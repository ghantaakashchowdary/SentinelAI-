import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import axios, { AxiosError } from "axios";
import cors from "cors";

// Ensure local Firestore emulator is used if running locally
if (!process.env.FIRESTORE_EMULATOR_HOST) {
  process.env.FIRESTORE_EMULATOR_HOST = "127.0.0.1:8080";
}

// Initialize Firebase Admin SDK
admin.initializeApp();
const db = getFirestore();



// CORS middleware handler
const corsHandler = cors({ origin: true });

// Configuration from environment variables
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const AI_SERVICE_TIMEOUT_MS = parseInt(process.env.AI_SERVICE_TIMEOUT_MS || "30000", 10);

const EXPECTED_SEQUENCE_LENGTH = 5;
const EXPECTED_FEATURE_COUNT = 21;

// Canonical feature columns in exact order from artifacts/feature_schema.json
export const CANONICAL_FEATURES = [
  "total_packets",
  "total_bytes",
  "duration",
  "syn_flag_count",
  "ack_flag_count",
  "fin_flag_count",
  "rst_flag_count",
  "psh_flag_count",
  "ttl",
  "tcp_window_size",
  "fragmented",
  "retransmission_count",
  "flow_bytes_per_sec",
  "flow_packets_per_sec",
  "avg_packet_size",
  "flow_count",
  "unique_src_ips",
  "unique_dst_ips",
  "unique_dst_ports",
  "tcp_count",
  "udp_count",
];

// ============================================================
// TYPE DEFINITIONS
// ============================================================

export interface FuturePrediction {
  step: number;
  time_window: string;
  attack_probability: number;
  predicted_stage: string;
  stage_confidence: number;
  predicted_state?: Record<string, number>;
}

export interface PredictionResult {
  model_version: string;
  feature_schema_version: string;
  attack_probability: number;
  predicted_stage: string;
  forecast_horizon: number;
  future_predictions: FuturePrediction[];
}

export interface PredictionDocument {
  id?: string;
  timestamp: admin.firestore.FieldValue | admin.firestore.Timestamp;
  model_version: string;
  feature_schema_version: string;
  attack_probability: number;
  predicted_stage: string;
  forecast_horizon: number;
  future_predictions: Array<{
    step: number;
    time_window: string;
    attack_probability: number;
    predicted_stage: string;
    stage_confidence: number;
  }>;
  request_metadata: {
    source: string;
    auth_uid?: string | null;
    created_at_iso: string;
  };
}

export interface PredictPayload {
  sequence: Array<number[] | Record<string, number>>;
  timestamps?: string[];
}

// ============================================================
// VALIDATION HELPER
// ============================================================

export function validatePredictionInput(data: any): { valid: boolean; error?: string; cleanPayload?: PredictPayload } {
  if (!data || typeof data !== "object") {
    return { valid: false, error: "Missing or invalid request body." };
  }

  const { sequence, timestamps } = data;

  if (!Array.isArray(sequence)) {
    return { valid: false, error: "'sequence' must be an array of 5 history windows." };
  }

  if (sequence.length !== EXPECTED_SEQUENCE_LENGTH) {
    return {
      valid: false,
      error: `Expected exactly ${EXPECTED_SEQUENCE_LENGTH} history windows, received ${sequence.length}.`,
    };
  }

  const cleanSequence: number[][] = [];

  for (let i = 0; i < sequence.length; i++) {
    const window = sequence[i];

    if (Array.isArray(window)) {
      if (window.length !== EXPECTED_FEATURE_COUNT) {
        return {
          valid: false,
          error: `Window ${i + 1} has ${window.length} features. Expected ${EXPECTED_FEATURE_COUNT}.`,
        };
      }
      const cleanRow: number[] = [];
      for (let j = 0; j < window.length; j++) {
        const val = Number(window[j]);
        if (isNaN(val) || !isFinite(val)) {
          return {
            valid: false,
            error: `Window ${i + 1}, feature '${CANONICAL_FEATURES[j]}' has non-numeric value: ${window[j]}`,
          };
        }
        cleanRow.push(val);
      }
      cleanSequence.push(cleanRow);
    } else if (window && typeof window === "object") {
      const cleanRow: number[] = [];
      for (const feat of CANONICAL_FEATURES) {
        if (!(feat in window)) {
          return {
            valid: false,
            error: `Window ${i + 1} is missing required feature: '${feat}'.`,
          };
        }
        const val = Number(window[feat]);
        if (isNaN(val) || !isFinite(val)) {
          return {
            valid: false,
            error: `Window ${i + 1}, feature '${feat}' has non-numeric value: ${window[feat]}`,
          };
        }
        cleanRow.push(val);
      }
      cleanSequence.push(cleanRow);
    } else {
      return {
        valid: false,
        error: `Window ${i + 1} must be an array of numbers or an object keyed by feature names.`,
      };
    }
  }

  let cleanTimestamps: string[] | undefined = undefined;
  if (timestamps !== undefined && timestamps !== null) {
    if (!Array.isArray(timestamps) || timestamps.length !== EXPECTED_SEQUENCE_LENGTH) {
      return {
        valid: false,
        error: `'timestamps' must be an array of ${EXPECTED_SEQUENCE_LENGTH} strings if provided.`,
      };
    }
    cleanTimestamps = timestamps.map((t) => String(t));
  }

  return {
    valid: true,
    cleanPayload: {
      sequence: cleanSequence,
      timestamps: cleanTimestamps,
    },
  };
}

