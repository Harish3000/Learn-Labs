import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// **UPDATE USER ANSWER AFTER MEETING**
export async function PATCH(req: Request) {
    try {
      const supabase = await createClient();
      const body = await req.json();
      const { roomID, userID, userAnswer } = body;
  
      if (!roomID || !userID || !userAnswer) {
        return NextResponse.json({ error: 'roomID, userID, and answer are required' }, { status: 400 });
      }
  
      const { data, error } = await supabase
        .from('breakroom_details') // Using existing table
        .update({ speech_to_text: userAnswer }) // Updating answer field
        .match({ room_id: roomID, student_id: userID });
  
      if (error) {
        console.error('Supabase Error:', error.message);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
  
      return NextResponse.json({ success: true, data }, { status: 200 });
    } catch (error) {
      console.error('API Error:', error);
      return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
  }