import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// **CREATE** an item in the summaries table
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json(); // Parse the JSON body
    
    const { userId, email, firstname, summary } = body;

    // Check for required fields
    if (!userId || !email || !firstname || !summary) {
      return NextResponse.json(
        { error: 'User ID, email, firstname, and summary are required' },
        { status: 400 }
      );
    }

    // Insert data into the 'summaries' table
    const { data, error } = await supabase
      .from('summaries')
      .insert([{ uid: userId, email, firstname, summary_text: summary }]);

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