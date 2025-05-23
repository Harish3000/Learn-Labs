import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getTranscript } from "@/lib/youtube";
import { processTranscript, generateQuestions } from "@/lib/gemini";
import { transcribeVideo, getTranscriptWithTimestamps } from "@/lib/assemblyai";
import { VideoInfo } from "@/types/video";
import { restrictServer, getUserFromServer } from "@/utils/restrictServer";

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

    // Fetch lecture id to add to transcript chunk table
    const { data: videoData, error: videoError } = await supabase
      .from("videos")
      .select("lecture_id")
      .eq("video_id", video.id)
      .single();

    if (videoError) {
      throw new Error(`Error fetching lecture_id: ${videoError.message}`);
    }

    const lectureId = videoData.lecture_id;

    // Get user email
    const user = await getUserFromServer();
    const userEmail = user?.email ?? "admin@learnlabs.com";

    // Fetch user preferences once before the loop
    console.log("Fetching preferences for userEmail:", userEmail);
    let { data: preferencesData, error: preferencesError } = await supabase
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
      .limit(1)
      .single();

    console.log("Supabase response - preferencesData:", preferencesData);
    console.log("Supabase response - preferencesError:", preferencesError);

    if (preferencesError || !preferencesData) {
      console.error(
        "Error fetching user preferences or no preferences found:",
        preferencesError
      );
      preferencesData = {
        language_tone_preference: "neutral",
        sentence_structure_preference: "simple",
        vocabulary_preference: "standard",
        readability_preference: "high",
        clarity_preference: "clear",
      };
    }

    const userPreferences = {
      language_tone_preference: preferencesData.language_tone_preference,
      sentence_structure_preference:
        preferencesData.sentence_structure_preference,
      vocabulary_preference: preferencesData.vocabulary_preference,
      readability_preference: preferencesData.readability_preference,
      clarity_preference: preferencesData.clarity_preference,
    };

    console.log("Final preferences used:", userPreferences);

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

      // Pass userPreferences to generateQuestions instead of fetching inside
      const questions = await generateQuestions(chapter.text, userPreferences);

      for (const question of questions) {
        const { error: questionError } = await supabase
          .from("questions")
          .insert({
            chunk_id: chunkId,
            display_time: chapter.end_time,
            question: question.question,
            options: JSON.stringify(question.options),
            answer: question.answer,
            lecture_id: lectureId,
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
