
import React from 'react';
import VisitorForecastChart from '@/components/VisitorForecastChart';
import WeatherForecastTable from '@/components/WeatherForecastTable';
import WeatherCard from '@/components/WeatherCard';
import { 
  mockCurrentWeather, 
  mockWeatherForecast, 
  mockVisitorForecast,
  mockHistoricalData
} from '@/lib/mock-data';
import { calculateAverageVisitors } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { InfoIcon } from 'lucide-react';

const Forecast: React.FC = () => {
  // Calculate average visitors from historical data
  const avgVisitors = calculateAverageVisitors(mockHistoricalData);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Besucherprognose & Wettervorhersage</h1>
      
      <Alert className="mb-6 bg-water-50 border-water-300">
        <InfoIcon className="h-4 w-4 text-water-600" />
        <AlertTitle>Über unsere Prognose</AlertTitle>
        <AlertDescription>
          Die Prognose basiert auf historischen Besucherdaten, aktuellen Wetterbedingungen und
          weiteren Faktoren wie Wochentag und besonderen Events. Die angegebenen Konfidenzintervalle 
          zeigen die mögliche Abweichung.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="md:col-span-2">
          <VisitorForecastChart 
            forecasts={mockVisitorForecast} 
            historicalAverage={avgVisitors}
          />
        </div>
        <div>
          <WeatherCard 
            weather={mockCurrentWeather} 
            title="Aktuelles Wetter"
          />
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Einflussfaktoren</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Temperatur</h3>
                  <p className="text-sm text-muted-foreground">
                    Bei höheren Temperaturen steigt die Besucherzahl. Ab ca. 25°C 
                    ist ein deutlicher Anstieg zu verzeichnen.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Niederschlag</h3>
                  <p className="text-sm text-muted-foreground">
                    Regen reduziert die Besucherzahlen deutlich. Selbst bei hohen 
                    Temperaturen führt Niederschlag zu weniger Besuchern.
                  </p>
                </div>
                <div>
                  <h3 className="font-medium">Wochentag & Ferien</h3>
                  <p className="text-sm text-muted-foreground">
                    An Wochenenden und in Schulferien sind die Besucherzahlen 
                    grundsätzlich höher als an regulären Wochentagen.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <WeatherForecastTable forecast={mockWeatherForecast} />
      
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Modelldetails</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Machine-Learning-Modell</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Das Prognosemodell nutzt eine Kombination aus Zeitreihenanalyse und 
                Regressionsverfahren, um zukünftige Besucherzahlen vorherzusagen.
              </p>
              
              <h4 className="font-medium">Berücksichtigte Faktoren:</h4>
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                <li>Historische Besucherzahlen</li>
                <li>Temperatur und Wetterbedingungen</li>
                <li>Wochentag und Monat</li>
                <li>Feiertage und Schulferien</li>
                <li>Besondere Events</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Modellgenauigkeit</h3>
              <p className="text-muted-foreground text-sm mb-4">
                Die Genauigkeit wird fortlaufend evaluiert und das Modell regelmäßig 
                neu trainiert. Die Konfidenzintervalle geben eine Einschätzung der Unsicherheit.
              </p>
              
              <h4 className="font-medium">Leistungskennzahlen:</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">MAE</div>
                  <div className="font-medium">42 Besucher</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">RMSE</div>
                  <div className="font-medium">68 Besucher</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">R²</div>
                  <div className="font-medium">0.82</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Genauigkeit</div>
                  <div className="font-medium">85%</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Forecast;
