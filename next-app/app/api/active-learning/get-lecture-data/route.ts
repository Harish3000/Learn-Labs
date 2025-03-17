// api/active-learning/get-lecture-data/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  console.log("Fetching lecture data from API");
  try {
    const supabase = await createClient();

    const lecturesResponse = await supabase
      .from("lectures")
      .select(
        `
        *,
        videos (
          video_url,
          video_title
        )
      `
      )
      .eq("is_active", true)
      .order("lecture_live_start", { ascending: true });

    if (lecturesResponse.error) {
      console.error("Error fetching lectures:", lecturesResponse.error);
      throw new Error(
        `Error fetching lectures: ${lecturesResponse.error.message}`
      );
    }

    console.log("Successfully fetched lectures:", lecturesResponse.data);
    return NextResponse.json({
      lectures: lecturesResponse.data,
    });
  } catch (error) {
    console.error("Error in get-lecture-data:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecture data" },
      { status: 500 }
    );
  }
}
