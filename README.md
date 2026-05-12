# Virtual CMO OS — Full Setup Guide

A production-ready AI-powered Chief Marketing Officer for founders. Built with Next.js 14, Supabase, and Claude AI.

---

## 🏗️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes (serverless)
- **Database**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: Anthropic Claude (claude-sonnet-4-20250514) with streaming
- **Hosting**: Vercel

---

## ⚡ Quick Start

### 1. Clone and install

```bash
git clone <your-repo>
cd virtual-cmo-os
npm install
```

### 2. Set up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Go to **SQL Editor** → paste the contents of `supabase/migrations/001_initial_schema.sql` → Run
3. Go to **Authentication** → **Providers** → Enable **Email** provider
4. Copy your project URL and anon key from **Settings → API**

### 3. Get Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 4. Configure environment

Copy `.env.local.example` to `.env.local` and fill in:

```bash
cp .env.local.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🚀 Deploy to Vercel

### Option A: Vercel CLI (fastest)

```bash
npm i -g vercel
vercel
```

Follow the prompts, then add environment variables:

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ANTHROPIC_API_KEY
vercel env add NEXT_PUBLIC_APP_URL
```

### Option B: Vercel Dashboard

1. Push code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Add environment variables in the dashboard
5. Deploy!

### Update Supabase redirect URLs

After deploying, go to Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Redirect URLs: `https://your-app.vercel.app/**`

---

## 📁 Project Structure

```
virtual-cmo-os/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── auth/
│   │   ├── login/page.tsx          # Login
│   │   └── signup/page.tsx         # Signup
│   ├── onboarding/page.tsx         # 4-step founder onboarding
│   ├── dashboard/
│   │   ├── layout.tsx              # Dashboard shell with sidebar
│   │   ├── page.tsx                # Main dashboard + tasks
│   │   ├── chat/page.tsx           # CMO Brain (AI chat)
│   │   ├── content/page.tsx        # Content calendar
│   │   ├── experiments/page.tsx    # Experiment tracker
│   │   ├── results/page.tsx        # Submit results + feedback
│   │   └── settings/page.tsx       # Profile settings
│   └── api/
│       ├── cmo/route.ts            # Streaming AI chat
│       ├── cmo/save/route.ts       # Save messages
│       ├── tasks/route.ts          # Generate + update tasks
│       ├── experiments/route.ts    # CRUD experiments
│       ├── results/route.ts        # Submit + analyze results
│       ├── content/route.ts        # Generate content calendar
│       └── auth/profile/route.ts   # Update profile
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             # Navigation sidebar
│   │   └── TopBar.tsx              # Top bar with context
│   └── dashboard/
│       ├── DashboardClient.tsx     # Dashboard UI
│       ├── ChatClient.tsx          # Chat interface
│       ├── ContentClient.tsx       # Content calendar UI
│       ├── ExperimentsClient.tsx   # Experiments tracker UI
│       ├── ResultsClient.tsx       # Results submission UI
│       └── SettingsClient.tsx      # Settings form UI
├── lib/
│   ├── anthropic.ts                # AI utilities + streaming
│   └── supabase/
│       ├── client.ts               # Browser Supabase client
│       └── server.ts               # Server Supabase client
├── types/
│   └── database.ts                 # TypeScript types
├── middleware.ts                   # Auth middleware
└── supabase/
    └── migrations/
        └── 001_initial_schema.sql  # Full DB schema
```

---

## 🗄️ Database Schema

| Table | Description |
|-------|-------------|
| `profiles` | Founder profile, startup data, CMO diagnosis |
| `tasks` | Generated action tasks with steps and outcomes |
| `chat_messages` | Full CMO chat history |
| `experiments` | Growth hypothesis tracker |
| `results` | Execution submissions with CMO feedback |
| `content_items` | Weekly content calendar |

All tables have Row Level Security (RLS) — users can only access their own data.

---

## 🔑 Key Features

### ✅ CMO Brain (AI Chat)
- Streaming responses with Claude claude-sonnet-4-20250514
- Context-aware: knows your product, ICP, goals
- Full history saved to Supabase
- Quick prompt shortcuts

### ✅ Dashboard + Task Generation
- AI generates personalized 5-task action plan
- Strategic diagnosis (archetype, bottleneck, top channels)
- Checkbox completion tracking
- Live traction score

### ✅ Content Engine
- 5-day, 10-piece content calendar
- Platform-specific (LinkedIn, Twitter, Reddit/Slack)
- Click to generate full ready-to-post content
- Status tracking (draft → scheduled → published)

### ✅ Experiment Tracker
- Log growth hypotheses with channel + metric
- Update results and learning
- AI analysis on completed experiments
- Win/loss tracking

### ✅ Results & Feedback Loop
- Submit daily execution with context
- AI scores 1-100 and gives specific feedback
- Next actions generated
- Full history with scores

---

## 🛠️ Customization

### Change AI model
In `lib/anthropic.ts`, update the model string.

### Add new pages
Create `app/dashboard/yourpage/page.tsx` and add to `components/layout/Sidebar.tsx` nav items.

### Customize prompts
All prompts are in `lib/anthropic.ts` (`buildCMOSystemPrompt`) and in each API route.

---

## 📄 License

MIT — Build something great.
