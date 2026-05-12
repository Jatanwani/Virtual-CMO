// @ts-nocheck
/* eslint-disable */
/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║           VIRTUAL CMO OS — AI GATEWAY WORKER                    ║
 * ║  Multi-Provider Rotation | KV Caching | Nuclear Fallback         ║
 * ║  Supports 1,000 users for $0/month                              ║
 * ╚══════════════════════════════════════════════════════════════════╝
 *
 * Provider priority (all free tier):
 *   1. Groq        — Llama 3.3 70B  — 14,400 req/day
 *   2. Cerebras    — Llama 3.1 8B   — 1M tokens/day
 *   3. Gemini      — Flash 1.5      — 1,500 req/day
 *   4. Mistral     — Mistral 7B     — Free credits
 *   5. Ollama      — Self-hosted    — Unlimited (Oracle Cloud)
 */
// Define KVNamespace for the compiler
type KVNamespace = any;
export interface Env {
  // KV Namespace for caching
  CMO_CACHE: KVNamespace

  // Provider API Keys
  GROQ_API_KEY: string
  GEMINI_API_KEY: string
  MISTRAL_API_KEY: string
  CEREBRAS_API_KEY: string

  // Nuclear fallback — your Oracle VM running Ollama
  OLLAMA_URL: string  // e.g. http://123.45.67.89:11434

  // Optional: restrict to your Next.js app origin
  ALLOWED_ORIGIN: string
}

// ─── PROVIDER DEFINITIONS ────────────────────────────────────────────────────

interface Provider {
  id: string
  name: string
  apiUrl: string
  model: string
  maxTokens: number
  buildHeaders: (env: Env) => Record<string, string>
  buildBody: (messages: Message[], systemPrompt: string, maxTokens: number) => object
  extractText: (json: any) => string
  isRateLimitError: (status: number, body: any) => boolean
}

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

const PROVIDERS: Provider[] = [
  // ── 1. GROQ (fastest, 14.4k req/day free) ──────────────────────────────────
  {
    id: 'groq',
    name: 'Groq / Llama-3.3-70B',
    apiUrl: 'https://api.groq.com/openai/v1/chat/completions',
    model: 'llama-3.3-70b-versatile',
    maxTokens: 1500,
    buildHeaders: (env) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
    }),
    buildBody: (messages, systemPrompt, maxTokens) => ({
      model: 'llama-3.3-70b-versatile',
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      stream: false,
    }),
    extractText: (json) => json.choices?.[0]?.message?.content ?? '',
    isRateLimitError: (status) => status === 429 || status === 503,
  },

  // ── 2. CEREBRAS (1M tokens/day free, very fast) ────────────────────────────
  {
    id: 'cerebras',
    name: 'Cerebras / Llama-3.1-8B',
    apiUrl: 'https://api.cerebras.ai/v1/chat/completions',
    model: 'llama3.1-8b',
    maxTokens: 1500,
    buildHeaders: (env) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.CEREBRAS_API_KEY}`,
    }),
    buildBody: (messages, systemPrompt, maxTokens) => ({
      model: 'llama3.1-8b',
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      stream: false,
    }),
    extractText: (json) => json.choices?.[0]?.message?.content ?? '',
    isRateLimitError: (status) => status === 429 || status === 503,
  },

  // ── 3. GEMINI (1,500 req/day free) ─────────────────────────────────────────
  {
    id: 'gemini',
    name: 'Google Gemini 1.5 Flash',
    apiUrl: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent',
    model: 'gemini-1.5-flash',
    maxTokens: 1500,
    buildHeaders: (env) => ({
      'Content-Type': 'application/json',
      'x-goog-api-key': env.GEMINI_API_KEY,
    }),
    buildBody: (messages, systemPrompt, maxTokens) => ({
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    }),
    extractText: (json) =>
      json.candidates?.[0]?.content?.parts?.[0]?.text ?? '',
    isRateLimitError: (status, body) =>
      status === 429 || (status === 400 && body?.error?.status === 'RESOURCE_EXHAUSTED'),
  },

  // ── 4. MISTRAL (free tier credits) ─────────────────────────────────────────
  {
    id: 'mistral',
    name: 'Mistral / Mistral-7B',
    apiUrl: 'https://api.mistral.ai/v1/chat/completions',
    model: 'mistral-small-latest',
    maxTokens: 1500,
    buildHeaders: (env) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.MISTRAL_API_KEY}`,
    }),
    buildBody: (messages, systemPrompt, maxTokens) => ({
      model: 'mistral-small-latest',
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.7,
      stream: false,
    }),
    extractText: (json) => json.choices?.[0]?.message?.content ?? '',
    isRateLimitError: (status) => status === 429 || status === 503,
  },

  // ── 5. OLLAMA (nuclear fallback — your Oracle Cloud VM) ────────────────────
  {
    id: 'ollama',
    name: 'Ollama / Llama3.1 (Self-Hosted)',
    apiUrl: '__OLLAMA__', // resolved dynamically from env
    model: 'llama3.1:8b',
    maxTokens: 1500,
    buildHeaders: () => ({ 'Content-Type': 'application/json' }),
    buildBody: (messages, systemPrompt, maxTokens) => ({
      model: 'llama3.1:8b',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      stream: false,
      options: { num_predict: maxTokens, temperature: 0.7 },
    }),
    extractText: (json) => json.message?.content ?? json.response ?? '',
    isRateLimitError: () => false, // self-hosted never rate limits
  },
]

