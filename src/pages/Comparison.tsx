
import React from 'react';
import HistoricalComparisonChart from '@/components/HistoricalComparisonChart';
import { mockYearlyComparison } from '@/lib/mock-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown } from 'lucide-react';

const Comparison: React.FC = () => {
  // Format number
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };
  
  // Calculate year-over-year growth
  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };
  
  // Get month names for the table
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  // Get total by year
  const yearlyTotals = mockYearlyComparison.map(y => ({
    year: y.year,
    total: y.total_visitors
  }));
  
  // Format German month names
  const germanMonths = [
    'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 
    'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
  ];
  
  // Create a month name mapping
  const monthNameMap = months.reduce((acc, month, index) => {
    acc[month] = germanMonths[index];
    return acc;
  }, {} as Record<string, string>);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Jahresvergleich der Besucherzahlen</h1>
      
      <div className="mb-8">
        <HistoricalComparisonChart data={mockYearlyComparison} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Jahresübersicht</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jahr</TableHead>
                  <TableHead>Gesamtbesucher</TableHead>
                  <TableHead>Täglicher Durchschnitt</TableHead>
                  <TableHead>Wachstum</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockYearlyComparison.map((yearData, index) => {
                  const prevYear = index > 0 ? mockYearlyComparison[index - 1] : null;
                  const growth = prevYear 
                    ? calculateGrowth(yearData.total_visitors, prevYear.total_visitors) 
                    : 0;
                  
                  return (
                    <TableRow key={yearData.year}>
                      <TableCell className="font-medium">{yearData.year}</TableCell>
                      <TableCell>{formatNumber(yearData.total_visitors)}</TableCell>
                      <TableCell>{formatNumber(yearData.average_daily)}</TableCell>
                      <TableCell>
                        {index > 0 ? (
                          <div className="flex items-center">
                            {growth > 0 ? (
                              <>
                                <TrendingUp className="h-4 w-4 text-success mr-1" />
                                <span className="text-success">+{growth.toFixed(1)}%</span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="h-4 w-4 text-destructive mr-1" />
                                <span className="text-destructive">{growth.toFixed(1)}%</span>
                              </>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Spitzentage nach Jahr</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Jahr</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead>Besucher</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockYearlyComparison.map((yearData) => (
                  <TableRow key={yearData.year}>
                    <TableCell className="font-medium">{yearData.year}</TableCell>
                    <TableCell>
                      {new Date(yearData.peak_day.date).toLocaleDateString('de-DE')}
                    </TableCell>
                    <TableCell className="font-bold">
                      {formatNumber(yearData.peak_day.count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Monatliche Besucherzahlen im Jahresvergleich</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Monat</TableHead>
                  {mockYearlyComparison.map(year => (
                    <TableHead key={year.year}>{year.year}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {months.map(month => (
                  <TableRow key={month}>
                    <TableCell className="font-medium">{monthNameMap[month]}</TableCell>
                    {mockYearlyComparison.map(year => (
                      <TableCell key={`${year.year}-${month}`}>
                        {formatNumber(year.months[month])}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Comparison;
