from __future__ import annotations

import json
import logging
import math
import os
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Any, Dict, List, Optional, Union

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

from src.forecasting.inference import Forecaster

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger("module3.api")

ROOT = Path(__file__).resolve().parent
DEFAULT_ARTIFACTS_DIR = ROOT / "artifacts"


class ModelManager:
    """Manages lazy or startup loading and health checking for Forecaster."""

    def __init__(self, artifact_dir: Path = DEFAULT_ARTIFACTS_DIR):
        self.artifact_dir = artifact_dir
        self.forecaster: Optional[Forecaster] = None
        self.feature_columns: List[str] = []
        self.sequence_length: int = 5
        self.forecast_horizon: int = 2
        self.model_version: str = "unknown"
        self.feature_schema_version: str = "unknown"
        self.load_metadata()

    def load_metadata(self) -> None:
        """Load feature schema and model configuration metadata."""
        schema_path = self.artifact_dir / "feature_schema.json"
        if schema_path.exists():
            try:
                with open(schema_path, "r", encoding="utf-8") as f:
                    schema = json.load(f)
                self.feature_columns = schema.get("feature_columns", [])
            except Exception as e:
                logger.warning("Could not read feature_schema.json: %s", e)

        config_path = self.artifact_dir / "model_config.json"
        if config_path.exists():
            try:
                with open(config_path, "r", encoding="utf-8") as f:
                    cfg = json.load(f)
                self.sequence_length = cfg.get("sequence_length", 5)
                self.forecast_horizon = cfg.get("forecast_horizon", 2)
                self.model_version = cfg.get("model_version", "1.0.0")
                self.feature_schema_version = cfg.get("feature_schema_version", "1.0.0")
            except Exception as e:
                logger.warning("Could not read model_config.json: %s", e)

    def check_artifacts(self) -> Dict[str, bool]:
        """Check presence of required artifact files."""
        required = [
            "model.pt",
            "preprocessor.joblib",
            "feature_schema.json",
            "label_mapping.json",
            "model_config.json",
        ]
        return {name: (self.artifact_dir / name).exists() for name in required}

    def is_healthy(self) -> bool:
        """Return True if all required artifacts are present and Forecaster can be loaded."""
        artifacts = self.check_artifacts()
        if not all(artifacts.values()):
            return False
        try:
            if self.forecaster is None:
                self.load_forecaster()
            return self.forecaster is not None
        except Exception as e:
            logger.error("Health check model load failed: %s", e)
            return False

    def load_forecaster(self) -> Forecaster:
        """Load and cache the Forecaster instance once."""
        if self.forecaster is None:
            logger.info("Loading Forecaster from %s", self.artifact_dir)
            self.forecaster = Forecaster(self.artifact_dir)
            self.feature_columns = self.forecaster.feature_columns
            self.sequence_length = self.forecaster.config.get("sequence_length", 5)
            self.forecast_horizon = self.forecaster.config.get("forecast_horizon", 2)
            self.model_version = self.forecaster.config.get("model_version", "1.0.0")
            self.feature_schema_version = self.forecaster.config.get("feature_schema_version", "1.0.0")
            logger.info(
                "Forecaster loaded successfully (version=%s, features=%d, sequence_len=%d)",
                self.model_version,
                len(self.feature_columns),
                self.sequence_length,
            )
        return self.forecaster


