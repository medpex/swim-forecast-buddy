
# Swim Forecast Buddy

Eine moderne Webanwendung zur Prognose von Schwimmbadbesucherzahlen basierend auf historischen Daten und Wettervorhersagen.

## Projektbeschreibung

Die Anwendung kombiniert historische Besucherdaten, aktuelle Wetterbedingungen und Vorhersagedaten, um präzise Prognosen für zukünftige Besucherzahlen eines Schwimmbads zu erstellen. Sie bietet sowohl eine Übersicht der aktuellen Situation als auch detaillierte Analysen vergangener Zeiträume.

### Hauptfunktionen

- **Dashboard**: Übersicht mit aktuellen Wetterdaten, Besucherprognosen und Schlüsselkennzahlen
- **Historische Daten**: Detaillierte Analyse vergangener Besucherdaten mit Filtermöglichkeiten
- **Prognose**: Vorhersage für zukünftige Besucherzahlen mit Wetterdaten und Konfidenzintervallen
- **Jahresvergleich**: Vergleich der Besucherzahlen über verschiedene Jahre hinweg

## Projektstruktur

Das Projekt ist wie folgt aufgebaut:

```
swim-forecast-buddy/
├── backend/              # Python-Backend-Code
│   ├── app.py            # FastAPI Hauptanwendung
│   ├── requirements.txt  # Python-Abhängigkeiten
│   ├── models/           # ML-Modelle und Modelldefinitionen
│   ├── data/             # CSV-Dateien und Datenverwaltung
│   └── services/         # Dienste für Wetter-API, Datenverarbeitung, etc.
│
└── frontend/             # React Frontend (dieses Repository)
    ├── src/
    │   ├── components/   # UI-Komponenten
    │   ├── pages/        # Seitenkomponenten
    │   ├── lib/          # Dienstprogramme, Typen und Hilfsfunktionen
    │   └── main.tsx      # Haupt-Einstiegspunkt
    └── ...
```

## Technologie-Stack

### Frontend

- **React**: UI-Bibliothek
- **Tailwind CSS**: Styling-Framework
- **Recharts**: Diagrammbibliothek
- **React Router**: Routing
- **TypeScript**: Typsicherheit

### Backend (separat zu implementieren)

- **Python** mit **FastAPI** oder **Flask**
- **scikit-learn** / **Prophet** / **ARIMA**: ML- und Zeitreihenmodelle
- **pandas**: Datenverarbeitung und -analyse
- **requests**: API-Kommunikation mit OpenWeather

## Implementierungsanleitungen

### Frontend (aktuelles Repository)

1. Projekt klonen und Abhängigkeiten installieren:
```
git clone <repository-url>
cd swim-forecast-buddy
npm install
```

2. Entwicklungsserver starten:
```
npm run dev
```

### Backend (zu implementieren)

1. Erstellen Sie einen `backend`-Ordner im Projektverzeichnis
2. Erstellen Sie die grundlegende Verzeichnisstruktur wie oben beschrieben
3. Implementieren Sie `app.py` mit FastAPI oder Flask
4. Installieren Sie die benötigten Abhängigkeiten:
```
pip install fastapi uvicorn pandas scikit-learn requests
```

5. Erstellen Sie die folgenden Endpunkte:
   - `/api/current_weather`: Gibt aktuelle Wetterdaten zurück
   - `/api/visitor_forecast`: Berechnet und gibt Besucherprognose zurück
   - `/api/historical_data`: Gibt historische Besucherdaten zurück
   - `/api/yearly_comparison`: Gibt Vergleichsdaten zwischen Jahren zurück

## Datenmodell

### CSV-Format für historische Besucherdaten (Beispiel)

```
date,visitor_count,day_of_week,is_holiday,is_weekend,is_school_break,special_event
2023-07-01,850,Saturday,0,1,1,Summer Festival
2023-07-02,920,Sunday,0,1,1,
...
```

### OpenWeather API

Die Anwendung nutzt die [OpenWeather API](https://openweathermap.org/api) für aktuelle Wetterdaten und Vorhersagen. Sie benötigen einen API-Schlüssel, der in einer Umgebungsvariable oder Konfigurationsdatei gespeichert werden sollte:

```python
# Im Backend (example.py)
import os
import requests

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
CITY_ID = "2950159"  # Berlin (als Beispiel)

def get_weather():
    url = f"https://api.openweathermap.org/data/2.5/weather?id={CITY_ID}&appid={OPENWEATHER_API_KEY}&units=metric"
    response = requests.get(url)
    return response.json()
```

## Machine-Learning-Modell

Das Backend sollte ein Modell implementieren, das basierend auf historischen Daten, Wetterbedingungen und anderen Faktoren die Besucherzahlen vorhersagen kann. Ein einfaches Beispiel mit scikit-learn könnte so aussehen:

```python
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error

# Daten laden
data = pd.read_csv("data/visitors.csv")

# Features vorbereiten
features = data[['temp', 'humidity', 'is_weekend', 'is_holiday', 'is_school_break']]
target = data['visitor_count']

# Modell trainieren
X_train, X_test, y_train, y_test = train_test_split(features, target, test_size=0.2)
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)

# Modell evaluieren
predictions = model.predict(X_test)
mae = mean_absolute_error(y_test, predictions)
print(f"Mean Absolute Error: {mae}")

# Modell speichern
import joblib
joblib.dump(model, "models/visitor_forecast_model.joblib")
```

## Umgebungsvariablen

Erstellen Sie eine `.env`-Datei im Backend-Verzeichnis mit folgenden Einträgen:

```
OPENWEATHER_API_KEY=Ihr_API_Schlüssel
DEBUG=True
```

## Start des Projekts

1. Frontend (in diesem Repository):
```
npm run dev
```

2. Backend (nach Implementierung):
```
cd backend
uvicorn app:app --reload
```

## Erweiterungsmöglichkeiten

- **Admin-Bereich**: Verwaltung von Daten und erneutes Training des Modells
- **Push-Benachrichtigungen**: Bei ungewöhnlich hohen Besucherprognosen
- **Containerisierung**: Docker-Unterstützung für einfache Bereitstellung
- **Automatisierte Tests**: Unit- und Integrationstests

## Hinweise

- Das Modelltraining sollte möglicherweise als separate Skripte ausgeführt werden, nicht im API-Handler
- Erwägen Sie Caching für die Wetter-API, um deren Nutzungslimits zu respektieren
- Stellen Sie sicher, dass alle sensiblen Daten (wie API-Schlüssel) geschützt sind
