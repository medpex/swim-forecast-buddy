import React from 'react';
import { useQuery } from '@tanstack/react-query';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import WeatherForecastTable from '@/components/WeatherForecastTable';
import WeatherCard from '@/components/WeatherCard';
import WinterBreakAlert from '@/components/WinterBreakAlert';
import LiveVisitorCount from '@/components/LiveVisitorCount';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { fetchHistoricalData } from '@/services/visitorService';
import { calculateAverageVisitors } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, InfoIcon, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

const Forecast: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: visitorData, isLoading: visitorLoading } = useQuery({
    queryKey: ['historicalVisitors'],
    queryFn: fetchHistoricalData
  });

  const avgVisitors = visitorData ? calculateAverageVisitors(visitorData) : 0;
  
  const { data: currentWeather, error: weatherError, isError } = useQuery({
    queryKey: ['currentWeather'],
    queryFn: () => fetchCurrentWeather(),
    retry: 1,
  });

  const { data: weatherForecast } = useQuery({
    queryKey: ['weatherForecast'],
    queryFn: () => fetchWeatherForecast(),
    enabled: !isError,
    retry: 1,
  });

  const getErrorMessage = () => {
    if (weatherError instanceof Error) {
      return weatherError.message;
    }
    return "Unbekannter Fehler beim Abrufen der Wetterdaten.";
  };

  if (visitorLoading) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Besucherprognose & Wettervorhersage</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <div>
          <Skeleton className="h-[200px] w-full" />
          <Skeleton className="h-[200px] w-full mt-6" />
        </div>
      </div>
      <Skeleton className="h-[400px] w-full" />
    </div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Besucherprognose & Wettervorhersage</h1>
      
      <WinterBreakAlert />
      
      <LiveVisitorCount />
      
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
        <AlertTitle>Hinweis zur Prognose während der Winterpause</AlertTitle>
        <AlertDescription>
          Während der Winterpause zeigen wir Ihnen die durchschnittlichen Besucherzahlen 
          der letzten Saison sowie die aktuellen Wetterbedingungen an. Die genauen Prognosen 
          werden wieder verfügbar sein, sobald das Bad öffnet.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          {visitorData && weatherForecast && (
            <VisitorForecastChart 
              forecasts={weatherForecast.map((forecast) => ({
                date: forecast.date,
                predicted_visitors: 0,
                confidence_lower: 0,
                confidence_upper: 0,
                weather_forecast: forecast
              }))}
              historicalAverage={avgVisitors}
            />
          )}
        </div>
        <div>
          {currentWeather && (
            <WeatherCard 
              weather={currentWeather}
              title="Aktuelles Wetter"
            />
          )}
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Information zur Winterpause</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Öffnungszeiten</h3>
                  <p className="text-sm text-muted-foreground">
                    Das Freizeitbad ist während der Winterpause geschlossen. 
                    Die neue Saison beginnt voraussichtlich im Mai 2025.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Letzte Saison</h3>
                  <p className="text-sm text-muted-foreground">
                    In der vergangenen Saison hatten wir durchschnittlich {avgVisitors} 
                    Besucher pro Tag während der Öffnungszeiten.
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
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Hinweise zu den Prognosen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Berechnung der Prognosen</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Während der Winterpause werden keine aktiven Besucherprognosen erstellt. 
                Die hier gezeigten Werte basieren auf historischen Daten der letzten Saison.
              </p>
              
              <h4 className="font-medium">Einflussfaktoren:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Temperatur und Wetterbedingungen</li>
                <li>Wochentag und Monat</li>
                <li>Feiertage und Schulferien</li>
                <li>Besondere Events</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Saisonale Informationen</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Das Freibad ist saisonal geöffnet und nutzt die Winterpause für 
                Wartungsarbeiten und Vorbereitungen auf die neue Saison.
              </p>
              
              <h4 className="font-medium">Wichtige Termine:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Saisonende 2024</div>
                  <div className="font-medium">September 2024</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Saisonstart 2025</div>
                  <div className="font-medium">Mai 2025</div>
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
