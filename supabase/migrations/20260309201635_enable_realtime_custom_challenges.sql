/*
  # Enable Realtime for custom_challenges table

  1. Changes
    - Enable realtime replication for custom_challenges table
    - This allows clients to receive INSERT, UPDATE, and DELETE events in real-time

  2. Notes
    - Required for Browse Challenges screen to automatically update when challenges are deleted from Admin screen
*/

ALTER PUBLICATION supabase_realtime ADD TABLE custom_challenges;
