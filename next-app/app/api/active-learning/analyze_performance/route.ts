import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  console.log("API: Received performance submission request");
  const { student_id, lecture_id, performance } = await request.json();

  try {
    for (const record of performance) {
      const { error } = await supabase.from("performance_records").insert({
        student_id,
        lecture_id,
        question_id: record.question_id,
        displayed_difficulty: record.displayed_difficulty,
        attempts: record.attempts,
        time_taken: record.time_taken,
        final_result: record.final_result,
      });
      if (error) {
        console.error("API: Error inserting performance record:", error);
        throw error;
      }
    }
    console.log("API: Performance records saved successfully");
    return NextResponse.json({ message: "Performance received and saved" });
  } catch (error) {
    console.error("API: Performance submission failed:", error);
    return NextResponse.json(
      { error: "Failed to save performance" },
      { status: 500 }
    );
  }
}
