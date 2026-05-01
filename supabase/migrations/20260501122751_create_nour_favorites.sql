/*
  # Nour App - Favorites Table

  1. New Tables
    - `favorites`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `card_id` (text, the local card identifier)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `favorites` table
    - Users can only read/write their own favorites

  3. Notes
    - card_id references local static card data (no separate cards table needed)
    - Unique constraint on user_id + card_id prevents duplicate favorites
*/

CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  card_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, card_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own favorites"
  ON favorites FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites"
  ON favorites FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites"
  ON favorites FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
