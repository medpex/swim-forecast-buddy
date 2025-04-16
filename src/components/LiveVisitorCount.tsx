
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import { scrapeLiveVisitors, fetchLatestLiveVisitorCount } from '@/services/liveVisitorService';
import { Skeleton } from '@/components/ui/skeleton';

const LiveVisitorCount = () => {
  const { data: liveCount, isLoading } = useQuery({
    queryKey: ['liveVisitors'],
    queryFn: async () => {
      // First try to scrape live data
      const liveData = await scrapeLiveVisitors();
      if (liveData !== null) {
        return { count: liveData, timestamp: new Date().toISOString() };
      }
      // Fallback to latest stored count
      return fetchLatestLiveVisitorCount();
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-[200px]" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-[100px]" />
        </CardContent>
      </Card>
    );
  }

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Aktuelle Besucher
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold">
              {liveCount ? liveCount.count : '-'}
            </div>
            {liveCount && (
              <div className="text-xs text-muted-foreground">
                Stand: {formatTime(liveCount.timestamp)}
              </div>
            )}
          </div>
          <Users className="h-8 w-8 text-water-500" />
        </div>
      </CardContent>
    </Card>
  );
};

export default LiveVisitorCount;
