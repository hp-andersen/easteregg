import { useMemo } from 'react';
import { MapContainer, TileLayer, Circle, Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const playerIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,' + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#FF6A13" stroke="white" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  `),
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function getRandomMapCenter(centerLat: number, centerLng: number, radius: number): [number, number] {
  const angle = Math.random() * 2 * Math.PI;
  const distance = Math.random() * radius * 0.7;

  const offsetLat = (distance * Math.cos(angle)) / 111320;
  const offsetLng = (distance * Math.sin(angle)) / (111320 * Math.cos(centerLat * Math.PI / 180));

  return [centerLat + offsetLat, centerLng + offsetLng];
}

interface GameMapProps {
  centerLat: number;
  centerLng: number;
  targetLat: number;
  targetLng: number;
  radius: number;
  playerLat: number | null;
  playerLng: number | null;
}

export default function GameMap({
  centerLat,
  centerLng,
  targetLat,
  targetLng,
  radius,
  playerLat,
  playerLng,
}: GameMapProps) {
  const playerPos: [number, number] | null =
    playerLat !== null && playerLng !== null ? [playerLat, playerLng] : null;

  const mapCenter = useMemo(
    () => getRandomMapCenter(targetLat, targetLng, radius),
    [targetLat, targetLng, radius]
  );

  return (
    <MapContainer
      center={mapCenter}
      zoom={15}
      className="w-full h-full"
      zoomControl={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[centerLat, centerLng]}
        radius={radius}
        pathOptions={{
          color: '#1F6F64',
          fillColor: '#1F6F64',
          fillOpacity: 0.15,
        }}
      />
      {playerPos && <Marker position={playerPos} icon={playerIcon} />}
    </MapContainer>
  );
}
