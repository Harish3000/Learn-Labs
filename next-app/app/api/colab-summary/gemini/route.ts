import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  console.log("Fetching student submitted summaries...");
  try {
    const { data, error } = await supabase
      .from("summaries")
      .select("*");

    if (error) {
      console.error("Error fetching summaries:", error);
      return NextResponse.json({ error: "Failed to fetch summaries." }, { status: 500 });
    }

    console.log("Successfully fetched the summaries...");
    console.log("Summary data : ",data);

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("Data Sending : ",body);

    const { breakroom_id, summary, responseData, correctness, missed } = body;
    console.log("breakroom_id : ",breakroom_id);
    // Insert the data into the Supabase table
      const { data, error } = await supabase
      .from("summaries") // Replace with your actual table name
      .insert([{
        breakroom_details: breakroom_id,
        student_input: summary,
        model_summary: responseData,
        correctness: correctness,
        missed_points: missed,
      }]);

      if (error) {
        console.error("Error inserting data:", error);
        return NextResponse.json({ error: "Failed to store summary." }, { status: 500 });
      }
    return NextResponse.json({ message: "Summary stored successfully." });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}