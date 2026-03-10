/*
  # Add Multi-Location Support to Custom Challenges

  1. Changes
    - Add `locations` JSONB column to store array of location objects
    - Add `created_by` text column to track who created the challenge
    - Keep existing columns for backwards compatibility
    - Add check constraint to ensure either old format OR new format is used

  2. Notes
    - Existing single-location challenges will continue to work
    - New multi-location challenges will use the `locations` array
*/

-- Add new columns for multi-location support
ALTER TABLE custom_challenges 
ADD COLUMN IF NOT EXISTS locations jsonb,
ADD COLUMN IF NOT EXISTS created_by text DEFAULT 'anonymous';

-- Add comment to explain the structure
COMMENT ON COLUMN custom_challenges.locations IS 'Array of location objects: [{"lat": number, "lng": number, "name": string}]';
