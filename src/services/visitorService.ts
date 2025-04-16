
import { supabase } from "@/integrations/supabase/client";
import type { VisitorData, YearlyComparison } from "@/lib/types";

export const fetchHistoricalData = async (): Promise<VisitorData[]> => {
  const { data, error } = await supabase
    .from('visitor_data')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  if (error) {
    console.error('Error fetching visitor data:', error);
    throw error;
  }

  return data || [];
};

export const fetchYearlyComparisons = async (): Promise<YearlyComparison[]> => {
  const currentYear = new Date().getFullYear();
  const lastThreeYears = [currentYear, currentYear - 1, currentYear - 2];
  
  const { data: visitorData, error } = await supabase
    .from('visitor_data')
    .select('*')
    .gte('date', `${currentYear - 2}-01-01`)
    .lte('date', `${currentYear}-12-31`)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching yearly comparison data:', error);
    throw error;
  }

  const yearlyData = lastThreeYears.map(year => {
    const yearData = (visitorData || []).filter(d => 
      new Date(d.date).getFullYear() === year
    );

    const monthlyVisitors: Record<string, number> = {};
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    months.forEach(month => {
      const monthData = yearData.filter(d => {
        const date = new Date(d.date);
        return date.toLocaleString('en-US', { month: 'long' }) === month;
      });
      
      monthlyVisitors[month] = monthData.reduce((sum, d) => sum + d.visitor_count, 0);
    });

    // Find the peak day for this year
    const peakDay = yearData.length > 0 
      ? yearData.reduce((max, current) => 
          max.visitor_count > current.visitor_count ? max : current, 
          yearData[0]
        )
      : { date: `${year}-01-01`, visitor_count: 0 };

    return {
      year,
      total_visitors: yearData.reduce((sum, d) => sum + d.visitor_count, 0),
      average_daily: Math.round(yearData.reduce((sum, d) => sum + d.visitor_count, 0) / 
        (yearData.length || 1)),
      peak_day: {
        date: peakDay.date,
        count: peakDay.visitor_count
      },
      months: monthlyVisitors
    };
  });

  return yearlyData;
};
