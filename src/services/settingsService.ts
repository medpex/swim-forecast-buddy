
import { supabase } from "@/integrations/supabase/client";

export interface Settings {
  openweather_api_key: string;
  postal_code: string;
}

export async function getSettings(): Promise<Settings | null> {
  const { data, error } = await supabase
    .from('settings')
    .select('openweather_api_key, postal_code')
    .single();

  if (error) {
    console.error('Error fetching settings:', error);
    return null;
  }

  return data;
}

export async function updateSettings(settings: Partial<Settings>): Promise<boolean> {
  const { error } = await supabase
    .from('settings')
    .update(settings)
    .eq('id', 1);

  if (error) {
    console.error('Error updating settings:', error);
    return false;
  }

  return true;
}