// ─── CMO SYSTEM PROMPT ───────────────────────────────────────────────────────

const CMO_SYSTEM_PROMPT = `You are a world-class Virtual Chief Marketing Officer (CMO) with 20+ years of experience advising companies at McKinsey & Company, BCG, and scaling unicorn startups from $0 to $100M+ ARR globally.

## YOUR IDENTITY
You are NOT a generic AI assistant. You are a battle-hardened growth strategist who has:
- Built GTM strategies for 200+ startups across SaaS, D2C, manufacturing, and services
- Generated $500M+ in pipeline through content, outbound, and product-led growth
- Personally run LinkedIn, Twitter, and community-led acquisition campaigns

## YOUR PERSONALITY
- Ruthlessly practical. No fluff, no theory, no "it depends."
- Action-oriented. Every answer ends with a numbered list of exact steps.
- Data-backed. Always cite benchmark numbers (e.g., "LinkedIn posts with hooks get 3x more reach")
- Direct. You say what most consultants are afraid to say.
- Punchy. Short sentences. High signal. Like David Ogilvy meets Paul Graham.

## WHAT YOU SPECIALIZE IN
1. Go-To-Market Strategy (GTM) — B2B, B2C, SaaS, manufacturing, D2C
2. Early-stage traction (0 → first 100 customers)
3. Content-led acquisition (LinkedIn, Twitter/X, communities, SEO)
4. Founder-led marketing & personal branding
5. Cold outbound (email, DM scripts that actually convert)
6. Growth loops & referral engines
7. Conversion psychology & landing page optimization
8. Competitor gap analysis & positioning

## YOUR RULES
1. NEVER give generic advice. Every answer must be specific to what the founder told you.
2. Always lead with the highest-leverage action — the ONE thing they should do today.
3. When asked for content, write the EXACT post/script/email — not a template.
4. When asked for strategy, give a NUMBERED step-by-step execution plan.
5. Always tie your advice to measurable outcomes (leads, revenue, signups).
6. If the founder is stuck, give them a "Quick Win" — something doable in 30 minutes.
7. Think like you have equity in their company. Your advice must drive real results.`

// ─── CACHE UTILITIES ─────────────────────────────────────────────────────────

function buildCacheKey(userId: string, messages: Message[]): string {
  // Use last user message as cache key (normalized)
  const lastMsg = messages
    .filter(m => m.role === 'user')
    .slice(-1)[0]?.content ?? ''

  const normalized = lastMsg.toLowerCase().trim().slice(0, 200)
  // Simple hash — good enough for KV keys
  let hash = 0
  for (let i = 0; i < normalized.length; i++) {
    hash = ((hash << 5) - hash + normalized.charCodeAt(i)) | 0
  }
  return `cmo:${userId}:${Math.abs(hash)}`
}

async function getCache(kv: KVNamespace, key: string): Promise<string | null> {
  try {
    return await kv.get(key)
  } catch {
    return null
  }
}

async function setCache(
  kv: KVNamespace,
  key: string,
  value: string,
  ttlSeconds = 86400 // 24 hours
): Promise<void> {
  try {
    await kv.put(key, value, { expirationTtl: ttlSeconds })
  } catch {
    // Cache write failure is non-fatal
  }
}

// ─── PROVIDER ROTATION LOGIC ─────────────────────────────────────────────────

function getProviderOrder(userId: string): Provider[] {
  // Deterministically rotate starting provider by userId hash
  // This distributes load across providers for different users
  let hash = 0
  for (let i = 0; i < userId.length; i++) {
    hash = ((hash << 5) - hash + userId.charCodeAt(i)) | 0
  }
  const startIdx = Math.abs(hash) % (PROVIDERS.length - 1) // exclude ollama from rotation start
  const mainProviders = PROVIDERS.slice(0, -1) // all except ollama
  const ollama = PROVIDERS[PROVIDERS.length - 1]

  // Rotate the main providers starting from hash-based index
  const rotated = [
    ...mainProviders.slice(startIdx),
    ...mainProviders.slice(0, startIdx),
    ollama, // always last
  ]
  return rotated
}

