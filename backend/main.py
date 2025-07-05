from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List, Optional, Dict, Any
from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
import os
import sys

# Standardized imports from backend package
from backend import services, predictor, schemas, ml_trainer, database

# --- Application Lifespan (init DB + model) ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Application startup: Initializing database and loading ML model...")

    try:
        database.create_db_and_tables()
        print("Database tables checked/created.")
    except Exception as e:
        print(f"CRITICAL: Could not initialize database tables: {e}")

    predictor.load_trained_model()
    if predictor.loaded_model is None:
        print("WARNING: ML Model could not be loaded at startup.")
    else:
        print("ML Model loaded successfully.")

    yield
    print("Application shutdown.")

app = FastAPI(
    title="Swim Forecast Buddy API",
    description="API for forecasting swimming pool visitor numbers.",
    version="0.1.0",
    lifespan=lifespan
)

# --- CORS (allow everything in dev, restrict in prod) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# --- Routes ---
@app.get("/")
async def root():
    return {"message": "Welcome to Swim Forecast Buddy Backend API"}

@app.get("/api/visitor_forecast", response_model=schemas.VisitorForecastResponse)
async def get_visitor_forecast(
    start_date: date = Query(None),
    end_date: date = Query(None),
    postal_code: Optional[str] = Query("10115"),
    country_code: Optional[str] = Query("DE"),
    db: Session = Depends(database.get_db)
):
    if start_date is None:
        start_date = date.today()
    if end_date is None:
        end_date = start_date + timedelta(days=6)

    if start_date > end_date:
        raise HTTPException(status_code=400, detail="Start date cannot be after end date.")

    num_days = (end_date - start_date).days + 1
    print(f"Forecast request: {start_date} to {end_date} ({num_days} days), postal code: {postal_code}")

    try:
        weather_forecast_list = services.get_weather_forecast_data(
            postal_code=postal_code,
            country_code=country_code,
            num_days=num_days
        )
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Could not fetch weather data: {str(e)}")

    if not weather_forecast_list:
        raise HTTPException(status_code=404, detail="No weather data available.")

    filtered = [
        wf for wf in weather_forecast_list
        if start_date <= datetime.strptime(wf["date"], "%Y-%m-%d").date() <= end_date
    ]

    if not filtered:
        raise HTTPException(status_code=404, detail="Weather data does not match requested range.")

    try:
        predictions = predictor.predict_visitor_counts(filtered)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

    final = []
    pred_map = {p["date"]: p for p in predictions}

    for wf in filtered:
        date_obj = datetime.strptime(wf["date"], "%Y-%m-%d").date()
        pred = pred_map.get(wf["date"])

        weather_data = schemas.WeatherData(
            date=date_obj,
            temp=wf.get("temp", 0.0),
            description=wf.get("weather_description", "N/A"),
            humidity=wf.get("humidity"),
            wind_speed=wf.get("wind_speed"),
            pop=wf.get("pop")
        )

        if pred and pred.get("error"):
            final.append(schemas.VisitorForecastOutput(
                date=date_obj,
                predicted_visitors=-1,
                weather_forecast=weather_data,
                error_message=pred["error"]
            ))
        elif pred:
            final.append(schemas.VisitorForecastOutput(
                date=date_obj,
                predicted_visitors=pred["predicted_visitors"],
                weather_forecast=weather_data
            ))

    if not final:
        raise HTTPException(status_code=500, detail="Failed to generate forecast output.")

    return schemas.VisitorForecastResponse(forecasts=final)

@app.post("/api/retrain_model", status_code=202)
async def trigger_retrain_model():
    try:
        ml_trainer.train_model()
        predictor.load_trained_model()
        if predictor.loaded_model:
            return {"message": "Model retrained and reloaded successfully."}
        else:
            raise HTTPException(status_code=500, detail="Model reload failed after retraining.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Retraining failed: {str(e)}")


# --- Local run fallback ---
if __name__ == "__main__":
    # Add project root to path if running directly
    current_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(current_dir)
    if root_dir not in sys.path:
        sys.path.insert(0, root_dir)

    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True, reload_dirs=["backend"])