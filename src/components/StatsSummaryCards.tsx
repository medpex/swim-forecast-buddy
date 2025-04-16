
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsSummary } from '@/lib/types';
import { TrendingUp, TrendingDown, Users, Calendar, Award } from 'lucide-react';

interface StatsSummaryCardsProps {
  stats: StatsSummary;
}

const StatsSummaryCards: React.FC<StatsSummaryCardsProps> = ({ stats }) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('de-DE').format(num);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('de-DE', { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Besucher (Aktuelles Jahr)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.total_current_year)}</div>
              <div className="text-xs text-muted-foreground">Gesamtbesucher</div>
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
              <div className="flex items-center">
                <span className="text-2xl font-bold">
                  {stats.change_percentage > 0 ? '+' : ''}{stats.change_percentage.toFixed(1)}%
                </span>
                {stats.change_percentage > 0 ? (
                  <TrendingUp className="ml-2 h-4 w-4 text-success" />
                ) : (
                  <TrendingDown className="ml-2 h-4 w-4 text-destructive" />
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatNumber(Math.abs(stats.change_from_last_year))} Besucher {stats.change_from_last_year >= 0 ? 'mehr' : 'weniger'}
              </div>
            </div>
            {stats.change_percentage > 0 ? (
              <div className="h-8 w-8 rounded-full bg-success-light flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-warning-light flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-warning" />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Durchschnittliche Besucher</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.average_daily)}</div>
              <div className="text-xs text-muted-foreground">Besucher pro Tag</div>
            </div>
            <Calendar className="h-8 w-8 text-water-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Höchste Prognose</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold">{formatNumber(stats.peak_forecast.count)}</div>
              <div className="text-xs text-muted-foreground">{formatDate(stats.peak_forecast.date)}</div>
            </div>
            <Award className="h-8 w-8 text-warning" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatsSummaryCards;
