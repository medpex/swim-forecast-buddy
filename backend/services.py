import os
import requests
from dotenv import load_dotenv # Still useful for OPENWEATHER_API_KEY if run standalone
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any, Optional

from sqlalchemy.orm import Session
from backend.models_db import VisitorDataDb
from backend.core.config import settings

load_dotenv() # Loads .env file for standalone script execution

# OpenWeather API settings
OPENWEATHER_API_KEY = settings.OPENWEATHER_API_KEY
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

# Cache for OpenWeather API responses
weather_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DURATION_SECONDS = 10 * 60  # 10 minutes

def get_historical_visitor_data(db: Session, limit: int = 1000) -> pd.DataFrame:
    """
    Fetches historical visitor data from the 'visitor_data' table in PostgreSQL
    using SQLAlchemy. Orders by date descending and returns a Pandas DataFrame.
    """
    try:
        query_result = db.query(VisitorDataDb).order_by(VisitorDataDb.date.desc()).limit(limit).all()

        if query_result:
            # Convert list of SQLAlchemy model instances to list of dicts, then to DataFrame
            data_list = [
                {column.name: getattr(row, column.name) for column in row.__table__.columns}
                for row in query_result
            ]
            df = pd.DataFrame(data_list)
            if 'date' in df.columns:
                 df['date'] = pd.to_datetime(df['date']) # Ensure date column is datetime
            return df
        else:
            return pd.DataFrame() # Return empty DataFrame if no data

    except Exception as e:
        print(f"An exception occurred while fetching historical visitor data from PostgreSQL: {e}")
        # Depending on desired error handling, you might re-raise or return empty/default
        raise

def get_weather_forecast_data(
    postal_code: str = "10115", # Default Berlin postal code
    country_code: str = "DE",
    num_days: int = 7
) -> List[Dict[str, Any]]:
    """
    Fetches weather forecast data from OpenWeather API for the given location and number of days.
    Uses a simple time-based cache to avoid redundant API calls.
    Returns a list of daily forecast data.
    """
    if not OPENWEATHER_API_KEY:
        raise ValueError("OPENWEATHER_API_KEY must be set in the environment variables.")

    location_query = f"zip={postal_code},{country_code}"
    cache_key = f"forecast_{location_query}_{num_days}"

    # Check cache
    if cache_key in weather_cache:
        cached_entry = weather_cache[cache_key]
        if (datetime.now() - cached_entry['timestamp']).total_seconds() < CACHE_DURATION_SECONDS:
            print(f"Using cached weather forecast for {location_query}")
            return cached_entry['data']

    api_url = f"{OPENWEATHER_BASE_URL}/forecast?{location_query}&appid={OPENWEATHER_API_KEY}&units=metric&cnt={num_days * 8}" # Request 3-hourly data

    try:
        response = requests.get(api_url)
        response.raise_for_status()  # Raises an HTTPError for bad responses (4XX or 5XX)
        forecast_data = response.json()

        processed_forecasts: List[Dict[str, Any]] = []

        # OpenWeather 'forecast' endpoint returns data in 3-hour intervals.
        # We need to process this to get one representative forecast per day.
        daily_data: Dict[str, List[Dict[str, Any]]] = {}
        for item in forecast_data.get('list', []):
            day_date_str = datetime.fromtimestamp(item['dt']).strftime('%Y-%m-%d')
            if day_date_str not in daily_data:
                daily_data[day_date_str] = []
            daily_data[day_date_str].append(item)

        for day_str, items_for_day in daily_data.items():
            if not items_for_day:
                continue

            # Select a representative item for the day (e.g., around midday or average)
            # Here, we'll take the item closest to noon or the first one if noon is not available.
            midday_item = next(
                (item for item in items_for_day if "12:00:00" in item.get("dt_txt", "")),
                items_for_day[0] # Fallback to the first item for the day
            )

            processed_forecasts.append({
                "date": day_str,
                "temp": midday_item['main'].get('temp'),
                "feels_like": midday_item['main'].get('feels_like'),
                "temp_min": midday_item['main'].get('temp_min'),
                "temp_max": midday_item['main'].get('temp_max'),
                "pressure": midday_item['main'].get('pressure'),
                "humidity": midday_item['main'].get('humidity'),
                "weather_main": midday_item['weather'][0].get('main') if midday_item['weather'] else None,
                "weather_description": midday_item['weather'][0].get('description') if midday_item['weather'] else None,
                "weather_icon": midday_item['weather'][0].get('icon') if midday_item['weather'] else None,
                "wind_speed": midday_item['wind'].get('speed'),
                "wind_deg": midday_item['wind'].get('deg'),
                "clouds": midday_item['clouds'].get('all'),
                "pop": midday_item.get('pop'), # Probability of precipitation
                "rain_3h": midday_item.get('rain', {}).get('3h') # Rain volume for last 3 hours
            })

            if len(processed_forecasts) >= num_days: # Ensure we don't return more days than requested
                break

        # Update cache
        weather_cache[cache_key] = {'data': processed_forecasts, 'timestamp': datetime.now()}
        return processed_forecasts

    except requests.exceptions.RequestException as e:
        print(f"Error fetching weather forecast: {e}")
        raise
    except ValueError as e: # For JSON decoding errors
        print(f"Error decoding weather forecast JSON: {e}")
        raise

# Example usage (for testing this service directly)
if __name__ == "__main__":
    print("Testing data access services (PostgreSQL and OpenWeather)...")

    # To test get_historical_visitor_data, we need a DB session.
    # This requires database.py and models_db.py to be correctly set up,
    # and a running PostgreSQL database as configured in .env (for DATABASE_URL).

    # This direct test is more involved now as it requires a live DB session.
    # For simplicity, direct execution test for get_historical_visitor_data is omitted here.
    # It will be tested through the FastAPI app or dedicated test scripts with DB setup.
    print("Skipping direct test of get_historical_visitor_data in services.py __main__ block.")
    print("Test this function via the FastAPI application or dedicated integration tests.")

    # Test OpenWeather API (still relevant)
    if OPENWEATHER_API_KEY and OPENWEATHER_API_KEY != "your_openweather_api_key_placeholder":
        try:
            print("\nFetching weather forecast from OpenWeather API (Berlin, 3 days)...")
            forecast = get_weather_forecast_data(postal_code="10115", num_days=3)
            if forecast:
                print(f"Successfully fetched {len(forecast)} days of weather forecast.")
                for day_forecast in forecast:
                    print(f"- Date: {day_forecast['date']}, Temp: {day_forecast['temp']}°C, Weather: {day_forecast['weather_description']}")
            else:
                print("No weather forecast data returned.")
        except Exception as e:
            print(f"Could not fetch weather forecast: {e}")
            print("Please ensure your OPENWEATHER_API_KEY in .env (via core.config) is correct and valid.")
    else:
        print("\nSkipping OpenWeather API test as OPENWEATHER_API_KEY is not set or is placeholder.")
