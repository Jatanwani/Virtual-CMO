import Anthropic from '@anthropic-ai/sdk'
import { Profile } from '@/types/database'

// ─── FIX 1: Correct model name ───────────────────────────────────────────────
const MODEL = 'claude-opus-4-5'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export function buildCMOSystemPrompt(profile: Partial<Profile>): string {
  return `You are a world-class Virtual CMO with 20+ years of experience working with McKinsey, BCG, and scaling unicorn startups globally. You are the founder's personal growth strategist.

## FOUNDER CONTEXT (Always use this to personalize every response)
- Product: ${profile.product || 'Not specified'}
- Problem solved: ${profile.problem || 'Not specified'}  
- Target ICP: ${profile.icp || 'Not specified'}
- Stage: ${profile.stage || 'Early stage'}
- Current traction: ${profile.traction || 'None yet'}
- Existing channels: ${profile.channels || 'None'}
- 30-day goal: ${profile.goal_30 || 'Not specified'}
- Daily time available: ${profile.time_available || '2-4 hours'}
- Marketing budget: ${profile.budget || '$0'}
- Growth archetype: ${profile.archetype || 'Unknown'}

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

// ─── FIX 2: Streaming with proper encoder ────────────────────────────────────
export async function streamCMOResponse(
  messages: { role: 'user' | 'assistant'; content: string }[],
  profile: Partial<Profile>
): Promise<ReadableStream<Uint8Array>> {
  const encoder = new TextEncoder()

  const anthropicStream = await anthropic.messages.stream({
    model: MODEL,
    max_tokens: 1500,
    system: buildCMOSystemPrompt(profile),
    messages,
  })

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const chunk of anthropicStream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta' &&
            chunk.delta.text
          ) {
            controller.enqueue(encoder.encode(chunk.delta.text))
          }
        }
      } catch (err) {
        controller.error(err)
      } finally {
        controller.close()
      }
    },
    cancel() {
      anthropicStream.abort()
    },
  })
}

// ─── FIX 3: Robust JSON extraction ──────────────────────────────────────────
function extractJSON(raw: string): string {
  // Strip markdown code fences
  let text = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim()

  // Find first { or [ and last } or ]
  const firstBrace = text.indexOf('{')
  const firstBracket = text.indexOf('[')
  let start = -1

  if (firstBrace === -1 && firstBracket === -1) {
    throw new Error('No JSON object found in response')
  } else if (firstBrace === -1) {
    start = firstBracket
  } else if (firstBracket === -1) {
    start = firstBrace
  } else {
    start = Math.min(firstBrace, firstBracket)
  }

  // Find the matching closing bracket
  const openChar = text[start]
  const closeChar = openChar === '{' ? '}' : ']'
  let depth = 0
  let end = -1

  for (let i = start; i < text.length; i++) {
    if (text[i] === openChar) depth++
    else if (text[i] === closeChar) {
      depth--
      if (depth === 0) { end = i; break }
    }
  }

  if (end === -1) throw new Error('Malformed JSON: no closing bracket found')
  return text.slice(start, end + 1)
}

export async function generateJSON<T>(prompt: string, profile: Partial<Profile>): Promise<T> {
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 4000,
    system:
      buildCMOSystemPrompt(profile) +
      '\n\nCRITICAL INSTRUCTION: Your response must be RAW JSON ONLY. Do NOT wrap in markdown. Do NOT add any text before or after the JSON. Start your response with { and end with }.',
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  
  if (!raw) throw new Error('Empty response from AI')

  try {
    const jsonStr = extractJSON(raw)
    return JSON.parse(jsonStr) as T
  } catch (parseErr) {
    console.error('JSON parse failed. Raw response was:\n', raw)
    throw new Error(`Failed to parse AI response as JSON: ${(parseErr as Error).message}`)
  }
}
