import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  console.log("Fetching lecturer preferences from API");
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("email");

    if (!userEmail) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data: preferencesData, error: preferencesError } = await supabase
      .from("user_feedback_preferences")
      .select(
        `
        language_tone_preference,
        sentence_structure_preference,
        vocabulary_preference,
        readability_preference,
        clarity_preference
      `
      )
      .eq("user_email", userEmail)
      .limit(1) // Select only one row
      .single();

    if (preferencesError || !preferencesData) {
      console.error(
        "Error fetching lecturer preferences or no preferences found:",
        preferencesError
      );
      return NextResponse.json(
        { error: "No preferences found for the specified lecturer" },
        { status: 404 }
      );
    }

    console.log("Successfully fetched lecturer preferences:", preferencesData);
    return NextResponse.json({
      preferences: preferencesData,
    });
  } catch (error) {
    console.error("Error in get-lecturer-preference:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecturer preferences" },
      { status: 500 }
    );
  }
}
