/*
  # WalkNSeek Database Schema

  1. New Tables
    - `daily_challenges`
      - `id` (uuid, primary key) - Unique identifier
      - `challenge_date` (date, unique) - Date of the challenge (one per day)
      - `target_lat` (decimal) - Hidden target latitude
      - `target_lng` (decimal) - Hidden target longitude
      - `center_lat` (decimal) - Center point latitude for search area
      - `center_lng` (decimal) - Center point longitude for search area
      - `radius_meters` (integer) - Search area radius
      - `lucky_distance` (decimal) - Bonus lucky distance for this challenge
      - `created_at` (timestamptz) - When challenge was created

    - `custom_challenges`
      - `id` (uuid, primary key) - Unique identifier
      - `share_code` (text, unique) - 6-character share code
      - `target_lat` (decimal) - Hidden target latitude
      - `target_lng` (decimal) - Hidden target longitude
      - `center_lat` (decimal) - Center point latitude
      - `center_lng` (decimal) - Center point longitude
      - `radius_meters` (integer) - Search area radius
      - `creator_name` (text) - Who created the challenge
      - `created_at` (timestamptz) - When challenge was created

    - `challenge_attempts`
      - `id` (uuid, primary key) - Unique identifier
      - `challenge_id` (uuid, foreign key) - Reference to daily_challenge
      - `custom_challenge_id` (uuid, foreign key, nullable) - Reference to custom_challenge
      - `player_name` (text) - Player's display name
      - `player_session` (text) - Anonymous session identifier
      - `final_lat` (decimal) - Where player stopped latitude
      - `final_lng` (decimal) - Where player stopped longitude
      - `distance_meters` (decimal) - Distance from target
      - `hit_lucky_distance` (boolean) - Whether player hit lucky distance
      - `created_at` (timestamptz) - When attempt was made

  2. Security
    - Enable RLS on all tables
    - Add policies for public read access (game is public)
    - Add policies for authenticated and anonymous inserts
*/

-- Daily Challenges Table
CREATE TABLE IF NOT EXISTS daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_date date UNIQUE NOT NULL,
  target_lat decimal(10, 8) NOT NULL,
  target_lng decimal(11, 8) NOT NULL,
  center_lat decimal(10, 8) NOT NULL,
  center_lng decimal(11, 8) NOT NULL,
  radius_meters integer DEFAULT 500,
  lucky_distance decimal(6, 2) DEFAULT 50.0,
  created_at timestamptz DEFAULT now()
);

-- Custom Challenges Table (must be created before challenge_attempts due to FK)
CREATE TABLE IF NOT EXISTS custom_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code text UNIQUE NOT NULL,
  target_lat decimal(10, 8) NOT NULL,
  target_lng decimal(11, 8) NOT NULL,
  center_lat decimal(10, 8) NOT NULL,
  center_lng decimal(11, 8) NOT NULL,
  radius_meters integer DEFAULT 500,
  creator_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Challenge Attempts Table
CREATE TABLE IF NOT EXISTS challenge_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid REFERENCES daily_challenges(id),
  custom_challenge_id uuid REFERENCES custom_challenges(id),
  player_name text NOT NULL,
  player_session text NOT NULL,
  final_lat decimal(10, 8) NOT NULL,
  final_lng decimal(11, 8) NOT NULL,
  distance_meters decimal(8, 2) NOT NULL,
  hit_lucky_distance boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON daily_challenges(challenge_date);
CREATE INDEX IF NOT EXISTS idx_attempts_challenge ON challenge_attempts(challenge_id);
CREATE INDEX IF NOT EXISTS idx_attempts_custom_challenge ON challenge_attempts(custom_challenge_id);
CREATE INDEX IF NOT EXISTS idx_attempts_distance ON challenge_attempts(distance_meters);
CREATE INDEX IF NOT EXISTS idx_custom_challenges_code ON custom_challenges(share_code);

-- Enable Row Level Security
ALTER TABLE daily_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_challenges ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow everyone to read challenges (public game)
CREATE POLICY "Anyone can view daily challenges"
  ON daily_challenges FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view custom challenges"
  ON custom_challenges FOR SELECT
  USING (true);

CREATE POLICY "Anyone can view attempts"
  ON challenge_attempts FOR SELECT
  USING (true);

-- RLS Policies: Allow anyone to insert attempts and create custom challenges
CREATE POLICY "Anyone can create attempts"
  ON challenge_attempts FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create custom challenges"
  ON custom_challenges FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can create daily challenges"
  ON daily_challenges FOR INSERT
  WITH CHECK (true);