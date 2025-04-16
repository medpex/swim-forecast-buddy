
import React from 'react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CalendarOff } from 'lucide-react';

const WinterBreakBanner = () => {
  return (
    <Alert className="mb-6 bg-blue-50 border-blue-200">
      <CalendarOff className="h-5 w-5 text-blue-600" />
      <AlertDescription className="text-blue-800">
        Winterpause: Das Freibad ist von Mitte September bis 30. April geschlossen. 
        Während dieser Zeit werden keine Besucherdaten erfasst.
      </AlertDescription>
    </Alert>
  );
};

export default WinterBreakBanner;
