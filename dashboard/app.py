from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st


# ============================================================
# PATHS
# ============================================================

ROOT = Path(__file__).resolve().parents[1]

DATA = ROOT / "data" / "network_state_sequence.csv"
ARTIFACTS = ROOT / "artifacts"
CONFIG = ROOT / "configs" / "module3.json"


# ============================================================
# STREAMLIT CONFIGURATION
# ============================================================

st.set_page_config(
    page_title="SIH26153 · Module 3 World Model",
    page_icon="M3",
    layout="wide",
)


# ============================================================
# CUSTOM CSS
# ============================================================

st.markdown(
    """
<style>

[data-testid="stSidebar"] {
    background: #07111f;
}

.block-container {
    padding-top: 1.5rem;
    max-width: 1500px;
}

.hero {
    padding: 28px;
    border-radius: 18px;
    background: linear-gradient(135deg, #0b2035, #0a1424);
    border: 1px solid #1c3954;
}

.badge {
    display: inline-block;
    padding: 5px 10px;
    border-radius: 999px;
    border: 1px solid #24506f;
    color: #61c7ff;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: .08em;
}

.process {
    display: flex;
    gap: 8px;
    align-items: center;
    flex-wrap: wrap;
    margin: 18px 0;
}

.step {
    padding: 10px 13px;
    border-radius: 10px;
    background: #0b1726;
    border: 1px solid #1b3046;
    color: #9bb2c9;
}

.step.active {
    border-color: #22c7ff;
    color: #eaf8ff;
    box-shadow: 0 0 0 1px #22c7ff33 inset;
}

.small {
    color: #7f96ad;
    font-size: 13px;
}

</style>
""",
    unsafe_allow_html=True,
)


# ============================================================
# HELPER FUNCTIONS
# ============================================================

def load_data():
    """Load Module 2 network-state data."""
    df = pd.read_csv(
        DATA,
        parse_dates=["timestamp"]
    )
    return df


def load_json(path):
    """Load JSON file if it exists."""
    if path.exists():
        return json.loads(
            path.read_text(encoding="utf-8")
        )
    return None


def artifacts_ready():
    """Check whether required model artifacts exist."""
    required_files = [
        "model.pt",
        "preprocessor.joblib",
        "model_config.json",
        "label_mapping.json",
    ]

    return all(
        (ARTIFACTS / filename).exists()
        for filename in required_files
    )


def run_command(command):
    """Run a Python command and display output in Streamlit."""

    with st.spinner(
        "Running Module 3... this is the real "
        "training/evaluation pipeline, not a demo animation."
    ):

        process = subprocess.run(
            command,
            cwd=ROOT,
            text=True,
            capture_output=True,
        )

    if process.returncode != 0:
        st.error(
            process.stderr[-5000:]
            or "Command failed"
        )
        return False

    st.code(
        process.stdout[-8000:]
        or "Completed"
    )

    return True


# ============================================================
# LOAD DATA / ARTIFACTS
# ============================================================

df = load_data()

ready = artifacts_ready()

metrics = load_json(
    ARTIFACTS / "evaluation_metrics.json"
)

history = load_json(
    ARTIFACTS / "training_history.json"
)

config = json.loads(
    CONFIG.read_text(
        encoding="utf-8"
    )
)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.markdown(
        "# M3 · WORLD MODEL"
    )

    st.caption(
        "SIH26153 · Predictive Network Attack Progression"
    )

    page = st.radio(
        "Module 3",
        [
            "Live Overview",
            "Model Build",
            "Forecast",
            "Evaluation",
            "Data & Contract",
            "Architecture",
        ],
        label_visibility="collapsed",
    )

    st.divider()

    if ready:
        st.success(
            "Model artifacts loaded"
        )
    else:
        st.warning(
            "Model not trained yet"
        )

    st.caption(
        f"Dataset: {len(df)} network windows"
    )

    resolution = (
        df.timestamp
        .diff()
        .dt.total_seconds()
        .median()
    )

    st.caption(
        f"Resolution: {resolution:.0f}s"
    )


# ============================================================
# HERO SECTION
# ============================================================

