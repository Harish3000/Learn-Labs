import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: Request) {
  try {

    const url = new URL(req.url);
    const summaryID = url.searchParams.get("summaryID");

    console.log("summaryID : ",summaryID);

    if (!summaryID) {
      return NextResponse.json({ error: "Missing required parameters." }, { status: 400 });
    }

    // Fetch breakroom attendance based on breakroomID and userID
    const { data, error } = await supabase
      .from("summaries")
      .select("*")
      .eq("id", summaryID);

      console.log("data : ",data);

    if (error) {
      console.error("Error fetching Summary Data:", error);
      return NextResponse.json({ error: "Failed to fetch Summary Data." }, { status: 500 });
    }
    // Return the fetched data
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Parse request body
    const body = await req.json();
    const { summary, responseData, correctness, missed, breakroomAttendanceDataID } = body;

    // Insert the data into the Supabase table
    const { data, error } = await supabase
      .from("summaries")
      .insert([{
        student_input: summary,
        model_summary: responseData,
        correctness: correctness,
        missed_points: missed,
        breakroom_details: breakroomAttendanceDataID,
      }])
      .select("*")
      .single();

    if (error) {
      console.error("Error inserting data:", error);
      return NextResponse.json({ error: "Failed to store summary." }, { status: 500 });
    }

    // Return success message with inserted data
    return NextResponse.json({ message: "Summary stored successfully.", data });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}