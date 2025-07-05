import os
from dotenv import load_dotenv

# Load environment variables from .env file, if present
# This is useful for local development when not using Docker Compose's env_file directly
# or when running scripts like ml_trainer.py directly.
dotenv_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
if os.path.exists(dotenv_path):
    load_dotenv(dotenv_path)

class Settings:
    PROJECT_NAME: str = "Swim Forecast Buddy Backend"
    VERSION: str = "0.1.0"

    # Database settings
    # Example: "postgresql://user:password@host:port/database"
    # For Docker Compose, this will be like: "postgresql://youruser:yourpassword@db:5432/yourdb"
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://user:password@localhost:5432/swim_forecast_db")

    # OpenWeather API Key
    OPENWEATHER_API_KEY: str = os.getenv("OPENWEATHER_API_KEY", "your_openweather_api_key_placeholder")

    # Supabase (will be phased out, but keep for now if any remnants use it, or remove if fully unused)
    # SUPABASE_URL: Optional[str] = os.getenv("SUPABASE_URL")
    # SUPABASE_KEY: Optional[str] = os.getenv("SUPABASE_KEY")


settings = Settings()

if __name__ == "__main__":
    # For testing the settings loading
    print(f"Project Name: {settings.PROJECT_NAME}")
    print(f"Database URL: {settings.DATABASE_URL}")
    print(f"OpenWeather API Key: {settings.OPENWEATHER_API_KEY}")
    # print(f"Supabase URL: {settings.SUPABASE_URL}") # if kept
    # print(f"Supabase Key: {settings.SUPABASE_KEY}")   # if kept
