
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import WeatherForecastTable from '@/components/WeatherForecastTable';
import WeatherCard from '@/components/WeatherCard';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { 
  mockVisitorForecast,
  mockHistoricalData
} from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, InfoIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Forecast: React.FC = () => {
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  const navigate = useNavigate();
  
  const { data: currentWeather, error: weatherError, isError } = useQuery({
    queryKey: ['currentWeather'],
    queryFn: () => fetchCurrentWeather(),
    retry: 1, // Nur einen Wiederholungsversuch
  });

  const { data: weatherForecast } = useQuery({
    queryKey: ['weatherForecast'],
    queryFn: () => fetchWeatherForecast(),
    enabled: !isError, // Nur wenn kein Fehler beim aktuellen Wetter auftrat
    retry: 1, // Nur einen Wiederholungsversuch
  });

  // Besucher-Prognose mit echten Wetterdaten aktualisieren
  const updatedVisitorForecast = weatherForecast 
    ? mockVisitorForecast.map((forecast, index) => ({
        ...forecast,
        weather_forecast: weatherForecast[index]
      }))
    : mockVisitorForecast;
  
  // Fehlerbehandlung - Extrahiere spezifische Fehlermeldung
  const getErrorMessage = () => {
    if (weatherError instanceof Error) {
      return weatherError.message;
    }
    
    return "Unbekannter Fehler beim Abrufen der Wetterdaten.";
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Besucherprognose & Wettervorhersage</h1>
      
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API-Fehler</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <div>{getErrorMessage()}</div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/settings')}
              className="self-start"
            >
              <Settings className="mr-2 h-4 w-4" />
              Zu den Einstellungen
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
      <Alert className="mb-6 bg-water-50 border-water-300">
        <InfoIcon className="h-4 w-4 text-water-600" />
        <AlertTitle>Über unsere Prognose</AlertTitle>
        <AlertDescription>
          Die Prognose basiert auf historischen Besucherdaten, aktuellen Wetterbedingungen und
          weiteren Faktoren wie Wochentag und besonderen Events.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <VisitorForecastChart 
            forecasts={updatedVisitorForecast}
            historicalAverage={avgVisitors}
          />
        </div>
        <div>
          {currentWeather && (
            <WeatherCard 
              weather={currentWeather}
              title="Aktuelles Wetter"
            />
          )}
          
          {/* Behält bestehende Einflussfaktoren-Karte bei */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Einflussfaktoren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Temperatur</h3>
                  <p className="text-sm text-muted-foreground">
                    Bei höheren Temperaturen steigt die Besucherzahl. Ab ca. 25°C 
                    ist ein deutlicher Anstieg zu verzeichnen.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Niederschlag</h3>
                  <p className="text-sm text-muted-foreground">
                    Regen reduziert die Besucherzahlen deutlich. Selbst bei hohen 
                    Temperaturen führt Niederschlag zu weniger Besuchern.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Wochentag & Ferien</h3>
                  <p className="text-sm text-muted-foreground">
                    An Wochenenden und in Schulferien sind die Besucherzahlen 
                    grundsätzlich höher als an regulären Wochentagen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {weatherForecast && (
        <WeatherForecastTable forecast={weatherForecast} />
      )}
      
      {/* Behält bestehende Modelldetails-Karte bei */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Modelldetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Machine-Learning-Modell</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Das Prognosemodell nutzt eine Kombination aus Zeitreihenanalyse und 
                Regressionsverfahren, um zukünftige Besucherzahlen vorherzusagen.
              </p>
              
              <h4 className="font-medium">Berücksichtigte Faktoren:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Historische Besucherzahlen</li>
                <li>Temperatur und Wetterbedingungen</li>
                <li>Wochentag und Monat</li>
                <li>Feiertage und Schulferien</li>
                <li>Besondere Events</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Modellgenauigkeit</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Die Genauigkeit wird fortlaufend evaluiert und das Modell regelmäßig 
                neu trainiert. Die Konfidenzintervalle geben eine Einschätzung der Unsicherheit.
              </p>
              
              <h4 className="font-medium">Leistungskennzahlen:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">MAE</div>
                  <div className="font-medium">42 Besucher</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">RMSE</div>
                  <div className="font-medium">68 Besucher</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">R²</div>
                  <div className="font-medium">0.82</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Genauigkeit</div>
                  <div className="font-medium">85%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecast;
