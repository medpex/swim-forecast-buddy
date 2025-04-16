
import { WeatherData, VisitorData, VisitorForecast, YearlyComparison, StatsSummary } from './types';

// Mock current weather data
export const mockCurrentWeather: WeatherData = {
  date: new Date().toISOString().split('T')[0],
  temp: 28.5,
  feels_like: 30.2,
  humidity: 65,
  description: "Mostly sunny",
  icon: "01d", // OpenWeather icon code
  precipitation: 0,
  wind_speed: 5.2
};

// Mock weather forecast for the next 7 days
export const mockWeatherForecast: WeatherData[] = Array.from({ length: 7 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() + i + 1);
  
  // Add some variation to make the data look realistic
  const variations = [
    { temp: 29.1, feels_like: 31.0, description: "Sunny", icon: "01d", precipitation: 0, wind_speed: 4.8 },
    { temp: 27.8, feels_like: 29.5, description: "Partly cloudy", icon: "02d", precipitation: 0, wind_speed: 6.1 },
    { temp: 26.5, feels_like: 28.0, description: "Scattered clouds", icon: "03d", precipitation: 0, wind_speed: 5.5 },
    { temp: 25.9, feels_like: 26.8, description: "Light rain", icon: "10d", precipitation: 2.5, wind_speed: 7.2 },
    { temp: 24.2, feels_like: 25.0, description: "Thunderstorm", icon: "11d", precipitation: 8.7, wind_speed: 8.5 },
    { temp: 26.1, feels_like: 27.4, description: "Cloudy", icon: "04d", precipitation: 0, wind_speed: 5.9 },
    { temp: 28.3, feels_like: 30.0, description: "Clear sky", icon: "01d", precipitation: 0, wind_speed: 4.3 },
  ][i % 7];
  
  return {
    date: date.toISOString().split('T')[0],
    temp: variations.temp,
    feels_like: variations.feels_like,
    humidity: Math.floor(Math.random() * 30) + 50, // 50-80%
    description: variations.description,
    icon: variations.icon,
    precipitation: variations.precipitation,
    wind_speed: variations.wind_speed
  };
});

// Mock historical visitor data for the last 30 days
export const mockHistoricalData: VisitorData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (30 - i));
  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()];
  const isWeekend = [0, 6].includes(date.getDay());
  
  // More visitors on weekends and warmer days
  let baseVisitors = isWeekend ? 800 : 350;
  
  // Add some randomness
  const randomFactor = Math.random() * 0.4 + 0.8; // 0.8 to 1.2
  const visitors = Math.floor(baseVisitors * randomFactor);
  
  return {
    date: date.toISOString().split('T')[0],
    visitor_count: visitors,
    day_of_week: dayOfWeek,
    is_holiday: Math.random() < 0.1, // 10% chance of being a holiday
    is_weekend: isWeekend,
    is_school_break: Math.random() < 0.2, // 20% chance of being during school break
    special_event: Math.random() < 0.05 ? "Summer Festival" : undefined // 5% chance of special event
  };
});

// Mock visitor forecast for the next 7 days
export const mockVisitorForecast: VisitorForecast[] = mockWeatherForecast.map((weather, i) => {
  const date = new Date(weather.date);
  const isWeekend = [0, 6].includes(date.getDay());
  
  // Base forecast algorithm (would be ML model in real app)
  let baseVisitors = isWeekend ? 850 : 400;
  
  // Weather impact (higher temperature = more visitors, rain = fewer visitors)
  const tempFactor = Math.min(Math.max(weather.temp - 20, 0) / 10, 1); // 0 to 1 based on temp
  const rainPenalty = weather.precipitation > 0 ? (0.8 - (weather.precipitation / 20)) : 1; // 0.8 to 0.3 based on rain
  
  // Calculate predicted visitors
  const predicted = Math.floor(baseVisitors * (1 + tempFactor * 0.5) * rainPenalty);
  
  // Add confidence interval (would come from ML model in real app)
  const confidence = 0.15; // 15% uncertainty
  
  return {
    date: weather.date,
    predicted_visitors: predicted,
    confidence_lower: Math.floor(predicted * (1 - confidence)),
    confidence_upper: Math.floor(predicted * (1 + confidence)),
    weather_forecast: weather
  };
});

// Mock yearly comparison data
export const mockYearlyComparison: YearlyComparison[] = [2021, 2022, 2023, 2024].map(year => {
  // Generate realistic yearly data with increasing trend
  const yearFactor = (year - 2020) / 10; // 0.1 to 0.4
  const baseTotal = 150000;
  const totalVisitors = Math.floor(baseTotal * (1 + yearFactor));
  
  return {
    year,
    total_visitors: totalVisitors,
    average_daily: Math.floor(totalVisitors / 365),
    peak_day: {
      date: `${year}-07-${Math.floor(Math.random() * 15) + 10}`, // Random day in July
      count: Math.floor(1200 * (1 + yearFactor))
    },
    months: {
      "January": Math.floor(5000 * (1 + yearFactor)),
      "February": Math.floor(6000 * (1 + yearFactor)),
      "March": Math.floor(8000 * (1 + yearFactor)),
      "April": Math.floor(10000 * (1 + yearFactor)),
      "May": Math.floor(15000 * (1 + yearFactor)),
      "June": Math.floor(20000 * (1 + yearFactor)),
      "July": Math.floor(25000 * (1 + yearFactor)),
      "August": Math.floor(24000 * (1 + yearFactor)),
      "September": Math.floor(15000 * (1 + yearFactor)),
      "October": Math.floor(10000 * (1 + yearFactor)),
      "November": Math.floor(6000 * (1 + yearFactor)),
      "December": Math.floor(6000 * (1 + yearFactor)),
    }
  };
});

// Mock stats summary
export const mockStatsSummary: StatsSummary = {
  total_current_year: 178500,
  change_from_last_year: 12500,
  change_percentage: 7.5,
  average_daily: 489,
  peak_forecast: {
    date: new Date().toISOString().split('T')[0],
    count: 920
  }
};
