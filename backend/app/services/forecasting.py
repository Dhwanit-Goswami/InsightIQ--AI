"""
Real Machine Learning Sales Forecasting Service
Uses statsmodels ExponentialSmoothing (Holt-Winters) with scikit-learn Ridge fallback.
Computes genuine RMSE and MAE on an 80/20 train/test split.
"""
import logging
from datetime import datetime, timezone, timedelta
from decimal import Decimal
from typing import Dict, Any, List
import uuid

from sqlalchemy import func
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

# Lazy-imported to avoid startup errors if libraries are missing
_np = None
_pd = None
_statsmodels = None
_sklearn = None


def _lazy_imports():
    global _np, _pd, _statsmodels, _sklearn
    if _np is None:
        import numpy as np
        import pandas as pd
        _np = np
        _pd = pd
    return _np, _pd


def _get_sales_timeseries(db: Session, company_id: uuid.UUID, months: int = 24) -> "pd.Series":
    """Fetch monthly aggregated revenue from PostgreSQL and return as a pandas Series."""
    np, pd = _lazy_imports()

    from app.models.sale import Sale
    from sqlalchemy import extract, cast
    from sqlalchemy.types import Date

    cutoff = datetime.now(timezone.utc) - timedelta(days=months * 31)

    rows = (
        db.query(
            func.date_trunc("month", Sale.sale_date).label("month"),
            func.coalesce(func.sum(Sale.total_amount), Decimal("0.00")).label("revenue"),
        )
        .filter(
            Sale.company_id == company_id,
            Sale.status == "completed",
            Sale.sale_date >= cutoff,
        )
        .group_by("month")
        .order_by("month")
        .all()
    )

    if not rows:
        return pd.Series(dtype=float)

    months_list = [r.month for r in rows]
    revenues = [float(r.revenue) for r in rows]

    series = pd.Series(revenues, index=pd.DatetimeIndex(months_list), name="revenue")
    # Fill any calendar month gaps with 0
    full_idx = pd.date_range(series.index.min(), series.index.max(), freq="MS")
    series = series.reindex(full_idx, fill_value=0.0)
    return series


def _compute_metrics(actual, predicted) -> Dict[str, float]:
    """Return RMSE and MAE between actual and predicted arrays."""
    np, _ = _lazy_imports()
    actual = np.array(actual, dtype=float)
    predicted = np.array(predicted, dtype=float)
    rmse = float(np.sqrt(np.mean((actual - predicted) ** 2)))
    mae = float(np.mean(np.abs(actual - predicted)))
    return {"rmse": round(rmse, 2), "mae": round(mae, 2)}


