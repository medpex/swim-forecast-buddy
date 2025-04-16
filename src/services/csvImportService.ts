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

export const importVisitorData = async (file: File): Promise<{ success: boolean; message: string }> => {
  return new Promise((resolve) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        try {
          const data = (results.data as VisitorCSVRow[])
            .filter(row => row.date && row.count)
            .map(row => ({
              date: row.date,
              visitor_count: parseInt(row.count, 10),
              day_of_week: row.day_of_week || null,
              is_weekend: row.is_weekend === '1',
              is_holiday: row.is_holiday === '1',
              is_school_break: row.is_school_break === '1',
              special_event: row.special_event || null,
              created_at: row.created_at || new Date().toISOString()
            }));

          if (data.length === 0) {
            resolve({ 
              success: false, 
              message: 'Keine gültigen Daten in der CSV-Datei gefunden.' 
            });
            return;
          }

          const { error } = await supabase
            .from('visitor_data')
            .insert(data);

          if (error) throw error;

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
            .map(row => ({
              date: row.date,
              temperature: parseFloat(row.temperature),
              condition: row.condition,
              created_at: new Date().toISOString()
            }));

          if (data.length === 0) {
            resolve({ 
              success: false, 
              message: 'Keine gültigen Daten in der CSV-Datei gefunden.' 
            });
            return;
          }

          const { error } = await supabase
            .from('weather_data')
            .insert(data);

          if (error) throw error;

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
