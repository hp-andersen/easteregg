import { ArrowLeft, Target, MapPin, Trophy, Users } from 'lucide-react';
import { Screen } from '../types';

interface AboutScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function AboutScreen({ onNavigate }: AboutScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white">
      <div className="bg-primary text-white p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">About</h1>
        </div>
      </div>

      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl shadow-lg p-8 mb-6">
          <div className="text-center mb-6">
            <div className="inline-block p-4 bg-primary rounded-full mb-4">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold mb-2">
              <span className="text-primary">Walk</span>
              <span className="text-accent">N</span>
              <span className="text-primary">Seek</span>
            </h2>
            <p className="text-gray-600">Beat My Distance</p>
          </div>

          <div className="space-y-6 text-gray-700">
            <div>
              <h3 className="font-bold text-xl text-primary mb-2 flex items-center gap-2">
                <Target className="w-5 h-5" />
                How to Play
              </h3>
              <p>
                WalkNSeek is a GPS-based game where you try to get as close as possible to a hidden location. The player who stops closest to the target wins!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-primary mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Daily Challenge
              </h3>
              <p>
                Every day, a new challenge is generated within 1km of your starting position. A circle shows the search area, but the exact target location is hidden. Walk around and use your intuition to find the best spot!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-primary mb-2 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Custom Challenges
              </h3>
              <p>
                Create your own challenges by tapping any location on the map. Share the challenge code with friends and see who can get closest to your hidden point!
              </p>
            </div>

            <div>
              <h3 className="font-bold text-xl text-primary mb-2 flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Leaderboard
              </h3>
              <p>
                Compete with other players! The leaderboard shows the top 10 attempts for each day's challenge. Lower distances are better.
              </p>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4">
              <h4 className="font-bold text-yellow-800 mb-1">Lucky Distance Bonus</h4>
              <p className="text-sm text-yellow-700">
                Each challenge has a secret "lucky distance." If you stop within 1 meter of this distance, you'll earn a special bonus badge!
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-6 mb-6">
          <h3 className="font-bold text-lg text-primary mb-3">Tips for Success</h3>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Use the search area circle as your guide</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Move slowly and strategically</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Check your GPS accuracy before stopping</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent font-bold">•</span>
              <span>Try multiple times to improve your score</span>
            </li>
          </ul>
        </div>

        <button
          onClick={() => onNavigate('home')}
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
