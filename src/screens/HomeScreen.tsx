import { MapPin, Compass, Info, Map } from 'lucide-react';
import { Screen } from '../types';
import { useRef } from 'react';

interface HomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const clickCountRef = useRef(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleNClick = () => {
    clickCountRef.current += 1;

    if (clickCountRef.current === 3) {
      onNavigate('admin');
      clickCountRef.current = 0;
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickCountRef.current = 0;
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white p-6 flex flex-col">
      <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-primary rounded-full mb-4">
            <MapPin className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="text-primary">Walk</span>
            <span
              className="text-accent cursor-pointer select-none"
              onClick={handleNClick}
            >
              N
            </span>
            <span className="text-primary">Seek</span>
          </h1>
          <p className="text-3xl font-bold text-gray-800">Beat My Distance</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => onNavigate('browse-challenges')}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Map className="w-6 h-6" />
            <span className="text-lg">Browse Challenges</span>
          </button>

          <button
            onClick={() => onNavigate('create-challenge')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-5 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Compass className="w-6 h-6" />
            <span className="text-lg">Create Challenge</span>
          </button>

          <button
            onClick={() => onNavigate('about')}
            className="w-full bg-white hover:bg-gray-50 text-gray-700 font-semibold py-4 px-6 rounded-2xl shadow flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Info className="w-5 h-5" />
            <span>About</span>
          </button>
        </div>
      </div>

      <div className="text-center text-sm text-gray-500 mt-8">
        Find the hidden GPS point. Get as close as possible!
      </div>
    </div>
  );
}
