
import { supabase } from "@/integrations/supabase/client";
import Papa from 'papaparse';

interface VisitorCSVRow {
  date: string;
  count: string;
  day_of_week: string;
  is_weekend: string;
  is_holiday: string;
  is_school_break: string;
  special_event?: string;
  created_at?: string;
}

interface WeatherCSVRow {
  date: string;
  temperature: string;
  condition: string;
}

/**
 * Convert a date from DD.MM.YYYY [HH:MM] format to YYYY-MM-DD
 */
const formatDate = (dateString: string): string => {
  try {
    // Check if dateString contains date and time (e.g., "16.04.2025 08:54")
    if (dateString.includes(' ')) {
      dateString = dateString.split(' ')[0]; // Extract only the date part
    }
    
    // Parse DD.MM.YYYY to YYYY-MM-DD
    const parts = dateString.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      // Ensure day and month are padded with leading zeros if needed
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
    
    // If already in YYYY-MM-DD format or another valid format, return as is
    return dateString;
  } catch (error) {
    console.error('Error formatting date:', dateString, error);
    // Return a fallback date or null when parsing fails
    return null;
  }
};

export const importVisitorData = async (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const data = (results.data as VisitorCSVRow[])
            .filter(row => row.date && row.count)
            .map(row => {
              const formattedDate = formatDate(row.date);
              if (!formattedDate) {
                throw new Error(`Invalid date format: ${row.date}`);
              }

              return {
                date: formattedDate,
                visitor_count: parseInt(row.count, 10),
                day_of_week: row.day_of_week || null,
                is_weekend: row.is_weekend === '1',
                is_holiday: row.is_holiday === '1',
                is_school_break: row.is_school_break === '1',
                special_event: row.special_event || null,
                created_at: row.created_at || new Date().toISOString()
              };
            });

          if (data.length === 0) {
            resolve({ 
              success: false, 
              message: 'Keine gültigen Daten in der CSV-Datei gefunden.' 
            });
            return;
          }

          console.log('Importing visitor data:', data);

          const { error } = await supabase
            .from('visitor_data')
            .insert(data);

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          resolve({ 
            success: true, 
            message: `${data.length} Besucherdaten erfolgreich importiert.` 
          });
        } catch (error) {
          console.error('Fehler beim Import:', error);
          resolve({ 
            success: false, 
            message: 'Fehler beim Importieren der Daten.' 
          });
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        resolve({ 
          success: false, 
          message: 'Fehler beim Parsen der CSV-Datei.' 
        });
      }
    });
  });
};

export const importWeatherData = async (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const data = (results.data as WeatherCSVRow[])
            .filter(row => row.date && row.temperature && row.condition)
            .map(row => {
              const formattedDate = formatDate(row.date);
              if (!formattedDate) {
                throw new Error(`Invalid date format: ${row.date}`);
              }

              return {
                date: formattedDate,
                temperature: parseFloat(row.temperature),
                condition: row.condition,
                created_at: new Date().toISOString()
              };
            });

          if (data.length === 0) {
            resolve({ 
              success: false, 
              message: 'Keine gültigen Daten in der CSV-Datei gefunden.' 
            });
            return;
          }

          console.log('Importing weather data:', data);

          const { error } = await supabase
            .from('weather_data')
            .insert(data);

          if (error) {
            console.error('Supabase error:', error);
            throw error;
          }

          resolve({ 
            success: true, 
            message: `${data.length} Wetterdaten erfolgreich importiert.` 
          });
        } catch (error) {
          console.error('Fehler beim Import:', error);
          resolve({ 
            success: false, 
            message: 'Fehler beim Importieren der Daten.' 
          });
        }
      },
      error: (error) => {
        console.error('CSV Parse Error:', error);
        resolve({ 
          success: false, 
          message: 'Fehler beim Parsen der CSV-Datei.' 
        });
      }
    });
  });
};
