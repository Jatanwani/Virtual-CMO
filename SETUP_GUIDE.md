# Virtual CMO OS — Complete $0 Setup Guide
## Multi-Provider AI Gateway + Next.js App + Supabase + Vercel

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE OVERVIEW                         │
│                                                                  │
│  User → Next.js (Vercel) → API Route → Cloudflare Worker        │
│                                              ↓                   │
│                                    ┌─────────────────┐          │
│                                    │  KV Cache Check  │          │
│                                    └────────┬────────┘          │
│                                        HIT ↙  ↘ MISS            │
│                                    Return    Rotate providers:   │
│                                    cached    1. Groq (14.4k/day) │
│                                              2. Cerebras (1M tok)│
│                                              3. Gemini (1.5k/day)│
│                                              4. Mistral (free)   │
│                                              5. Ollama (∞ Oracle)│
└─────────────────────────────────────────────────────────────────┘
```

---

## STEP 1 — Get Your Free API Keys (15 minutes)

### 1A. Groq (Fastest — Llama 3.3 70B, 14,400 req/day free)
1. Go to → https://console.groq.com
2. Sign up with Google
3. Click **API Keys** → **Create API Key**
4. Copy the key (starts with `gsk_...`)

### 1B. Cerebras (1 Million tokens/day free)
1. Go to → https://cloud.cerebras.ai
2. Sign up
3. Go to **API Keys** → **Create Key**
4. Copy the key

### 1C. Google Gemini (1,500 req/day free)
1. Go to → https://aistudio.google.com/app/apikey
2. Click **Create API Key**
3. Select any Google Cloud project (or create one)
4. Copy the key (starts with `AIza...`)

### 1D. Mistral AI (Free credits on signup)
1. Go to → https://console.mistral.ai
2. Sign up
3. Go to **API Keys** → **Create new key**
4. Copy the key

---

## STEP 2 — Set Up Oracle Cloud (Always Free VM — Nuclear Fallback)
*This is optional but gives you unlimited AI when all API quotas are hit.*

### 2A. Create Oracle Free Account
1. Go to → https://www.oracle.com/cloud/free/
2. Sign up (needs credit card for verification — you will NOT be charged)
3. Select **Always Free** tier
4. Choose region closest to you

### 2B. Create the VM
1. In Oracle Cloud console → **Compute** → **Instances** → **Create Instance**
2. Change shape to **Ampere A1** (ARM, Always Free)
   - Set OCPUs: **4**, Memory: **24 GB** (maximum free)
3. Generate or upload SSH key → Download the private key
4. Click **Create**
5. Wait ~2 minutes → Copy the **Public IP Address**

### 2C. Install Ollama on the VM
```bash
# SSH into your Oracle VM
ssh -i your-private-key.key ubuntu@YOUR_ORACLE_IP

# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Download Llama 3.1 8B (takes ~5 min on Oracle)
ollama pull llama3.1:8b

# Run Ollama as a service (stays running forever)
sudo systemctl enable ollama
sudo systemctl start ollama

# Open port 11434 in Oracle firewall
# Go to Oracle Console → Networking → Virtual Cloud Networks
# → Your VCN → Security Lists → Add Ingress Rule:
#   Source: 0.0.0.0/0, Port: 11434, Protocol: TCP
```

### 2D. Test Ollama is working
```bash
curl http://YOUR_ORACLE_IP:11434/api/chat -d '{
  "model": "llama3.1:8b",
  "messages": [{"role":"user","content":"Hello"}],
  "stream": false
}'
```
You should get a JSON response. ✅

Your `OLLAMA_URL` will be: `http://YOUR_ORACLE_IP:11434`

---

## STEP 3 — Deploy the Cloudflare Worker (10 minutes)

### 3A. Install Wrangler
```bash
npm install -g wrangler
```

### 3B. Login to Cloudflare (free account)
```bash
wrangler login
# Opens browser → authorize Wrangler
```

### 3C. Navigate to worker folder
```bash
cd cloudflare-worker
npm install
```

### 3D. Create the KV namespace
```bash
wrangler kv namespace create CMO_CACHE
```
This outputs something like:
```
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "CMO_CACHE", id = "abc123def456..." }
```
**Copy that ID** and paste it into `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CMO_CACHE"
id = "PASTE_YOUR_ID_HERE"   ← replace this line
```

### 3E. Set your API key secrets
```bash
# Run the helper script
bash set-secrets.sh
```
OR set them one by one:
```bash
echo "gsk_your_groq_key" | wrangler secret put GROQ_API_KEY
echo "your_cerebras_key" | wrangler secret put CEREBRAS_API_KEY
echo "AIza_your_gemini_key" | wrangler secret put GEMINI_API_KEY
echo "your_mistral_key" | wrangler secret put MISTRAL_API_KEY
echo "http://YOUR_ORACLE_IP:11434" | wrangler secret put OLLAMA_URL
```

