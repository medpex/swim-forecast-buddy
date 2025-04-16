
interface OpenWeatherResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
  rain?: {
    "1h"?: number;
    "3h"?: number;
  };
}

interface ForecastResponse {
  list: Array<OpenWeatherResponse & { dt_txt: string }>;
}

const BASE_URL = "https://api.openweathermap.org/data/2.5";

export const fetchCurrentWeather = async (apiKey: string, city = "Berlin,DE") => {
  try {
    const response = await fetch(
      `${BASE_URL}/weather?q=${city}&units=metric&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('Weather data fetch failed');
    }

    const data: OpenWeatherResponse = await response.json();
    
    return {
      date: new Date().toISOString().split('T')[0],
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      precipitation: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      wind_speed: data.wind.speed
    };
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async (apiKey: string, city = "Berlin,DE") => {
  try {
    const response = await fetch(
      `${BASE_URL}/forecast?q=${city}&units=metric&appid=${apiKey}`
    );

    if (!response.ok) {
      throw new Error('Forecast data fetch failed');
    }

    const data: ForecastResponse = await response.json();
    
    // Group forecasts by day and take the middle of the day forecast (around 12:00)
    const dailyForecasts = data.list.reduce((acc: any, forecast) => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(forecast);
      return acc;
    }, {});

    return Object.entries(dailyForecasts).map(([date, forecasts]: [string, any]) => {
      const middayForecast = forecasts.find((f: any) => 
        f.dt_txt.includes('12:00')
      ) || forecasts[0];

      return {
        date,
        temp: middayForecast.main.temp,
        feels_like: middayForecast.main.feels_like,
        humidity: middayForecast.main.humidity,
        description: middayForecast.weather[0].description,
        icon: middayForecast.weather[0].icon,
        precipitation: middayForecast.rain?.["3h"] || 0,
        wind_speed: middayForecast.wind.speed
      };
    }).slice(0, 5); // Free API only provides 5 days
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};