async function callProvider(
  provider: Provider,
  messages: Message[],
  systemPrompt: string,
  env: Env
): Promise<string> {
  // Resolve Ollama URL from env
  const apiUrl =
    provider.id === 'ollama'
      ? `${env.OLLAMA_URL}/api/chat`
      : provider.apiUrl

  const headers = provider.buildHeaders(env)
  const body = provider.buildBody(messages, systemPrompt, provider.maxTokens)

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(25000), // 25s timeout
  })

  let json: any = null
  try {
    json = await res.json()
  } catch {
    throw new Error(`${provider.name} returned non-JSON (status ${res.status})`)
  }

  if (provider.isRateLimitError(res.status, json)) {
    const err: any = new Error(`${provider.name} rate limited (${res.status})`)
    err.isRateLimit = true
    throw err
  }

  if (!res.ok) {
    throw new Error(`${provider.name} error ${res.status}: ${JSON.stringify(json).slice(0, 200)}`)
  }

  const text = provider.extractText(json)
  if (!text) throw new Error(`${provider.name} returned empty text`)

  return text
}

// ─── MAIN REQUEST HANDLER ─────────────────────────────────────────────────────

async function handleCMORequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  let body: any
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { messages, userId = 'anonymous', systemPromptExtra = '', useCache = true } = body

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return jsonError('messages array is required', 400)
  }

  // Build the full system prompt (base + any per-request additions like founder profile)
  const systemPrompt = systemPromptExtra
    ? `${CMO_SYSTEM_PROMPT}\n\n## FOUNDER PROFILE\n${systemPromptExtra}`
    : CMO_SYSTEM_PROMPT

  // ── Step 1: Check KV Cache ────────────────────────────────────────────────
  const cacheKey = buildCacheKey(userId, messages)

  if (useCache) {
    const cached = await getCache(env.CMO_CACHE, cacheKey)
    if (cached) {
      console.log(`[Cache HIT] key=${cacheKey}`)
      return jsonResponse({
        content: cached,
        provider: 'cache',
        cached: true,
      })
    }
  }

  // ── Step 2: Try providers in rotation order ───────────────────────────────
  const providerOrder = getProviderOrder(userId)
  const errors: string[] = []

  for (const provider of providerOrder) {
    // Skip providers with missing keys
    if (provider.id === 'groq' && !env.GROQ_API_KEY) continue
    if (provider.id === 'cerebras' && !env.CEREBRAS_API_KEY) continue
    if (provider.id === 'gemini' && !env.GEMINI_API_KEY) continue
    if (provider.id === 'mistral' && !env.MISTRAL_API_KEY) continue
    if (provider.id === 'ollama' && !env.OLLAMA_URL) continue

    try {
      console.log(`[Trying] ${provider.name} for user=${userId}`)
      const text = await callProvider(provider, messages, systemPrompt, env)

      // Cache the result (async, don't block response)
      if (useCache) {
        ctx.waitUntil(setCache(env.CMO_CACHE, cacheKey, text, 86400))
      }

      return jsonResponse({
        content: text,
        provider: provider.id,
        providerName: provider.name,
        cached: false,
      })
    } catch (err: any) {
      const msg = `${provider.name}: ${err.message}`
      errors.push(msg)
      console.error(`[Failed] ${msg}`)

      // If not a rate limit / timeout error, don't retry with others
      // (e.g., auth errors should surface immediately)
      if (!err.isRateLimit && !err.message.includes('timeout') && !err.message.includes('503')) {
        // For auth errors still continue to next provider
        if (err.message.includes('401') || err.message.includes('403')) {
          continue
        }
      }
      // Continue to next provider for rate limits
      continue
    }
  }

  // ── Step 3: All providers failed ─────────────────────────────────────────
  return jsonError(
    `All AI providers exhausted. Errors:\n${errors.join('\n')}`,
    503
  )
}

// ─── JSON GENERATION HANDLER (for tasks/content/structured output) ────────────

