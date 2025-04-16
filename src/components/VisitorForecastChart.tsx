import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { VisitorForecast } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface VisitorForecastChartProps {
  forecasts: VisitorForecast[];
  historicalAverage?: number;
}

const VisitorForecastChart: React.FC<VisitorForecastChartProps> = ({ 
  forecasts, 
  historicalAverage 
}) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'short', month: 'numeric', day: 'numeric' }).format(date);
  };

  // Format data for chart
  const chartData = forecasts.map(forecast => ({
    date: formatDate(forecast.date),
    rawDate: forecast.date,
    visitors: forecast.predicted_visitors,
    lower: forecast.confidence_lower,
    upper: forecast.confidence_upper,
    weather: forecast.weather_forecast?.description || '',
    temp: forecast.weather_forecast?.temp || 0
  }));

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Besucherprognose - Nächste 7 Tage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284c7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-25} 
                textAnchor="end" 
                height={60}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'visitors') return [`${value} Besucher`, 'Prognose'];
                  if (name === 'lower') return [`${value} Besucher`, 'Untere Grenze'];
                  if (name === 'upper') return [`${value} Besucher', 'Obere Grenze'];
                  return [value, name];
                }} 
                labelFormatter={(label) => `Datum: ${label}`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded shadow border">
                        <p className="font-bold">{label}</p>
                        <p className="text-water-600">
                          <span className="font-bold">Prognose:</span> {data.visitors} Besucher
                        </p>
                        <p className="text-water-400">
                          <span className="font-bold">Bereich:</span> {data.lower} - {data.upper}
                        </p>
                        <p className="mt-2">
                          <span className="font-bold">Wetter:</span> {data.weather}, {Math.round(data.temp)}°C
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {historicalAverage && (
                <ReferenceLine 
                  y={historicalAverage} 
                  label="Ø Vorjahr" 
                  stroke="#f97316" 
                  strokeDasharray="3 3" 
                />
              )}
              <Area 
                type="monotone" 
                dataKey="visitors" 
                stroke="#0ea5e9" 
                fillOpacity={1} 
                fill="url(#colorVisitors)" 
                name="Prognose"
              />
              <Area 
                type="monotone" 
                dataKey="lower" 
                stroke="none" 
                fill="url(#colorConfidence)" 
                name="Untere Grenze"
              />
              <Area 
                type="monotone" 
                dataKey="upper" 
                stroke="none" 
                fill="url(#colorConfidence)" 
                name="Obere Grenze"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default VisitorForecastChart;
