import { useState, useEffect } from 'react';
import { ArrowLeft, Navigation, Target } from 'lucide-react';
import { Screen, GameState, CustomChallenge } from '../types';
import { supabase } from '../lib/supabase';
import {
  calculateDistance,
  getPlayerSession,
  getPlayerName,
  setPlayerName,
} from '../lib/gps';
import GameMap from '../components/GameMap';

interface CustomChallengeScreenProps {
  onNavigate: (screen: Screen) => void;
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

export default function CustomChallengeScreen({
  onNavigate,
  gameState,
  updateGameState,
}: CustomChallengeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState(getPlayerName() || '');
  const [showNamePrompt, setShowNamePrompt] = useState(!getPlayerName());
  const [watchId, setWatchId] = useState<number | null>(null);
  const [distanceWalked, setDistanceWalked] = useState(0);
  const [startPos, setStartPos] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!gameState.challenge) {
      loadChallengeFromURL();
    } else {
      setLoading(false);
    }
    startTracking();

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, []);

  const loadChallengeFromURL = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shareCode = urlParams.get('code');

      if (!shareCode) {
        setError('No challenge code provided');
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from('custom_challenges')
        .select('*')
        .eq('share_code', shareCode)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Challenge not found');
        setLoading(false);
        return;
      }

      updateGameState({ challenge: data, isCustom: true });
      setLoading(false);
    } catch (err) {
      setError('Failed to load challenge');
      setLoading(false);
    }
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    const id = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        updateGameState({ playerLat: latitude, playerLng: longitude });

        if (!startPos) {
          setStartPos({ lat: latitude, lng: longitude });
        } else {
          const walked = calculateDistance(
            startPos.lat,
            startPos.lng,
            latitude,
            longitude
          );
          setDistanceWalked(walked);
        }
      },
      (err) => {
        setError('Unable to get location');
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );

    setWatchId(id);
  };

  const handleStop = async () => {
    if (!gameState.challenge || !gameState.playerLat || !gameState.playerLng) {
      return;
    }

    if (!playerName.trim()) {
      setShowNamePrompt(true);
      return;
    }

    setPlayerName(playerName);

    const challenge = gameState.challenge as CustomChallenge;
    const distance = calculateDistance(
      gameState.playerLat,
      gameState.playerLng,
      challenge.target_lat,
      challenge.target_lng
    );

    await supabase.from('challenge_attempts').insert([
      {
        custom_challenge_id: challenge.id,
        player_name: playerName,
        player_session: getPlayerSession(),
        final_lat: gameState.playerLat,
        final_lng: gameState.playerLng,
        distance_meters: distance,
        hit_lucky_distance: false,
      },
    ]);

    updateGameState({ finalDistance: distance, hitLucky: false });
    onNavigate('result');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <Navigation className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 mb-4">{error}</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary text-white px-6 py-3 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-primary mb-4 text-center">
            Enter Your Name
          </h2>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerNameState(e.target.value)}
            placeholder="Your name"
            className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary outline-none mb-4"
            autoFocus
          />
          <button
            onClick={() => {
              if (playerName.trim()) {
                setShowNamePrompt(false);
                handleStop();
              }
            }}
            className="w-full bg-accent text-white font-semibold py-3 rounded-xl"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  if (!gameState.challenge) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <Target className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-800 mb-4">No challenge loaded</p>
          <button
            onClick={() => onNavigate('home')}
            className="bg-primary text-white px-6 py-3 rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const challenge = gameState.challenge as CustomChallenge;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-primary text-white p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-lg">Challenge by {challenge.creator_name}</h1>
          <p className="text-sm opacity-90">Distance: {distanceWalked.toFixed(1)}m</p>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        <div className="absolute inset-0">
          <GameMap
            centerLat={challenge.center_lat}
            centerLng={challenge.center_lng}
            targetLat={challenge.target_lat}
            targetLng={challenge.target_lng}
            radius={challenge.radius_meters}
            playerLat={gameState.playerLat}
            playerLng={gameState.playerLng}
          />
        </div>
      </div>

      <div className="p-6 bg-white border-t-2 border-gray-100">
        <div className="max-w-md mx-auto">
          <p className="text-center text-gray-600 mb-4">
            Walk to find the hidden point within the circle
          </p>
          <button
            onClick={handleStop}
            disabled={!gameState.playerLat || !gameState.playerLng}
            className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xl"
          >
            Stop Here
          </button>
        </div>
      </div>
    </div>
  );
}
