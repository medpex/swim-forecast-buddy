# This file will contain Pydantic models for:
# - Request bodies
# - Response bodies
#
# Implementation details will be added in Step 6.

from pydantic import BaseModel
from typing import List, Optional
from datetime import date

class WeatherForecastInput(BaseModel):
    start_date: date
    end_date: date
    postal_code: Optional[str] = None

class WeatherData(BaseModel):
    date: date
    temp: float
    description: str
    # Add other relevant weather fields

class VisitorForecastOutput(BaseModel):
    date: date
    predicted_visitors: int
    weather_forecast: WeatherData # Or a more detailed weather schema

class VisitorForecastResponse(BaseModel):
    forecasts: List[VisitorForecastOutput]
