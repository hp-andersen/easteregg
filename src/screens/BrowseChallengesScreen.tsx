import { useState, useEffect } from 'react';
import { ArrowLeft, MapPin, Users, List, Map as MapIcon } from 'lucide-react';
import { MapContainer, TileLayer, Circle, useMapEvents, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Screen, CustomChallenge, GameState } from '../types';
import { supabase } from '../lib/supabase';

const challengeIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="#0EA5E9" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <path d="M12 2 L12 22 M2 12 L22 12"/>
    </svg>
  `),
  iconSize: [32, 32],
  iconAnchor: [16, 16],
});

const playerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF6A13" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="8"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface MapClickHandlerProps {
  onMapClick: () => void;
}

function MapClickHandler({ onMapClick }: MapClickHandlerProps) {
  useMapEvents({
    click() {
      onMapClick();
    },
  });
  return null;
}

interface BrowseChallengesScreenProps {
  onNavigate: (screen: Screen) => void;
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

export default function BrowseChallengesScreen({
  onNavigate,
  updateGameState,
}: BrowseChallengesScreenProps) {
  const [loading, setLoading] = useState(true);
  const [centerPos, setCenterPos] = useState<[number, number] | null>(null);
  const [challenges, setChallenges] = useState<CustomChallenge[]>([]);
  const [selectedChallenge, setSelectedChallenge] = useState<CustomChallenge | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  useEffect(() => {
    const timeout = setTimeout(() => {
      const pos: [number, number] = [56.1533, 10.1380];
      setCenterPos(pos);
      loadNearbyChallenges(pos[0], pos[1]);
    }, 3000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          clearTimeout(timeout);
          const pos: [number, number] = [position.coords.latitude, position.coords.longitude];
          setCenterPos(pos);
          await loadNearbyChallenges(pos[0], pos[1]);
        },
        () => {
          clearTimeout(timeout);
          const pos: [number, number] = [56.1533, 10.1380];
          setCenterPos(pos);
          loadNearbyChallenges(pos[0], pos[1]);
        },
        { timeout: 3000, enableHighAccuracy: true }
      );
    } else {
      clearTimeout(timeout);
      const pos: [number, number] = [56.1533, 10.1380];
      setCenterPos(pos);
      loadNearbyChallenges(pos[0], pos[1]);
    }

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('custom_challenges_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'custom_challenges',
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setChallenges((prev) => prev.filter((c) => c.id !== payload.old.id));
            if (selectedChallenge?.id === payload.old.id) {
              setSelectedChallenge(null);
            }
          } else if (payload.eventType === 'INSERT' && centerPos) {
            const newChallenge = payload.new as CustomChallenge;
            const distance = calculateDistance(
              centerPos[0],
              centerPos[1],
              newChallenge.center_lat,
              newChallenge.center_lng
            );
            if (distance < 100000) {
              setChallenges((prev) => [newChallenge, ...prev]);
            }
          } else if (payload.eventType === 'UPDATE') {
            setChallenges((prev) =>
              prev.map((c) => (c.id === payload.new.id ? (payload.new as CustomChallenge) : c))
            );
            if (selectedChallenge?.id === payload.new.id) {
              setSelectedChallenge(payload.new as CustomChallenge);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [centerPos, selectedChallenge]);

  const loadNearbyChallenges = async (lat: number, lng: number) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('custom_challenges')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const nearby = (data || []).filter((challenge) => {
        const distance = calculateDistance(
          lat,
          lng,
          challenge.center_lat,
          challenge.center_lng
        );
        return distance < 100000;
      });

      setChallenges(nearby);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load challenges:', err);
      setLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371000;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const handleStartChallenge = (challenge: CustomChallenge) => {
    updateGameState({
      challenge,
      isCustom: true,
      playerLat: null,
      playerLng: null,
      finalDistance: null,
      hitLucky: false,
    });
    onNavigate('custom-challenge');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-gray-600">Loading challenges...</p>
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
          <h1 className="font-bold text-lg">Browse Challenges</h1>
          <p className="text-sm opacity-90">{challenges.length} challenges nearby</p>
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
          className="p-2 hover:bg-white/20 rounded-lg transition-colors"
        >
          {viewMode === 'map' ? <List className="w-6 h-6" /> : <MapIcon className="w-6 h-6" />}
        </button>
      </div>

      <div className="flex-1 relative min-h-0">
        {viewMode === 'map' && centerPos && (
          <div className="absolute inset-0">
            <MapContainer
              center={centerPos}
              zoom={13}
              className="w-full h-full"
              zoomControl={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapClickHandler onMapClick={() => setSelectedChallenge(null)} />

              <Marker position={centerPos} icon={playerIcon}>
                <Popup>Your Location</Popup>
              </Marker>

              {challenges.map((challenge) => (
                <Circle
                  key={challenge.id}
                  center={[challenge.center_lat, challenge.center_lng]}
                  radius={challenge.radius_meters}
                  pathOptions={{
                    color: selectedChallenge?.id === challenge.id ? '#FF6A13' : '#0EA5E9',
                    fillColor: selectedChallenge?.id === challenge.id ? '#FF6A13' : '#0EA5E9',
                    fillOpacity: 0.2,
                    weight: 2,
                  }}
                  eventHandlers={{
                    click: () => setSelectedChallenge(challenge),
                  }}
                >
                  <Marker
                    position={[challenge.center_lat, challenge.center_lng]}
                    icon={challengeIcon}
                    eventHandlers={{
                      click: () => setSelectedChallenge(challenge),
                    }}
                  >
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold text-primary mb-1">
                          {challenge.challenge_name || `Challenge by ${challenge.creator_name}`}
                        </p>
                        <p className="text-xs text-gray-500 mb-1">by {challenge.creator_name}</p>
                        <p className="text-sm text-gray-600 mb-2">
                          Created {new Date(challenge.created_at).toLocaleDateString()}
                        </p>
                        <button
                          onClick={() => handleStartChallenge(challenge)}
                          className="bg-accent text-white px-4 py-2 rounded-lg text-sm font-semibold"
                        >
                          Start Challenge
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                </Circle>
              ))}
            </MapContainer>
          </div>
        )}

        {viewMode === 'list' && (
          <div className="overflow-y-auto h-full p-4">
            <div className="max-w-2xl mx-auto space-y-3">
              {challenges.map((challenge) => {
                const distance = centerPos ? calculateDistance(
                  centerPos[0],
                  centerPos[1],
                  challenge.center_lat,
                  challenge.center_lng
                ) : 0;

                return (
                  <div
                    key={challenge.id}
                    onClick={() => handleStartChallenge(challenge)}
                    className="bg-white border-2 border-gray-200 rounded-xl p-4 shadow-sm hover:border-primary hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg text-gray-900">
                          {challenge.challenge_name || `Challenge by ${challenge.creator_name}`}
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">by {challenge.creator_name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {(distance / 1000).toFixed(1)} km away
                          </span>
                          <span>Radius: {challenge.radius_meters}m</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Created {new Date(challenge.created_at).toLocaleDateString('da-DK', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {selectedChallenge && (
        <div className="p-6 bg-white border-t-2 border-gray-100 shadow-lg">
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="font-bold text-lg text-primary">
                  {selectedChallenge.challenge_name || `Challenge by ${selectedChallenge.creator_name}`}
                </h2>
                <p className="text-sm text-gray-600">by {selectedChallenge.creator_name}</p>
                <p className="text-sm text-gray-600">
                  Radius: {selectedChallenge.radius_meters}m
                </p>
              </div>
            </div>

            <button
              onClick={() => handleStartChallenge(selectedChallenge)}
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all active:scale-95"
            >
              Start This Challenge
            </button>
          </div>
        </div>
      )}

      {!selectedChallenge && challenges.length === 0 && (
        <div className="p-6 bg-white border-t-2 border-gray-100">
          <div className="max-w-md mx-auto text-center text-gray-600">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No challenges found nearby.</p>
            <p className="text-sm mt-2">Be the first to create one!</p>
          </div>
        </div>
      )}
    </div>
  );
}
