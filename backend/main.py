from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
import os # For __main__ block path adjustments
import sys # For __main__ block path adjustments

# Standardized absolute imports from 'backend' package
from backend import services, predictor, schemas, ml_trainer, database

# --- Application Lifespan (for model loading and DB init) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing database and loading ML model...")

    # Initialize database tables
    try:
        database.create_db_and_tables() # Uses the imported database module
        print("Database tables checked/created.")
    except Exception as e:
        print(f"CRITICAL: Could not initialize database tables: {e}")
        # Depending on policy, might want to prevent app startup or run in degraded mode

    # Load the ML model
    predictor.load_trained_model()
    if predictor.loaded_model is None:
        print("WARNING: ML Model could not be loaded at startup. Prediction endpoint might fail if no model is present.")
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
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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
    country_code: Optional[str] = Query("DE", description="Country code for the location (e.g., 'DE' for Germany)."),
    db: Session = Depends(database.get_db) # Kept for potential future use, though not used in current logic directly
):
    if start_date is None:
        start_date = date.today()
    if end_date is None:
        end_date = start_date + timedelta(days=6)
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    num_days = (end_date - start_date).days + 1
    print(f"Received forecast request: Start={start_date}, End={end_date}, PostalCode={postal_code}, NumDays={num_days}")

    try:
        weather_forecast_list: List[Dict[str, Any]] = services.get_weather_forecast_data(
            postal_code=postal_code,
            country_code=country_code,
            num_days=num_days
        )
    except Exception as e:
        print(f"Error fetching weather data from service: {e}")
        raise HTTPException(status_code=503, detail=f"Could not fetch weather data: {str(e)}")

    if not weather_forecast_list:
        raise HTTPException(status_code=404, detail="No weather forecast data available for the specified parameters.")

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

    final_forecasts: List[schemas.VisitorForecastOutput] = []
    predictions_map = {item['date']: item for item in visitor_predictions_list}

    for weather_item in filtered_weather_forecast:
        prediction_info = predictions_map.get(weather_item['date'])

        if prediction_info and prediction_info.get("error"):
            final_forecasts.append(schemas.VisitorForecastOutput(
                date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                predicted_visitors=-1,
                weather_forecast=schemas.WeatherData(
                    date=datetime.strptime(weather_item['date'], '%Y-%m-%d').date(),
                    temp=weather_item.get('temp', 0.0),
                    description=weather_item.get('weather_description', "N/A"),
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

    if not final_forecasts and filtered_weather_forecast: # Ensure we don't error if weather was found but no preds
         print("Warning: Weather data was found, but final_forecasts list is empty after processing predictions.")
         # This might happen if all predictions had errors not caught above or if predictions_map was empty.
         # Depending on desired behavior, could raise 500 or return empty list with appropriate response.
         # For now, let it proceed to return VisitorForecastResponse, which might be empty.

    return schemas.VisitorForecastResponse(forecasts=final_forecasts)


@app.post("/api/retrain_model", status_code=202) # 202 Accepted
async def trigger_retrain_model(): # Removed db: Session = Depends(database.get_db)
    """
    Triggers the model retraining process.
    ml_trainer.train_model() is expected to handle its own database session.
    """
    print("Retrain model endpoint called.")
    try:
        ml_trainer.train_model()

        print("Retraining finished. Attempting to reload the model in predictor service...")
        predictor.load_trained_model()
        if predictor.loaded_model:
            print("Model reloaded successfully after retraining.")
            return {"message": "Model retraining process initiated and model reloaded."}
        else:
            print("Model reloaded FAILED after retraining.")
            raise HTTPException(status_code=500, detail="Retraining completed, but failed to reload the new model into the predictor.")

    except Exception as e:
        print(f"Error during model retraining or reloading: {e}")
        raise HTTPException(status_code=500, detail=f"Model retraining failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn

    # This block is for direct execution (e.g., `python backend/main.py`)
    # It adjusts sys.path to allow `from backend import ...` to work.
    # This is not strictly necessary when Uvicorn runs `backend.main:app` as a module.
    project_root_for_direct_run = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if project_root_for_direct_run not in sys.path:
        sys.path.insert(0, project_root_for_direct_run)

    # Re-attempt imports here if needed for the direct run context,
    # though the top-level imports should ideally work if PYTHONPATH is correct or structure is standard.
    # from backend import services, predictor, schemas, ml_trainer, database # Already at top

    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=["backend"])
