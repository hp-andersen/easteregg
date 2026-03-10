/*
  # Add DELETE policy for custom challenges

  1. Changes
    - Add policy to allow anyone to delete custom challenges
    - This enables the admin panel to delete challenges

  2. Security
    - Policy allows public DELETE access
    - In production, this should be restricted to authenticated admin users only
*/

CREATE POLICY "Anyone can delete custom challenges"
  ON custom_challenges
  FOR DELETE
  TO public
  USING (true);
