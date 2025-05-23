import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const lectureId = searchParams.get("lectureId");

  try {
    const supabase = await createClient();

    if (!lectureId) {
      // Original fetch all data if no lectureId provided
      const [lectures, videos, transcriptChunks, questions] = await Promise.all(
        [
          supabase.from("lectures").select("*"),
          supabase.from("videos").select("*"),
          supabase.from("transcript_chunks").select("*"),
          supabase.from("questions").select("*"),
        ]
      );

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
    }

    // Fetch data filtered by lectureId
    const [lectures, videos, transcriptChunks, questions] = await Promise.all([
      supabase.from("lectures").select("*").eq("lecture_id", lectureId),
      supabase.from("videos").select("*").eq("lecture_id", lectureId),
      supabase
        .from("transcript_chunks")
        .select("*")
        .eq("lecture_id", lectureId),
      supabase.from("questions").select("*").eq("lecture_id", lectureId),
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

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("videos")
      .select("lecture_id")
      .eq("video_id", videoId)
      .single();

    if (error) throw error;

    return NextResponse.json({ lectureId: data.lecture_id });
  } catch (error) {
    console.error("Error fetching lecture ID:", error);
    return NextResponse.json(
      { error: "Failed to fetch lecture ID" },
      { status: 500 }
    );
  }
}
