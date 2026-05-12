/**
 * AI Gateway — Multi-Provider Fallback (no Cloudflare Worker needed)
 *
 * Provider priority (tries each in order, skips if key missing or call fails):
 *   1. Groq        — Llama 3.3 70B   — 14,400 req/day FREE
 *   2. Cerebras    — Llama 3.1 8B    — 1M tokens/day FREE
 *   3. Gemini      — Flash 2.0       — 1,500 req/day FREE
 *   4. Mistral     — Mistral 7B      — Free credits
 *   5. OpenAI      — GPT-4o-mini     — Paid, reliable fallback
 *   6. Anthropic   — Claude Sonnet   — Paid, final fallback
 *
 * Add keys to .env.local to activate each provider.
 * Any provider without a key is silently skipped.
 */

import { Profile } from '@/types/database'
import Anthropic from '@anthropic-ai/sdk'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export interface GatewayResponse {
  content: string
  provider: string
  cached: boolean
}

export interface GatewayJSONResponse<T> {
  data: T
  provider: string
  cached: boolean
}

// ─── System prompt builder ────────────────────────────────────────────────────
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

## FOUNDER CONTEXT (Always use this to personalize every response)
${buildFounderContext(profile)}

## YOUR RULES
1. NEVER give generic advice. Every response must be tailored to this exact founder.
2. Always be specific with numbers, platforms, scripts, and steps.
3. Lead with the highest-leverage action, not theory.
4. When suggesting content, always provide the exact hook + structure.
5. When suggesting outreach, always provide the exact DM/email script.
6. Keep responses focused and punchy — founders don't have time for fluff.
7. Use bullet points and numbered lists for action items.
8. Always tie suggestions to the founder's 30-day goal.
9. Think like a CMO who has skin in the game, not a consultant who just advises.`
}

// ─── JSON extraction helper ───────────────────────────────────────────────────
function extractJSON(raw: string): string {
  let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let start = -1
  if (firstBrace === -1 && firstBracket === -1) throw new Error('No JSON found in response')
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
  if (end === -1) throw new Error('Malformed JSON: no closing bracket found')
  return text.slice(start, end + 1)
}

// ─── Provider definitions ─────────────────────────────────────────────────────
interface Provider {
  id: string
  name: string
  envKey: string
  call: (messages: Message[], system: string, apiKey: string) => Promise<string>
}

// OpenAI-compatible call (works for Groq, Cerebras, Mistral, OpenAI)
async function callOpenAICompat(
  apiUrl: string,
  model: string,
  messages: Message[],
  system: string,
  apiKey: string,
  maxTokens = 1500
): Promise<string> {
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
      temperature: 0.7,
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status}: ${body}`)
  }
  const json = await res.json()
  const content = json.choices?.[0]?.message?.content
  if (!content) throw new Error('Empty response from provider')
  return content
}

