import os
from dotenv import load_dotenv

# Load environment variables from .env file, if present, located at the project root.
# Project root is three levels up from this file (backend/core/config.py -> backend/core -> backend -> project root)
# This is useful for local development or direct script execution like `python backend/ml_trainer.py`.
# Docker Compose handles env loading separately.
project_root_path = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
dotenv_path = os.path.join(project_root_path, '.env')

if os.path.exists(dotenv_path):
    print(f"Loading .env file from: {dotenv_path}")
    load_dotenv(dotenv_path)
else:
    print(f".env file not found at {dotenv_path}, relying on environment variables set externally (e.g., by Docker Compose).")

class Settings:
    PROJECT_NAME: str = "Swim Forecast Buddy Backend"
    VERSION: str = "0.1.0"

    # Database settings
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/swim_forecast_db")

    # OpenWeather API Key
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "your_openweather_api_key_placeholder")

    # Optional Supabase placeholders (remove if unused)
    # SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    # SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")

settings = Settings()

if __name__ == "__main__":
    # For testing the settings loading
    print(f"Project Name: {settings.PROJECT_NAME}")
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"OpenWeather API Key: {settings.OPENWEATHER_API_KEY}")
    # print(f"Supabase URL: {settings.SUPABASE_URL}") # if used
    # print(f"Supabase Key: {settings.SUPABASE_KEY}") # if used