st.markdown(
    """
<div class="hero">

<span class="badge">
TEMPORAL WORLD MODEL · MODULE 3
</span>

<h1>
Network state → future state → attack progression
</h1>

<p class="small">
This dashboard is connected to the actual Module 2
network-state sequence. Training, forecasting and metrics
come from the Python LSTM pipeline.
</p>

</div>
""",
    unsafe_allow_html=True,
)


# ============================================================
# PROCESS PIPELINE
# ============================================================

steps = [
    "Module 2 state",
    "Validate",
    "Scale",
    "Sequence",
    "LSTM",
    "K-step forecast",
    "Risk + stage",
    "Evaluate",
    "Artifacts",
]


# FIXED VERSION
# The previous version had nested braces inside an f-string,
# which caused:
# SyntaxError: f-string: expecting '}'

steps_html = []

for i, x in enumerate(steps):

    active_class = (
        "active"
        if (i < 7 and ready)
        else ""
    )

    steps_html.append(
        f"<div class='step {active_class}'>{i + 1}. {x}</div>"
    )


process_html = (
    "<div class='process'>"
    + "".join(steps_html)
    + "</div>"
)

st.markdown(
    process_html,
    unsafe_allow_html=True,
)


# ============================================================
# LIVE OVERVIEW
# ============================================================

if page == "Live Overview":

    stages = (
        df.majority_attack_stage
        .value_counts()
        .rename_axis("stage")
        .reset_index(name="windows")
    )

    c1, c2, c3, c4 = st.columns(4)

    c1.metric(
        "Network windows",
        len(df)
    )

    c2.metric(
        "Temporal resolution",
        f"{resolution:.0f}s"
    )

    c3.metric(
        "Observed attack windows",
        int(
            (
                df.majority_attack_stage
                != "Normal"
            ).sum()
        )
    )

    c4.metric(
        "Supported observed stages",
        df.majority_attack_stage.nunique()
    )

    st.subheader(
        "What the model actually learns"
    )

    left, right = st.columns(
        [1.5, 1]
    )

    with left:

        feature = st.selectbox(
            "Network-state signal",
            [
                "total_packets",
                "total_bytes",
                "flow_count",
                "unique_dst_ports",
                "syn_flag_count",
                "flow_bytes_per_sec",
                "retransmission_count",
            ],
        )

        fig = px.line(
            df,
            x="timestamp",
            y=feature,
            title=f"{feature} across 5-second network states",
        )

        fig.update_layout(
            template="plotly_dark",
            height=360,
            margin=dict(
                l=20,
                r=20,
                t=50,
                b=20,
            ),
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
        )

    with right:

        fig = px.bar(
            stages,
            x="windows",
            y="stage",
            orientation="h",
            title="Observed ground truth stages",
        )

        fig.update_layout(
            template="plotly_dark",
            height=360,
            margin=dict(
                l=20,
                r=20,
                t=50,
                b=20,
            ),
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
        )

    st.info(
        "The dashboard does not fabricate future probabilities. "
        "Forecast panels remain locked until model.pt and the "
        "preprocessing artifacts have been produced by the "
        "real training command."
    )


# ============================================================
# MODEL BUILD
# ============================================================

elif page == "Model Build":

    st.subheader(
        "Build the temporal model"
    )

    st.write(
        "This executes the real pipeline: "
        "dataset validation → training-only scaling → "
        "chronological split → sequence generation → "
        "multi-task LSTM → checkpointing → saved artifacts."
    )

    c1, c2, c3, c4 = st.columns(4)

    c1.metric(
        "History",
        f"{config['sequence_length']} windows"
    )

    c2.metric(
        "Forecast",
        f"K={config['forecast_horizon']}"
    )

    c3.metric(
        "Hidden size",
        config["hidden_size"]
    )

    c4.metric(
        "LSTM layers",
        config["num_layers"]
    )

    st.code(
        "python train.py\npython evaluate.py",
        language="powershell",
    )

    if st.button(
        "TRAIN / REBUILD MODEL",
        type="primary",
        use_container_width=True,
    ):

        ok = run_command(
            [
                sys.executable,
                "train.py",
            ]
        )

        if ok:

            st.success(
                "Training completed and artifacts were saved. "
                "Run evaluation next."
            )

            st.rerun()

    if ready:

        st.success(
            "A trained checkpoint is available."
        )

        if history:

            h = pd.DataFrame(
                history["history"]
            )

            fig = go.Figure()

            fig.add_trace(
                go.Scatter(
                    x=h.epoch,
                    y=h.train_loss,
                    name="train loss",
                )
            )

            fig.add_trace(
                go.Scatter(
                    x=h.epoch,
                    y=h.validation_loss,
                    name="validation loss",
                )
            )

            fig.update_layout(
                template="plotly_dark",
                height=360,
                title="Real training history",
            )

            st.plotly_chart(
                fig,
                use_container_width=True,
            )

    else:

        st.warning(
            "No checkpoint exists yet. "
            "Train the model to unlock inference."
        )


