import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // Import your Supabase client utility

// **CREATE** an item in the summaries table
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json(); // Parse the JSON body
    
    const {
      userId, email, firstname, fact_checking, gemini_summary, accuracy
    } = body;

    // Check for required fields
    if (!userId || !email || !firstname || !fact_checking || !gemini_summary || accuracy === undefined) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Insert data into the 'summaries' table
    const { data, error } = await supabase
      .from('summaries')
      .insert([{
        uid: userId, 
        email, 
        firstname, 
        fact_checking_text: fact_checking,
        gemini_summary_text: gemini_summary,
        accuracy_percentage: accuracy
      }]);

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
