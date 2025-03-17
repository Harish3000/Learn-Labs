import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getTranscript } from "@/lib/youtube";
import { processTranscript, generateQuestions } from "@/lib/gemini";
import { transcribeVideo, getTranscriptWithTimestamps } from "@/lib/assemblyai";
import { VideoInfo } from "@/types/video";

export async function POST(req: Request) {
  try {
    const { video }: { video: VideoInfo } = await req.json();
    console.log("Processing video:", video);

    if (!video.source) {
      throw new Error(`Missing video source for video ID: ${video.id}`);
    }

    let transcript: any[];
    if (video.source === "youtube") {
      transcript = await getTranscript(video.id);
    } else if (video.source === "google_drive") {
      const transcriptionResult = await transcribeVideo(video.url);
      transcript = await getTranscriptWithTimestamps(transcriptionResult.id);
    } else if (video.source === "cloudinary") {
      const transcriptionResult = await transcribeVideo(video.url);
      transcript = await getTranscriptWithTimestamps(transcriptionResult.id);
    } else {
      throw new Error(`Unsupported video source: ${video.source}`);
    }

    console.log("transcript with timestamps", transcript);
    // Process transcript and generate chapters
    const chapters = await processTranscript(transcript);

    const supabase = await createClient();

    console.log("Data extracted:", video);

    // Update video duration in Supabase
    const { error: updateError } = await supabase
      .from("videos")
      .update({ duration_seconds: video.duration })
      .eq("video_id", video.id);

    if (updateError) {
      throw new Error(`Error updating video duration: ${updateError.message}`);
    }

    //fetch lecture id to add to transcript chunk table
    const { data: videoData, error: videoError } = await supabase
      .from("videos")
      .select("lecture_id")
      .eq("video_id", video.id)
      .single();

    if (videoError) {
      throw new Error(`Error fetching lecture_id: ${videoError.message}`);
    }

    const lectureId = videoData.lecture_id;

    // Insert transcript chunks and generate questions
    for (const chapter of chapters) {
      // Extract vector from the "values" key
      const vector = chapter.embedding.values;

      const { data: chunkData, error: chunkError } = await supabase
        .from("transcript_chunks")
        .insert({
          video_id: video.id,
          lecture_id: lectureId,
          start_time: chapter.start_time,
          end_time: chapter.end_time,
          text: chapter.text,
          embedding: vector,
          chunk_sequence: chapter.sequence,
        })
        .select();

      if (chunkError) {
        throw new Error(
          `Error inserting transcript chunk: ${chunkError.message}`
        );
      }

      const chunkId = chunkData[0].chunk_id;

      const questions = await generateQuestions(chapter.text);

      for (const question of questions) {
        const { error: questionError } = await supabase
          .from("questions")
          .insert({
            chunk_id: chunkId,
            display_time: chapter.end_time,
            question: question.question,
            options: JSON.stringify(question.options),
            answer: question.answer,
            difficulty: question.difficulty,
          });

        if (questionError) {
          throw new Error(`Error inserting question: ${questionError.message}`);
        }
      }
    }

    return NextResponse.json({ message: "Video processed successfully" });
  } catch (error) {
    console.error("Error processing video:", error);
    return NextResponse.json(
      { error: "Failed to process video" },
      { status: 500 }
    );
  }
}
