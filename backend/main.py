from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime


# Assuming services, predictor, schemas, and ml_trainer are in the same directory or accessible via PYTHONPATH
try:
    import services
    import predictor
    import schemas
    import ml_trainer # For the retraining endpoint
except ImportError:
    print("Error: Could not import one or more backend modules (services, predictor, schemas, ml_trainer).")
    print("Ensure these files exist and Python's import path is configured correctly.")
    # Fallback for direct uvicorn execution from root if backend is a module
    from . import services
    from . import predictor
    from . import schemas
    from . import ml_trainer


# --- Application Lifespan (for model loading) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model during startup
    print("Application startup: Loading ML model...")
    predictor.load_trained_model()
    if predictor.loaded_model is None:
        print("WARNING: ML Model could not be loaded at startup. Prediction endpoint might fail.")
    else:
        print("ML Model loaded successfully at startup.")
    yield
    # Clean up the ML model and other resources (if any) during shutdown (optional)
    print("Application shutdown.")

app = FastAPI(
    title="Swim Forecast Buddy API",
    description="API for forecasting swimming pool visitor numbers.",
    version="0.1.0",
    lifespan=lifespan # Register lifespan context manager
)

# --- CORS Middleware ---
# Allow all origins for development purposes. Restrict in production.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Or specify frontend URL: e.g., "http://localhost:5173"
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# --- API Endpoints ---

@app.get("/")
async def root():
    return {"message": "Welcome to Swim Forecast Buddy Backend API"}

@app.get("/api/visitor_forecast", response_model=schemas.VisitorForecastResponse)
async def get_visitor_forecast(
    start_date: date = Query(None, description="Start date for the forecast (YYYY-MM-DD). Defaults to today."),
    end_date: date = Query(None, description="End date for the forecast (YYYY-MM-DD). Defaults to 7 days from start_date."),
    postal_code: Optional[str] = Query("10115", description="Postal code for the location (e.g., '10115' for Berlin)."),
    country_code: Optional[str] = Query("DE", description="Country code for the location (e.g., 'DE' for Germany).")
):
    """
    Provides a visitor forecast based on weather predictions for the given date range and location.
    """
    if start_date is None:
        start_date = date.today()

    if end_date is None:
        end_date = start_date + timedelta(days=6) # Default to 7 days forecast (today + 6 more days)

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    num_days = (end_date - start_date).days + 1
    if num_days > 16: # OpenWeather free tier forecast is typically limited for longer ranges effectively
        # The /forecast endpoint gives 5 days of 3-hourly data.
        # The /forecast/daily gives up to 16 days but is part of OneCall API often paid.
        # services.get_weather_forecast_data is adjusted to handle this by processing 3-hourly data.
        # Let's cap num_days for practical limits if needed, or rely on service to handle API limits.
        # For now, let's assume services.py handles what it can get for num_days.
        print(f"Requesting forecast for {num_days} days. Weather API might limit this.")


    print(f"Received forecast request: Start={start_date}, End={end_date}, PostalCode={postal_code}, NumDays={num_days}")

    try:
        weather_forecast_list: List[Dict[str, Any]] = services.get_weather_forecast_data(
            postal_code=postal_code,
            country_code=country_code,
            num_days=num_days # services.py will fetch appropriate data from OpenWeather
        )
    except Exception as e:
        print(f"Error fetching weather data from service: {e}")
        raise HTTPException(status_code=503, detail=f"Could not fetch weather data: {str(e)}")

    if not weather_forecast_list:
        raise HTTPException(status_code=404, detail="No weather forecast data available for the specified parameters.")

    # Filter weather data to match exact date range requested, as weather service might return fixed number of days
    # Convert weather forecast dates to datetime.date for comparison
    filtered_weather_forecast = []
    for wf_item in weather_forecast_list:
        item_date_obj = datetime.strptime(wf_item['date'], '%Y-%m-%d').date()
        if start_date <= item_date_obj <= end_date:
            filtered_weather_forecast.append(wf_item)

    if not filtered_weather_forecast:
         raise HTTPException(status_code=404, detail="Weather data available but not for the specific requested date range.")


    print(f"Weather data fetched for {len(filtered_weather_forecast)} days. Now predicting visitors.")

    try:
        visitor_predictions_list: List[Dict[str, Any]] = predictor.predict_visitor_counts(filtered_weather_forecast)
    except Exception as e:
        print(f"Error getting visitor predictions: {e}")
        raise HTTPException(status_code=500, detail=f"Could not predict visitor counts: {str(e)}")

    # Combine weather data and predictions
    # The predictor returns a list of {'date': ..., 'predicted_visitors': ...}
    # The weather data is a list of {'date': ..., 'temp': ..., etc.}
    # We need to merge them. Assuming dates align.

    final_forecasts: List[schemas.VisitorForecastOutput] = []

    # Create a dictionary for quick lookup of predictions by date
    predictions_map = {item['date']: item for item in visitor_predictions_list}

    for weather_item in filtered_weather_forecast:
        prediction_info = predictions_map.get(weather_item['date'])

        if prediction_info and prediction_info.get("error"):
             # If model loading failed, predictor adds an error field
            final_forecasts.append(schemas.VisitorForecastOutput(
                date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                predicted_visitors=-1, # Indicate error
                weather_forecast=schemas.WeatherData(
                    date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                    temp=weather_item.get('temp', 0.0),
                    description=weather_item.get('weather_description', "N/A"),
                    # Add other relevant weather fields from weather_item as defined in schemas.WeatherData
                    humidity=weather_item.get('humidity'),
                    wind_speed=weather_item.get('wind_speed'),
                    pop=weather_item.get('pop')
                ),
                error_message=prediction_info.get("error")
            ))
        elif prediction_info:
            final_forecasts.append(schemas.VisitorForecastOutput(
                date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                predicted_visitors=prediction_info['predicted_visitors'],
                weather_forecast=schemas.WeatherData(
                    date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                    temp=weather_item.get('temp', 0.0),
                    description=weather_item.get('weather_description', "N/A"),
                    humidity=weather_item.get('humidity'),
                    wind_speed=weather_item.get('wind_speed'),
                    pop=weather_item.get('pop')
                )
            ))
        # Else: if no prediction for a weather item (should not happen if lists align), it's skipped.

    if not final_forecasts:
         raise HTTPException(status_code=500, detail="Failed to combine predictions with weather data.")

    return schemas.VisitorForecastResponse(forecasts=final_forecasts)


