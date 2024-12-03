import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("summaries") // Table name
      .select("*"); // Fetch all columns

    if (error) {
      console.error("Error fetching summaries:", error);
      return NextResponse.json({ error: "Failed to fetch summaries." }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse the incoming JSON

    console.log("Data Sending : ",body);

    const { uid, email, firstname, gemini_summary, accuracy } = body;

    // Validation checks for required fields
    if (!uid || !email || !firstname || !gemini_summary || accuracy === undefined) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    // Insert the data into the Supabase table
    const { data, error } = await supabase
      .from("summaries") // Replace with your actual table name
      .insert([{
        uid: uid,
        email,
        firstname,
        gemini_summary,
        accuracy,
      }]);

    // Error handling for failed insertion
    if (error) {
      console.error("Error inserting data:", error);
      return NextResponse.json({ error: "Failed to store summary." }, { status: 500 });
    }

    // Return a success response
    return NextResponse.json({ message: "Summary stored successfully." });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}