# ============================================================
# FORECAST
# ============================================================

elif page == "Forecast":

    st.subheader(
        "K-step future forecast"
    )

    if not ready:

        st.warning(
            "Train Module 3 first. "
            "This page intentionally does not display fake predictions."
        )

    else:

        from src.forecasting.inference import Forecaster

        forecaster = Forecaster(
            ARTIFACTS
        )

        seq = df.tail(
            forecaster.config[
                "sequence_length"
            ]
        )

        result = forecaster.predict(
            seq,
            seq.timestamp.astype(str).tolist()
        )

        c1, c2, c3 = st.columns(3)

        c1.metric(
            "T+1 attack probability",
            f"{result['future_predictions'][0]['attack_probability'] * 100:.1f}%"
        )

        c2.metric(
            "T+1 predicted stage",
            result[
                "future_predictions"
            ][0][
                "predicted_stage"
            ],
        )

        c3.metric(
            "Forecast horizon",
            f"{result['forecast_horizon']} windows",
        )

        rows = []

        for prediction in result[
            "future_predictions"
        ]:

            rows.append(
                {
                    "Step": f"T+{prediction['step']}",
                    "Window": prediction["time_window"],
                    "Attack probability": prediction[
                        "attack_probability"
                    ],
                    "Stage": prediction[
                        "predicted_stage"
                    ],
                    "Stage confidence": prediction[
                        "stage_confidence"
                    ],
                }
            )

        st.dataframe(
            pd.DataFrame(rows),
            use_container_width=True,
            hide_index=True,
        )

        fig = go.Figure()

        fig.add_trace(
            go.Scatter(
                x=[
                    f"T+{r['step']}"
                    for r in result[
                        "future_predictions"
                    ]
                ],
                y=[
                    r["attack_probability"]
                    for r in result[
                        "future_predictions"
                    ]
                ],
                mode="lines+markers",
                name="predicted attack probability",
            )
        )

        fig.update_yaxes(
            range=[0, 1]
        )

        fig.update_layout(
            template="plotly_dark",
            height=320,
            title="Model-generated future attack probability",
        )

        st.plotly_chart(
            fig,
            use_container_width=True,
        )

        with st.expander(
            "Predicted future network state"
        ):

            state_rows = []

            for prediction in result[
                "future_predictions"
            ]:

                for key, value in prediction[
                    "predicted_state"
                ].items():

                    state_rows.append(
                        {
                            "step": f"T+{prediction['step']}",
                            "feature": key,
                            "predicted_value": value,
                        }
                    )

            st.dataframe(
                pd.DataFrame(state_rows),
                use_container_width=True,
                hide_index=True,
            )

        st.json(result)


# ============================================================
# EVALUATION
# ============================================================

