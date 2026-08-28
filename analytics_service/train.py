from __future__ import annotations

import argparse
import json
import logging
import math
from pathlib import Path

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, TensorDataset

from src.data.loader import load_network_states, inspect_dataset
from src.preprocessing.pipeline import fit_transform_splits, save_preprocessor
from src.sequences.builder import build_sequences
from src.models.lstm import MultiTaskLSTM
from src.utils.io import save_json
from src.utils.seed import seed_everything

ROOT = Path(__file__).resolve().parent
DEFAULT_CONFIG = ROOT / "configs" / "module3.json"

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
log = logging.getLogger("module3.train")


def load_config(path: str | Path = DEFAULT_CONFIG) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def make_loaders(seq, batch_size, shuffle):
    ds = TensorDataset(
        torch.tensor(seq.X, dtype=torch.float32),
        torch.tensor(seq.state_y, dtype=torch.float32),
        torch.tensor(seq.attack_y, dtype=torch.float32),
        torch.tensor(seq.stage_y, dtype=torch.long),
    )
    return DataLoader(ds, batch_size=batch_size, shuffle=shuffle)


def compute_stage_weights(stage_y: np.ndarray, stage_count: int) -> torch.Tensor:
    counts = np.bincount(stage_y.reshape(-1), minlength=stage_count).astype(np.float32)
    weights = np.ones(stage_count, dtype=np.float32)
    present = counts > 0
    if present.any():
        weights[present] = counts[present].sum() / (counts[present] * present.sum())
    return torch.tensor(weights, dtype=torch.float32)


def run_epoch(model, loader, optimizer, state_loss_fn, attack_loss_fn, stage_loss_fn, device, train=True):
    model.train(train)
    total = 0.0
    count = 0
    for x, state_y, attack_y, stage_y in loader:
        x, state_y, attack_y, stage_y = x.to(device), state_y.to(device), attack_y.to(device), stage_y.to(device)
        with torch.set_grad_enabled(train):
            state_pred, attack_logits, stage_logits = model(x)
            loss_state = state_loss_fn(state_pred, state_y)
            loss_attack = attack_loss_fn(attack_logits, attack_y)
            loss_stage = stage_loss_fn(stage_logits.reshape(-1, stage_logits.shape[-1]), stage_y.reshape(-1))
            loss = loss_state + loss_attack + loss_stage
            if train:
                optimizer.zero_grad(set_to_none=True)
                loss.backward()
                torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
                optimizer.step()
        total += float(loss.item()) * len(x)
        count += len(x)
    return total / max(count, 1)


def collect_predictions(model, loader, device):
    model.eval()
    states, attacks, stages, ys, ay, sy = [], [], [], [], [], []
    with torch.no_grad():
        for x, state_y, attack_y, stage_y in loader:
            state_pred, attack_logits, stage_logits = model(x.to(device))
            states.append(state_pred.cpu().numpy())
            attacks.append(torch.sigmoid(attack_logits).cpu().numpy())
            stages.append(torch.softmax(stage_logits, dim=-1).cpu().numpy())
            ys.append(state_y.numpy())
            ay.append(attack_y.numpy())
            sy.append(stage_y.numpy())
    return (
        np.concatenate(states), np.concatenate(attacks), np.concatenate(stages),
        np.concatenate(ys), np.concatenate(ay), np.concatenate(sy)
    )


