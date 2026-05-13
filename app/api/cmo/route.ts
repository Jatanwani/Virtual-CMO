import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Use Edge Runtime for high performance and low latency on Vercel
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // The modern streamText implementation
    const result = await streamText({
      model: openai('gpt-4-turbo'),
      messages,
      system: `You are an expert Virtual CMO with 20 years of experience in digital marketing and brand scaling.
      
      CLIENT PROFILE:
      - Business Name: ${context?.company || 'Undisclosed'}
      - Target Industry: ${context?.industry || 'General Market'}
      - Value Proposition: ${context?.problem || 'General growth and lead generation'}
      
      OPERATIONAL GUIDELINES:
      1. Never give generic advice. Always tailor strategies to the ${context?.industry || 'client\'s'} sector.
      2. If asked for content, provide specific hooks, headlines, and call-to-actions.
      3. Focus on ROI, lead generation, and scalable marketing automation.
      4. Maintain a professional, decisive, and highly strategic tone.`,
      temperature: 0.7,
    });

    // Returns a response compatible with the useChat hook
    return result.toDataStreamResponse();

  } catch (error: any) {
    console.error('CMO_ROUTE_ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response. Please check your API key.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}