// ============================================================
// CALL PYTHON AI INFERENCE SERVICE
// ============================================================

async function callPythonInference(payload: PredictPayload): Promise<PredictionResult> {
  const targetUrl = `${AI_SERVICE_URL.replace(/\/+$/, "")}/predict`;

  try {
    const response = await axios.post<PredictionResult>(targetUrl, payload, {
      timeout: AI_SERVICE_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });

    return response.data;
  } catch (err: any) {
    const axiosErr = err as AxiosError<any>;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.message.includes("timeout")) {
      functions.logger.error("Python AI service timed out after %d ms", AI_SERVICE_TIMEOUT_MS);
      throw new functions.https.HttpsError(
        "deadline-exceeded",
        `AI forecasting service timed out after ${AI_SERVICE_TIMEOUT_MS}ms.`
      );
    }

    if (axiosErr.code === "ECONNREFUSED" || !axiosErr.response) {
      functions.logger.error("Python AI service unreachable at %s: %s", targetUrl, axiosErr.message);
      throw new functions.https.HttpsError(
        "unavailable",
        "AI forecasting service is currently unreachable. Please ensure the Python API service is running."
      );
    }

    const statusCode = axiosErr.response.status;
    const responseData = axiosErr.response.data;

    functions.logger.error("Python AI service returned status %d: %j", statusCode, responseData);

    if (statusCode === 422) {
      const detail = responseData?.message || responseData?.detail || "Input validation failed in AI service.";
      throw new functions.https.HttpsError("invalid-argument", detail);
    }

    if (statusCode === 503) {
      throw new functions.https.HttpsError("unavailable", "AI model artifacts are unavailable.");
    }

    throw new functions.https.HttpsError(
      "internal",
      "An unexpected error occurred during AI model inference."
    );
  }
}

// ============================================================
// STORE PREDICTION IN FIRESTORE
// ============================================================

async function savePredictionToFirestore(
  prediction: PredictionResult,
  source: string,
  authUid?: string | null
): Promise<string> {
  try {
    const docData: PredictionDocument = {
      timestamp: FieldValue.serverTimestamp(),
      model_version: prediction.model_version,

      feature_schema_version: prediction.feature_schema_version,
      attack_probability: prediction.attack_probability,
      predicted_stage: prediction.predicted_stage,
      forecast_horizon: prediction.forecast_horizon,
      future_predictions: prediction.future_predictions.map((p) => ({
        step: p.step,
        time_window: p.time_window,
        attack_probability: p.attack_probability,
        predicted_stage: p.predicted_stage,
        stage_confidence: p.stage_confidence,
      })),
      request_metadata: {
        source,
        auth_uid: authUid || null,
        created_at_iso: new Date().toISOString(),
      },
    };

    const docRef = await db.collection("predictions").add(docData);
    functions.logger.info("Saved prediction to Firestore with ID: %s", docRef.id);
    return docRef.id;
  } catch (err: any) {
    functions.logger.error("Failed to write prediction history to Firestore: %s", err.message);
    // Non-fatal: do not block the prediction response if history persistence fails
    return "";
  }
}

