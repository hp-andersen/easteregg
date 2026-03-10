export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function generateRandomPointInRadius(
  centerLat: number,
  centerLng: number,
  radiusMeters: number
): { lat: number; lng: number } {
  const radiusInDegrees = radiusMeters / 111320;

  const u = Math.random();
  const v = Math.random();
  const w = radiusInDegrees * Math.sqrt(u);
  const t = 2 * Math.PI * v;
  const x = w * Math.cos(t);
  const y = w * Math.sin(t);

  const newLat = centerLat + y;
  const newLng = centerLng + x / Math.cos((centerLat * Math.PI) / 180);

  return { lat: newLat, lng: newLng };
}

export function generateShareCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function getPlayerSession(): string {
  let session = localStorage.getItem('walknseek_session');
  if (!session) {
    session = crypto.randomUUID();
    localStorage.setItem('walknseek_session', session);
  }
  return session;
}

export function getPlayerName(): string | null {
  return localStorage.getItem('walknseek_player_name');
}

export function setPlayerName(name: string): void {
  localStorage.setItem('walknseek_player_name', name);
}