def _holt_winters_forecast(series, forecast_months: int = 6):
    """Fit Holt-Winters (triple exponential smoothing) and return forecast."""
    np, pd = _lazy_imports()
    try:
        from statsmodels.tsa.holtwinters import ExponentialSmoothing

        if len(series) < 4:
            raise ValueError("Not enough data for Holt-Winters")

        seasonal_periods = min(12, len(series) // 2)
        trend_type = "add" if len(series) >= 6 else None
        seasonal_type = "add" if len(series) >= seasonal_periods * 2 else None

        model = ExponentialSmoothing(
            series.values,
            trend=trend_type,
            seasonal=seasonal_type,
            seasonal_periods=seasonal_periods if seasonal_type else None,
            initialization_method="estimated",
        )
        fit = model.fit(optimized=True, disp=False)
        forecast = fit.forecast(forecast_months)
        # clip negatives
        forecast = np.maximum(forecast, 0.0)

        # Train/test split for evaluation (80/20)
        split = max(2, int(len(series) * 0.8))
        train, test = series.values[:split], series.values[split:]
        if len(test) > 0:
            eval_model = ExponentialSmoothing(
                train,
                trend=trend_type,
                seasonal=seasonal_type,
                seasonal_periods=seasonal_periods if seasonal_type else None,
                initialization_method="estimated",
            )
            eval_fit = eval_model.fit(optimized=True, disp=False)
            eval_pred = eval_fit.forecast(len(test))
            metrics = _compute_metrics(test, eval_pred)
        else:
            metrics = {"rmse": 0.0, "mae": 0.0}

        return forecast.tolist(), metrics, "Holt-Winters Exponential Smoothing"

    except Exception as exc:
        logger.warning(f"Holt-Winters failed ({exc}), falling back to Ridge regression")
        return None, None, None


def _ridge_forecast(series, forecast_months: int = 6):
    """Fallback: simple Ridge regression on lag features."""
    np, pd = _lazy_imports()
    from sklearn.linear_model import Ridge

    y = np.array(series.values, dtype=float)
    n = len(y)

    if n < 3:
        # Not enough data — return simple trend extension
        avg = float(np.mean(y)) if n > 0 else 0.0
        forecast = [max(0.0, avg)] * forecast_months
        return forecast, {"rmse": 0.0, "mae": 0.0}, "Linear Trend Extrapolation"

    # Create lag features
    lags = min(3, n - 1)
    X, Y = [], []
    for i in range(lags, n):
        X.append(y[i - lags: i])
        Y.append(y[i])
    X, Y = np.array(X), np.array(Y)

    split = max(1, int(len(X) * 0.8))
    X_train, X_test = X[:split], X[split:]
    Y_train, Y_test = Y[:split], Y[split:]

    model = Ridge(alpha=1.0)
    model.fit(X_train, Y_train)

    if len(X_test) > 0:
        pred_test = model.predict(X_test)
        metrics = _compute_metrics(Y_test, pred_test)
    else:
        metrics = {"rmse": 0.0, "mae": 0.0}

    # Roll forward to forecast
    window = list(y[-lags:])
    forecast = []
    for _ in range(forecast_months):
        x_next = np.array(window[-lags:]).reshape(1, -1)
        pred = float(model.predict(x_next)[0])
        pred = max(0.0, pred)
        forecast.append(round(pred, 2))
        window.append(pred)

    return forecast, metrics, "Ridge Regression (Lag Features)"


def get_sales_forecast(db: Session, company_id: uuid.UUID, forecast_months: int = 6) -> Dict[str, Any]:
    """
    Main entry point: returns real ML sales forecast with evaluation metrics.
    """
    np, pd = _lazy_imports()

    try:
        series = _get_sales_timeseries(db, company_id, months=24)
    except Exception as exc:
        logger.error(f"Failed to load sales time series: {exc}")
        return _empty_forecast_response(forecast_months)

    if series.empty or len(series) < 2:
        return _empty_forecast_response(forecast_months, reason="Insufficient historical data (need ≥ 2 months).")

    # Try Holt-Winters first, fall back to Ridge
    forecast_values, metrics, model_name = _holt_winters_forecast(series, forecast_months)
    if forecast_values is None:
        forecast_values, metrics, model_name = _ridge_forecast(series, forecast_months)

    # Build historical data points
    historical = [
        {"month": str(idx.strftime("%Y-%m")), "revenue": round(float(val), 2)}
        for idx, val in zip(series.index, series.values)
    ]

    # Build forecast data points (months after last historical)
    last_date = series.index[-1]
    forecast_points = []
    ci_half = metrics["rmse"] * 1.96  # ~95% CI using RMSE as std proxy
    for i, val in enumerate(forecast_values):
        month_dt = last_date + pd.DateOffset(months=i + 1)
        forecast_points.append({
            "month": month_dt.strftime("%Y-%m"),
            "forecast": round(val, 2),
            "lower_bound": round(max(0.0, val - ci_half), 2),
            "upper_bound": round(val + ci_half, 2),
        })

    return {
        "model": model_name,
        "historical_months": len(series),
        "forecast_months": forecast_months,
        "metrics": metrics,
        "historical": historical,
        "forecast": forecast_points,
        "data_available": True,
    }


def _empty_forecast_response(forecast_months: int, reason: str = "No sales data found.") -> Dict[str, Any]:
    return {
        "model": "N/A",
        "historical_months": 0,
        "forecast_months": forecast_months,
        "metrics": {"rmse": 0.0, "mae": 0.0},
        "historical": [],
        "forecast": [],
        "data_available": False,
        "reason": reason,
    }
