-- ========================================
-- MyHeart 💕 — Supabase Database Schema
-- ========================================
-- Run this SQL in your Supabase project:
-- Dashboard → SQL Editor → New Query → Paste & Run

-- 1. Albums table
CREATE TABLE IF NOT EXISTS albums (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  cover_url TEXT,
  color TEXT DEFAULT '#ff6b9d',
  sort_order INT4 DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
  caption TEXT,
  media_url TEXT,
  media_type TEXT DEFAULT 'image',
  thumbnail_url TEXT,
  date_taken DATE DEFAULT CURRENT_DATE,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable Row Level Security
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- 4. Public read policies (anyone can view)
-- Drop existing policies first to avoid "already exists" errors if run multiple times
DROP POLICY IF EXISTS "Albums are viewable by everyone" ON albums;
CREATE POLICY "Albums are viewable by everyone" ON albums FOR SELECT USING (true);

DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);

-- 5. Authenticated write policies (only logged-in users)
DROP POLICY IF EXISTS "Authenticated users can create albums" ON albums;
CREATE POLICY "Authenticated users can create albums" ON albums FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update albums" ON albums;
CREATE POLICY "Authenticated users can update albums" ON albums FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete albums" ON albums;
CREATE POLICY "Authenticated users can delete albums" ON albums FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can create posts" ON posts;
CREATE POLICY "Authenticated users can create posts" ON posts FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Authenticated users can update posts" ON posts;
CREATE POLICY "Authenticated users can update posts" ON posts FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can delete posts" ON posts;
CREATE POLICY "Authenticated users can delete posts" ON posts FOR DELETE TO authenticated USING (true);

-- 6. Create Storage bucket (run separately in Storage settings)
-- Go to Storage → Create Bucket → Name: "media" → Public: ON

-- 7. Storage policies
-- Go to Storage → media bucket → Policies → Add:
-- - SELECT: Allow public access (everyone can view)
-- - INSERT: Allow authenticated users
-- - DELETE: Allow authenticated users