// ============================================================
// CLOUD FUNCTIONS
// ============================================================

/**
 * predictAttack - Callable Cloud Function
 * Primary entry point for Firebase Web / Mobile SDKs.
 */
export const predictAttack = functions.https.onCall(async (data, context) => {
  // 1. Validate Input
  const validation = validatePredictionInput(data);
  if (!validation.valid || !validation.cleanPayload) {
    throw new functions.https.HttpsError("invalid-argument", validation.error || "Invalid payload.");
  }

  // 2. Call Python AI Service
  const prediction = await callPythonInference(validation.cleanPayload);

  // 3. Save to Firestore
  const predictionId = await savePredictionToFirestore(
    prediction,
    "firebase-callable",
    context.auth?.uid
  );

  // 4. Return clean result to Frontend
  return {
    prediction_id: predictionId,
    ...prediction,
  };
});

/**
 * apiPredict - HTTPS REST Endpoint
 * REST endpoint with CORS support for direct HTTP consumers.
 */
export const apiPredict = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed", message: "Only POST is supported." });
      return;
    }

    try {
      // 1. Validate input
      const validation = validatePredictionInput(req.body);
      if (!validation.valid || !validation.cleanPayload) {
        res.status(400).json({ error: "Bad Request", message: validation.error });
        return;
      }

      // 2. Inference
      const prediction = await callPythonInference(validation.cleanPayload);

      // 3. History
      const predictionId = await savePredictionToFirestore(prediction, "http-rest");

      // 4. Response
      res.status(200).json({
        prediction_id: predictionId,
        ...prediction,
      });
    } catch (err: any) {
      if (err instanceof functions.https.HttpsError) {
        const statusMap: Record<string, number> = {
          "invalid-argument": 400,
          "deadline-exceeded": 504,
          "unavailable": 503,
          "internal": 500,
        };
        const status = statusMap[err.code] || 500;
        res.status(status).json({ error: err.code, message: err.message });
      } else {
        functions.logger.error("Unhandled error in apiPredict: %s", err);
        res.status(500).json({ error: "internal", message: "Internal server error." });
      }
    }
  });
});

/**
 * getPredictionHistory - Callable Function
 * Retrieves recent prediction records from Firestore.
 */
export const getPredictionHistory = functions.https.onCall(async (data, _context) => {
  const limit = Math.min(Math.max(Number(data?.limit || 20), 1), 100);

  try {
    const snapshot = await db
      .collection("predictions")
      .orderBy("timestamp", "desc")
      .limit(limit)
      .get();

    const results = snapshot.docs.map((doc) => {
      const docData = doc.data();
      return {
        id: doc.id,
        ...docData,
        timestamp: docData.timestamp?.toDate ? docData.timestamp.toDate().toISOString() : null,
      };
    });

    return { count: results.length, predictions: results };
  } catch (err: any) {
    functions.logger.error("Failed to query prediction history: %s", err.message);
    throw new functions.https.HttpsError("internal", "Failed to retrieve prediction history.");
  }
});

/**
 * health - HTTPS REST Endpoint
 * Checks health of Firebase functions and connectivity to Python AI service.
 */
export const health = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    let pythonStatus = "unknown";
    let pythonDetails: any = null;

    try {
      const response = await axios.get(`${AI_SERVICE_URL.replace(/\/+$/, "")}/health`, {
        timeout: 5000,
      });
      pythonStatus = response.data?.status || "ok";
      pythonDetails = response.data;
    } catch (err: any) {
      pythonStatus = "unreachable";
      pythonDetails = { error: err.message };
    }

    res.status(pythonStatus === "healthy" || pythonStatus === "ok" ? 200 : 503).json({
      service: "module3-firebase-backend",
      status: pythonStatus === "healthy" || pythonStatus === "ok" ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      ai_service_url: AI_SERVICE_URL,
      ai_service_status: pythonStatus,
      ai_service_details: pythonDetails,
    });
  });
});


