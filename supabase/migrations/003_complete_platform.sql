-- Add all missing fields to profiles for complete settings
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS company_logo_url TEXT,
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS team_size TEXT DEFAULT '1 (Solo)',
  ADD COLUMN IF NOT EXISTS founder_phone TEXT,
  ADD COLUMN IF NOT EXISTS founder_email TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS facebook_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS twitter_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS instagram_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS facebook_connected BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS linkedin_handle TEXT,
  ADD COLUMN IF NOT EXISTS twitter_handle TEXT,
  ADD COLUMN IF NOT EXISTS instagram_handle TEXT,
  ADD COLUMN IF NOT EXISTS facebook_handle TEXT;

-- Add missing fields to content_items
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS hashtags TEXT[],
  ADD COLUMN IF NOT EXISTS image_prompt TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cta TEXT;

-- Social accounts table
CREATE TABLE IF NOT EXISTS public.social_accounts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'instagram', 'facebook')),
  account_name TEXT,
  account_id TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  connected BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.social_accounts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own social accounts" ON public.social_accounts;
CREATE POLICY "Users can CRUD own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- Scheduled posts table
CREATE TABLE IF NOT EXISTS public.scheduled_posts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'cancelled')),
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  posted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own scheduled posts" ON public.scheduled_posts;
CREATE POLICY "Users can CRUD own scheduled posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

-- Generated images table
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content_item_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  prompt TEXT,
  image_url TEXT NOT NULL,
  platform TEXT,
  width INTEGER,
  height INTEGER,
  provider TEXT DEFAULT 'pollinations',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own images" ON public.generated_images;
CREATE POLICY "Users can CRUD own images" ON public.generated_images
  FOR ALL USING (auth.uid() = user_id);

-- Landing pages table
CREATE TABLE IF NOT EXISTS public.landing_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  html_content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can CRUD own landing pages" ON public.landing_pages;
CREATE POLICY "Users can CRUD own landing pages" ON public.landing_pages
  FOR ALL USING (auth.uid() = user_id);
