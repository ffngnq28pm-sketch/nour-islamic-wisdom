/*
  # User Profiles Table

  1. New Tables
    - `user_profiles`
      - `id` (uuid, primary key, references auth.users)
      - `first_name` (text) — for personalized greeting
      - `focus_theme` (text) — chosen spiritual focus: Patience/Gratitude/Amour/Foi/Sagesse/Paix
      - `focus_started_at` (timestamptz) — when the current focus theme was set
      - `notif_enabled` (boolean)
      - `notif_time_preset` (text) — Fajr/Matin/Midi/Soir/Isha
      - `notif_hour` (int) — custom hour override
      - `notif_minute` (int) — custom minute override
      - `notif_theme` (text) — preferred theme for notifications
      - `app_theme` (text) — visual theme: dark/light/sepia
      - `onboarding_done` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS
    - Authenticated users can read/insert/update their own profile only
*/

CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name text DEFAULT '',
  focus_theme text DEFAULT 'Sagesse',
  focus_started_at timestamptz DEFAULT now(),
  notif_enabled boolean DEFAULT false,
  notif_time_preset text DEFAULT 'Matin',
  notif_hour int DEFAULT 8,
  notif_minute int DEFAULT 0,
  notif_theme text DEFAULT '',
  app_theme text DEFAULT 'dark',
  onboarding_done boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
