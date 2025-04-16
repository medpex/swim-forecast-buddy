
import React from 'react';
import WeatherCard from '@/components/WeatherCard';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import StatsSummaryCards from '@/components/StatsSummaryCards';
import RecentVisitorsChart from '@/components/RecentVisitorsChart';
import { 
  mockCurrentWeather, 
  mockVisitorForecast, 
  mockHistoricalData,
  mockStatsSummary
} from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';

const Dashboard: React.FC = () => {
  // Calculate average visitors from historical data
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Schwimmbad Besuchervorhersage</h1>
      
      <StatsSummaryCards stats={mockStatsSummary} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2">
          <VisitorForecastChart 
            forecasts={mockVisitorForecast} 
            historicalAverage={avgVisitors}
          />
        </div>
        <div>
          <WeatherCard weather={mockCurrentWeather} />
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
