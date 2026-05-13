import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  // Initialize Supabase with the user's session cookies
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // 1. Authenticate the user
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Parse the content to save
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 });
    }

    // 3. Insert the assistant message into the database
    const { error: dbError } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        content: content,
        role: 'assistant',
        created_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('DB_SAVE_ERROR:', dbError);
      throw dbError;
    }

    return NextResponse.json({ success: true, message: 'Message saved successfully' });

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' }, 
      { status: 500 }
    );
  }
}