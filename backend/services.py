import os
import requests
from dotenv import load_dotenv
from datetime import datetime
import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session

from backend.models_db import VisitorDataDb
from backend.core.config import settings

# Load environment variables from .env (optional if already handled elsewhere)
load_dotenv()

# OpenWeather API config
OPENWEATHER_API_KEY = settings.OPENWEATHER_API_KEY
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

# Simple in-memory cache
weather_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DURATION_SECONDS = 10 * 60  # 10 minutes


def get_historical_visitor_data(db: Session, limit: int = 1000) -> pd.DataFrame:
    """
    Fetches historical visitor data from the database.
    """
    try:
        query_result = db.query(VisitorDataDb).order_by(VisitorDataDb.date.desc()).limit(limit).all()
        if not query_result:
            return pd.DataFrame()

        data_list = [
            {column.name: getattr(row, column.name) for column in row.__table__.columns}
            for row in query_result
        ]
        df = pd.DataFrame(data_list)

        if 'date' in df.columns:
            df['date'] = pd.to_datetime(df['date'])

        return df

    except Exception as e:
        print(f"[ERROR] Failed to fetch visitor data: {e}")
        raise


def get_weather_forecast_data(
    postal_code: str = "10115",
    country_code: str = "DE",
    num_days: int = 7
) -> List[Dict[str, Any]]:
    """
    Fetches weather forecast from OpenWeatherMap and returns daily summaries.
    """
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY is not set in environment variables.")

    location_query = f"zip={postal_code},{country_code}"
    cache_key = f"forecast_{location_query}_{num_days}"

    # Return cached result if recent enough
    if cache_key in weather_cache:
        cached = weather_cache[cache_key]
        if (datetime.now() - cached['timestamp']).total_seconds() < CACHE_DURATION_SECONDS:
            print(f"[CACHE] Returning cached forecast for {location_query}")
            return cached['data']

    api_url = f"{OPENWEATHER_BASE_URL}/forecast?{location_query}&appid={OPENWEATHER_API_KEY}&units=metric&cnt={num_days * 8}"

    try:
        response = requests.get(api_url)
        response.raise_for_status()
        forecast_data = response.json()
    except requests.RequestException as e:
        print(f"[ERROR] Failed to fetch forecast: {e}")
        raise

    # Process 3-hourly data into daily summaries
    daily_data: Dict[str, List[Dict[str, Any]]] = {}
    for entry in forecast_data.get("list", []):
        date_str = datetime.fromtimestamp(entry['dt']).strftime('%Y-%m-%d')
        daily_data.setdefault(date_str, []).append(entry)

    processed: List[Dict[str, Any]] = []
    for date_str, entries in daily_data.items():
        if not entries:
            continue

        representative = next(
            (e for e in entries if "12:00:00" in e.get("dt_txt", "")),
            entries[0]
        )

        processed.append({
            "date": date_str,
            "temp": representative['main'].get('temp'),
            "feels_like": representative['main'].get('feels_like'),
            "temp_min": representative['main'].get('temp_min'),
            "temp_max": representative['main'].get('temp_max'),
            "pressure": representative['main'].get('pressure'),
            "humidity": representative['main'].get('humidity'),
            "weather_main": representative['weather'][0].get('main') if representative['weather'] else None,
            "weather_description": representative['weather'][0].get('description') if representative['weather'] else None,
            "weather_icon": representative['weather'][0].get('icon') if representative['weather'] else None,
            "wind_speed": representative['wind'].get('speed'),
            "wind_deg": representative['wind'].get('deg'),
            "clouds": representative['clouds'].get('all'),
            "pop": representative.get('pop'),
            "rain_3h": representative.get('rain', {}).get('3h')
        })

        if len(processed) >= num_days:
            break

    # Update cache
    weather_cache[cache_key] = {
        "data": processed,
        "timestamp": datetime.now()
    }

    return processed


if __name__ == "__main__":
    print("Manual test skipped: Use FastAPI endpoints or integration tests.")