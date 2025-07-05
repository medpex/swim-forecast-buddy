import joblib
import pandas as pd
import os
from typing import List, Dict, Any
import numpy as np

# Assuming features.py is in the same directory or PYTHONPATH is set
try:
    import features
except ImportError:
    print("Make sure features.py is accessible.")
    from . import features # Fallback for direct execution

MODEL_DIR = "backend/models"
MODEL_FILENAME = "visitor_forecast_model.joblib"
MODEL_PATH = os.path.join(MODEL_DIR, MODEL_FILENAME)

# Global variable to hold the loaded model
loaded_model = None

def load_trained_model():
    """Loads the trained model from disk."""
    global loaded_model
    if not os.path.exists(MODEL_PATH):
        print(f"Error: Model file not found at {MODEL_PATH}.")
        print("Please train the model first by running ml_trainer.py.")
        # In a production FastAPI app, you might raise an exception or handle this startup error.
        # For now, loaded_model will remain None.
        return None

    try:
        loaded_model = joblib.load(MODEL_PATH)
        print(f"Model '{MODEL_FILENAME}' loaded successfully from {MODEL_PATH}.")
        return loaded_model
    except Exception as e:
        print(f"Error loading model from {MODEL_PATH}: {e}")
        loaded_model = None # Ensure it's None if loading fails
        return None

def predict_visitor_counts(future_weather_data_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Predicts visitor counts based on future weather forecast data.

    Args:
        future_weather_data_list: A list of dictionaries, where each dictionary
                                 represents a daily weather forecast and must include a 'date' key
                                 and other weather features (e.g., 'temp', 'humidity').
                                 Example: [{'date': '2023-10-01', 'temp': 20, ...}, ...]

    Returns:
        A list of dictionaries, each containing the original date and the 'predicted_visitors'.
        Example: [{'date': '2023-10-01', 'predicted_visitors': 150}, ...]
                 Returns an empty list if prediction fails or model is not loaded.
    """
    global loaded_model
    if loaded_model is None:
        print("Model not loaded. Attempting to load model...")
        load_trained_model() # Attempt to load it
        if loaded_model is None: # Still None after attempt
            print("Prediction failed: Model could not be loaded.")
            # Return empty predictions or forecasts with a specific error indicator
            return [{"date": item.get('date', 'unknown_date'), "predicted_visitors": -1, "error": "Model not loaded"}
                    for item in future_weather_data_list]


    if not future_weather_data_list:
        print("Input weather data list is empty. No predictions to make.")
        return []

    # Convert list of dicts to DataFrame
    future_weather_df = pd.DataFrame(future_weather_data_list)

    if 'date' not in future_weather_df.columns:
        print("Error: 'date' column is missing in the input weather data.")
        return [{"date": "unknown_date", "predicted_visitors": -1, "error": "Missing date column"}
                for _ in future_weather_data_list]

    original_dates = future_weather_df['date'].copy() # Keep original dates to return

    print(f"Preparing features for {len(future_weather_df)} days of future weather data...")
    try:
        # Use is_training=False as we are preparing for prediction (no target column)
        prediction_features_df = features.prepare_features_for_model(
            future_weather_df,
            is_training=False
        )
    except Exception as e:
        print(f"Error during feature preparation for prediction: {e}")
        return [{"date": str(date_val), "predicted_visitors": -1, "error": "Feature preparation failed"}
                for date_val in original_dates]

    # Ensure the columns are in the order expected by the model (features.MODEL_FEATURES)
    # The prepare_features_for_model should ideally handle this, but as a safeguard:
    try:
        X_pred = prediction_features_df[features.MODEL_FEATURES]
    except KeyError as e:
        print(f"Error: Missing one or more expected feature columns for prediction: {e}")
        print(f"Expected columns: {features.MODEL_FEATURES}")
        print(f"Available columns after preparation: {prediction_features_df.columns.tolist()}")
        return [{"date": str(date_val), "predicted_visitors": -1, "error": f"Missing feature columns: {e}"}
                for date_val in original_dates]

    print(f"Making predictions with features:\n{X_pred.head()}")
    try:
        raw_predictions = loaded_model.predict(X_pred)
    except Exception as e:
        print(f"Error during model prediction: {e}")
        return [{"date": str(date_val), "predicted_visitors": -1, "error": "Model prediction failed"}
                for date_val in original_dates]

    # Ensure predictions are non-negative integers
    # RandomForest can sometimes predict small negative numbers if target was never negative but close to zero
    cleaned_predictions = np.maximum(0, raw_predictions).astype(int)

    predictions_output = []
    for i, date_str in enumerate(original_dates):
        predictions_output.append({
            "date": str(date_str), # Ensure date is string for JSON later
            "predicted_visitors": int(cleaned_predictions[i])
        })

    print(f"Generated predictions: {predictions_output[:5]}") # Log first few predictions
    return predictions_output

# Example usage (for testing this predictor directly)
if __name__ == "__main__":
    print("Testing predictor service...")

    # Attempt to load the model first (as it would be in an app startup)
    load_trained_model()

    if loaded_model:
        # Simulate future weather data (similar to what services.get_weather_forecast_data might return)
        dummy_future_weather_data = [
            {'date': '2023-11-01', 'temp': 15.0, 'feels_like': 14.0, 'temp_min': 10.0, 'temp_max': 18.0,
             'humidity': 70.0, 'wind_speed': 10.0, 'pop': 0.3, 'weather_description': 'cloudy with chance of rain'},
            {'date': '2023-11-02', 'temp': 16.0, 'feels_like': 15.5, 'temp_min': 11.0, 'temp_max': 19.0,
             'humidity': 65.0, 'wind_speed': 8.0, 'pop': 0.1, 'weather_description': 'partly cloudy'},
            {'date': '2023-11-03', 'temp': 14.0, 'feels_like': 13.0, 'temp_min': 9.0, 'temp_max': 17.0,
             'humidity': 75.0, 'wind_speed': 12.0, 'pop': 0.6, 'weather_description': 'rainy'},
        ]

        print(f"\nMaking predictions for dummy future weather data (first item): {dummy_future_weather_data[0]}")
        predictions = predict_visitor_counts(dummy_future_weather_data)

        if predictions:
            print("\nPredictions Output:")
            for p in predictions:
                print(p)
        else:
            print("No predictions were generated or an error occurred.")
    else:
        print("Model could not be loaded. Run ml_trainer.py to create and save a model first.")
        print(f"Expected model path: {MODEL_PATH}")
