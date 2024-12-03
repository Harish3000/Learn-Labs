import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  console.log("Fetching student submitted summaries...")
  try {
    const { data, error } = await supabase
      .from("summaries") // Table name
      .select("*"); // Fetch all columns

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
  console.log("Submitting Summaries to database...");
  console.log("Integrating API...");
  try {
    const body = await req.json(); // Parse the incoming JSON

    console.log("Data Sending : ",body);

    const { uid, email, firstname, gemini_summary, accuracy } = body;

    // Validation checks for required fields
    if (!uid || !email || !firstname || !gemini_summary || accuracy === undefined) {
      return NextResponse.json({ error: "All fields are required." }, { status: 400 });
    }

    console.log("Loading...");

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

    console.log("Summaries stored successfully...");
    console.log("API Integrated success!!");
    // Return a success response
    return NextResponse.json({ message: "Summary stored successfully." });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}