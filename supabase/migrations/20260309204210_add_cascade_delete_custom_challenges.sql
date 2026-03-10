/*
  # Add CASCADE delete for custom challenges

  1. Changes
    - Drop existing foreign key constraint on challenge_attempts.custom_challenge_id
    - Recreate foreign key with ON DELETE CASCADE
    - This ensures when a custom challenge is deleted, all related attempts are automatically deleted

  2. Security
    - Maintains existing RLS policies
    - Ensures data integrity by cleaning up orphaned records
*/

-- Drop the existing foreign key constraint
ALTER TABLE challenge_attempts 
  DROP CONSTRAINT IF EXISTS challenge_attempts_custom_challenge_id_fkey;

-- Recreate with CASCADE delete
ALTER TABLE challenge_attempts
  ADD CONSTRAINT challenge_attempts_custom_challenge_id_fkey
  FOREIGN KEY (custom_challenge_id)
  REFERENCES custom_challenges(id)
  ON DELETE CASCADE;

-- Also add CASCADE to daily challenges FK for consistency
ALTER TABLE challenge_attempts 
  DROP CONSTRAINT IF EXISTS challenge_attempts_challenge_id_fkey;

ALTER TABLE challenge_attempts
  ADD CONSTRAINT challenge_attempts_challenge_id_fkey
  FOREIGN KEY (challenge_id)
  REFERENCES daily_challenges(id)
  ON DELETE CASCADE;