// Gemini has a different API format
async function callGemini(messages: Message[], system: string, apiKey: string): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: messages.map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }],
      })),
      generationConfig: { maxOutputTokens: 1500, temperature: 0.7 },
    }),
    signal: AbortSignal.timeout(45000),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Gemini ${res.status}: ${body}`)
  }
  const json = await res.json()
  const content = json.candidates?.[0]?.content?.parts?.[0]?.text
  if (!content) throw new Error('Empty response from Gemini')
  return content
}

const PROVIDERS: Provider[] = [
  {
    id: 'groq',
    name: 'Groq / Llama-3.3-70B',
    envKey: 'GROQ_API_KEY',
    call: (msgs, sys, key) => callOpenAICompat(
      'https://api.groq.com/openai/v1/chat/completions',
      'llama-3.3-70b-versatile', msgs, sys, key
    ),
  },
  {
    id: 'cerebras',
    name: 'Cerebras / Llama-3.1-8B',
    envKey: 'CEREBRAS_API_KEY',
    call: (msgs, sys, key) => callOpenAICompat(
      'https://api.cerebras.ai/v1/chat/completions',
      'llama3.1-8b', msgs, sys, key
    ),
  },
  {
    id: 'gemini',
    name: 'Gemini 2.0 Flash',
    envKey: 'GEMINI_API_KEY',
    call: callGemini,
  },
  {
    id: 'mistral',
    name: 'Mistral 7B',
    envKey: 'MISTRAL_API_KEY',
    call: (msgs, sys, key) => callOpenAICompat(
      'https://api.mistral.ai/v1/chat/completions',
      'mistral-small-latest', msgs, sys, key
    ),
  },
  {
    id: 'openai',
    name: 'OpenAI GPT-4o-mini',
    envKey: 'OPENAI_API_KEY',
    call: (msgs, sys, key) => callOpenAICompat(
      'https://api.openai.com/v1/chat/completions',
      'gpt-4o-mini', msgs, sys, key
    ),
  },
]

// ─── Core: try providers in order ─────────────────────────────────────────────
async function callWithFallback(
  messages: Message[],
  profile: Partial<Profile>
): Promise<GatewayResponse> {
  const system = buildCMOSystemPrompt(profile)
  const errors: string[] = []

  // Try each configured provider in priority order
  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.envKey]
    if (!apiKey) continue  // skip — key not configured

    try {
      console.log(`[CMO Gateway] Trying ${provider.name}...`)
      const content = await provider.call(messages, system, apiKey)
      console.log(`[CMO Gateway] ✓ Success via ${provider.name}`)
      return { content, provider: provider.id, cached: false }
    } catch (err: any) {
      const msg = err.message || String(err)
      console.warn(`[CMO Gateway] ✗ ${provider.name} failed: ${msg}`)
      errors.push(`${provider.name}: ${msg}`)
      // Continue to next provider
    }
  }

  // All free providers failed — try Anthropic as final fallback
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      console.log('[CMO Gateway] Trying Anthropic (final fallback)...')
      const client = new Anthropic({ apiKey: anthropicKey })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system,
        messages,
      })
      const content = response.content[0].type === 'text' ? response.content[0].text : ''
      console.log('[CMO Gateway] ✓ Success via Anthropic')
      return { content, provider: 'anthropic', cached: false }
    } catch (err: any) {
      errors.push(`Anthropic: ${err.message}`)
    }
  }

  throw new Error(
    `All AI providers failed. Add free API keys to .env.local to fix this.\n` +
    `Errors:\n${errors.join('\n')}`
  )
}

// ─── Public: chat (non-streaming, used internally) ───────────────────────────
export async function callGatewayChat(
  messages: Message[],
  profile: Partial<Profile>,
  _userId: string,
): Promise<GatewayResponse> {
  return callWithFallback(messages, profile)
}

// ─── Public: streaming chat (used by /api/cmo) ────────────────────────────────
export async function streamGatewayChat(
  messages: Message[],
  profile: Partial<Profile>,
  userId: string
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        // Try true Anthropic streaming first (best experience)
        const anthropicKey = process.env.ANTHROPIC_API_KEY
        const tryAnthropicStream = !!anthropicKey

        if (tryAnthropicStream) {
          try {
            const client = new Anthropic({ apiKey: anthropicKey! })
            const stream = await client.messages.stream({
              model: 'claude-sonnet-4-6',
              max_tokens: 1500,
              system: buildCMOSystemPrompt(profile),
              messages,
            })
            for await (const chunk of stream) {
              if (
                chunk.type === 'content_block_delta' &&
                chunk.delta.type === 'text_delta' &&
                chunk.delta.text
              ) {
                controller.enqueue(encoder.encode(chunk.delta.text))
              }
            }
            controller.close()
            return
          } catch (err: any) {
            // Anthropic failed (credit exhaustion, rate limit, etc.)
            // Fall through to multi-provider fallback below
            console.warn('[CMO Gateway] Anthropic stream failed, switching to fallback providers:', err.message)
          }
        }

        // Fallback: call other providers, simulate streaming word-by-word
        const response = await callWithFallback(messages, profile)
        console.log(`[CMO Gateway] Streaming via ${response.provider}`)

        // Normalise escaped newlines from non-Anthropic providers
        const cleanContent = response.content
          .replace(/\\n/g, '\n')
          .replace(/\\t/g, '\t')

        // Stream word-by-word to keep the UI feeling live
        const words = cleanContent.split(' ')
        const chunkSize = 4
        for (let i = 0; i < words.length; i += chunkSize) {
          const chunk = words.slice(i, i + chunkSize).join(' ')
          const isLast = i + chunkSize >= words.length
          controller.enqueue(encoder.encode(chunk + (isLast ? '' : ' ')))
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

// ─── Public: structured JSON (used by tasks, content, experiments) ────────────
export async function callGatewayJSON<T>(
  prompt: string,
  profile: Partial<Profile>,
  userId: string
): Promise<T> {
  const jsonProfile = { ...profile }
  const jsonSystem = buildCMOSystemPrompt(jsonProfile) +
    '\n\nCRITICAL INSTRUCTION: Your response must be RAW JSON ONLY. Do NOT wrap in markdown. Do NOT add any text before or after the JSON. Start your response with { and end with }.'

  // For JSON we need reliable output — try Anthropic first since it follows instructions best
  const anthropicKey = process.env.ANTHROPIC_API_KEY
  if (anthropicKey) {
    try {
      const client = new Anthropic({ apiKey: anthropicKey })
      const response = await client.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 4000,
        system: jsonSystem,
        messages: [{ role: 'user', content: prompt }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text : ''
      if (raw) return JSON.parse(extractJSON(raw)) as T
    } catch (err: any) {
      console.warn('[CMO Gateway] Anthropic JSON failed, trying fallback:', err.message)
    }
  }

  // Fallback providers for JSON
  const system = jsonSystem
  const messages: Message[] = [{ role: 'user', content: prompt }]
  const errors: string[] = []

  for (const provider of PROVIDERS) {
    const apiKey = process.env[provider.envKey]
    if (!apiKey) continue

    try {
      console.log(`[CMO Gateway] JSON via ${provider.name}...`)
      const raw = await provider.call(messages, system, apiKey)
      return JSON.parse(extractJSON(raw)) as T
    } catch (err: any) {
      errors.push(`${provider.name}: ${err.message}`)
      console.warn(`[CMO Gateway] JSON ${provider.name} failed:`, err.message)
    }
  }

  throw new Error(`All providers failed for JSON generation:\n${errors.join('\n')}`)
}
