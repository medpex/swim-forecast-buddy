
import React from 'react';
import { Link } from 'react-router-dom';
import { Droplet } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-gradient-to-r from-water-600 to-water-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3">
            <Droplet className="h-8 w-8" />
            <span className="text-2xl font-bold">Swim Forecast Buddy</span>
          </Link>
          
          <nav>
            <ul className="flex space-x-6">
              <li>
                <Link 
                  to="/" 
                  className="text-white hover:text-water-100 transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link 
                  to="/historical" 
                  className="text-white hover:text-water-100 transition-colors"
                >
                  Historische Daten
                </Link>
              </li>
              <li>
                <Link 
                  to="/forecast" 
                  className="text-white hover:text-water-100 transition-colors"
                >
                  Prognose
                </Link>
              </li>
              <li>
                <Link 
                  to="/comparison" 
                  className="text-white hover:text-water-100 transition-colors"
                >
                  Vergleich
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
