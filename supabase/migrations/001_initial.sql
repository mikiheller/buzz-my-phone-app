-- BuzzMe Database Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  email TEXT,
  partner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  push_token TEXT,
  pair_code TEXT,
  pair_code_expires TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Buzzes table (notification history)
CREATE TABLE IF NOT EXISTS public.buzzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level TEXT NOT NULL CHECK (level IN ('nudge', 'hey', 'urgent', 'emergency')),
  message TEXT DEFAULT '',
  acknowledged BOOLEAN DEFAULT FALSE,
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_buzzes_receiver ON public.buzzes(receiver_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_buzzes_sender ON public.buzzes(sender_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_pair_code ON public.profiles(pair_code) WHERE pair_code IS NOT NULL;

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.buzzes ENABLE ROW LEVEL SECURITY;

-- Profiles policies: users can read their own profile and their partner's
CREATE POLICY "Users can read own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can read partner profile"
  ON public.profiles FOR SELECT
  USING (id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow reading profiles by pair_code (for pairing flow)
CREATE POLICY "Users can find profiles by pair code"
  ON public.profiles FOR SELECT
  USING (pair_code IS NOT NULL AND pair_code_expires > NOW());

-- Allow updating partner's profile during pairing (to set partner_id on both sides)
CREATE POLICY "Users can update partner during pairing"
  ON public.profiles FOR UPDATE
  USING (
    id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid())
    OR id IN (SELECT id FROM public.profiles WHERE pair_code IS NOT NULL AND pair_code_expires > NOW())
  );

-- Buzzes policies: users can read/write buzzes they're involved in
CREATE POLICY "Users can read own buzzes"
  ON public.buzzes FOR SELECT
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send buzzes to partner"
  ON public.buzzes FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id
    AND receiver_id = (SELECT partner_id FROM public.profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can acknowledge received buzzes"
  ON public.buzzes FOR UPDATE
  USING (auth.uid() = receiver_id);

-- Enable realtime for buzzes table
ALTER PUBLICATION supabase_realtime ADD TABLE public.buzzes;

-- Function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
