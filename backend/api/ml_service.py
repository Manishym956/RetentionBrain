import io
import os
import numpy as np
import pandas as pd
import joblib
import shap
from django.conf import settings


MODEL_PATH = getattr(
    settings,
    "MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "xgboost_churn_model.pkl"),
)

# Features expected by the pre-trained model
MODEL_FEATURES = ['Frequency', 'Monetary', 'AvgOrderValue', 'TotalReturns', 'ReturnRatio', 'CustomerLifetime']

_cached_model = None


def load_model():
    global _cached_model
    if _cached_model is None:
        _cached_model = joblib.load(MODEL_PATH)
    return _cached_model


def parse_csv(file) -> pd.DataFrame:
    content = file.read() if hasattr(file, "read") else file
    if isinstance(content, bytes):
        content = content.decode('utf-8')
    df = pd.read_csv(io.StringIO(content))
    df.columns = df.columns.str.strip()
    return df


def compute_rfm_features(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [c.strip() for c in df.columns]
    col_map = {c.lower(): c for c in df.columns}

    # Detect customer ID column
    id_col = None
    for candidate in ['customerid', 'customer_id', 'user_id', 'userid', 'id']:
        if candidate in col_map:
            id_col = col_map[candidate]
            break

    # Check if data already has the model's feature columns
    has_features = all(
        any(feat.lower() == c.lower() for c in df.columns)
        for feat in MODEL_FEATURES
    )

    if has_features:
        rename = {}
        for feat in MODEL_FEATURES:
            for c in df.columns:
                if c.lower() == feat.lower():
                    rename[c] = feat
                    break
        df = df.rename(columns=rename)
        if id_col and id_col != 'customer_id':
            df = df.rename(columns={id_col: 'customer_id'})
        elif not id_col:
            df['customer_id'] = [f"cust_{i}" for i in range(len(df))]

        # Also pick up Recency if present
        for c in df.columns:
            if c.lower() == 'recency':
                df = df.rename(columns={c: 'Recency'})
                break

        churn_col = None
        for candidate in ['churn', 'churned', 'is_churned']:
            if candidate in col_map:
                churn_col = col_map[candidate]
                break
        if churn_col and churn_col != 'churn':
            df = df.rename(columns={churn_col: 'churn'})

        return df

    # Otherwise, compute features from transactional data
    date_col = None
    for candidate in ['invoicedate', 'invoice_date', 'date', 'order_date', 'purchase_date', 'transactiondate']:
        if candidate in col_map:
            date_col = col_map[candidate]
            break

    quantity_col = None
    for candidate in ['quantity', 'qty', 'units']:
        if candidate in col_map:
            quantity_col = col_map[candidate]
            break

    price_col = None
    for candidate in ['unitprice', 'unit_price', 'price', 'amount', 'revenue', 'totalprice']:
        if candidate in col_map:
            price_col = col_map[candidate]
            break

    if not all([id_col, date_col]):
        raise ValueError(
            "CSV must contain either feature columns (Frequency, Monetary, AvgOrderValue, TotalReturns, ReturnRatio, CustomerLifetime) "
            "or transactional columns (CustomerID, InvoiceDate, Quantity, UnitPrice)."
        )

    df[date_col] = pd.to_datetime(df[date_col], errors='coerce')
    df = df.dropna(subset=[date_col])

    if quantity_col and price_col:
        df['TotalPrice'] = df[quantity_col] * df[price_col]
    elif price_col:
        df['TotalPrice'] = df[price_col]
    else:
        df['TotalPrice'] = 1

    max_date = df[date_col].max()

    rfm = df.groupby(id_col).agg(
        Recency=(date_col, lambda x: (max_date - x.max()).days),
        Frequency=(date_col, 'nunique'),
        Monetary=('TotalPrice', 'sum'),
    ).reset_index()
    rfm = rfm.rename(columns={id_col: 'customer_id'})

    # AvgOrderValue
    rfm['AvgOrderValue'] = np.where(rfm['Frequency'] > 0, rfm['Monetary'] / rfm['Frequency'], 0)

    # TotalReturns and ReturnRatio
    if quantity_col:
        returns = df[df[quantity_col] < 0].groupby(id_col).size()
        totals = df.groupby(id_col).size()
        rfm['TotalReturns'] = rfm['customer_id'].map(
            dict(zip(returns.index.astype(str), returns.values))
        ).fillna(0)
        rfm['ReturnRatio'] = rfm['customer_id'].map(
            dict(zip((returns / totals).fillna(0).index.astype(str), (returns / totals).fillna(0).values))
        ).fillna(0)
    else:
        rfm['TotalReturns'] = 0.0
        rfm['ReturnRatio'] = 0.0

    # CustomerLifetime
    lifetime = df.groupby(id_col).agg(
        first_purchase=(date_col, 'min'),
        last_purchase=(date_col, 'max'),
    )
    lifetime['CustomerLifetime'] = (lifetime['last_purchase'] - lifetime['first_purchase']).dt.days
    rfm['CustomerLifetime'] = rfm['customer_id'].map(
        dict(zip(lifetime.index.astype(str), lifetime['CustomerLifetime'].values))
    ).fillna(0)

    # Churn label (inactive >90 days)
    churn = (max_date - df.groupby(id_col)[date_col].max()).dt.days > 90
    rfm['churn'] = rfm['customer_id'].map(
        dict(zip(churn.index.astype(str), churn.astype(int).values))
    ).fillna(0).astype(int)

    return rfm


def predict(rfm: pd.DataFrame) -> pd.DataFrame:
    model = load_model()

    X = rfm[MODEL_FEATURES].fillna(0)

    probas = model.predict_proba(X)[:, 1]
    rfm['churn_probability'] = probas
    rfm['is_churned'] = (probas >= 0.5).astype(int)

    # SHAP explainability
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)

    top_features_list = []
    for i in range(len(X)):
        sv = shap_values[i]
        indices = np.argsort(np.abs(sv))[::-1][:3]
        top = [
            {"feature": MODEL_FEATURES[idx], "impact": round(float(sv[idx]), 4)}
            for idx in indices
        ]
        top_features_list.append(top)

    rfm['top_features'] = top_features_list

    def risk_level(p):
        if p >= 0.7:
            return 'high'
        elif p >= 0.4:
            return 'medium'
        return 'low'

    rfm['risk_level'] = rfm['churn_probability'].apply(risk_level)

    return rfm
