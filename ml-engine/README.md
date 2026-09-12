# Sanjeevani — ML Scoring Engine

The ML Engine processes multi-source alternative agricultural data to generate explainable credit scores and yield forecasts.

## Model Stack
- **Credit Scoring Ensemble**:
  - `Random Forest` (scikit-learn): Collinear tabular base model.
  - `XGBoost`: Gradient boosted trees for default classification.
  - `LightGBM`: Fast leaf-wise tree splitting for large FPO membership batches.
- **Yield & Harvest Time-Series**:
  - `statsmodels` (ARIMA / SARIMAX): Multi-season yield projection & weather vulnerability modeling.
- **Experiment Tracking**:
  - `MLflow`: Experiment tracking, metric logging, and model registry.

## Running Worker Locally
```bash
python worker.py --test
```
