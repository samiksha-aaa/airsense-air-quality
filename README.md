# AirSense 🌫️

### AI-Powered Air Quality Prediction System

AirSense is a full-stack machine learning application that predicts **carbon monoxide (CO) concentration** from air-quality sensor measurements and environmental conditions.

It combines a **PyTorch neural network**, **FastAPI backend**, and **React dashboard** into a production-deployed web application.

## 🚀 Live Demo

**Web App:**  
https://airsense-air-quality-pi.vercel.app/

**Backend API:**  
https://airsense-r0qe.onrender.com

**GitHub:**  
https://github.com/samiksha-aaa/airsense-air-quality

---

## ✨ Features

- 🤖 Neural-network-based CO prediction
- 📊 Interactive analytics dashboard
- 📈 Model performance visualization
- 🧪 Multiple model evaluation strategies
- 📝 Prediction history
- 🌓 Dark and light mode
- 📱 Responsive mobile-friendly interface
- ⚡ FastAPI prediction API
- ☁️ Production deployment with Vercel and Render

---

## 🧠 Machine Learning

AirSense uses a feed-forward neural network built with **PyTorch**.

The model uses 12 air-quality and environmental features:

| Feature | Description |
|---|---|
| `PT08.S1(CO)` | CO sensor response |
| `C6H6(GT)` | Benzene concentration |
| `PT08.S2(NMHC)` | NMHC sensor response |
| `NOx(GT)` | Nitrogen oxides concentration |
| `PT08.S3(NOx)` | NOx sensor response |
| `NO2(GT)` | Nitrogen dioxide concentration |
| `PT08.S4(NO2)` | NO2 sensor response |
| `PT08.S5(O3)` | Ozone sensor response |
| `T` | Temperature |
| `RH` | Relative humidity |
| `AH` | Absolute humidity |
| `Hour` | Hour of the day |

Missing values are handled using training-set median imputation, together with missing-value indicators.

This produces **24 inputs** to the neural network:

```text
12 original features
+
12 missing-value indicators
=
24 model inputs