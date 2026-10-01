from pathlib import Path
from typing import Optional

import joblib
import numpy as np
import torch
import torch.nn as nn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ============================================================
# Paths
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "air_quality_model.pth"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
MEDIANS_PATH = MODEL_DIR / "train_medians.pkl"


# ============================================================
# Model architecture
# ============================================================

class AirQualityNet(nn.Module):
    def __init__(self):
        super().__init__()

        self.network = nn.Sequential(
            nn.Linear(24, 16),
            nn.ReLU(),
            nn.Linear(16, 8),
            nn.ReLU(),
            nn.Linear(8, 1),
        )

    def forward(self, x):
        return self.network(x)


# ============================================================
# Load preprocessing objects and model
# ============================================================

print("Loading AirSense model...")

if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found: {MODEL_PATH}")

if not SCALER_PATH.exists():
    raise FileNotFoundError(f"Scaler file not found: {SCALER_PATH}")

if not MEDIANS_PATH.exists():
    raise FileNotFoundError(f"Training medians file not found: {MEDIANS_PATH}")


scaler = joblib.load(SCALER_PATH)
train_medians = joblib.load(MEDIANS_PATH)

model = AirQualityNet()

checkpoint = torch.load(
    MODEL_PATH,
    map_location="cpu",
    weights_only=False,
)

# Support either a raw state_dict or a checkpoint dictionary
if isinstance(checkpoint, dict) and "state_dict" in checkpoint:
    state_dict = checkpoint["state_dict"]
else:
    state_dict = checkpoint

model.load_state_dict(state_dict)
model.eval()

print("Model loaded successfully.")


# ============================================================
# FastAPI application
# ============================================================

app = FastAPI(
    title="AirSense API",
    description="Neural air-quality prediction API",
    version="1.0.0",
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local frontend
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        # Production frontend
        "https://airsense-air-quality.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Request schema
# ============================================================

class PredictionRequest(BaseModel):
    sensor1: Optional[float] = None
    benzene: Optional[float] = None
    sensor2: Optional[float] = None
    nox: Optional[float] = None
    sensor3: Optional[float] = None
    no2: Optional[float] = None
    sensor4: Optional[float] = None
    sensor5: Optional[float] = None
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    absoluteHumidity: Optional[float] = None
    hour: Optional[float] = None


# ============================================================
# Feature order
# ============================================================

FEATURE_NAMES = [
    "PT08.S1(CO)",
    "C6H6(GT)",
    "PT08.S2(NMHC)",
    "NOx(GT)",
    "PT08.S3(NOx)",
    "NO2(GT)",
    "PT08.S4(NO2)",
    "PT08.S5(O3)",
    "T",
    "RH",
    "AH",
    "Hour",
]


# ============================================================
# Utility: retrieve training median
# ============================================================

def get_median(feature_name: str) -> float:
    """
    Retrieve a training median regardless of whether the saved
    object is a dictionary, pandas Series, or similar object.
    """

    if hasattr(train_medians, "get"):
        value = train_medians.get(feature_name)

        if value is not None:
            return float(value)

    try:
        return float(train_medians[feature_name])
    except Exception:
        return 0.0


# ============================================================
# Build model input
# ============================================================

def build_features(data: PredictionRequest):
    values = [
        data.sensor1,
        data.benzene,
        data.sensor2,
        data.nox,
        data.sensor3,
        data.no2,
        data.sensor4,
        data.sensor5,
        data.temperature,
        data.humidity,
        data.absoluteHumidity,
        data.hour,
    ]

    cleaned_values = []
    missing_indicators = []

    for feature_name, value in zip(FEATURE_NAMES, values):
        if value is None:
            cleaned_values.append(
                get_median(feature_name)
            )

            missing_indicators.append(1.0)

        else:
            cleaned_values.append(float(value))
            missing_indicators.append(0.0)

    # 12 original features
    original_features = np.array(
        cleaned_values,
        dtype=np.float32,
    )

    # 12 missing-value indicators
    missing_features = np.array(
        missing_indicators,
        dtype=np.float32,
    )

    # Total = 24 features
    combined = np.concatenate(
        [original_features, missing_features]
    )

    return combined


# ============================================================
# Health endpoints
# ============================================================

@app.get("/")
def root():
    return {
        "name": "AirSense API",
        "status": "online",
        "model": "AirQualityNet",
        "version": "1.0.0",
    }


@app.get("/health")
def health():
    return {
        "status": "healthy",
        "model_loaded": True,
    }


# ============================================================
# Prediction endpoint
# ============================================================

@app.post("/predict")
def predict(data: PredictionRequest):
    features = build_features(data)

    # Scaler expects 24 features
    scaled_features = scaler.transform(
        features.reshape(1, -1)
    )

    tensor = torch.tensor(
        scaled_features,
        dtype=torch.float32,
    )

    with torch.no_grad():
        prediction = model(tensor)

    value = float(prediction.item())

    # CO concentration should not be negative
    value = max(0.0, value)

    return {
        "prediction": round(value, 4),
        "unit": "mg/m³",
        "model": "AirQualityNet",
    }