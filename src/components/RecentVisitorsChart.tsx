
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend, ReferenceLine 
} from 'recharts';
import { VisitorData } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecentVisitorsChartProps {
  data: VisitorData[];
  averageVisitors?: number;
}

const RecentVisitorsChart: React.FC<RecentVisitorsChartProps> = ({ 
  data,
  averageVisitors
}) => {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', { month: 'numeric', day: 'numeric' }).format(date);
  };

  // Format data for chart
  const chartData = data.map(day => ({
    date: formatDate(day.date),
    rawDate: day.date,
    visitors: day.visitor_count,
    isWeekend: day.is_weekend,
    isHoliday: day.is_holiday,
    dayOfWeek: day.day_of_week,
    specialEvent: day.special_event
  }));

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Besucherzahlen der letzten 30 Tage</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                angle={-45} 
                textAnchor="end" 
                height={70}
                tick={{ fontSize: 12 }}
                tickFormatter={(value, index) => index % 3 === 0 ? value : ''}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} Besucher`, 'Besucher']}
                labelFormatter={(label) => `Datum: ${label}`}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-4 rounded shadow border">
                        <p className="font-bold">{label}</p>
                        <p className="text-water-600">
                          <span className="font-bold">Besucher:</span> {data.visitors}
                        </p>
                        <p className="text-muted-foreground">{data.dayOfWeek}</p>
                        {data.isWeekend && <p className="text-water-900">Wochenende</p>}
                        {data.isHoliday && <p className="text-success">Feiertag</p>}
                        {data.specialEvent && (
                          <p className="text-warning font-medium">Event: {data.specialEvent}</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
              {averageVisitors && (
                <ReferenceLine 
                  y={averageVisitors} 
                  label="Ø"
                  stroke="#888888"
                  strokeDasharray="3 3"
                />
              )}
              <Line 
                type="monotone" 
                dataKey="visitors" 
                stroke="#0ea5e9" 
                strokeWidth={2}
                dot={{ 
                  stroke: '#0ea5e9', 
                  strokeWidth: 2, 
                  r: 4, 
                  fill: 'white' 
                }}
                activeDot={{ 
                  stroke: '#0c4a6e', 
                  strokeWidth: 2, 
                  r: 6, 
                  fill: '#38bdf8' 
                }}
                name="Besucher"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentVisitorsChart;
