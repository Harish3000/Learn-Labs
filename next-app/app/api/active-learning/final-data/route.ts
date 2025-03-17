import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const [lectures, videos, transcriptChunks, questions] = await Promise.all([
      supabase.from("lectures").select("*"),
      supabase.from("videos").select("*"),
      supabase.from("transcript_chunks").select("*"),
      supabase.from("questions").select("*"),
    ]);

    if (lectures.error)
      throw new Error(`Error fetching lectures: ${lectures.error.message}`);
    if (videos.error)
      throw new Error(`Error fetching videos: ${videos.error.message}`);
    if (transcriptChunks.error)
      throw new Error(
        `Error fetching transcript chunks: ${transcriptChunks.error.message}`
      );
    if (questions.error)
      throw new Error(`Error fetching questions: ${questions.error.message}`);

    return NextResponse.json({
      lectures: lectures.data,
      videos: videos.data,
      transcriptChunks: transcriptChunks.data,
      questions: questions.data,
    });
  } catch (error) {
    console.error("Error fetching final data:", error);
    return NextResponse.json(
      { error: "Failed to fetch final data" },
      { status: 500 }
    );
  }
}
