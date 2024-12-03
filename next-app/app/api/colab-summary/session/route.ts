import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// **CREATE**
export async function POST(req: Request) {

  console.log("Creating meeting...");
  try {
    const supabase = await createClient();
    const body = await req.json(); // Parse the JSON body
    const { url, name } = body;

    if (!url || !name) {
      return NextResponse.json({ error: 'URL and name required' }, { status: 400 });
    }

    console.log("Fetching current session users...");

    const { data, error } = await supabase
      .from('current_session_users')
      .insert([{ meeting_url : url, time_period : 10, name : name }]);

    console.log("Meeting URL created...");
    if (error) {
      console.error('Supabase Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.log("On going meeting...");
    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