### 3F. Deploy the worker
```bash
wrangler deploy
```
Output will show your worker URL:
```
✨ Deployed to: https://virtual-cmo-gateway.YOUR_SUBDOMAIN.workers.dev
```
**Copy this URL** — you need it for the Next.js app.

### 3G. Test your gateway
```bash
# Check status
curl https://virtual-cmo-gateway.YOUR_SUBDOMAIN.workers.dev/status

# Test a chat request
curl -X POST https://virtual-cmo-gateway.YOUR_SUBDOMAIN.workers.dev/v1/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Give me 3 growth hacks"}],"userId":"test"}'
```

---

## STEP 4 — Set Up Supabase (5 minutes)

### 4A. Create project
1. Go to → https://supabase.com → New Project
2. Choose a name, set a strong password, pick a region
3. Wait ~2 min for project to provision

### 4B. Run the database migration
1. In Supabase dashboard → **SQL Editor**
2. Click **New query**
3. Copy the entire contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**
5. You should see "Success. No rows returned."

### 4C. Get your keys
Go to **Settings → API**:
- Copy **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- Copy **anon/public key** → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Copy **service_role key** → this is `SUPABASE_SERVICE_ROLE_KEY`

### 4D. Configure Auth
Go to **Authentication → URL Configuration**:
- Site URL: `http://localhost:3000` (change to Vercel URL after deploy)
- Redirect URLs: Add `http://localhost:3000/**`

---

## STEP 5 — Configure & Run the Next.js App

### 5A. Set up environment
```bash
# In the main cmo-os folder (not cloudflare-worker)
cp .env.local.example .env.local
```

Edit `.env.local` with your values:
```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

AI_GATEWAY_URL=https://virtual-cmo-gateway.YOUR_SUBDOMAIN.workers.dev
NEXT_PUBLIC_AI_GATEWAY_URL=https://virtual-cmo-gateway.YOUR_SUBDOMAIN.workers.dev

NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5B. Install and run
```bash
npm install
npm run dev
```
Open → http://localhost:3000 ✅

---

## STEP 6 — Deploy to Vercel (5 minutes)

### 6A. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit"
gh repo create virtual-cmo-os --public --push
# OR push to your existing GitHub repo
```

### 6B. Deploy on Vercel
```bash
npm i -g vercel
vercel
```
Follow prompts. When asked for environment variables, set:
```
NEXT_PUBLIC_SUPABASE_URL       = your supabase url
NEXT_PUBLIC_SUPABASE_ANON_KEY  = your anon key
SUPABASE_SERVICE_ROLE_KEY      = your service role key
AI_GATEWAY_URL                 = your cloudflare worker url
NEXT_PUBLIC_AI_GATEWAY_URL     = your cloudflare worker url
NEXT_PUBLIC_APP_URL            = https://your-app.vercel.app
```

### 6C. Update Supabase auth URLs
In Supabase → **Authentication → URL Configuration**:
- Site URL: `https://your-app.vercel.app`
- Add to Redirect URLs: `https://your-app.vercel.app/**`

### 6D. Update Cloudflare CORS (optional but recommended)
In `wrangler.toml`:
```toml
[env.production.vars]
ALLOWED_ORIGIN = "https://your-app.vercel.app"
```
Then redeploy:
```bash
cd cloudflare-worker
wrangler deploy --env production
```

---

## Provider Rotation Logic

| User ID Hash | Provider Order |
|---|---|
| 0% | Groq → Cerebras → Gemini → Mistral → Ollama |
| 25% | Cerebras → Gemini → Mistral → Groq → Ollama |
| 50% | Gemini → Mistral → Groq → Cerebras → Ollama |
| 75% | Mistral → Groq → Cerebras → Gemini → Ollama |

- **Same user** always hits same provider first → consistent experience
- **Rate limit (429)** → auto-retry next provider in < 1 second
- **Same prompt within 24h** → served from KV Cache → 0 API calls used

## Free Tier Capacity
| Provider | Free Limit | Serves |
|---|---|---|
| Groq | 14,400 req/day | ~580 users (25 req/user) |
| Cerebras | 1M tokens/day | ~800 users |
| Gemini | 1,500 req/day | ~60 users |
| Mistral | Free credits | Variable |
| KV Cache | 100k reads/day | Repeat queries |
| Ollama | Unlimited | All overflow |
| **Total** | **~1,000+ users/day** | **$0/month** |

---

## Quick Reference — All Commands

```bash
# ── Cloudflare Worker ─────────────────────────────
cd cloudflare-worker
npm install
wrangler login
wrangler kv namespace create CMO_CACHE      # get the ID
# edit wrangler.toml with your KV ID
bash set-secrets.sh                          # set all API keys
wrangler deploy                              # go live
wrangler tail                                # live logs

# ── Next.js App ───────────────────────────────────
cd ..  # back to cmo-os root
npm install
npm run dev                                  # local dev

# ── Deploy to Vercel ──────────────────────────────
vercel --prod

# ── Test Gateway ──────────────────────────────────
curl https://YOUR_WORKER.workers.dev/status
```
