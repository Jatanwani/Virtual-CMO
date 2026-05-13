import { OpenAIStream, StreamingTextResponse } from 'ai';
import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Use Edge Runtime for faster streaming and lower latency on Vercel
export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages, context } = await req.json();

    // Construct the Expert Persona using the user's dynamic context
    const systemPrompt = {
      role: 'system',
      content: `You are an expert Virtual CMO with 20 years of experience in digital marketing and brand scaling.
      
      CLIENT PROFILE:
      - Business Name: ${context?.company || 'Undisclosed'}
      - Target Industry: ${context?.industry || 'General Market'}
      - Value Proposition: ${context?.problem || 'General growth and lead generation'}
      
      OPERATIONAL GUIDELINES:
      1. Never give generic advice. Always tailor strategies to the ${context?.industry || 'client\'s'} sector.
      2. If asked for content, provide specific hooks, headlines, and call-to-actions.
      3. Focus on ROI, lead generation, and scalable marketing automation.
      4. Maintain a professional, decisive, and highly strategic tone.`
    };

    // Request a streaming completion from GPT-4
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      stream: true,
      messages: [
        systemPrompt,
        ...messages.map((m: any) => ({
          role: m.role,
          content: m.content,
        })),
      ],
      temperature: 0.7,
    });

    // Convert the response into a friendly text-stream
    const stream = OpenAIStream(response);
    
    // Respond with the stream
    return new StreamingTextResponse(stream);

  } catch (error: any) {
    console.error('CMO_ROUTE_ERROR:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate response. Please check your API key.' }), 
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}