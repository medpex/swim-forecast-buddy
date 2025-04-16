import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WeatherData } from '@/lib/types';
import { Cloud, CloudDrizzle, CloudLightning, CloudRain, CloudSnow, Sun, Wind } from 'lucide-react';

interface WeatherCardProps {
  weather: WeatherData;
  title?: string;
}

const WeatherCard: React.FC<WeatherCardProps> = ({ weather, title = "Aktuelles Wetter" }) => {
  // Map OpenWeather icon codes to Lucide icons
  const getWeatherIcon = (iconCode: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      "01d": <Sun className="h-16 w-16 text-warning" />,
      "01n": <Sun className="h-16 w-16 text-warning" />,
      "02d": <Cloud className="h-16 w-16 text-blue-400" />,
      "02n": <Cloud className="h-16 w-16 text-blue-400" />,
      "03d": <Cloud className="h-16 w-16 text-blue-400" />,
      "03n": <Cloud className="h-16 w-16 text-blue-400" />,
      "04d": <Cloud className="h-16 w-16 text-blue-600" />,
      "04n": <Cloud className="h-16 w-16 text-blue-600" />,
      "09d": <CloudDrizzle className="h-14 w-14 text-water-500" />,
      "09n": <CloudDrizzle className="h-14 w-14 text-water-500" />,
      "10d": <CloudRain className="h-14 w-14 text-water-500" />,
      "10n": <CloudRain className="h-14 w-14 text-water-500" />,
      "11d": <CloudLightning className="h-14 w-14 text-warning" />,
      "11n": <CloudLightning className="h-14 w-14 text-warning" />,
      "13d": <CloudSnow className="h-14 w-14 text-water-100" />,
      "13n": <CloudSnow className="h-14 w-14 text-water-100" />,
      "50d": <Wind className="h-14 w-14 text-water-300" />,
      "50n": <Wind className="h-14 w-14 text-water-300" />,
    };

    return iconMap[iconCode] || <Cloud className="h-16 w-16 text-blue-400" />;
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-blue-500 text-white p-4">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-6 px-6 pb-6">
        <div className="flex flex-col items-center">
          {getWeatherIcon(weather.icon)}
          <h2 className="mt-2 text-4xl font-bold">{Math.round(weather.temp)}°C</h2>
          <p className="text-sm text-gray-600">Gefühlt wie: {Math.round(weather.feels_like)}°C</p>
          <p className="mt-1 text-sm font-medium capitalize text-gray-700">{weather.description}</p>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="flex flex-col">
            <span className="text-gray-500">Luftfeuchtigkeit</span>
            <span className="font-medium">{weather.humidity}%</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500">Wind</span>
            <span className="font-medium">{weather.wind_speed} km/h</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500">Niederschlag</span>
            <span className="font-medium">{weather.precipitation} mm</span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-gray-500">Datum</span>
            <span className="font-medium">{new Date(weather.date).toLocaleDateString('de-DE')}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WeatherCard;
