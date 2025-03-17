import { NextResponse } from "next/server";
import { createCourseSchema } from "@/validators/course";
import { createClient } from "@/utils/supabase/server";
import { restrictServer, getUserFromServer } from "@/utils/restrictServer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, links } = createCourseSchema.parse(body);
    const supabase = await createClient();
    const user = await getUserFromServer();

    // Insert lecture data into Supabase
    const { data: lectureData, error: lectureError } = await supabase
      .from("lectures")
      .insert({
        lecture_title: title,
        description: "N/A",
        playlist_id: "N/A",
        upload_date: new Date().toISOString(),
        is_active: true,
        lecturer_email: user?.email ?? "admin@learnlabs.com",
        joined_students: "N/A",
      })
      .select();

    if (lectureError) {
      throw new Error(`Error inserting lecture: ${lectureError.message}`);
    }

    const lectureId = lectureData[0].lecture_id;

    // Insert video data into Supabase
    for (let i = 0; i < links.length; i++) {
      const videoUrl = links[i];
      let videoId, source;

      if (videoUrl.includes("youtube.com") || videoUrl.includes("youtu.be")) {
        const match = videoUrl.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
        videoId = match ? match[1] : null;
        source = "youtube";
      } else if (videoUrl.includes("drive.google.com")) {
        const match = videoUrl.match(/\/d\/(.*)\/view/);
        videoId = match ? match[1] : null;
        source = "google_drive";
      } else if (videoUrl.includes("res.cloudinary.com")) {
        videoId = videoUrl.split("/").pop()?.split(".")[0];
        source = "cloudinary";
      } else {
        console.error(`Invalid URL: ${videoUrl}`);
        throw new Error(`Invalid URL: ${videoUrl}`);
      }

      if (!videoId) {
        console.error("video_id cannot be null or empty");
        throw new Error("video_id cannot be null or empty");
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
        video_title: `Video ${i + 1}`,
        video_url: videoUrl,
        duration_seconds: 0,
        start_timestamp: new Date().toISOString(),
        end_timestamp: new Date().toISOString(),
        video_sequence: i + 1,
        active_students: "N/A",
        source: source,
      });

      if (videoError) {
        throw new Error(`Error inserting video: ${videoError.message}`);
      }
    }

    return NextResponse.json({
      message: "Course created successfully",
      lectureId,
    });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