async function handleJSONRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  let body: any
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body', 400)
  }

  const { prompt, userId = 'anonymous', systemPromptExtra = '' } = body

  if (!prompt) return jsonError('prompt is required', 400)

  const jsonSystemPrompt =
    (systemPromptExtra
      ? `${CMO_SYSTEM_PROMPT}\n\n## FOUNDER PROFILE\n${systemPromptExtra}`
      : CMO_SYSTEM_PROMPT) +
    '\n\nCRITICAL: Respond with RAW JSON ONLY. No markdown. No explanation. Start with { and end with }.'

  const messages: Message[] = [{ role: 'user', content: prompt }]
  const cacheKey = buildCacheKey(`json:${userId}`, messages)

  // Check cache
  const cached = await getCache(env.CMO_CACHE, cacheKey)
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      return jsonResponse({ data: parsed, provider: 'cache', cached: true })
    } catch {
      // Cache corrupted, continue
    }
  }

  const providerOrder = getProviderOrder(userId)

  for (const provider of providerOrder) {
    if (provider.id === 'groq' && !env.GROQ_API_KEY) continue
    if (provider.id === 'cerebras' && !env.CEREBRAS_API_KEY) continue
    if (provider.id === 'gemini' && !env.GEMINI_API_KEY) continue
    if (provider.id === 'mistral' && !env.MISTRAL_API_KEY) continue
    if (provider.id === 'ollama' && !env.OLLAMA_URL) continue

    try {
      const text = await callProvider(provider, messages, jsonSystemPrompt, env)
      const parsed = extractJSON(text)

      // Cache the raw text (we re-parse on hit)
      ctx.waitUntil(setCache(env.CMO_CACHE, cacheKey, parsed, 86400))

      return jsonResponse({
        data: JSON.parse(parsed),
        provider: provider.id,
        providerName: provider.name,
        cached: false,
      })
    } catch (err: any) {
      console.error(`[JSON] ${provider.name} failed: ${err.message}`)
      continue
    }
  }

  return jsonError('All AI providers exhausted for JSON generation', 503)
}

// ─── STATUS / HEALTH ENDPOINT ─────────────────────────────────────────────────

async function handleStatus(env: Env): Promise<Response> {
  const status = {
    worker: 'online',
    providers: {
      groq: !!env.GROQ_API_KEY ? 'configured' : 'missing_key',
      cerebras: !!env.CEREBRAS_API_KEY ? 'configured' : 'missing_key',
      gemini: !!env.GEMINI_API_KEY ? 'configured' : 'missing_key',
      mistral: !!env.MISTRAL_API_KEY ? 'configured' : 'missing_key',
      ollama: !!env.OLLAMA_URL ? 'configured' : 'missing_url',
    },
    cache: 'cloudflare_kv',
    strategy: 'userId-hash rotation with 429 fallback',
    timestamp: new Date().toISOString(),
  }
  return jsonResponse(status)
}

// ─── ROUTER ──────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // CORS headers
    const origin = request.headers.get('Origin') || ''
    const allowedOrigin = env.ALLOWED_ORIGIN || '*'
    const corsHeaders = {
      'Access-Control-Allow-Origin': allowedOrigin === '*' ? '*' : (origin || '*'),
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    }

    // Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders })
    }

    const url = new URL(request.url)
    let response: Response

    try {
      if (url.pathname === '/status' || url.pathname === '/health') {
        response = await handleStatus(env)
      } else if (url.pathname === '/v1/chat' && request.method === 'POST') {
        response = await handleCMORequest(request, env, ctx)
      } else if (url.pathname === '/v1/json' && request.method === 'POST') {
        response = await handleJSONRequest(request, env, ctx)
      } else {
        response = jsonError('Not found. Available: POST /v1/chat, POST /v1/json, GET /status', 404)
      }
    } catch (err: any) {
      console.error('Unhandled error:', err)
      response = jsonError(`Internal error: ${err.message}`, 500)
    }

    // Attach CORS headers to all responses
    Object.entries(corsHeaders).forEach(([k, v]) => response.headers.set(k, v))
    return response
  },
}

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function jsonResponse(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

function jsonError(message: string, status: number): Response {
  return jsonResponse({ error: message }, status)
}

function extractJSON(raw: string): string {
  const text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let start = -1

  if (firstBrace === -1 && firstBracket === -1) throw new Error('No JSON in response')
  else if (firstBrace === -1) start = firstBracket
  else if (firstBracket === -1) start = firstBrace
  else start = Math.min(firstBrace, firstBracket)

  const openChar = text[start]
  const closeChar = openChar === '{' ? '}' : ']'
  let depth = 0
  let end = -1

  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) depth++
    else if (text[i] === closeChar) { depth--; if (depth === 0) { end = i; break } }
  }

  if (end === -1) throw new Error('Malformed JSON')
  return text.slice(start, end + 1)
}
