
import React, { useState } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, Legend 
} from 'recharts';
import { YearlyComparison } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface HistoricalComparisonChartProps {
  data: YearlyComparison[];
}

const HistoricalComparisonChart: React.FC<HistoricalComparisonChartProps> = ({ data }) => {
  const [viewType, setViewType] = useState<'yearly' | 'monthly'>('yearly');

  // Prepare yearly comparison data
  const yearlyData = data.map(yearData => ({
    year: yearData.year,
    visitors: yearData.total_visitors,
    average: yearData.average_daily
  }));

  // Prepare monthly comparison data
  const monthlyData = (() => {
    const months = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    return months.map(month => {
      const monthData: Record<string, any> = { month };
      
      data.forEach(yearData => {
        // Use the year as a key in the object
        monthData[yearData.year.toString()] = yearData.months[month];
      });
      
      return monthData;
    });
  })();

  // Custom colors for years
  const yearColors = ['#0c4a6e', '#0284c7', '#0ea5e9', '#38bdf8'];

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Historischer Vergleich der Besucherzahlen</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="yearly" className="w-full" onValueChange={(v) => setViewType(v as 'yearly' | 'monthly')}>
          <TabsList className="mb-4">
            <TabsTrigger value="yearly">Jährlicher Vergleich</TabsTrigger>
            <TabsTrigger value="monthly">Monatlicher Vergleich</TabsTrigger>
          </TabsList>
          
          <TabsContent value="yearly" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={yearlyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 30 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value.toLocaleString()} Besucher`, '']}
                  labelFormatter={(year) => `Jahr ${year}`}
                />
                <Legend />
                <Bar 
                  dataKey="visitors" 
                  name="Gesamtbesucher" 
                  fill="#0ea5e9" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="monthly" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  angle={-45} 
                  textAnchor="end" 
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip 
                  formatter={(value: number, name: string) => 
                    [`${value.toLocaleString()} Besucher`, `Jahr ${name}`]
                  }
                  labelFormatter={(month) => `${month}`}
                />
                <Legend />
                {data.map((yearData, index) => (
                  <Bar 
                    key={yearData.year}
                    dataKey={yearData.year.toString()} 
                    name={yearData.year.toString()} 
                    fill={yearColors[index % yearColors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default HistoricalComparisonChart;
