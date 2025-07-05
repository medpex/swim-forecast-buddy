
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

## Starten mit Docker

Diese Anleitung beschreibt, wie die Anwendung (Frontend und Backend) mithilfe von Docker und Docker Compose gestartet wird. Dies ist die empfohlene Methode für eine schnelle Inbetriebnahme und eine konsistente Entwicklungsumgebung.

### Voraussetzungen

*   **Docker Desktop** (für Windows, macOS) oder **Docker Engine & Docker Compose** (für Linux).
    *   Docker Engine Version 20.10.0 oder neuer.
    *   Docker Compose Version v2.0.0 oder neuer (Compose V2).
    *   Stellen Sie sicher, dass der Docker-Daemon läuft.

### Einrichtung der Umgebungsvariablen

Bevor Sie die Anwendung starten können, müssen Sie eine `.env`-Datei im Hauptverzeichnis des Projekts erstellen. Diese Datei enthält die notwendigen Konfigurationen für den Backend-Dienst.

1.  **Erstellen Sie eine Kopie der Beispieldatei:**
    ```bash
    cp .env.example .env
    ```
2.  **Bearbeiten Sie die `.env`-Datei** und tragen Sie Ihre tatsächlichen Zugangsdaten ein:
    *   `SUPABASE_URL`: Ihre Supabase Projekt-URL.
    *   `SUPABASE_KEY`: Ihr Supabase Service Role Key (dieser ist geheim und sollte sicher aufbewahrt werden).
    *   `OPENWEATHER_API_KEY`: Ihr API-Schlüssel für OpenWeatherMap.

    **Hinweis:** Die Variable `VITE_API_BASE_URL` für das Frontend wird automatisch während des Docker-Build-Prozesses durch `docker-compose.yml` auf `http://backend:8000` gesetzt, um die Kommunikation zwischen Frontend- und Backend-Containern zu ermöglichen.

### Anwendung bauen und starten

1.  **Öffnen Sie ein Terminal** im Hauptverzeichnis des Projekts (wo sich die `docker-compose.yml`-Datei befindet).
2.  **Bauen Sie die Docker-Images und starten Sie die Container** mit folgendem Befehl:
    ```bash
    docker compose up --build -d
    ```
    *   `--build`: Erzwingt das Bauen der Images, falls sie noch nicht existieren oder Änderungen vorgenommen wurden.
    *   `-d`: Startet die Container im "detached mode" (im Hintergrund).

### Zugriff auf die Anwendung

Nachdem die Container erfolgreich gestartet wurden:

*   **Frontend**: Die Webanwendung ist unter `http://localhost:8080` in Ihrem Browser erreichbar.
*   **Backend API**: Die FastAPI-Backend-Schnittstelle ist unter `http://localhost:8000` verfügbar. Die API-Dokumentation (Swagger UI) finden Sie unter `http://localhost:8000/docs`.

### Anwendung stoppen

Um die Anwendung zu stoppen und die Container zu entfernen:

1.  Führen Sie im Terminal (im Hauptverzeichnis des Projekts) folgenden Befehl aus:
    ```bash
    docker compose down
    ```
    *   Wenn Sie auch die Docker-Volumes entfernen möchten (z.B. um einen sauberen Neustart zu erzwingen, obwohl in dieser Konfiguration keine kritischen Daten in Volumes gespeichert werden), können Sie `docker compose down -v` verwenden.

### Modelltraining (Optional)

Das Machine-Learning-Modell für die Besuchervorhersage wird beim ersten Start des Backend-Containers geladen, falls eine Modelldatei (`backend/models/visitor_forecast_model.joblib`) im Image vorhanden ist. Wenn das Modell neu trainiert werden muss (z.B. nach Datenaktualisierungen):

1.  **Option 1: Über den API-Endpunkt (empfohlen)**
    *   Senden Sie eine POST-Anfrage an den Endpunkt `http://localhost:8000/api/retrain_model`. Dies kann mit Tools wie `curl`, Postman oder direkt aus einer Anwendung heraus geschehen.
        ```bash
        curl -X POST http://localhost:8000/api/retrain_model
        ```
    *   Das Backend trainiert das Modell neu und lädt es anschließend automatisch.

2.  **Option 2: Manuell im Container (für Debugging)**
    *   Führen Sie das Trainingsskript direkt im laufenden Backend-Container aus:
        ```bash
        docker compose exec backend python ml_trainer.py
        ```
    *   Nachdem das Skript durchgelaufen ist, müssen Sie möglicherweise den Backend-Container neu starten, damit das neu trainierte Modell geladen wird, oder den API-Endpunkt zum Neutrainieren aufrufen, welcher das Neuladen beinhaltet.
        ```bash
        docker compose restart backend
        ```

### Fehlerbehebung und häufige Probleme

*   **`Cannot connect to the Docker daemon`**: Stellen Sie sicher, dass Docker Desktop läuft oder der Docker-Dienst auf Ihrem System aktiv ist und Sie die notwendigen Berechtigungen haben.
*   **Port-Konflikte**: Wenn die Ports `8080` oder `8000` bereits auf Ihrem System verwendet werden, erhalten Sie eine Fehlermeldung. Sie können die Port-Mappings in der `docker-compose.yml`-Datei ändern (z.B. `"8081:80"` für das Frontend).
*   **Fehler im Backend-Container (siehe `docker compose logs backend`)**:
    *   **`ValueError: SUPABASE_URL and SUPABASE_KEY must be set...`**: Überprüfen Sie, ob die `.env`-Datei korrekt erstellt wurde und die Variablen `SUPABASE_URL` und `SUPABASE_KEY` gesetzt sind.
    *   **Fehler bei der Verbindung zu OpenWeatherMap**: Stellen Sie sicher, dass Ihr `OPENWEATHER_API_KEY` in der `.env`-Datei korrekt und gültig ist und der Container Internetzugriff hat.
    *   **Modell nicht gefunden (`Model file not found`)**: Wenn Sie das Modell noch nicht trainiert haben, wird diese Meldung beim Start oder bei der ersten Vorhersageanfrage angezeigt. Verwenden Sie den Endpunkt `/api/retrain_model` oder führen Sie `ml_trainer.py` wie oben beschrieben aus.
*   **Frontend kann Backend nicht erreichen (Netzwerkfehler in der Browserkonsole)**:
    *   Stellen Sie sicher, dass der Backend-Container läuft (`docker compose ps`).
    *   Überprüfen Sie die `VITE_API_BASE_URL`-Einstellung in `docker-compose.yml` (sollte `http://backend:8000` sein). Wenn Sie diese geändert haben, müssen Sie möglicherweise die Images neu bauen (`docker compose build frontend`).
*   **Lange Build-Zeiten**: Der erste Build kann einige Zeit in Anspruch nehmen, da alle Abhängigkeiten heruntergeladen und kompiliert werden müssen. Nachfolgende Builds sind dank Docker's Layer-Caching in der Regel schneller.

## Erweiterungsmöglichkeiten

- **Admin-Bereich**: Verwaltung von Daten und erneutes Training des Modells
- **Push-Benachrichtigungen**: Bei ungewöhnlich hohen Besucherprognosen
- **Containerisierung**: Docker-Unterstützung für einfache Bereitstellung
- **Automatisierte Tests**: Unit- und Integrationstests

## Hinweise

- Das Modelltraining sollte möglicherweise als separate Skripte ausgeführt werden, nicht im API-Handler
- Erwägen Sie Caching für die Wetter-API, um deren Nutzungslimits zu respektieren
- Stellen Sie sicher, dass alle sensiblen Daten (wie API-Schlüssel) geschützt sind
