import os
import requests
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime, timedelta
import pandas as pd
from typing import List, Dict, Any, Optional

load_dotenv()

# Initialize Supabase client
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment variables.")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# OpenWeather API settings
OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
OPENWEATHER_BASE_URL = "https://api.openweathermap.org/data/2.5"

# Cache for OpenWeather API responses
weather_cache: Dict[str, Dict[str, Any]] = {}
CACHE_DURATION_SECONDS = 10 * 60  # 10 minutes

def get_historical_visitor_data(limit: int = 1000) -> pd.DataFrame:
    """
    Fetches historical visitor data from the 'visitor_data' table in Supabase.
    Orders by date descending and returns a Pandas DataFrame.
    """
    try:
        response = supabase.table('visitor_data').select('*').order('date', desc=True).limit(limit).execute()

        if response.data:
            df = pd.DataFrame(response.data)
            df['date'] = pd.to_datetime(df['date']) # Ensure date column is datetime
            return df
        else:
            # Handle cases where response.error might exist or data is empty
            if hasattr(response, 'error') and response.error:
                print(f"Error fetching historical visitor data: {response.error}")
                raise Exception(f"Supabase error: {response.error.message}")
            return pd.DataFrame() # Return empty DataFrame if no data or error handled by Supabase client

    except Exception as e:
        print(f"An exception occurred while fetching historical visitor data: {e}")
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
    print("Testing data access services...")

    # Test Supabase connection (requires .env file with credentials)
    if SUPABASE_URL and SUPABASE_KEY and OPENWEATHER_API_KEY:
        try:
            print("\nFetching historical visitor data from Supabase...")
            historical_data_df = get_historical_visitor_data(limit=5)
            if not historical_data_df.empty:
                print(f"Successfully fetched {len(historical_data_df)} historical records.")
                print(historical_data_df.head())
            else:
                print("No historical data returned or table is empty.")

        except Exception as e:
            print(f"Could not fetch historical data: {e}")
            print("Please ensure your Supabase instance is running, 'visitor_data' table exists, and .env credentials are correct.")

        # Test OpenWeather API
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
            print("Please ensure your OPENWEATHER_API_KEY in .env is correct and valid.")
    else:
        print("Skipping tests as SUPABASE_URL, SUPABASE_KEY, or OPENWEATHER_API_KEY are not set in .env")
