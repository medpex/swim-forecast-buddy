
import React from 'react';
import RecentVisitorsChart from '@/components/RecentVisitorsChart';
import { mockHistoricalData } from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calendar, Users, Award, Droplet } from 'lucide-react';

const Historical: React.FC = () => {
  // Calculate average visitors from historical data
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  
  // Find the peak day
  const peakDay = [...mockHistoricalData].sort((a, b) => 
    b.visitor_count - a.visitor_count
  )[0];
  
  // Format date
  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(dateStr));
  };
  
  // Count days by type
  const weekendDays = mockHistoricalData.filter(day => day.is_weekend).length;
  const holidayDays = mockHistoricalData.filter(day => day.is_holiday).length;
  const specialEventDays = mockHistoricalData.filter(day => day.special_event).length;
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Historische Besucherdaten</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Durchschnittliche Besucher
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{avgVisitors}</div>
                <div className="text-xs text-muted-foreground">pro Tag</div>
              </div>
              <Users className="h-8 w-8 text-water-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Spitzentag
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{peakDay.visitor_count}</div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(peakDay.date).split(',')[0]}
                </div>
              </div>
              <Award className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wochenend- & Feiertage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{weekendDays + holidayDays}</div>
                <div className="text-xs text-muted-foreground">
                  {weekendDays} Wochenenden, {holidayDays} Feiertage
                </div>
              </div>
              <Calendar className="h-8 w-8 text-water-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Besondere Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{specialEventDays}</div>
                <div className="text-xs text-muted-foreground">
                  Tage mit Events
                </div>
              </div>
              <Droplet className="h-8 w-8 text-water-500" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="mb-8">
        <RecentVisitorsChart 
          data={mockHistoricalData} 
          averageVisitors={avgVisitors}
        />
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Detaillierte Besucherdaten</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Wochentag</TableHead>
                <TableHead>Besucher</TableHead>
                <TableHead>Feiertag</TableHead>
                <TableHead>Wochenende</TableHead>
                <TableHead>Schulferien</TableHead>
                <TableHead>Besonderes Event</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...mockHistoricalData]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((day) => (
                <TableRow key={day.date}>
                  <TableCell className="font-medium">
                    {new Date(day.date).toLocaleDateString('de-DE')}
                  </TableCell>
                  <TableCell>{day.day_of_week}</TableCell>
                  <TableCell className="font-bold">{day.visitor_count}</TableCell>
                  <TableCell>
                    {day.is_holiday ? 
                      <span className="text-success">Ja</span> : 
                      <span className="text-muted-foreground">Nein</span>
                    }
                  </TableCell>
                  <TableCell>
                    {day.is_weekend ? 
                      <span className="text-water-600">Ja</span> : 
                      <span className="text-muted-foreground">Nein</span>
                    }
                  </TableCell>
                  <TableCell>
                    {day.is_school_break ? 
                      <span className="text-water-600">Ja</span> : 
                      <span className="text-muted-foreground">Nein</span>
                    }
                  </TableCell>
                  <TableCell>
                    {day.special_event ? 
                      <span className="text-warning">{day.special_event}</span> : 
                      <span className="text-muted-foreground">-</span>
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Historical;