def train_model(config_path: str | Path = DEFAULT_CONFIG):
    cfg = load_config(config_path)
    seed_everything(cfg["seed"])
    artifact_dir = ROOT / cfg["artifact_dir"]
    artifact_dir.mkdir(parents=True, exist_ok=True)

    bundle = load_network_states(ROOT / cfg["data_path"])
    inspection = inspect_dataset(bundle)
    log.info("Loaded %s network-state windows and %s features", inspection["rows"], inspection["feature_count"])

    splits = fit_transform_splits(
        bundle,
        train_ratio=cfg["train_ratio"],
        validation_ratio=cfg["validation_ratio"],
    )
    stage_to_id = {name: i for i, name in enumerate(bundle.stage_names)}
    train_supported_stage_names = sorted(splits.train["majority_attack_stage"].astype(str).unique().tolist())

    seq_train = build_sequences(splits.train, bundle.feature_columns, stage_to_id, cfg["sequence_length"], cfg["forecast_horizon"])
    seq_val = build_sequences(splits.validation, bundle.feature_columns, stage_to_id, cfg["sequence_length"], cfg["forecast_horizon"])
    seq_test = build_sequences(splits.test, bundle.feature_columns, stage_to_id, cfg["sequence_length"], cfg["forecast_horizon"])
    log.info("Sequences: train=%d validation=%d test=%d", len(seq_train.X), len(seq_val.X), len(seq_test.X))

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = MultiTaskLSTM(
        len(bundle.feature_columns), cfg["hidden_size"], cfg["num_layers"], cfg["dropout"],
        cfg["forecast_horizon"], len(bundle.stage_names)
    ).to(device)

    train_loader = make_loaders(seq_train, cfg["batch_size"], True)
    val_loader = make_loaders(seq_val, cfg["batch_size"], False)
    test_loader = make_loaders(seq_test, cfg["batch_size"], False)

    pos = seq_train.attack_y.sum()
    neg = seq_train.attack_y.size - pos
    pos_weight = torch.tensor([float(neg / max(pos, 1.0))], dtype=torch.float32, device=device)
    stage_weights = compute_stage_weights(seq_train.stage_y, len(bundle.stage_names)).to(device)

    state_loss_fn = nn.SmoothL1Loss()
    attack_loss_fn = nn.BCEWithLogitsLoss(pos_weight=pos_weight)
    stage_loss_fn = nn.CrossEntropyLoss(weight=stage_weights)
    optimizer = torch.optim.AdamW(model.parameters(), lr=cfg["learning_rate"], weight_decay=cfg["weight_decay"])
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=3)

    best_val = math.inf
    patience_left = cfg["early_stopping_patience"]
    history = []

    for epoch in range(1, cfg["epochs"] + 1):
        train_loss = run_epoch(model, train_loader, optimizer, state_loss_fn, attack_loss_fn, stage_loss_fn, device, True)
        val_loss = run_epoch(model, val_loader, optimizer, state_loss_fn, attack_loss_fn, stage_loss_fn, device, False)
        scheduler.step(val_loss)
        lr = optimizer.param_groups[0]["lr"]
        history.append({"epoch": epoch, "train_loss": train_loss, "validation_loss": val_loss, "learning_rate": lr})
        log.info("epoch=%03d train=%.5f val=%.5f lr=%.6g", epoch, train_loss, val_loss, lr)
        if val_loss < best_val - 1e-5:
            best_val = val_loss
            patience_left = cfg["early_stopping_patience"]
            torch.save(model.state_dict(), artifact_dir / "model.pt")
        else:
            patience_left -= 1
            if patience_left <= 0:
                log.info("Early stopping")
                break

    save_preprocessor(artifact_dir / "preprocessor.joblib", splits.scaler, bundle.feature_columns)
    save_json({"stage_names": bundle.stage_names, "stage_to_id": stage_to_id, "label_names": bundle.label_names, "train_supported_stage_names": train_supported_stage_names}, artifact_dir / "label_mapping.json")
    save_json({"feature_columns": bundle.feature_columns, "excluded_columns": ["majority_label", "majority_attack_stage", "stage_purity"]}, artifact_dir / "feature_schema.json")
    save_json(inspection, artifact_dir / "dataset_inspection.json")
    save_json({"history": history, "best_validation_loss": best_val}, artifact_dir / "training_history.json")

    model_cfg = {
        **cfg,
        "feature_count": len(bundle.feature_columns),
        "stage_count": len(bundle.stage_names),
        "stage_names": bundle.stage_names,
        "model_version": cfg["model_version"],
        "feature_schema_version": cfg["feature_schema_version"],
        "window_seconds": inspection["window_seconds"],
        "device_at_training": str(device),
    }
    save_json(model_cfg, artifact_dir / "model_config.json")

    # Keep the exact test arrays for evaluation without changing the source dataset.
    np.savez_compressed(
        artifact_dir / "test_sequences.npz",
        X=seq_test.X, state_y=seq_test.state_y, attack_y=seq_test.attack_y, stage_y=seq_test.stage_y,
    )
    return model_cfg


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Train SIH26153 Module 3 temporal world model")
    parser.add_argument("--config", default=str(DEFAULT_CONFIG))
    args = parser.parse_args()
    train_model(args.config)
