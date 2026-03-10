import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Share2, Check } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Screen } from '../types';
import { supabase } from '../lib/supabase';
import { generateShareCode, getPlayerName, setPlayerName } from '../lib/gps';

const targetIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#FF6A13" stroke="white" stroke-width="2">
      <path d="M12 2 L12 22 M2 12 L22 12"/>
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

interface MapClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

interface CreateChallengeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export default function CreateChallengeScreen({ onNavigate }: CreateChallengeScreenProps) {
  const [loading, setLoading] = useState(true);
  const [myPos, setMyPos] = useState<[number, number] | null>(null);
  const [centerPos, setCenterPos] = useState<[number, number] | null>(null);
  const [targetPos, setTargetPos] = useState<[number, number] | null>(null);
  const [shareCode, setShareCode] = useState<string | null>(null);
  const [playerName, setPlayerNameState] = useState(getPlayerName() || '');
  const [challengeName, setChallengeNameState] = useState('');
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [step, setStep] = useState<'center' | 'target'>('center');

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setMyPos([position.coords.latitude, position.coords.longitude]);
          setLoading(false);
        },
        () => {
          setMyPos([51.505, -0.09]);
          setLoading(false);
        }
      );
    } else {
      setMyPos([51.505, -0.09]);
      setLoading(false);
    }
  }, []);

  const handleMapClick = (lat: number, lng: number) => {
    if (shareCode) return;
    if (step === 'center') {
      setCenterPos([lat, lng]);
      setStep('target');
    } else {
      setTargetPos([lat, lng]);
    }
  };

  const handleCreateChallenge = async () => {
    if (!targetPos || !centerPos) return;

    if (!playerName.trim() || !challengeName.trim()) {
      setShowNamePrompt(true);
      return;
    }

    setPlayerName(playerName);

    try {
      const code = generateShareCode();

      const { error } = await supabase.from('custom_challenges').insert([
        {
          share_code: code,
          challenge_name: challengeName,
          target_lat: targetPos[0],
          target_lng: targetPos[1],
          center_lat: centerPos[0],
          center_lng: centerPos[1],
          radius_meters: 500,
          creator_name: playerName,
        },
      ]);

      if (error) throw error;

      setShareCode(code);
    } catch (err) {
      alert('Failed to create challenge');
    }
  };

  const handleShare = async () => {
    if (!shareCode) return;

    const url = `${window.location.origin}?code=${shareCode}`;
    const text = `I created a WalkNSeek challenge for you! Can you find my hidden location?`;

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
          alert('Challenge link copied to clipboard!');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(`${text}\n\n${url}`);
        alert('Challenge link copied to clipboard!');
      } catch (err) {
        alert('Unable to share. Please copy manually: ' + url);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  if (showNamePrompt) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-bold text-primary mb-6 text-center">
            Challenge Details
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Challenge Name
              </label>
              <input
                type="text"
                value={challengeName}
                onChange={(e) => setChallengeNameState(e.target.value)}
                placeholder="e.g. Find the Secret Garden"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary outline-none"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerNameState(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:border-primary outline-none"
              />
            </div>
          </div>
          <button
            onClick={() => {
              if (playerName.trim() && challengeName.trim()) {
                setShowNamePrompt(false);
                handleCreateChallenge();
              }
            }}
            disabled={!playerName.trim() || !challengeName.trim()}
            className="w-full bg-accent text-white font-semibold py-3 rounded-xl mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Challenge
          </button>
        </div>
      </div>
    );
  }

  if (shareCode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/10 to-white flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full text-center">
          <div className="inline-block p-6 bg-white rounded-full shadow-xl mb-6">
            <Check className="w-16 h-16 text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-primary mb-4">Challenge Created!</h1>

          <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Share Code</p>
            <p className="text-4xl font-bold text-primary mb-4">{shareCode}</p>
            <p className="text-sm text-gray-600">
              Share this code or link with friends to challenge them!
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleShare}
              className="w-full bg-accent hover:bg-accent/90 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center gap-3 transition-all active:scale-95"
            >
              <Share2 className="w-5 h-5" />
              <span>Share Challenge</span>
            </button>

            <button
              onClick={() => onNavigate('home')}
              className="w-full bg-white hover:bg-gray-50 text-primary font-semibold py-4 px-6 rounded-2xl shadow border-2 border-primary transition-all active:scale-95"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-primary text-white p-4 flex items-center gap-3 shadow-lg">
        <button onClick={() => onNavigate('home')}>
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div className="flex-1">
          <h1 className="font-bold text-2xl">Create Challenge</h1>
          <p className="text-sm opacity-90">
            {step === 'center' ? 'Step 1: Set search area center' : 'Step 2: Set hidden target'}
          </p>
        </div>
      </div>

      <div className="flex-1 relative min-h-0">
        {myPos && (
          <div className="absolute inset-0">
            <MapContainer
              center={centerPos || myPos}
              zoom={15}
              className="w-full h-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={handleMapClick} />
              {centerPos && (
                <Circle
                  center={centerPos}
                  radius={500}
                  pathOptions={{
                    color: '#3B82F6',
                    fillColor: '#3B82F6',
                    fillOpacity: 0.1,
                    weight: 2,
                  }}
                />
              )}
              {targetPos && (
                <Marker position={targetPos} icon={targetIcon} />
              )}
            </MapContainer>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t-2 border-gray-100">
        <div className="max-w-md mx-auto">
          {step === 'center' && !centerPos && (
            <p className="text-center text-gray-600 mb-4">
              Tap on the map to set the center of the search area (a 500m circle will appear)
            </p>
          )}
          {step === 'target' && !targetPos && (
            <>
              <p className="text-center text-gray-600 mb-4">
                Now tap to set the hidden target point within the circle
              </p>
              <button
                onClick={() => {
                  setStep('center');
                  setCenterPos(null);
                }}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl mb-2"
              >
                Back: Change Center
              </button>
            </>
          )}
          {targetPos && (
            <button
              onClick={handleCreateChallenge}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-5 px-6 rounded-2xl shadow-lg transition-all active:scale-95 text-xl"
            >
              Create Challenge
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
