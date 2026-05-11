-- RouteFlex Supabase Schema Migration
-- Run each block sequentially in the Supabase SQL Editor
-- Dashboard → SQL Editor → New query → paste → Run

-- ============================================================
-- STEP 1: Create profiles table
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT,
  car_name    TEXT,
  car_emoji   TEXT DEFAULT '🚗',
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 2: Create trips table
-- ============================================================
CREATE TABLE IF NOT EXISTS trips (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID REFERENCES profiles(id) ON DELETE CASCADE,
  started_at       TIMESTAMPTZ NOT NULL,
  ended_at         TIMESTAMPTZ,
  duration_secs    INT,
  distance_km      FLOAT,
  top_speed_kmh    FLOAT,
  avg_speed_kmh    FLOAT,
  smoothness_score INT,
  trip_tag         TEXT CHECK (trip_tag IN ('commute','road_trip','midnight','errand','custom')),
  map_snapshot_url TEXT,
  show_route       BOOLEAN DEFAULT true,
  spotify_track    JSONB,
  ai_caption       TEXT,
  card_template    TEXT DEFAULT 'cyberpunk' CHECK (card_template IN ('cyberpunk','minimal','y2k')),
  raw_coords       JSONB,
  created_at       TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- STEP 3: Enable RLS on trips
-- ============================================================
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- STEP 4: Create RLS policy for trips
-- ============================================================
CREATE POLICY "Users own their trips"
  ON trips FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- STEP 5: Enable RLS on profiles + policy
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own their profile"
  ON profiles FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- STEP 6: Auto-create profile row on user signup trigger
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
