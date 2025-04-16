import React from 'react';
import { useQuery } from '@tanstack/react-query';
import WeatherCard from '@/components/WeatherCard';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import StatsSummaryCards from '@/components/StatsSummaryCards';
import RecentVisitorsChart from '@/components/RecentVisitorsChart';
import { fetchCurrentWeather, fetchWeatherForecast } from '@/services/weatherService';
import { fetchHistoricalData } from '@/services/visitorService';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { calculateAverageVisitors } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: visitorData, isLoading: visitorLoading } = useQuery({
    queryKey: ['historicalVisitors'],
    queryFn: fetchHistoricalData
  });

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

  // Calculate statistics
  const avgVisitors = visitorData ? calculateAverageVisitors(visitorData) : 0;
  
  // Get last year's total
  const lastYearTotal = visitorData 
    ? visitorData
        .filter(d => new Date(d.date).getFullYear() === 2024)
        .reduce((sum, d) => sum + d.visitor_count, 0)
    : 0;
  
  if (visitorLoading) {
    return <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schwimmbad Besuchervorhersage</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-[150px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-[100px]" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Skeleton className="h-[400px] w-full" />
        </div>
        <Skeleton className="h-[400px]" />
      </div>
    </div>;
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schwimmbad Besuchervorhersage</h1>
      
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
      
      {visitorData && (
        <StatsSummaryCards 
          stats={{
            total_current_year: 0, // Always 0 during winter break
            total_last_year: lastYearTotal,
            change_percentage: 0,
            change_from_last_year: 0,
            average_daily: avgVisitors,
            peak_forecast: {
              count: Math.max(...visitorData.map(d => d.visitor_count)),
              date: visitorData.sort((a, b) => b.visitor_count - a.visitor_count)[0].date
            }
          }} 
        />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          {visitorData && weatherForecast && (
            <VisitorForecastChart 
              forecasts={weatherForecast.map((forecast, index) => ({
                date: forecast.date,
                predicted_visitors: avgVisitors, // This would need actual prediction logic
                confidence_lower: avgVisitors * 0.8,
                confidence_upper: avgVisitors * 1.2,
                weather_forecast: forecast
              }))}
              historicalAverage={avgVisitors}
            />
          )}
        </div>
        <div>
          {currentWeather && (
            <WeatherCard weather={currentWeather} title="Aktuelles Wetter" />
          )}
        </div>
      </div>
      
      <div className="mt-8">
        {visitorData && (
          <RecentVisitorsChart 
            data={visitorData} 
            averageVisitors={avgVisitors}
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
