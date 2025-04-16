import { getSettings } from './settingsService';

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
const DEFAULT_CITY = "Berlin,DE";

// Verbesserte Funktion, um die Standortabfrage zu erstellen
export const getLocationQuery = (postalCode: string | undefined) => {
  return postalCode 
    ? `zip=${postalCode},DE` 
    : `q=${DEFAULT_CITY}`;
};

// Verbesserte Fehlerbehandlung für API-Anfragen
const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json();
    console.log('OpenWeather API Error:', errorData);
    
    if (response.status === 401) {
      throw new Error('Ungültiger API-Schlüssel. Bitte überprüfen Sie Ihren API-Schlüssel in den Einstellungen.');
    } else if (response.status === 429) {
      throw new Error('API-Aufruf-Limit erreicht. Bitte versuchen Sie es in 10 Minuten erneut.');
    } else if (response.status === 404) {
      throw new Error('Standort nicht gefunden. Bitte überprüfen Sie die Postleitzahl.');
    } else {
      throw new Error(`Wetterdaten konnten nicht abgerufen werden: ${errorData.message || 'Unbekannter Fehler'}`);
    }
  }
  
  return response.json();
};

// Cache für API-Anfragen - verhindert zu häufige Anfragen
const cache: Record<string, { data: any, timestamp: number }> = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 Minuten in Millisekunden

export const fetchCurrentWeather = async () => {
  try {
    const settings = await getSettings();
    
    if (!settings?.openweather_api_key) {
      throw new Error('Kein API-Schlüssel vorhanden. Bitte tragen Sie einen OpenWeather API-Schlüssel in den Einstellungen ein.');
    }
    
    const locationQuery = settings.postal_code 
      ? `zip=${settings.postal_code},DE` 
      : `q=${DEFAULT_CITY}`;
    
    const cacheKey = `current_${locationQuery}_${settings.openweather_api_key}`;
    
    // Überprüfen, ob ein gültiger Cache-Eintrag existiert
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log('Lade Wetterdaten aus dem Cache');
      return cache[cacheKey].data;
    }
    
    console.log(`Rufe OpenWeather API auf: ${BASE_URL}/weather?${locationQuery}`);
    
    const response = await fetch(
      `${BASE_URL}/weather?${locationQuery}&units=metric&appid=${settings.openweather_api_key}`
    );
    
    const data: OpenWeatherResponse = await handleApiResponse(response);
    
    const processedData = {
      date: new Date().toISOString().split('T')[0],
      temp: data.main.temp,
      feels_like: data.main.feels_like,
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      precipitation: data.rain?.["1h"] || data.rain?.["3h"] || 0,
      wind_speed: data.wind.speed
    };
    
    // Daten im Cache speichern
    cache[cacheKey] = {
      data: processedData,
      timestamp: now
    };
    
    return processedData;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchWeatherForecast = async () => {
  try {
    const settings = await getSettings();
    
    if (!settings?.openweather_api_key) {
      throw new Error('Kein API-Schlüssel vorhanden. Bitte tragen Sie einen OpenWeather API-Schlüssel in den Einstellungen ein.');
    }
    
    const locationQuery = settings.postal_code 
      ? `zip=${settings.postal_code},DE` 
      : `q=${DEFAULT_CITY}`;
    
    const cacheKey = `forecast_${locationQuery}_${settings.openweather_api_key}`;
    
    // Überprüfen, ob ein gültiger Cache-Eintrag existiert
    const now = Date.now();
    if (cache[cacheKey] && now - cache[cacheKey].timestamp < CACHE_DURATION) {
      console.log('Lade Wettervorhersage aus dem Cache');
      return cache[cacheKey].data;
    }
    
    console.log(`Rufe OpenWeather API auf: ${BASE_URL}/forecast?${locationQuery}`);
    
    const response = await fetch(
      `${BASE_URL}/forecast?${locationQuery}&units=metric&appid=${settings.openweather_api_key}`
    );

    const data: ForecastResponse = await handleApiResponse(response);
    
    const dailyForecasts = data.list.reduce((acc: any, forecast) => {
      const date = forecast.dt_txt.split(' ')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(forecast);
      return acc;
    }, {});

    const processedData = Object.entries(dailyForecasts).map(([date, forecasts]: [string, any]) => {
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
    }).slice(0, 5); // Free API liefert nur 5 Tage
    
    // Daten im Cache speichern
    cache[cacheKey] = {
      data: processedData,
      timestamp: now
    };
    
    return processedData;
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    throw error;
  }
};