elif page == "Evaluation":

    st.subheader(
        "Test-set evaluation"
    )

    if not (
        ARTIFACTS
        / "evaluation_metrics.json"
    ).exists():

        st.warning(
            "Run python evaluate.py after training."
        )

        if ready and st.button(
            "RUN TEST EVALUATION",
            type="primary",
        ):

            run_command(
                [
                    sys.executable,
                    "evaluate.py",
                ]
            )

            st.rerun()

    else:

        overall = metrics[
            "overall"
        ]

        c1, c2, c3, c4, c5 = st.columns(5)

        c1.metric(
            "Precision",
            f"{overall['attack_precision']:.3f}",
        )

        c2.metric(
            "Recall",
            f"{overall['attack_recall']:.3f}",
        )

        c3.metric(
            "F1",
            f"{overall['attack_f1']:.3f}",
        )

        c4.metric(
            "FPR",
            f"{overall['attack_false_positive_rate']:.3f}",
        )

        c5.metric(
            "Normalized state RMSE",
            f"{overall['normalized_state_rmse']:.3f}",
        )

        st.markdown(
            "#### Forecast quality by horizon"
        )

        rows = []

        for step in metrics[
            "state_forecast_by_step"
        ]:

            rows.append(
                {
                    "Forecast": step,
                    "Normalized MAE": metrics[
                        "state_forecast_by_step"
                    ][step][
                        "normalized"
                    ][
                        "mae"
                    ],
                    "Normalized RMSE": metrics[
                        "state_forecast_by_step"
                    ][step][
                        "normalized"
                    ][
                        "rmse"
                    ],
                    "Attack F1": metrics[
                        "attack_by_step"
                    ][step][
                        "f1"
                    ],
                    "FPR": metrics[
                        "attack_by_step"
                    ][step][
                        "false_positive_rate"
                    ],
                }
            )

        st.dataframe(
            pd.DataFrame(rows),
            use_container_width=True,
            hide_index=True,
        )

        st.caption(
            "Metrics are computed from the chronological "
            "test segment. With only 105 Module 2 windows, "
            "these metrics are an MVP benchmark, not a "
            "production-generalization claim."
        )


# ============================================================
# DATA & CONTRACT
# ============================================================

elif page == "Data & Contract":

    st.subheader(
        "Actual Module 2 contract"
    )

    st.write(
        "Module 3 consumes "
        "data/processed/network_state_sequence.csv "
        "from Module 2. The copy used here is the uploaded "
        "Module 2 output."
    )

    st.write(
        "Input columns"
    )

    st.code(
        ", ".join(df.columns)
    )

    st.write(
        "Model features "
        "(label-derived columns excluded to prevent leakage)"
    )

    feature_cols = [
        column
        for column in df.select_dtypes(
            include="number"
        ).columns
        if column not in [
            "stage_purity"
        ]
    ]

    st.code(
        ", ".join(feature_cols)
    )

    st.write(
        "Observed stage vocabulary"
    )

    st.json(
        sorted(
            df.majority_attack_stage
            .unique()
            .tolist()
        )
    )

    st.dataframe(
        df.tail(20),
        use_container_width=True,
        hide_index=True,
    )

    st.download_button(
        "Download Module 3 contract dataset",
        df.to_csv(
            index=False
        ).encode(),
        "network_state_sequence.csv",
        "text/csv",
    )


# ============================================================
# ARCHITECTURE
# ============================================================

elif page == "Architecture":

    st.subheader(
        "Judge-facing model pipeline"
    )

    st.markdown(
        """
**1. Network state representation** — each 5-second Module 2
window is represented by the numeric traffic-state features.
Ground-truth labels and `stage_purity` are excluded from the
model input so they cannot leak into the forecast.

**2. Temporal history** — the default model consumes the
previous 5 windows (25 seconds) and predicts the next 2
windows (10 seconds).

**3. LSTM world model** — a 2-layer LSTM encodes temporal
dependencies. Three heads are trained jointly:

- future continuous network state
- future attack probability
- future attack stage distribution

**4. K-step prediction** — the model emits T+1 and T+2
directly. The horizon is configurable.

**5. Risk** — attack probability is the sigmoid of a learned
attack logit. It is not hard-coded and is not claimed to be
calibrated on this small dataset.

**6. Stage** — stage prediction uses the actual
`majority_attack_stage` vocabulary present in Module 2.
A stage is only claimed when the model selects it; the
dashboard does not invent unsupported labels.

**7. Evaluation** — the final segment is held out
chronologically. Preprocessing is fitted only on the
training segment.

**8. Integration** — Module 4 can load
`artifacts/model.pt`, `preprocessor.joblib`,
`feature_schema.json`, `label_mapping.json`, and
`model_config.json` through the Python `Forecaster` class.
"""
    )

    st.code(
        "Module 2 CSV → validate → training-only scaler → "
        "temporal sequences → LSTM → future state + risk + "
        "stage → evaluation → artifacts → Module 4",
        language="text",
    )