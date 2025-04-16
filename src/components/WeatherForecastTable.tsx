
import React from 'react';
import { WeatherData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

interface WeatherForecastTableProps {
  forecast: WeatherData[];
}

const WeatherForecastTable: React.FC<WeatherForecastTableProps> = ({ forecast }) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'short', month: 'numeric', day: 'numeric' }).format(date);
  };

  // Map OpenWeather icon codes to Lucide icons
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "01d": <Sun className="h-5 w-5 text-warning" />,
      "01n": <Sun className="h-5 w-5 text-warning" />,
      "02d": <Cloud className="h-5 w-5 text-water-400" />,
      "02n": <Cloud className="h-5 w-5 text-water-400" />,
      "03d": <Cloud className="h-5 w-5 text-water-400" />,
      "03n": <Cloud className="h-5 w-5 text-water-400" />,
      "04d": <Cloud className="h-5 w-5 text-water-600" />,
      "04n": <Cloud className="h-5 w-5 text-water-600" />,
      "09d": <CloudDrizzle className="h-5 w-5 text-water-500" />,
      "09n": <CloudDrizzle className="h-5 w-5 text-water-500" />,
      "10d": <CloudRain className="h-5 w-5 text-water-500" />,
      "10n": <CloudRain className="h-5 w-5 text-water-500" />,
      "11d": <CloudLightning className="h-5 w-5 text-warning" />,
      "11n": <CloudLightning className="h-5 w-5 text-warning" />,
      "13d": <CloudSnow className="h-5 w-5 text-water-100" />,
      "13n": <CloudSnow className="h-5 w-5 text-water-100" />,
      "50d": <Wind className="h-5 w-5 text-water-300" />,
      "50n": <Wind className="h-5 w-5 text-water-300" />,
    };

    return iconMap[iconCode] || <Cloud className="h-5 w-5 text-water-400" />;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Wettervorhersage - Nächste 7 Tage</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Wetter</TableHead>
              <TableHead>Temp.</TableHead>
              <TableHead>Gefühlt</TableHead>
              <TableHead>Niederschlag</TableHead>
              <TableHead>Wind</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forecast.map((day) => (
              <TableRow key={day.date}>
                <TableCell className="font-medium">{formatDate(day.date)}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {getWeatherIcon(day.icon)}
                    <span className="capitalize">{day.description}</span>
                  </div>
                </TableCell>
                <TableCell>{Math.round(day.temp)}°C</TableCell>
                <TableCell>{Math.round(day.feels_like)}°C</TableCell>
                <TableCell>{day.precipitation} mm</TableCell>
                <TableCell>{day.wind_speed} km/h</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default WeatherForecastTable;
