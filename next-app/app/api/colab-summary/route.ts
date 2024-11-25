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


// **READ** all items
// export async function GET() {
//     const { data, error } = await supabase.from('items').select('*');
//     if (error) return NextResponse.json({ error: error.message }, { status: 400 });
//     return NextResponse.json(data, { status: 200 });
//   }
  
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