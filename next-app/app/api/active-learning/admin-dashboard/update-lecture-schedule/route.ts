import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { lectureId, lecture_live_start, lecture_live_end } = body;

    console.log("API request received with body:", body);

    if (!lectureId || !lecture_live_start || !lecture_live_end) {
      console.log("Missing required parameters:", {
        lectureId,
        lecture_live_start,
        lecture_live_end,
      });
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    console.log(`Updating lecture ${lectureId} with schedule:`, {
      lecture_live_start,
      lecture_live_end,
    });

    const { data, error } = await supabase
      .from("lectures")
      .update({
        lecture_live_start,
        lecture_live_end,
      })
      .eq("lecture_id", lectureId);

    if (error) {
      console.error("Supabase update error:", error.message);
      return NextResponse.json(
        { error: "Failed to update lecture schedule" },
        { status: 500 }
      );
    }

    console.log("Lecture schedule updated successfully:", data);
    return NextResponse.json(
      { message: "Lecture schedule updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
