/**
 * AI Gateway — Multi-LLM with automatic fallback
 * All FREE tier providers — handles 100+ users with zero cost
 * Order: Groq → Cerebras → Gemini → Mistral → DeepSeek → Anthropic → OpenAI
 * 
 * Free tier limits:
 * - Groq:      14,400 req/day free (llama-3.3-70b)
 * - Cerebras:  1,000 req/day free (llama3.1-70b)  
 * - Gemini:    1,500 req/day free (gemini-1.5-flash)
 * - Mistral:   unlimited on free tier (mistral-small)
 * - DeepSeek:  generous free credits (deepseek-chat)
 * - Anthropic: fallback if credits available
 * - OpenAI:    fallback if credits available
 */

import { Profile } from '@/types/database'

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface GatewayResponse {
  content: string
  provider: string
  cached: boolean
}

// ─── System prompt builders ───────────────────────────────────────────────────
export function buildFounderContext(profile: Partial<Profile>): string {
  return `Product: ${profile.product || 'Not specified'}
Problem solved: ${profile.problem || 'Not specified'}
Target ICP: ${profile.icp || 'Not specified'}
Stage: ${profile.stage || 'Early stage'}
Current traction: ${profile.traction || 'None yet'}
Existing channels: ${profile.channels || 'None'}
30-day goal: ${profile.goal_30 || 'Not specified'}
Daily time available: ${profile.time_available || '2-4 hours'}
Marketing budget: ${profile.budget || '$0'}
Growth archetype: ${profile.archetype || 'Unknown'}`
}

export function buildCMOSystemPrompt(profile: Partial<Profile>): string {
  return `You are a world-class Virtual CMO with 20+ years of experience working with McKinsey, BCG, and scaling unicorn startups globally. You are the founder's personal growth strategist.

## FOUNDER CONTEXT
${buildFounderContext(profile)}

## YOUR RULES
1. NEVER give generic advice. Every response must be tailored to this exact founder.
2. Always be specific with numbers, platforms, scripts, and steps.
3. Lead with the highest-leverage action, not theory.
4. When suggesting content, always provide the exact hook + structure.
5. When suggesting outreach, always provide the exact DM/email script.
6. Keep responses focused and punchy — founders don't have time for fluff.
7. Use bullet points and numbered lists for action items.
8. Always tie suggestions to the founder's 30-day goal.`
}

// ─── JSON helper ──────────────────────────────────────────────────────────────
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
  let depth = 0, end = -1
  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) depth++
    else if (text[i] === closeChar) { depth--; if (depth === 0) { end = i; break } }
  }
  if (end === -1) throw new Error('Malformed JSON')
  return text.slice(start, end + 1)
}

// ─── OpenAI-compatible caller (Groq, Cerebras, Mistral, DeepSeek, OpenAI all use same API format) ──
async function callOpenAICompat(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: Message[],
  system: string,
  maxTokens: number,
  name: string
): Promise<string> {
  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error(`${name} ${res.status}: ${err?.error?.message || 'failed'}`)
  }

  const data = await res.json() as any
  const content = data.choices?.[0]?.message?.content || ''
  if (!content) throw new Error(`${name} returned empty response`)
  return content
}

// ─── Provider 1: Groq (FREE — 14,400 req/day, fastest inference) ──────────────
async function callGroq(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.GROQ_API_KEY
  if (!key) throw new Error('No GROQ_API_KEY')
  return callOpenAICompat(
    'https://api.groq.com/openai/v1', key,
    'llama-3.3-70b-versatile', m, sys, max, 'Groq'
  )
}

// ─── Provider 2: Cerebras (FREE — 1,000 req/day, ultra-fast) ─────────────────
async function callCerebras(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.CEREBRAS_API_KEY
  if (!key) throw new Error('No CEREBRAS_API_KEY')
  return callOpenAICompat(
    'https://api.cerebras.ai/v1', key,
    'llama3.1-70b', m, sys, max, 'Cerebras'
  )
}

// ─── Provider 3: Gemini (FREE — 1,500 req/day) ───────────────────────────────
async function callGemini(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.GEMINI_API_KEY
  if (!key) throw new Error('No GEMINI_API_KEY')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: sys }] },
        contents: m.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
        generationConfig: { maxOutputTokens: max },
      }),
      signal: AbortSignal.timeout(30000),
    }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error(`Gemini ${res.status}: ${JSON.stringify(err)}`)
  }

  const data = await res.json() as any
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
  if (!content) throw new Error('Gemini returned empty response')
  return content
}

