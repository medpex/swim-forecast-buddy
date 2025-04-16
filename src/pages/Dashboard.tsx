
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import WeatherCard from '@/components/WeatherCard';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import StatsSummaryCards from '@/components/StatsSummaryCards';
import RecentVisitorsChart from '@/components/RecentVisitorsChart';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { 
  mockVisitorForecast, 
  mockHistoricalData,
  mockStatsSummary
} from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';

const Dashboard: React.FC = () => {
  const apiKey = localStorage.getItem('openWeatherApiKey');
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  
  const { data: currentWeather, error: weatherError } = useQuery({
    queryKey: ['currentWeather', apiKey],
    queryFn: () => fetchCurrentWeather(apiKey || ''),
    enabled: !!apiKey,
  });

  const { data: weatherForecast } = useQuery({
    queryKey: ['weatherForecast', apiKey],
    queryFn: () => fetchWeatherForecast(apiKey || ''),
    enabled: !!apiKey,
  });

  // Update visitor forecasts with real weather data
  const updatedVisitorForecast = weatherForecast 
    ? mockVisitorForecast.map((forecast, index) => ({
        ...forecast,
        weather_forecast: weatherForecast[index]
      }))
    : mockVisitorForecast;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schwimmbad Besuchervorhersage</h1>
      
      {!apiKey && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API-Schlüssel fehlt</AlertTitle>
          <AlertDescription>
            Bitte tragen Sie einen OpenWeather API-Schlüssel in den Einstellungen ein.
          </AlertDescription>
        </Alert>
      )}

      {weatherError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API-Fehler</AlertTitle>
          <AlertDescription>
            Fehler beim Abrufen der Wetterdaten. Bitte überprüfen Sie Ihren API-Schlüssel.
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
            <WeatherCard weather={currentWeather} />
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
