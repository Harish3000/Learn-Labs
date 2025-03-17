import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("user_feedback_preferences")
      .select("*")
      .order("generated_at", { ascending: false })
      .limit(10);

    if (error) {
      throw new Error(`Error fetching analysis data: ${error.message}`);
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching analysis data:", error);
    return NextResponse.json(
      { error: "Failed to fetch analysis data" },
      { status: 500 }
    );
  }
}