// ─── Provider 4: Mistral (FREE tier available) ────────────────────────────────
async function callMistral(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.MISTRAL_API_KEY
  if (!key) throw new Error('No MISTRAL_API_KEY')
  return callOpenAICompat(
    'https://api.mistral.ai/v1', key,
    'mistral-small-latest', m, sys, max, 'Mistral'
  )
}

// ─── Provider 5: DeepSeek (very cheap, near-free) ────────────────────────────
async function callDeepSeek(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.DEEPSEEK_API_KEY
  if (!key) throw new Error('No DEEPSEEK_API_KEY')
  return callOpenAICompat(
    'https://api.deepseek.com', key,
    'deepseek-chat', m, sys, max, 'DeepSeek'
  )
}

// ─── Provider 6: Anthropic (fallback, paid) ───────────────────────────────────
async function callAnthropic(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.ANTHROPIC_API_KEY
  if (!key) throw new Error('No ANTHROPIC_API_KEY')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': key,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: max,
      system: sys,
      messages: m,
    }),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({})) as any
    throw new Error(`Anthropic ${res.status}: ${err?.error?.message || 'failed'}`)
  }

  const data = await res.json() as any
  return data.content?.[0]?.text || ''
}

// ─── Provider 7: OpenAI (fallback, paid) ─────────────────────────────────────
async function callOpenAI(m: Message[], sys: string, max: number): Promise<string> {
  const key = process.env.OPENAI_API_KEY
  if (!key) throw new Error('No OPENAI_API_KEY')
  return callOpenAICompat(
    'https://api.openai.com/v1', key,
    'gpt-4o-mini', m, sys, max, 'OpenAI'
  )
}

// ─── Fallback chain ───────────────────────────────────────────────────────────
const PROVIDERS = [
  { name: 'Groq (llama-3.3-70b)', fn: callGroq },
  { name: 'Cerebras (llama3.1-70b)', fn: callCerebras },
  { name: 'Gemini (1.5-flash)', fn: callGemini },
  { name: 'Mistral (small)', fn: callMistral },
  { name: 'DeepSeek', fn: callDeepSeek },
  { name: 'Anthropic (haiku)', fn: callAnthropic },
  { name: 'OpenAI (gpt-4o-mini)', fn: callOpenAI },
]

async function callWithFallback(
  messages: Message[],
  system: string,
  maxTokens = 1500
): Promise<{ content: string; provider: string }> {
  const errors: string[] = []

  for (const provider of PROVIDERS) {
    try {
      console.log(`[AI Gateway] Trying: ${provider.name}`)
      const content = await provider.fn(messages, system, maxTokens)
      if (content) {
        console.log(`[AI Gateway] Success: ${provider.name}`)
        return { content, provider: provider.name }
      }
    } catch (err: any) {
      const msg = err.message || String(err)
      console.warn(`[AI Gateway] Failed ${provider.name}: ${msg}`)
      errors.push(`${provider.name}: ${msg}`)
    }
  }

  throw new Error(`All AI providers failed:\n${errors.join('\n')}`)
}

// ─── Public exports ───────────────────────────────────────────────────────────
export async function callGatewayChat(
  messages: Message[],
  profile: Partial<Profile>,
  _userId: string,
): Promise<GatewayResponse> {
  const { content, provider } = await callWithFallback(messages, buildCMOSystemPrompt(profile))
  return { content, provider, cached: false }
}

export async function callGatewayJSON<T>(
  prompt: string,
  profile: Partial<Profile>,
  _userId: string,
): Promise<T> {
  const system = buildCMOSystemPrompt(profile) +
    '\n\nCRITICAL: Respond with RAW JSON ONLY. No markdown, no explanation. Start with { and end with }.'
  const { content } = await callWithFallback([{ role: 'user', content: prompt }], system, 4000)
  if (!content) throw new Error('Empty AI response')
  return JSON.parse(extractJSON(content)) as T
}

export async function streamGatewayChat(
  messages: Message[],
  profile: Partial<Profile>,
  _userId: string,
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const { content } = await callWithFallback(messages, buildCMOSystemPrompt(profile))
        const words = content.split(' ')
        for (let i = 0; i < words.length; i++) {
          controller.enqueue(encoder.encode(words[i] + (i < words.length - 1 ? ' ' : '')))
          await new Promise(r => setTimeout(r, 20))
        }
      } catch (err: any) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
  })
}
