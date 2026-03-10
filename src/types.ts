export interface DailyChallenge {
  id: string;
  challenge_date: string;
  target_lat: number;
  target_lng: number;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  lucky_distance: number;
  created_at: string;
}

export interface CustomChallenge {
  id: string;
  share_code: string;
  challenge_name: string;
  target_lat: number;
  target_lng: number;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  creator_name: string;
  created_at: string;
}

export interface ChallengeAttempt {
  id: string;
  challenge_id?: string;
  custom_challenge_id?: string;
  player_name: string;
  player_session: string;
  final_lat: number;
  final_lng: number;
  distance_meters: number;
  hit_lucky_distance: boolean;
  created_at: string;
}

export type Screen =
  | 'home'
  | 'create-challenge'
  | 'browse-challenges'
  | 'custom-challenge'
  | 'result'
  | 'about'
  | 'admin';

export interface GameState {
  challenge: DailyChallenge | CustomChallenge | null;
  isCustom: boolean;
  playerLat: number | null;
  playerLng: number | null;
  finalDistance: number | null;
  hitLucky: boolean;
}
