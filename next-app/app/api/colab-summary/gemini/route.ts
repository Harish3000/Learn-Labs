import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("summaries") // Replace with your actual table name
      .select("summary_text")
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching summary:", error);
      return NextResponse.json({ error: "Failed to fetch summary text." }, { status: 500 });
    }

    return NextResponse.json({ summary_text: data?.summary_text || "" });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}

// POST handler to store analysis
export async function POST(req: Request) {
  try {
    const body = await req.json(); // Parse the incoming JSON
    const { analysis } = body; // Extract the analysis from the request body

    if (!analysis) {
      return NextResponse.json({ error: "Analysis text is required." }, { status: 400 });
    }

    // Insert the analysis into the Supabase table
    const { data, error } = await supabase
      .from("summaries") // Replace with your actual table name
      .insert([{ analysis_text: analysis }]); // Store the analysis in the table

    if (error) {
      console.error("Error inserting analysis:", error);
      return NextResponse.json({ error: "Failed to store analysis." }, { status: 500 });
    }

    return NextResponse.json({ message: "Analysis stored successfully." });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