model_manager = ModelManager()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model once at application startup if artifacts exist."""
    try:
        if all(model_manager.check_artifacts().values()):
            model_manager.load_forecaster()
            logger.info("AI service startup complete with loaded model.")
        else:
            logger.warning("Artifacts missing at startup. Model will load on demand when available.")
    except Exception as e:
        logger.error("Failed to initialize model at startup: %s", e)
    yield


app = FastAPI(
    title="Module 3 AI Attack Forecasting API",
    description="Python HTTP API wrapping Madhav's multi-stage attack forecasting LSTM model for Firebase/frontend integration.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# PYDANTIC SCHEMAS
# ============================================================

class PredictRequest(BaseModel):
    sequence: List[Union[List[Union[float, int]], Dict[str, Union[float, int]]]] = Field(
        ...,
        description="5 history windows containing 21 features each (either 2D array or list of feature dicts)",
    )
    timestamps: Optional[List[str]] = Field(
        None,
        description="Optional list of 5 ISO-8601 timestamps for the history windows",
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "sequence": [
                    [100.0, 5000.0, 5.0, 10.0, 12.0, 0.0, 0.0, 5.0, 64.0, 65535.0, 0.0, 0.0, 1000.0, 20.0, 50.0, 15.0, 3.0, 4.0, 2.0, 15.0, 0.0],
                    [110.0, 5200.0, 5.0, 12.0, 14.0, 0.0, 0.0, 6.0, 64.0, 65535.0, 0.0, 0.0, 1040.0, 22.0, 47.0, 16.0, 3.0, 4.0, 2.0, 16.0, 0.0],
                    [120.0, 5400.0, 5.0, 15.0, 16.0, 0.0, 0.0, 7.0, 64.0, 65535.0, 0.0, 0.0, 1080.0, 24.0, 45.0, 17.0, 4.0, 5.0, 3.0, 17.0, 0.0],
                    [130.0, 5600.0, 5.0, 18.0, 18.0, 0.0, 0.0, 8.0, 64.0, 65535.0, 0.0, 0.0, 1120.0, 26.0, 43.0, 18.0, 4.0, 5.0, 3.0, 18.0, 0.0],
                    [140.0, 5800.0, 5.0, 20.0, 20.0, 0.0, 0.0, 9.0, 64.0, 65535.0, 0.0, 0.0, 1160.0, 28.0, 41.0, 19.0, 5.0, 6.0, 4.0, 19.0, 0.0],
                ],
                "timestamps": [
                    "2026-08-27T09:00:00",
                    "2026-08-27T09:00:05",
                    "2026-08-27T09:00:10",
                    "2026-08-27T09:00:15",
                    "2026-08-27T09:00:20",
                ],
            }
        }
    }


class FuturePrediction(BaseModel):
    step: int
    time_window: str
    attack_probability: float
    predicted_stage: str
    stage_confidence: float
    predicted_state: Dict[str, float]


class PredictResponse(BaseModel):
    model_version: str
    feature_schema_version: str
    attack_probability: float
    predicted_stage: str
    forecast_horizon: int
    future_predictions: List[FuturePrediction]


class HealthResponse(BaseModel):
    status: str
    service: str
    artifacts_ready: bool
    artifacts: Dict[str, bool]
    model_version: str
    feature_count: int
    sequence_length: int
    forecast_horizon: int
    ganesh_pipeline_available: bool = Field(
        default=True,
        description="Whether Ganesh's network data & feature extraction pipeline is available"
    )


class RawFlowsRequest(BaseModel):
    flows: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="List of raw network flow records (must cover >= 25 seconds to generate 5 windows)"
    )
    csv_data: Optional[str] = Field(
        None,
        description="Raw CSV text of network flow records"
    )
    window_seconds: Optional[int] = Field(
        5,
        description="Time window duration in seconds (default 5)"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "flows": [
                    {
                        "timestamp": "2026-08-27 09:00:00.100",
                        "src_ip": "192.168.1.5",
                        "dst_ip": "10.0.0.1",
                        "protocol": "TCP",
                        "src_port": 54321,
                        "dst_port": 80,
                        "duration": 0.05,
                        "total_fwd_packets": 5,
                        "total_bwd_packets": 4,
                        "total_fwd_bytes": 450,
                        "total_bwd_bytes": 520,
                        "syn_flag_count": 1,
                        "ack_flag_count": 8,
                        "fin_flag_count": 0,
                        "rst_flag_count": 0,
                        "psh_flag_count": 2,
                        "urg_flag_count": 0,
                        "ttl": 64,
                        "tcp_window_size": 65535,
                        "fragmented": 0,
                        "retransmission_count": 0
                    }
                ]
            }
        }
    }



# ============================================================
# EXCEPTION HANDLERS
# ============================================================

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for err in exc.errors():
        loc = " -> ".join(str(l) for l in err.get("loc", []))
        errors.append(f"{loc}: {err.get('msg', 'Invalid value')}")
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "; ".join(errors) if errors else "Invalid request payload format",
            "details": exc.errors(),
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "message": exc.detail,
        },
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled error: %s", exc, exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Internal Server Error",
            "message": "An unexpected error occurred during prediction",
        },
    )


# ============================================================
# ENDPOINTS
# ============================================================

@app.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint.
    Verifies service status, artifact presence, model readiness, and Ganesh adapter availability.
    Does NOT execute training.
    """
    from src.integration.ganesh_adapter import is_ganesh_available

    artifacts_status = model_manager.check_artifacts()
    all_ready = all(artifacts_status.values())
    ganesh_ready = is_ganesh_available()
    
    return HealthResponse(
        status="healthy" if all_ready else "degraded",
        service="module3-ai-forecasting",
        artifacts_ready=all_ready,
        artifacts=artifacts_status,
        model_version=model_manager.model_version,
        feature_count=len(model_manager.feature_columns),
        sequence_length=model_manager.sequence_length,
        forecast_horizon=model_manager.forecast_horizon,
        ganesh_pipeline_available=ganesh_ready,
    )


