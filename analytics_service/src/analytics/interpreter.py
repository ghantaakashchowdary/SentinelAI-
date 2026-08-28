import json
import datetime
import numpy as np
import pandas as pd
import torch
from pathlib import Path

from src.forecasting.inference import Forecaster
from captum.attr import IntegratedGradients

class AttackProbWrapper(torch.nn.Module):
    def __init__(self, model):
        super().__init__()
        self.model = model
        
    def forward(self, x):
        _, attack_logits, _ = self.model(x)
        # return logits which has shape [batch, forecast_horizon]
        return attack_logits


class SecurityInterpreter:
    def __init__(self, artifact_dir: str):
        self.forecaster = Forecaster(artifact_dir)
        self.model = self.forecaster.model
        self.model.eval()
        self.wrapper = AttackProbWrapper(self.model)
        self.ig = IntegratedGradients(self.wrapper)

    def analyze_sequence(self, sequence_df: pd.DataFrame, timestamps: list = None) -> dict:
        """
        Analyze the sequence, get forecasts, and explain the prediction using Captum.
        """
        # 1. Get Forecast
        forecast_result = self.forecaster.predict(sequence_df, timestamps)
        
        # 2. Get the observed context summary
        features = self.forecaster.feature_columns
        recent_state = sequence_df[features].iloc[-1].to_dict()
        
        # 3. Calculate Feature Importance via Integrated Gradients
        # We need the scaled tensor to pass into Captum
        raw = sequence_df[features].to_numpy(dtype=np.float32)
        scaled = self.forecaster.scaler.transform(pd.DataFrame(raw, columns=features))
        x = torch.tensor(scaled, dtype=torch.float32, device=self.forecaster.device).unsqueeze(0)
        
        # We will explain the first forecast horizon step (T+1) which is target=0
        # Baseline is a zero tensor
        baseline = torch.zeros_like(x)
        
        attributions, delta = self.ig.attribute(
            x, 
            baselines=baseline, 
            target=0, # T+1 attack logit
            return_convergence_delta=True
        )
        
        # Attributions shape: [1, 5, 21]. We sum across the 5 history windows to get feature importance
        attr_np = attributions.squeeze(0).cpu().numpy()
        feature_importance = np.sum(attr_np, axis=0) # shape [21]
        
        # Create a sorted list of top contributing features
        importance_list = []
        for i, feat in enumerate(features):
            val = float(feature_importance[i])
            if abs(val) > 1e-4:
                importance_list.append({
                    "feature": feat,
                    "importance_score": val,
                    "interpretation": "Increases attack probability" if val > 0 else "Decreases attack probability"
                })
        
        importance_list = sorted(importance_list, key=lambda x: abs(x["importance_score"]), reverse=True)
        # Keep top 5
        top_features = importance_list[:5]
        
        # Build the structured JSON
        analytics = {
            "analytics_timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "status": "ATTACK_FORECASTED" if forecast_result["attack_probability"] > 0.5 else "NORMAL",
            "observed_context": {
                "window_size": f"{self.forecaster.config['window_seconds']} seconds",
                "history_windows": self.forecaster.config["sequence_length"],
                "current_state_summary": recent_state
            },
            "forecast": {
                "horizon": forecast_result["forecast_horizon"],
                "overall_attack_probability": forecast_result["attack_probability"],
                "progression": forecast_result["future_predictions"]
            },
            "explainability": {
                "method": "Integrated Gradients (Captum) on LSTM Attack Logits",
                "top_contributing_features": top_features
            }
        }
        
        return analytics
