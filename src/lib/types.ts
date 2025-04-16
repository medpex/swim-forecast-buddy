
// Types for the Swim Forecast Buddy application

// Weather data types
export interface WeatherData {
  date: string;
  temp: number;
  feels_like: number;
  humidity: number;
  description: string;
  icon: string;
  precipitation: number;
  wind_speed: number;
}

// Historical visitor data types
export interface VisitorData {
  date: string;
  visitor_count: number;
  day_of_week: string;
  is_holiday: boolean;
  is_weekend: boolean;
  is_school_break: boolean;
  special_event?: string;
}

// Forecast data types
export interface VisitorForecast {
  date: string;
  predicted_visitors: number;
  confidence_lower?: number;
  confidence_upper?: number;
  weather_forecast?: WeatherData;
}

// Comparison data types
export interface YearlyComparison {
  year: number;
  total_visitors: number;
  average_daily: number;
  peak_day: {
    date: string;
    count: number;
  };
  months: {
    [month: string]: number;
  };
}

// Stats summary
export interface StatsSummary {
  total_current_year: number;
  change_from_last_year: number;
  change_percentage: number;
  average_daily: number;
  peak_forecast: {
    date: string;
    count: number;
  };
}