@app.post("/api/retrain_model", status_code=202) # 202 Accepted
async def trigger_retrain_model():
    """
    Triggers the model retraining process. This is an asynchronous-like operation.
    The actual retraining happens in the background (conceptually).
    For this simple version, it will run synchronously but quickly return.
    """
    print("Retrain model endpoint called.")
    try:
        # In a real-world scenario, this would likely be offloaded to a background worker (e.g., Celery).
        # For now, we call it directly. This will block the request until training is done.
        # This is NOT ideal for long training times.
        ml_trainer.train_model()

        # After training, reload the model in the predictor
        print("Retraining finished. Attempting to reload the model in predictor service...")
        predictor.load_trained_model()
        if predictor.loaded_model:
            print("Model reloaded successfully after retraining.")
            return {"message": "Model retraining process initiated and model reloaded."}
        else:
            print("Model reloaded FAILED after retraining.")
            # This is tricky, the training might have succeeded but loading failed.
            raise HTTPException(status_code=500, detail="Retraining completed, but failed to reload the new model into the predictor.")

    except Exception as e:
        print(f"Error during model retraining or reloading: {e}")
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    # This allows running directly with uvicorn for development.
    # `uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000`
    # The import `from . import ...` style might require running as `python -m backend.main`
    # or ensuring backend's parent directory is in PYTHONPATH.

    # For simplicity if running `python backend/main.py`:
    # Ensure CWD is the project root or backend directory is in PYTHONPATH.
    # This setup is more for when uvicorn targets `backend.main:app`.

    # Fallback for simple `python backend/main.py` execution:
    current_dir_main_py = os.path.dirname(os.path.abspath(__file__))
    if current_dir_main_py not in sys.path:
         sys.path.append(current_dir_main_py)
    # And if the parent of 'backend' is the project root:
    project_root = os.path.dirname(current_dir_main_py)
    if project_root not in sys.path:
        sys.path.append(project_root)

    # This re-import attempt is mostly for the linter/static analysis if imports are tricky
    try:
        from backend import services, predictor, schemas, ml_trainer
    except ImportError:
        pass # Already handled by top-level imports

    uvicorn.run(app, host="0.0.0.0", port=8000)
