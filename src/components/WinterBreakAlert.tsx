
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarClock } from 'lucide-react';

const WinterBreakAlert = () => {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <CalendarClock className="h-4 w-4 text-blue-600" />
      <AlertTitle>Winterpause 2024/2025</AlertTitle>
      <AlertDescription>
        Das Freizeitbad ist aktuell in der Winterpause. Die neue Saison beginnt voraussichtlich im Mai 2025. 
        Die hier angezeigten Prognosen basieren auf den Daten der letzten Saison.
      </AlertDescription>
    </Alert>
  );
};

export default WinterBreakAlert;
