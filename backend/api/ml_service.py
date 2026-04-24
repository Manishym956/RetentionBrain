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
MODEL_FEATURES = [
    'Frequency', 'Monetary', 'AvgOrderValue', 'TotalReturns', 'ReturnRatio', 'CustomerLifetime'
]

# Domain Baselines for Missing Value Imputation
# Since the original training data is unavailable, we use statistically sound eCommerce defaults.
FEATURE_STATS = {
    'Frequency': {'mean': 5.0, 'min': 0.0},
    'Monetary': {'mean': 500.0, 'min': 0.0},
    'AvgOrderValue': {'mean': 100.0, 'min': 0.0},
    'TotalReturns': {'mean': 0.5, 'min': 0.0},
    'ReturnRatio': {'mean': 0.05, 'min': 0.0},
    'CustomerLifetime': {'mean': 180.0, 'min': 0.0},
}

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


def generate_eda(df: pd.DataFrame) -> dict:
    eda_result = {
        "shape": {"rows": int(df.shape[0]), "columns": int(df.shape[1])},
        "columns": [],
        "missing_values": df.isnull().sum().to_dict(),
    }
    
    # Process column types and descriptive stats
    desc = df.describe(include='all').to_dict()
    for col in df.columns:
        col_type = str(df[col].dtype)
        is_numeric = pd.api.types.is_numeric_dtype(df[col])
        
        col_info = {
            "name": col,
            "type": col_type,
            "is_numeric": is_numeric,
        }
        
        if col in desc:
            # Filter out NaNs from describe output to keep JSON clean
            stats = {k: v for k, v in desc[col].items() if pd.notna(v)}
            col_info["statistics"] = stats
            
        eda_result["columns"].append(col_info)
        
    # Correlation matrix for numeric columns only
    numeric_df = df.select_dtypes(include='number')
    if not numeric_df.empty:
        # Replace NaNs with None/null for JSON serialization
        corr_matrix = numeric_df.corr().replace({np.nan: None}).to_dict()
        eda_result["correlation_matrix"] = corr_matrix
    else:
        eda_result["correlation_matrix"] = {}

    return eda_result


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
        # Dynamic fallback: if we can't compute RFM from transactions, and we don't have all exact features,
        # we will just rename whatever we can find and let predict() fill the missing ones with defaults.
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
        return df

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


import logging
logger = logging.getLogger(__name__)

def predict(rfm: pd.DataFrame) -> pd.DataFrame:
    model = load_model()

    missing_features_series = pd.Series([[] for _ in range(len(rfm))], index=rfm.index)

    # Feature Alignment Layer
    for feat in MODEL_FEATURES:
        feat_mean = FEATURE_STATS[feat]['mean']
        
        # Instantiate column if entirely missing
        if feat not in rfm.columns:
            rfm[feat] = np.nan
        
        # Dynamic encoding / Type coercion
        if not pd.api.types.is_numeric_dtype(rfm[feat]):
            # If categorical or string, coerce to numeric (non-parsable becomes NaN)
            rfm[feat] = pd.to_numeric(rfm[feat], errors='coerce')
            
        nan_mask = rfm[feat].isna()
        if nan_mask.any():
            logger.warning(f"Feature '{feat}' has {nan_mask.sum()} missing/invalid values. Filled with mean: {feat_mean}")
            for idx in rfm.index[nan_mask]:
                # Need to create a new list or append safely. Since we initialized with empty lists, 
                # we can modify the list in-place or assign a new one.
                current_list = missing_features_series.at[idx]
                if feat not in current_list:
                    current_list.append(feat)
            
            rfm.loc[nan_mask, feat] = feat_mean
            
    # Conditional Defaults (Light Logic)
    freq_zero_mask = rfm['Frequency'] == 0
    if freq_zero_mask.any():
        logger.info(f"Applied conditional defaults: {freq_zero_mask.sum()} rows with Frequency=0. Coerced dependent features to 0.0")
        rfm.loc[freq_zero_mask, 'AvgOrderValue'] = 0.0
        rfm.loc[freq_zero_mask, 'TotalReturns'] = 0.0
        rfm.loc[freq_zero_mask, 'ReturnRatio'] = 0.0

    # Ensure exact feature order and fill any remaining unlikely NaNs with 0 as absolute ultimate fallback
    X = rfm[MODEL_FEATURES].fillna(0)
    
    # Track missing features and confidence
    rfm['missing_features'] = missing_features_series
    
    def calculate_confidence(missing_list):
        count = len(missing_list)
        if count <= 1:
            return 'high'
        elif count <= 3:
            return 'moderate'
        return 'low'
        
    rfm['confidence'] = rfm['missing_features'].apply(calculate_confidence)

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
