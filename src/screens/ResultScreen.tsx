import { Target, Trophy, Share2 } from 'lucide-react';
import { Screen, GameState } from '../types';

interface ResultScreenProps {
  onNavigate: (screen: Screen) => void;
  gameState: GameState;
}

export default function ResultScreen({ onNavigate, gameState }: ResultScreenProps) {
  const distance = gameState.finalDistance || 0;

  const getMessage = () => {
    if (distance < 10) return 'Incredible!';
    if (distance < 25) return 'Amazing!';
    if (distance < 50) return 'Great job!';
    if (distance < 100) return 'Well done!';
    return 'Good try!';
  };

  const handleShare = async () => {
    const text = `I got ${distance.toFixed(1)} meters in today's WalkNSeek challenge. Can you beat my distance?`;
    const url = window.location.origin;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'WalkNSeek Challenge',
          text: text,
          url: url,
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          await navigator.clipboard.writeText(`${text}\n\n${url}`);
          alert('Result copied to clipboard!');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        alert('Result copied to clipboard!');
      } catch (err) {
        alert('Unable to share. Please copy manually: ' + url);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <div className="inline-block p-6 bg-white rounded-full shadow-xl mb-6">
          <Target className="w-16 h-16 text-accent" />
        </div>

        <h1 className="text-3xl font-bold text-primary mb-2">{getMessage()}</h1>

        {gameState.hitLucky && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-xl p-4 mb-4 flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            <span className="font-semibold text-yellow-800">Lucky Distance Bonus!</span>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-2xl p-8 mb-6">
          <p className="text-gray-600 text-sm mb-2">Your Distance</p>
          <p className="text-6xl font-bold text-primary mb-1">
            {distance.toFixed(1)}
          </p>
          <p className="text-2xl text-gray-500">meters</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleShare}
            className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Share2 className="w-5 h-5" />
            <span>Share Result</span>
          </button>

          <button
            onClick={() => onNavigate('browse-challenges')}
            className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
          >
            <Trophy className="w-5 h-5" />
            <span>Try Another Challenge</span>
          </button>

          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-2xl transition-all active:scale-95"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
