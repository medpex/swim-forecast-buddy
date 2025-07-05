import joblib
import pandas as pd
import os
import numpy as np
from typing import List, Dict, Any

from backend.features import prepare_features_for_model, MODEL_FEATURES

MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
MODEL_FILENAME = "visitor_forecast_model.joblib"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

# Global variable to hold the loaded model
loaded_model = None

def load_trained_model():
    """Loads the trained model from disk."""
    global loaded_model

    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file not found at {MODEL_PATH}. Please train it first.")
        return None

    try:
        loaded_model = joblib.load(MODEL_PATH)
        print(f"Model loaded successfully from {MODEL_PATH}")
        return loaded_model
    except Exception as e:
        print(f"Error loading model: {e}")
        loaded_model = None
        return None


def predict_visitor_counts(future_weather_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Predicts visitor counts based on future weather forecast data."""
    global loaded_model

    if loaded_model is None:
        print("Model not loaded. Attempting to load...")
        load_trained_model()

    if loaded_model is None:
        print("Model still not loaded. Aborting prediction.")
        return [
            {"date": item.get("date", "unknown_date"), "predicted_visitors": -1, "error": "Model not loaded"}
            for item in future_weather_data_list
        ]

    if not future_weather_data_list:
        print("No weather data provided.")
        return []

    # Convert to DataFrame
    future_weather_df = pd.DataFrame(future_weather_data_list)

    if 'date' not in future_weather_df.columns:
        print("Missing 'date' column.")
        return [
            {"date": "unknown_date", "predicted_visitors": -1, "error": "Missing date column"}
            for _ in future_weather_data_list
        ]

    original_dates = future_weather_df['date'].copy()

    # Feature preparation
    try:
        prediction_features_df = prepare_features_for_model(
            future_weather_df,
            is_training=False
        )
    except Exception as e:
        print(f"Feature preparation error: {e}")
        return [
            {"date": str(d), "predicted_visitors": -1, "error": "Feature preparation failed"}
            for d in original_dates
        ]

    # Ensure feature alignment
    try:
        X_pred = prediction_features_df[MODEL_FEATURES]
    except KeyError as e:
        print(f"Missing features: {e}")
        return [
            {"date": str(d), "predicted_visitors": -1, "error": f"Missing feature columns: {e}"}
            for d in original_dates
        ]

    # Prediction
    try:
        raw_predictions = loaded_model.predict(X_pred)
    except Exception as e:
        print(f"Prediction error: {e}")
        return [
            {"date": str(d), "predicted_visitors": -1, "error": "Model prediction failed"}
            for d in original_dates
        ]

    cleaned_predictions = np.maximum(0, raw_predictions).astype(int)

    return [
        {"date": str(date_val), "predicted_visitors": int(pred)}
        for date_val, pred in zip(original_dates, cleaned_predictions)
    ]


if __name__ == "__main__":
    print("Testing predictor...")

    load_trained_model()

    if loaded_model:
        dummy_data = [
            {
                'date': '2023-11-01', 'temp': 15.0, 'feels_like': 14.0,
                'temp_min': 10.0, 'temp_max': 18.0, 'humidity': 70.0,
                'wind_speed': 10.0, 'pop': 0.3,
                'weather_description': 'cloudy with chance of rain'
            },
            {
                'date': '2023-11-02', 'temp': 16.0, 'feels_like': 15.5,
                'temp_min': 11.0, 'temp_max': 19.0, 'humidity': 65.0,
                'wind_speed': 8.0, 'pop': 0.1,
                'weather_description': 'partly cloudy'
            },
        ]
        results = predict_visitor_counts(dummy_data)
        for r in results:
            print(r)
    else:
        print(f"Could not load model from: {MODEL_PATH}")