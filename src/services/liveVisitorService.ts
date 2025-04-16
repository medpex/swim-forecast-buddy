
import { supabase } from "@/integrations/supabase/client";

export const scrapeLiveVisitors = async () => {
  try {
    const { data, error } = await supabase.functions.invoke('scrape-live-visitors')
    
    if (error) {
      console.error('Error scraping live visitors:', error)
      return null
    }

    return data?.visitorCount
  } catch (err) {
    console.error('Unexpected error in live visitor scraping:', err)
    return null
  }
}

export const fetchLatestLiveVisitorCount = async () => {
  // Use the generic version of from to bypass type checking
  // since our types file hasn't been updated yet
  const { data, error } = await supabase
    .from('live_visitor_counts')
    .select('visitor_count, timestamp')
    .order('timestamp', { ascending: false })
    .limit(1)
    .single() as unknown as { 
      data: { visitor_count: number, timestamp: string } | null, 
      error: any 
    }

  if (error) {
    console.error('Error fetching latest visitor count:', error)
    return null
  }

  return data
}