@app.post("/predict", response_model=PredictResponse)
def predict(request_data: PredictRequest):
    """
    Run multi-stage attack forecasting inference.
    
    Validates:
    - Exactly 5 history windows
    - Exactly 21 features matching canonical feature schema
    - Numeric validity (no NaN/Inf)
    
    Calls Forecaster.predict() without retraining.
    """
    # 1. Check artifacts readiness
    artifacts_status = model_manager.check_artifacts()
    if not all(artifacts_status.values()):
        missing = [k for k, v in artifacts_status.items() if not v]
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model artifacts not available. Missing: {missing}",
        )

    # 2. Ensure Forecaster is loaded
    try:
        forecaster = model_manager.load_forecaster()
    except Exception as e:
        logger.error("Failed to load Forecaster: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load forecasting model: {str(e)}",
        )

    expected_len = forecaster.config.get("sequence_length", 5)
    feature_cols = forecaster.feature_columns
    expected_num_features = len(feature_cols)

    # 3. Validate history length
    seq = request_data.sequence
    if len(seq) != expected_len:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Expected exactly {expected_len} history windows, received {len(seq)}.",
        )

    # 4. Validate and convert features
    matrix: List[List[float]] = []

    for i, window in enumerate(seq):
        if isinstance(window, list):
            if len(window) != expected_num_features:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=(
                        f"Window {i + 1} has {len(window)} features. "
                        f"Expected exactly {expected_num_features} features in order: {feature_cols}"
                    ),
                )
            row_floats: List[float] = []
            for j, val in enumerate(window):
                if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Window {i + 1}, feature '{feature_cols[j]}' has non-numeric/invalid value: {val}",
                    )
                row_floats.append(float(val))
            matrix.append(row_floats)

        elif isinstance(window, dict):
            missing_keys = [col for col in feature_cols if col not in window]
            if missing_keys:
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail=f"Window {i + 1} is missing required features: {missing_keys}",
                )
            row_floats: List[float] = []
            for col in feature_cols:
                val = window[col]
                if not isinstance(val, (int, float)) or math.isnan(val) or math.isinf(val):
                    raise HTTPException(
                        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                        detail=f"Window {i + 1}, feature '{col}' has non-numeric/invalid value: {val}",
                    )
                row_floats.append(float(val))
            matrix.append(row_floats)
        else:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Window {i + 1} must be an array of {expected_num_features} numbers or an object keyed by feature names.",
            )

    # 5. Validate timestamps if provided
    timestamps = request_data.timestamps
    if timestamps is not None:
        if len(timestamps) != expected_len:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Expected {expected_len} timestamps, received {len(timestamps)}.",
            )
        for t in timestamps:
            if not isinstance(t, str) or not t.strip():
                raise HTTPException(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    detail="Timestamps must be non-empty strings (e.g. ISO-8601 format).",
                )

    # 6. Convert to DataFrame and call Madhav's existing Forecaster.predict()
    try:
        input_df = pd.DataFrame(matrix, columns=feature_cols)
        prediction_result = forecaster.predict(input_df, timestamps)
        return prediction_result
    except ValueError as ve:
        logger.warning("Forecaster input error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Prediction validation error: {str(ve)}",
        )
    except Exception as e:
        logger.error("Inference failure: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model inference execution failed.",
        )


@app.post("/predict/raw-flows", response_model=PredictResponse)
def predict_raw_flows(request_data: RawFlowsRequest):
    """
    Run multi-stage attack forecasting starting from RAW network flows.
    
    1. Passes raw flow records into Ganesh's pipeline (cleaning, feature extraction, 5s windowing).
    2. Enforces the 5-window requirement (>= 25 seconds of network activity).
    3. Strips ground-truth label columns.
    4. Passes the resulting 5 windows (21 numerical features) to Madhav's Forecaster.predict().
    5. Returns Module 4 compatible multi-step forecast.
    """
    from src.integration.ganesh_adapter import process_raw_flows_to_sequence, is_ganesh_available

    # 1. Check Ganesh module availability
    if not is_ganesh_available():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Ganesh Network Data Pipeline module is not available on this server.",
        )

    # 2. Check artifacts readiness
    artifacts_status = model_manager.check_artifacts()
    if not all(artifacts_status.values()):
        missing = [k for k, v in artifacts_status.items() if not v]
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Model artifacts not available. Missing: {missing}",
        )

    # 3. Ensure Forecaster is loaded
    try:
        forecaster = model_manager.load_forecaster()
    except Exception as e:
        logger.error("Failed to load Forecaster: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to load forecasting model: {str(e)}",
        )

    # 4. Extract raw data from request
    raw_payload: Union[List[Dict[str, Any]], str, None] = None
    if request_data.flows is not None:
        raw_payload = request_data.flows
    elif request_data.csv_data is not None:
        raw_payload = request_data.csv_data
    else:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Must provide either 'flows' (list of flow objects) or 'csv_data' (CSV text).",
        )

    # 5. Process through Ganesh's pipeline into 5 windows
    try:
        sequence_df, timestamps, ganesh_log = process_raw_flows_to_sequence(
            raw_input=raw_payload,
            window_seconds=request_data.window_seconds or 5,
            required_windows=forecaster.config.get("sequence_length", 5),
        )
    except ValueError as ve:
        logger.warning("Ganesh pipeline validation error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(ve),
        )
    except Exception as e:
        logger.error("Ganesh pipeline processing error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process raw network flows: {str(e)}",
        )

    # 6. Run Madhav Forecaster inference
    try:
        prediction_result = forecaster.predict(sequence_df, timestamps)
        return prediction_result
    except ValueError as ve:
        logger.warning("Forecaster input error: %s", ve)
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Prediction validation error: {str(ve)}",
        )
    except Exception as e:
        logger.error("Inference failure: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Model inference execution failed.",
        )



if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "0.0.0.0")
    uvicorn.run("api:app", host=host, port=port, reload=True)
