from __future__ import annotations

import torch
from torch import nn


class MultiTaskLSTM(nn.Module):
    """Direct K-step multi-task temporal model.

    From a history of network states, the model predicts K future states,
    K attack probabilities, and K attack-stage distributions in parallel.
    """

    def __init__(self, feature_count: int, hidden_size: int, num_layers: int, dropout: float,
                 forecast_horizon: int, stage_count: int):
        super().__init__()
        self.feature_count = feature_count
        self.forecast_horizon = forecast_horizon
        self.stage_count = stage_count
        self.lstm = nn.LSTM(
            input_size=feature_count,
            hidden_size=hidden_size,
            num_layers=num_layers,
            dropout=dropout if num_layers > 1 else 0.0,
            batch_first=True,
        )
        self.norm = nn.LayerNorm(hidden_size)
        self.state_head = nn.Linear(hidden_size, forecast_horizon * feature_count)
        self.attack_head = nn.Linear(hidden_size, forecast_horizon)
        self.stage_head = nn.Linear(hidden_size, forecast_horizon * stage_count)

    def forward(self, x):
        out, _ = self.lstm(x)
        h = self.norm(out[:, -1, :])
        state = self.state_head(h).view(-1, self.forecast_horizon, self.feature_count)
        attack_logits = self.attack_head(h)
        stage_logits = self.stage_head(h).view(-1, self.forecast_horizon, self.stage_count)
        return state, attack_logits, stage_logits
