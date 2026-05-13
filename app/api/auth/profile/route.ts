import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const body = await request.json();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // We use .upsert to either create a new profile or update an existing one
    const { error } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        company_name: body.company_name,
        website: body.website,
        industry: body.industry, // General purpose field
        solving_problem: body.solving_problem,
        updated_at: new Date().toISOString(),
      });

    if (error) throw error;

    return NextResponse.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}