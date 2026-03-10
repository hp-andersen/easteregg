/*
  # Add challenge name column

  1. Changes
    - Add `challenge_name` column to `custom_challenges` table
    - Column is required (NOT NULL) with a default empty string for existing rows
  
  2. Notes
    - Existing challenges will have empty challenge names
    - New challenges must provide a challenge name
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'custom_challenges' AND column_name = 'challenge_name'
  ) THEN
    ALTER TABLE custom_challenges ADD COLUMN challenge_name text NOT NULL DEFAULT '';
  END IF;
END $$;
