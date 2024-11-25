import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// **CREATE** an item
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json(); // Parse the JSON body
    const { url, name } = body;

    if (!url || !name) {
      return NextResponse.json({ error: 'URL and name required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('current_session_users')
      .insert([{ meeting_url : url, time_period : 10, name : name }]);

    if (error) {
      console.error('Supabase Error:', error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data }, { status: 201 });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


// Read
export async function GET() {
    try {
      // Create the Supabase client instance using the createClient function
      const supabase = await createClient();
  
      // Query the 'current_session_users' table
      const { data, error } = await supabase.from('current_session_users').select('*');
  
      if (error) {
        // Return error response with status 400
        return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 400 });
      }
  
      // Return the fetched data with status 200
      return NextResponse.json(data, { status: 200 });
    } catch (err) {
      // Handle unexpected errors and return a 500 status
      console.error('Error:', err);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}  
  
//   // **UPDATE** an item
//   export async function PUT(req: Request) {
//     const { id, name, description } = await req.json();
//     const { data, error } = await supabase
//       .from('items')
//       .update({ name, description })
//       .eq('id', id);
  
//     if (error) return NextResponse.json({ error: error.message }, { status: 400 });
//     return NextResponse.json(data, { status: 200 });
//   }
  
//   // **DELETE** an item
//   export async function DELETE(req: Request) {
//     const { id } = await req.json();
//     const { data, error } = await supabase.from('items').delete().eq('id', id);
  
//     if (error) return NextResponse.json({ error: error.message }, { status: 400 });
//     return NextResponse.json(data, { status: 200 });
//   }