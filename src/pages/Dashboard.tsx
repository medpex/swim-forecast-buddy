
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import WeatherCard from '@/components/WeatherCard';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import StatsSummaryCards from '@/components/StatsSummaryCards';
import RecentVisitorsChart from '@/components/RecentVisitorsChart';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { 
  mockVisitorForecast, 
  mockHistoricalData,
  mockStatsSummary
} from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const apiKey = localStorage.getItem('openWeatherApiKey');
  const postalCode = localStorage.getItem('poolPostalCode');
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  const navigate = useNavigate();
  
  const { data: currentWeather, error: weatherError, isError } = useQuery({
    queryKey: ['currentWeather', apiKey, postalCode],
    queryFn: () => fetchCurrentWeather(apiKey || ''),
    enabled: !!apiKey,
    retry: 1, // Nur einen Wiederholungsversuch
  });

  const { data: weatherForecast } = useQuery({
    queryKey: ['weatherForecast', apiKey, postalCode],
    queryFn: () => fetchWeatherForecast(apiKey || ''),
    enabled: !!apiKey && !isError,
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
    if (!apiKey) {
      return "API-Schlüssel fehlt. Bitte tragen Sie einen OpenWeather API-Schlüssel in den Einstellungen ein.";
    }
    
    if (weatherError instanceof Error) {
      return weatherError.message;
    }
    
    return "Unbekannter Fehler beim Abrufen der Wetterdaten.";
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schwimmbad Besuchervorhersage</h1>
      
      {(!apiKey || isError) && (
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
      
      <StatsSummaryCards stats={mockStatsSummary} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <VisitorForecastChart 
            forecasts={updatedVisitorForecast}
            historicalAverage={avgVisitors}
          />
        </div>
        <div>
          {currentWeather && (
            <WeatherCard weather={currentWeather} title="Aktuelles Wetter" />
          )}
        </div>
      </div>
      
      <div className="mt-8">
        <RecentVisitorsChart 
          data={mockHistoricalData} 
          averageVisitors={avgVisitors}
        />
      </div>
    </div>
  );
};

export default Dashboard;
