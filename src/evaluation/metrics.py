from __future__ import annotations

import json
from pathlib import Path
import numpy as np
from sklearn.metrics import (
    precision_score, recall_score, f1_score, confusion_matrix,
    mean_absolute_error, mean_squared_error, roc_auc_score, average_precision_score,
    brier_score_loss,
)


def binary_metrics(y_true, probabilities, threshold=0.5):
    y_true = np.asarray(y_true).astype(int)
    probabilities = np.asarray(probabilities)
    y_pred = (probabilities >= threshold).astype(int)
    cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
    tn, fp, fn, tp = cm.ravel()
    fpr = float(fp / (fp + tn)) if (fp + tn) else 0.0
    result = {
        "precision": float(precision_score(y_true, y_pred, zero_division=0)),
        "recall": float(recall_score(y_true, y_pred, zero_division=0)),
        "f1": float(f1_score(y_true, y_pred, zero_division=0)),
        "false_positive_rate": fpr,
        "confusion_matrix": cm.tolist(),
        "brier_score": float(brier_score_loss(y_true, probabilities)),
    }
    if len(np.unique(y_true)) == 2:
        result["roc_auc"] = float(roc_auc_score(y_true, probabilities))
        result["pr_auc"] = float(average_precision_score(y_true, probabilities))
    else:
        result["roc_auc"] = None
        result["pr_auc"] = None
    return result


def continuous_metrics(y_true, y_pred):
    y_true = np.asarray(y_true)
    y_pred = np.asarray(y_pred)
    return {
        "mae": float(mean_absolute_error(y_true.reshape(-1), y_pred.reshape(-1))),
        "rmse": float(np.sqrt(mean_squared_error(y_true.reshape(-1), y_pred.reshape(-1)))),
    }


def per_step_forecast_metrics(state_true, state_pred, attack_true, attack_probs):
    result = {}
    for step in range(state_true.shape[1]):
        result[f"T+{step+1}"] = {
            "state": continuous_metrics(state_true[:, step, :], state_pred[:, step, :]),
            "attack": binary_metrics(attack_true[:, step], attack_probs[:, step]),
        }
    return result
