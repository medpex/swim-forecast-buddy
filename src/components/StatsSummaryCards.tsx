
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsSummary } from '@/lib/types';
import { Users, CalendarX2, TrendingDown, Calendar } from 'lucide-react';
import { isWinterBreak } from '@/lib/utils/dateUtils';

interface StatsSummaryCardsProps {
  stats: StatsSummary;
}

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  const currentDate = new Date();
  const isCurrentlyWinterBreak = isWinterBreak(currentDate);

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-blue-600">Winterpause</div>
              <div className="text-xs text-muted-foreground">
                15. September - 30. April
              </div>
            </div>
            <CalendarX2 className="h-8 w-8 text-blue-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Besucher (Letztes Jahr)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.total_last_year)}</div>
              <div className="text-xs text-muted-foreground">Gesamtbesucher 2024</div>
            </div>
            <Users className="h-8 w-8 text-water-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Veränderung zum Vorjahr</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-400">-</div>
              <div className="text-xs text-muted-foreground">
                Erst nach Saisonstart verfügbar
              </div>
            </div>
            <TrendingDown className="h-8 w-8 text-gray-400" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Saisonstart</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">1. Mai 2025</div>
              <div className="text-xs text-muted-foreground">Saisonbeginn</div>
            </div>
            <Calendar className="h-8 w-8 text-success" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryCards;
