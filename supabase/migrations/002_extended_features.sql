-- ─── SOCIAL ACCOUNTS ────────────────────────────────────────
CREATE TABLE public.social_accounts (
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
CREATE POLICY "Users can CRUD own social accounts" ON public.social_accounts
  FOR ALL USING (auth.uid() = user_id);

-- ─── SCHEDULED POSTS ────────────────────────────────────────
CREATE TABLE public.scheduled_posts (
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
CREATE POLICY "Users can CRUD own scheduled posts" ON public.scheduled_posts
  FOR ALL USING (auth.uid() = user_id);

-- ─── GENERATED IMAGES ───────────────────────────────────────
CREATE TABLE public.generated_images (
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
CREATE POLICY "Users can CRUD own images" ON public.generated_images
  FOR ALL USING (auth.uid() = user_id);

-- ─── LANDING PAGES ───────────────────────────────────────────
CREATE TABLE public.landing_pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  html_content TEXT,
  css_content TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.landing_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own landing pages" ON public.landing_pages
  FOR ALL USING (auth.uid() = user_id);

-- ─── ANALYTICS ───────────────────────────────────────────────
CREATE TABLE public.post_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  scheduled_post_id UUID REFERENCES public.scheduled_posts(id) ON DELETE CASCADE,
  platform TEXT,
  impressions INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  recorded_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.post_analytics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own analytics" ON public.post_analytics
  FOR ALL USING (auth.uid() = user_id);

-- ─── EXTEND content_items ────────────────────────────────────
ALTER TABLE public.content_items
  ADD COLUMN IF NOT EXISTS hashtags TEXT[],
  ADD COLUMN IF NOT EXISTS image_prompt TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS scheduled_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT FALSE;

-- Triggers
CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON public.social_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON public.landing_pages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
