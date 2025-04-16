
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Fetch the webpage
    const response = await fetch('https://www.freizeitbad-geesthacht.de/startseite')
    const html = await response.text()

    // Extract visitor count (this is a placeholder - actual implementation depends on the website's HTML structure)
    const visitorCountMatch = html.match(/Aktuelle Besucheranzahl\s*(\d+)/)
    const visitorCount = visitorCountMatch ? parseInt(visitorCountMatch[1], 10) : 0

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Insert visitor count into database
    const { error } = await supabase
      .from('live_visitor_counts')
      .insert({ visitor_count: visitorCount })

    if (error) throw error

    return new Response(JSON.stringify({ visitorCount }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })
  } catch (error) {
    console.error('Error scraping visitor count:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500
    })
  }
})
