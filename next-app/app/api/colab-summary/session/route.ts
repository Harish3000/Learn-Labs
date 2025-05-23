import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// **CREATE**
export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const body = await req.json();
    const { url, name, roomID, userID, breakroom_id } = body;
    console.log("breakroom id : ",breakroom_id);
    if (!url || !name) {
      return NextResponse.json({ error: 'URL and name are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('breakroom_details')
      .insert([{ meeting_url : url, time_period : 10, student_name : name, room_id : roomID, student_id : userID, breakroom_attendance: breakroom_id }]).select("*").single();
    
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

export async function GET(req: Request) {
  try {
    // Get query parameters from the URL
    const url = new URL(req.url);
    const breakroomID = url.searchParams.get("breakroomID");
    const userID = url.searchParams.get("userID");

    if (!breakroomID || !userID) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    const supabase = await createClient();

    // Fetch breakroom attendance based on breakroomID and userID
    const { data, error } = await supabase
      .from("breakroom_attendance")
      .select("*")
      .eq("breakroom_id", breakroomID)
      .eq("student_id", userID);

    console.log("breakroom attendance data : ",data);

    if (error) {
      console.error("Error fetching breakroom attendance data:", error);
      return NextResponse.json({ error: "Failed to fetch summaries." }, { status: 500 });
    }
    // Return the fetched data
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
