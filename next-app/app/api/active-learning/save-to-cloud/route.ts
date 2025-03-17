import { NextResponse } from "next/server";
import { createCourseSchema } from "@/validators/course";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Received request body:", body);
    const { title, links } = createCourseSchema.parse(body);
    const supabase = await createClient();

    const { data: lectureData, error: lectureError } = await supabase
      .from("lectures")
      .insert({
        lecture_title: title,
        description: "N/A",
        playlist_id: "N/A",
        upload_date: new Date().toISOString(),
        is_active: true,
        joined_students: "[]",
      })
      .select();

    if (lectureError) {
      console.error("Lecture insertion error:", lectureError);
      throw new Error(`Error inserting lecture: ${lectureError.message}`);
    }

    const lectureId = lectureData[0].lecture_id;
    console.log("Lecture inserted with ID:", lectureId);

    for (let i = 0; i < links.length; i++) {
      const videoUrl = links[i];
      let videoId: string | null = null;
      let source: string;

      if (videoUrl.includes("cloudinary.com")) {
        const match = videoUrl.match(/\/upload\/v\d+\/(.+)\.mp4/);
        videoId = match ? match[1] : null;
        source = "cloudinary";
      } else {
        console.error(`Invalid Cloudinary URL: ${videoUrl}`);
        throw new Error(`Invalid Cloudinary URL: ${videoUrl}`);
      }

      if (!videoId) {
        console.error("Video ID cannot be null or empty");
        throw new Error("Video ID cannot be null or empty");
      }

      const { data: existingVideo } = await supabase
        .from("videos")
        .select("video_id")
        .eq("video_id", videoId)
        .single();

      if (existingVideo) {
        console.error(`Duplicate video_id found: ${videoId}`);
        throw new Error(`Duplicate video_id: ${videoId}`);
      }

      const { error: videoError } = await supabase.from("videos").insert({
        lecture_id: lectureId,
        video_id: videoId,
        video_title: "Video 1",
        video_url: videoUrl,
        duration_seconds: "0",
        start_timestamp: new Date().toISOString(),
        end_timestamp: new Date().toISOString(),
        video_sequence: "1",
        active_students: "[]",
        source: source,
      });

      if (videoError) {
        console.error("Video insertion error:", videoError);
        throw new Error(`Error inserting video: ${videoError.message}`);
      }
      console.log(`Video inserted: ${videoId}`);
    }

    return NextResponse.json({
      message: "Course created successfully",
      lectureId,
    });
  } catch (error) {
    console.error("Error in save-to-cloud:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
