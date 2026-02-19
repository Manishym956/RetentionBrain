# RetentionBrain – Customer Churn Prediction Platform

RetentionBrain is an end-to-end customer churn prediction system designed to help businesses proactively identify at-risk customers and take data-driven retention actions.

The platform transforms raw transactional data into actionable churn insights using machine learning and behavioral analytics.

---

## Project Overview

Businesses often lose customers without early warning. RetentionBrain addresses this problem by:

- Analyzing transactional purchase behavior
- Generating churn probability scores
- Segmenting customers into risk categories
- Providing feature-level explanations
- Enabling report downloads for business action

---

## Core Features

- Upload customer dataset (CSV)
- Automated RFM feature engineering
- Behavioral feature extraction
- Churn prediction using XGBoost
- Risk segmentation (Low / Medium / High)
- Customer-level explanation
- Interactive dashboard
- Downloadable churn report (CSV)

---

## Tech Stack

### Frontend
- Next.js
- TailwindCSS
- Recharts

### Backend
- Django REST Framework
- PostgreSQL

### Machine Learning
- XGBoost
- Pandas
- NumPy
- SHAP (Explainability)

---

## Machine Learning Approach

### 1️⃣ Data Processing
- Removed missing CustomerID records
- Converted InvoiceDate to datetime
- Removed duplicates
- Created TotalPrice feature

### 2️⃣ Feature Engineering
- Recency (excluded from model to prevent leakage)
- Frequency
- Monetary
- Average Order Value
- Return Ratio
- Customer Lifetime

### 3️⃣ Model Development
- Stratified 70 / 15 / 15 split
- Benchmarked XGBoost vs CatBoost
- Multi-seed stability testing
- Final model selected: XGBoost

### 📈 Final Model Performance
- Test ROC-AUC ≈ **0.81**
- Stable across multiple random seeds

---

## 🔄 User Flow

See detailed consumer flow here:

📄 [User Flow Diagram](./UserFlow.md)

---

## 📂 Project Structure
```
RetentionBrain/
│
├── notebooks/
│ ├── EDA.ipynb
│ ├── Model_Training.ipynb
│
├── backend/
│
├── frontend/
│
├── UserFlow.md
├── README.md
└── requirements.txt
```

---

## ⚠️ Key Learning & Model Integrity

During development, a data leakage issue was identified:

- Churn was initially defined using Recency.
- Including Recency as a feature led to artificially perfect performance.
- The issue was resolved by removing Recency from model features.

This ensured realistic and production-valid evaluation.

---

## 🔮 Future Improvements

- Time-based production validation
- Survival analysis
- LTV prediction
- Async job processing
- Role-based authentication
- CRM integration

---

## 👨‍💻 Author

**Manish Y M**  
Data Scientist Track – 2026  
Customer Churn Prediction Project