/**
 * predictFromRawTraffic - Callable Cloud Function
 * Handles raw network traffic (flows or CSV) by invoking Ganesh's pipeline via Python API.
 */
export const predictFromRawTraffic = functions.https.onCall(async (data, context) => {

  if (!data || typeof data !== "object") {
    throw new functions.https.HttpsError("invalid-argument", "Missing or invalid request body.");
  }

  const { flows, csv_data, window_seconds } = data;

  if (!flows && !csv_data) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Must provide either 'flows' (array of flow records) or 'csv_data' (CSV string)."
    );
  }

  const targetUrl = `${AI_SERVICE_URL.replace(/\/+$/, "")}/predict/raw-flows`;

  try {
    const response = await axios.post<PredictionResult>(
      targetUrl,
      { flows, csv_data, window_seconds: window_seconds || 5 },
      {
        timeout: AI_SERVICE_TIMEOUT_MS,
        headers: { "Content-Type": "application/json", Accept: "application/json" },
      }
    );

    const prediction = response.data;

    // Persist to Firestore with source metadata
    const predictionId = await savePredictionToFirestore(
      prediction,
      "firebase-callable-raw-flows",
      context.auth?.uid
    );

    return {
      prediction_id: predictionId,
      ...prediction,
    };
  } catch (err: any) {
    const axiosErr = err as AxiosError<any>;

    if (axiosErr.code === "ECONNABORTED" || axiosErr.message.includes("timeout")) {
      throw new functions.https.HttpsError("deadline-exceeded", `AI forecasting service timed out after ${AI_SERVICE_TIMEOUT_MS}ms.`);
    }

    if (axiosErr.code === "ECONNREFUSED" || !axiosErr.response) {
      throw new functions.https.HttpsError("unavailable", "AI forecasting service is currently unreachable.");
    }

    const statusCode = axiosErr.response.status;
    const responseData = axiosErr.response.data;

    if (statusCode === 422) {
      const detail = responseData?.message || responseData?.detail || "Input validation failed in AI pipeline.";
      throw new functions.https.HttpsError("invalid-argument", detail);
    }

    if (statusCode === 503) {
      throw new functions.https.HttpsError("unavailable", responseData?.detail || "AI model or Ganesh module unavailable.");
    }

    throw new functions.https.HttpsError("internal", "An unexpected error occurred during raw traffic inference.");
  }
});

/**
 * apiPredictRaw - HTTPS REST Endpoint
 * REST endpoint with CORS support for raw flow traffic.
 */
export const apiPredictRaw = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed", message: "Only POST is supported." });
      return;
    }

    const { flows, csv_data, window_seconds } = req.body || {};

    if (!flows && !csv_data) {
      res.status(400).json({ error: "Bad Request", message: "Must provide either 'flows' or 'csv_data'." });
      return;
    }

    const targetUrl = `${AI_SERVICE_URL.replace(/\/+$/, "")}/predict/raw-flows`;

    try {
      const response = await axios.post<PredictionResult>(
        targetUrl,
        { flows, csv_data, window_seconds: window_seconds || 5 },
        {
          timeout: AI_SERVICE_TIMEOUT_MS,
          headers: { "Content-Type": "application/json", Accept: "application/json" },
        }
      );

      const prediction = response.data;
      const predictionId = await savePredictionToFirestore(prediction, "http-rest-raw-flows");

      res.status(200).json({
        prediction_id: predictionId,
        ...prediction,
      });
    } catch (err: any) {
      const axiosErr = err as AxiosError<any>;
      if (axiosErr.response) {
        res.status(axiosErr.response.status).json(axiosErr.response.data);
      } else if (axiosErr.code === "ECONNABORTED") {
        res.status(504).json({ error: "deadline-exceeded", message: "AI service timed out." });
      } else {
        res.status(503).json({ error: "unavailable", message: "AI service unreachable." });
      }
    }
  });
});

