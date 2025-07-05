import requests
import pandas as pd

# API-URL
url = (
    "https://archive-api.open-meteo.com/v1/archive"
    "?latitude=53.5&longitude=10.5"
    "&start_date=2022-01-01&end_date=2025-07-05"
    "&daily=temperature_2m_max,weathercode"
    "&timezone=Europe%2FBerlin"
)

# Request
response = requests.get(url)
data = response.json()

# Wettercode → Beschreibung
def code_to_condition(code):
    if code == 0:
        return "Clear"
    elif code in [1, 2, 3]:
        return "Partly Cloudy"
    elif 45 <= code <= 48:
        return "Fog"
    elif 51 <= code <= 67:
        return "Drizzle"
    elif 80 <= code <= 94:
        return "Rain"
    elif code >= 95:
        return "Thunderstorm"
    else:
        return "Unknown"

# CSV vorbereiten
rows = []
for date, temp, code in zip(data["daily"]["time"], data["daily"]["temperature_2m_max"], data["daily"]["weathercode"]):
    if temp is None or code is None:
        continue
    rows.append({
        "date": date,
        "temperature": temp,
        "condition": code_to_condition(code)
    })

# Speichern
df = pd.DataFrame(rows)
df.to_csv("historical_weather_geesthacht.csv", index=False)
print("✅ CSV exportiert als historical_weather_geesthacht.csv")