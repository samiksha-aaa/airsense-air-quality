import json
import pickle
from pathlib import Path

import numpy as np
import pandas as pd
import streamlit as st
import torch
import torch.nn as nn


# ============================================================
# PAGE CONFIG
# ============================================================

st.set_page_config(
    page_title="AirSense | Neural Air Quality Intelligence",
    page_icon="🌍",
    layout="wide",
    initial_sidebar_state="expanded",
)


# ============================================================
# PROJECT PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_DIR = BASE_DIR / "models"

MODEL_PATH = MODEL_DIR / "air_quality_model.pth"
SCALER_PATH = MODEL_DIR / "scaler.pkl"
MEDIANS_PATH = MODEL_DIR / "train_medians.pkl"
MODEL_INFO_PATH = MODEL_DIR / "model_info.json"


# ============================================================
# FEATURE DEFINITIONS
# ============================================================

FEATURES = [
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

FEATURE_LABELS = {
    "PT08.S1(CO)": "PT08.S1 — CO Sensor",
    "C6H6(GT)": "C6H6 — Benzene",
    "PT08.S2(NMHC)": "PT08.S2 — NMHC Sensor",
    "NOx(GT)": "NOx",
    "PT08.S3(NOx)": "PT08.S3 — NOx Sensor",
    "NO2(GT)": "NO2",
    "PT08.S4(NO2)": "PT08.S4 — NO2 Sensor",
    "PT08.S5(O3)": "PT08.S5 — O3 Sensor",
    "T": "Temperature",
    "RH": "Relative Humidity",
    "AH": "Absolute Humidity",
    "Hour": "Hour of Day",
}


# ============================================================
# MODEL
# ============================================================

class AirQualityNet(nn.Module):
    def __init__(self):
        super().__init__()

        # IMPORTANT:
        # The saved model was trained with:
        # 12 original features + 12 missing-value indicators = 24 inputs

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
# LOAD MODEL
# ============================================================

@st.cache_resource
def load_assets():

    model = AirQualityNet()

    state_dict = torch.load(
        MODEL_PATH,
        map_location="cpu",
        weights_only=True,
    )

    model.load_state_dict(state_dict)
    model.eval()

    with open(SCALER_PATH, "rb") as file:
        scaler = pickle.load(file)

    with open(MEDIANS_PATH, "rb") as file:
        medians = pickle.load(file)

    if MODEL_INFO_PATH.exists():
        with open(MODEL_INFO_PATH, "r", encoding="utf-8") as file:
            model_info = json.load(file)
    else:
        model_info = {}

    return model, scaler, medians, model_info


# ============================================================
# THEME
# ============================================================

if "dark_mode" not in st.session_state:
    st.session_state.dark_mode = True


dark_mode = st.session_state.dark_mode


if dark_mode:

    BG = "#0B1120"
    SIDEBAR = "#111827"
    CARD = "#151F32"
    CARD_ALT = "#1A263B"
    BORDER = "#26354D"
    TEXT = "#F8FAFC"
    MUTED = "#94A3B8"
    GREEN = "#22C55E"
    BLUE = "#38BDF8"
    INPUT = "#182337"

else:

    BG = "#F4F7FB"
    SIDEBAR = "#FFFFFF"
    CARD = "#FFFFFF"
    CARD_ALT = "#F8FAFC"
    BORDER = "#DCE3ED"
    TEXT = "#0F172A"
    MUTED = "#64748B"
    GREEN = "#16A34A"
    BLUE = "#0284C7"
    INPUT = "#FFFFFF"


# ============================================================
# STYLING
# ============================================================

st.markdown(
    f"""
    <style>

    /* ================================
       MAIN APP
       ================================ */

    .stApp {{
        background: {BG};
    }}

    .main {{
        background: {BG};
    }}

    /* ================================
       SIDEBAR
       ================================ */

    section[data-testid="stSidebar"] {{
        background: {SIDEBAR};
        border-right: 1px solid {BORDER};
    }}

    section[data-testid="stSidebar"] * {{
        color: {TEXT};
    }}

    /* ================================
       TEXT
       ================================ */

    h1, h2, h3, h4, h5, h6 {{
        color: {TEXT} !important;
    }}

    p {{
        color: {TEXT};
    }}

    /* ================================
       HERO
       ================================ */

    .hero-box {{
        background:
            linear-gradient(
                135deg,
                {CARD} 0%,
                {CARD_ALT} 55%,
                rgba(56, 189, 248, 0.08) 100%
            );

        border: 1px solid {BORDER};
        border-radius: 24px;
        padding: 34px 38px;
        margin-bottom: 28px;
        box-shadow: 0 15px 45px rgba(0,0,0,0.08);
    }}

    .hero-eyebrow {{
        color: {GREEN};
        font-size: 12px;
        font-weight: 800;
        letter-spacing: 1.8px;
        text-transform: uppercase;
        margin-bottom: 8px;
    }}

    .hero-title {{
        color: {TEXT};
        font-size: 42px;
        font-weight: 850;
        line-height: 1.08;
        margin-bottom: 12px;
    }}

    .hero-description {{
        color: {MUTED};
        font-size: 16px;
        line-height: 1.65;
        max-width: 850px;
    }}

    /* ================================
       CARDS
       ================================ */

    div[data-testid="stMetric"] {{
        background: {CARD};
        border: 1px solid {BORDER};
        border-radius: 16px;
        padding: 16px;
    }}

    div[data-testid="stMetricLabel"] {{
        color: {MUTED} !important;
    }}

    div[data-testid="stMetricValue"] {{
        color: {TEXT} !important;
    }}

    /* ================================
       INPUTS
       ================================ */

    .stNumberInput input {{
        background: {INPUT} !important;
        color: {TEXT} !important;
        border-color: {BORDER} !important;
    }}

    .stNumberInput label {{
        color: {TEXT} !important;
    }}

    /* ================================
       BUTTONS
       ================================ */

    .stButton > button {{
        border-radius: 12px;
        min-height: 44px;
        font-weight: 700;
    }}

    /* ================================
       TABS
       ================================ */

    button[data-baseweb="tab"] {{
        color: {MUTED};
        font-weight: 700;
    }}

    /* ================================
       EXPANDERS
       ================================ */

    details {{
        background: {CARD};
        border: 1px solid {BORDER};
        border-radius: 14px;
    }}

    /* ================================
       DATAFRAMES
       ================================ */

    div[data-testid="stDataFrame"] {{
        border: 1px solid {BORDER};
        border-radius: 12px;
        overflow: hidden;
    }}

    /* ================================
       DIVIDERS
       ================================ */

    hr {{
        border-color: {BORDER};
    }}

    </style>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# LOAD EVERYTHING
# ============================================================

try:

    model, scaler, medians, model_info = load_assets()

    MODEL_READY = True
    LOAD_ERROR = None

except Exception as error:

    MODEL_READY = False
    LOAD_ERROR = str(error)


# ============================================================
# SIDEBAR
# ============================================================

with st.sidebar:

    st.markdown("## 🌍 AirSense")

    st.caption("Neural Air Quality Intelligence")

    st.divider()

    page = st.radio(
        "Workspace",
        [
            "🎯 Prediction",
            "📊 Explore",
            "🧠 Model",
        ],
        label_visibility="visible",
    )

    st.divider()

    st.markdown("### Appearance")

    theme_changed = st.toggle(
        "Dark mode",
        value=dark_mode,
    )

    if theme_changed != st.session_state.dark_mode:
        st.session_state.dark_mode = theme_changed
        st.rerun()

    st.divider()

    st.markdown("### System")

    if MODEL_READY:
        st.success("Model online")
    else:
        st.error("Model unavailable")

    st.caption("PyTorch neural network")
    st.caption("24-input architecture")


# ============================================================
# MODEL ERROR
# ============================================================

if not MODEL_READY:

    st.title("Model loading problem")

    st.error(LOAD_ERROR)

    st.info(
        f"""
        The application found the model folder:

        `{MODEL_DIR}`

        Required files:

        - `air_quality_model.pth`
        - `scaler.pkl`
        - `train_medians.pkl`
        - `model_info.json`
        """
    )

    st.stop()


# ============================================================
# HERO
# ============================================================

st.markdown(
    """
    <div class="hero-box">

        <div class="hero-eyebrow">
            Machine Learning · Environmental Intelligence
        </div>

        <div class="hero-title">
            AirSense
        </div>

        <div class="hero-description">
            A neural-network-powered air quality analytics system for
            estimating carbon monoxide concentration from atmospheric
            conditions and sensor measurements — with built-in
            missing-data awareness.
        </div>

    </div>
    """,
    unsafe_allow_html=True,
)


# ============================================================
# PREDICTION PAGE
# ============================================================

if page == "🎯 Prediction":

    st.header("Prediction Center")

    st.caption(
        "Enter current environmental and sensor measurements to estimate CO concentration."
    )

    # --------------------------------------------------------
    # QUICK STATUS
    # --------------------------------------------------------

    metric1, metric2, metric3 = st.columns(3)

    with metric1:
        st.metric(
            "Model",
            "Neural Network",
        )

    with metric2:
        st.metric(
            "Input Features",
            "24",
        )

    with metric3:
        st.metric(
            "Target",
            "CO(GT)",
        )

    st.divider()

    # --------------------------------------------------------
    # INPUT SECTIONS
    # --------------------------------------------------------

    tab_atmosphere, tab_gases, tab_sensors = st.tabs(
        [
            "🌡️ Atmospheric Conditions",
            "🧪 Gas Measurements",
            "📡 Sensor Measurements",
        ]
    )

    values = {}

    # --------------------------------------------------------
    # ATMOSPHERE
    # --------------------------------------------------------

    with tab_atmosphere:

        st.subheader("Atmospheric Conditions")

        st.caption(
            "Environmental conditions that influence pollutant concentration."
        )

        col1, col2, col3, col4 = st.columns(4)

        with col1:
            values["T"] = st.number_input(
                "Temperature (°C)",
                value=20.0,
                step=0.1,
                format="%.2f",
            )

        with col2:
            values["RH"] = st.number_input(
                "Relative Humidity (%)",
                value=50.0,
                step=0.5,
                format="%.2f",
            )

        with col3:
            values["AH"] = st.number_input(
                "Absolute Humidity",
                value=1.0,
                step=0.01,
                format="%.3f",
            )

        with col4:
            values["Hour"] = st.slider(
                "Hour of Day",
                min_value=0,
                max_value=23,
                value=12,
            )

    # --------------------------------------------------------
    # GAS MEASUREMENTS
    # --------------------------------------------------------

    with tab_gases:

        st.subheader("Gas Measurements")

        st.caption(
            "Measured concentrations of atmospheric pollutants."
        )

        col1, col2, col3 = st.columns(3)

        with col1:
            values["C6H6(GT)"] = st.number_input(
                "C6H6 (GT)",
                value=10.0,
                step=0.1,
                format="%.2f",
            )

        with col2:
            values["NOx(GT)"] = st.number_input(
                "NOx (GT)",
                value=200.0,
                step=1.0,
                format="%.2f",
            )

        with col3:
            values["NO2(GT)"] = st.number_input(
                "NO2 (GT)",
                value=100.0,
                step=1.0,
                format="%.2f",
            )

    # --------------------------------------------------------
    # SENSOR MEASUREMENTS
    # --------------------------------------------------------

    with tab_sensors:

        st.subheader("Sensor Measurements")

        st.caption(
            "Electrochemical and metal-oxide sensor readings."
        )

        col1, col2 = st.columns(2)

        with col1:
            values["PT08.S1(CO)"] = st.number_input(
                "PT08.S1 — CO",
                value=1000.0,
                step=1.0,
                format="%.2f",
            )

            values["PT08.S2(NMHC)"] = st.number_input(
                "PT08.S2 — NMHC",
                value=900.0,
                step=1.0,
                format="%.2f",
            )

            values["PT08.S3(NOx)"] = st.number_input(
                "PT08.S3 — NOx",
                value=800.0,
                step=1.0,
                format="%.2f",
            )

        with col2:
            values["PT08.S4(NO2)"] = st.number_input(
                "PT08.S4 — NO2",
                value=1400.0,
                step=1.0,
                format="%.2f",
            )

            values["PT08.S5(O3)"] = st.number_input(
                "PT08.S5 — O3",
                value=1000.0,
                step=1.0,
                format="%.2f",
            )

            # This makes the three gas measurements appear balanced
            # visually with the sensor section.
            st.info(
                "The model combines these sensor readings with the atmospheric "
                "and gas measurements above."
            )

    # --------------------------------------------------------
    # MISSING DATA SIMULATION
    # --------------------------------------------------------

    st.divider()

    st.subheader("Missing-data awareness")

    st.caption(
        "The trained model includes 12 missing-value indicators. "
        "You can optionally simulate missing measurements."
    )

    enable_missing = st.checkbox(
        "Simulate missing sensor measurements",
        value=False,
    )

    missing_features = []

    if enable_missing:

        missing_features = st.multiselect(
            "Select measurements to treat as missing",
            FEATURES,
            format_func=lambda x: FEATURE_LABELS.get(x, x),
        )

        if missing_features:

            st.warning(
                f"{len(missing_features)} measurement(s) will be replaced "
                "with their training-data median."
            )

    # --------------------------------------------------------
    # PREDICT
    # --------------------------------------------------------

    st.divider()

    predict = st.button(
        "🚀 Generate CO Prediction",
        type="primary",
        use_container_width=True,
    )

    if predict:

        # ----------------------------------------------------
        # ORIGINAL 12 FEATURES
        # ----------------------------------------------------

        feature_vector = []

        missing_indicators = []

        for feature in FEATURES:

            value = float(values[feature])

            if feature in missing_features:

                # Use training median for missing value.
                if isinstance(medians, dict):

                    median_value = medians.get(feature, value)

                else:

                    median_value = value

                value = float(median_value)

                missing_indicators.append(1.0)

            else:

                missing_indicators.append(0.0)

            feature_vector.append(value)

        # ----------------------------------------------------
        # 12 FEATURES + 12 MISSING INDICATORS = 24
        # ----------------------------------------------------

        complete_vector = feature_vector + missing_indicators

        X = np.asarray(
            complete_vector,
            dtype=np.float32,
        ).reshape(1, -1)

        # Safety check.
        if X.shape[1] != 24:

            st.error(
                f"Unexpected feature count: {X.shape[1]}. "
                "The trained model expects 24 inputs."
            )

            st.stop()

        # ----------------------------------------------------
        # SCALE
        # ----------------------------------------------------

        X_scaled = scaler.transform(X)

        tensor = torch.tensor(
            X_scaled,
            dtype=torch.float32,
        )

        # ----------------------------------------------------
        # PREDICTION
        # ----------------------------------------------------

        with torch.no_grad():

            prediction = model(tensor).item()

        prediction = max(0.0, float(prediction))

        # ----------------------------------------------------
        # RESULT
        # ----------------------------------------------------

        st.success("Prediction generated successfully.")

        st.markdown("### Estimated CO concentration")

        result_col1, result_col2, result_col3 = st.columns(
            [1, 1.4, 1]
        )

        with result_col2:

            st.metric(
                label="CO(GT)",
                value=f"{prediction:.2f}",
                help="Estimated carbon monoxide concentration.",
            )

        st.caption(
            "Prediction produced by the trained AirSense neural network."
        )

        # ----------------------------------------------------
        # PREDICTION DETAILS
        # ----------------------------------------------------

        with st.expander("View prediction details"):

            detail1, detail2 = st.columns(2)

            with detail1:

                st.write(
                    "**Input measurements:**",
                    len(feature_vector),
                )

                st.write(
                    "**Missing indicators:**",
                    len(missing_indicators),
                )

            with detail2:

                st.write(
                    "**Total model inputs:**",
                    len(complete_vector),
                )

                st.write(
                    "**Missing measurements:**",
                    len(missing_features),
                )


# ============================================================
# EXPLORE PAGE
# ============================================================

elif page == "📊 Explore":

    st.header("Air Quality Explorer")

    st.caption(
        "A compact overview of the dataset, model performance, and feature relationships."
    )

    # --------------------------------------------------------
    # DATASET METRICS
    # --------------------------------------------------------

    col1, col2, col3, col4 = st.columns(4)

    with col1:
        st.metric(
            "Observations",
            "9,357",
        )

    with col2:
        st.metric(
            "Original Features",
            "12",
        )

    with col3:
        st.metric(
            "Model Inputs",
            "24",
        )

    with col4:
        st.metric(
            "Target",
            "CO(GT)",
        )

    st.divider()

    # --------------------------------------------------------
    # MODEL PERFORMANCE
    # --------------------------------------------------------

    st.subheader("Model Performance")

    performance = pd.DataFrame(
        {
            "Evaluation": [
                "Baseline",
                "Neural Network",
                "Time-based evaluation",
                "Final evaluation",
                "Missing-feature indicator",
            ],
            "MAE": [
                1.1345,
                0.4101,
                0.7471,
                0.5860,
                0.4794,
            ],
            "RMSE": [
                1.4762,
                0.6100,
                0.9672,
                0.7666,
                0.6736,
            ],
        }
    )

    st.dataframe(
        performance,
        use_container_width=True,
        hide_index=True,
    )

    st.divider()

    # --------------------------------------------------------
    # TARGET DISTRIBUTION
    # --------------------------------------------------------

    st.subheader("CO(GT) Distribution")

    target_stats = pd.DataFrame(
        {
            "Statistic": [
                "Mean",
                "Median",
                "Minimum",
                "Maximum",
                "Standard deviation",
            ],
            "CO(GT)": [
                2.1306,
                1.8,
                0.1,
                11.9,
                1.4317,
            ],
        }
    )

    col1, col2 = st.columns([1, 2])

    with col1:

        st.dataframe(
            target_stats,
            use_container_width=True,
            hide_index=True,
        )

    with col2:

        distribution = pd.DataFrame(
            {
                "CO range": [
                    "0–1",
                    "1–2",
                    "2–3",
                    "3–4",
                    "4–6",
                    "6+",
                ],
                "Representative level": [
                    0.5,
                    1.5,
                    2.5,
                    3.5,
                    5.0,
                    7.0,
                ],
            }
        )

        st.bar_chart(
            distribution.set_index("CO range")
        )

    st.divider()

    # --------------------------------------------------------
    # FEATURES
    # --------------------------------------------------------

    st.subheader("Feature Groups")

    feature_table = pd.DataFrame(
        {
            "Feature": FEATURES,
            "Type": [
                "Sensor",
                "Gas",
                "Sensor",
                "Gas",
                "Sensor",
                "Gas",
                "Sensor",
                "Sensor",
                "Atmospheric",
                "Atmospheric",
                "Atmospheric",
                "Time",
            ],
            "Role": [
                "CO sensor",
                "Benzene",
                "NMHC sensor",
                "Nitrogen oxides",
                "NOx sensor",
                "Nitrogen dioxide",
                "NO2 sensor",
                "O3 sensor",
                "Temperature",
                "Humidity",
                "Absolute humidity",
                "Hour of day",
            ],
        }
    )

    st.dataframe(
        feature_table,
        use_container_width=True,
        hide_index=True,
    )


# ============================================================
# MODEL PAGE
# ============================================================

elif page == "🧠 Model":

    st.header("Neural Network")

    st.caption(
        "Architecture, preprocessing, and missing-data strategy used by AirSense."
    )

    # --------------------------------------------------------
    # ARCHITECTURE
    # --------------------------------------------------------

    st.subheader("Architecture")

    architecture = pd.DataFrame(
        {
            "Layer": [
                "Input",
                "Hidden Layer 1",
                "Activation",
                "Hidden Layer 2",
                "Activation",
                "Output",
            ],
            "Configuration": [
                "24 features",
                "Linear(24 → 16)",
                "ReLU",
                "Linear(16 → 8)",
                "ReLU",
                "Linear(8 → 1)",
            ],
        }
    )

    st.dataframe(
        architecture,
        use_container_width=True,
        hide_index=True,
    )

    st.divider()

    # --------------------------------------------------------
    # WHY 24 INPUTS?
    # --------------------------------------------------------

    st.subheader("Why does the model use 24 inputs?")

    col1, col2 = st.columns(2)

    with col1:

        st.info(
            """
            **12 environmental measurements**

            The model receives temperature, humidity,
            gas concentrations, sensor readings, and hour of day.
            """
        )

    with col2:

        st.success(
            """
            **12 missing-data indicators**

            Each measurement also has a binary indicator that tells
            the model whether that measurement was missing.
            """
        )

    st.divider()

    # --------------------------------------------------------
    # PIPELINE
    # --------------------------------------------------------

    st.subheader("Prediction Pipeline")

    pipeline = pd.DataFrame(
        {
            "Step": [
                "01",
                "02",
                "03",
                "04",
                "05",
            ],
            "Stage": [
                "Input",
                "Missing-data handling",
                "Feature scaling",
                "Neural network",
                "Prediction",
            ],
            "Description": [
                "Collect environmental and sensor measurements.",
                "Represent missing measurements with indicators.",
                "Apply the saved training scaler.",
                "Process the 24-dimensional feature vector.",
                "Return estimated CO concentration.",
            ],
        }
    )

    st.dataframe(
        pipeline,
        use_container_width=True,
        hide_index=True,
    )

    st.divider()

    # --------------------------------------------------------
    # MODEL FILES
    # --------------------------------------------------------

    st.subheader("Deployment Assets")

    assets = pd.DataFrame(
        {
            "File": [
                "air_quality_model.pth",
                "scaler.pkl",
                "train_medians.pkl",
                "model_info.json",
            ],
            "Purpose": [
                "Trained PyTorch neural network",
                "Feature preprocessing",
                "Missing-value replacement",
                "Model metadata",
            ],
        }
    )

    st.dataframe(
        assets,
        use_container_width=True,
        hide_index=True,
    )


# ============================================================
# FOOTER
# ============================================================

st.divider()

st.caption(
    "AirSense · Built with Python · PyTorch · Streamlit"
)