import { NextResponse } from "next/server";

const API_KEY = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY!;

export async function POST(req: Request) {
  try {
    const { title, links } = await req.json();

    const videoIds = links
      .map((url: string) => {
        const urlObj = new URL(url);
        return urlObj.searchParams.get("v");
      })
      .filter(Boolean);

    const videoInfoPromises = videoIds.map(async (videoId: string) => {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${videoId}&key=${API_KEY}`
      );
      if (!response.ok) throw new Error("Failed to fetch video info");
      const data = await response.json();
      const video = data.items[0];
      return {
        id: videoId,
        title: video.snippet.title,
        publishedAt: video.snippet.publishedAt,
        channelTitle: video.snippet.channelTitle,
        duration: video.contentDetails.duration,
        thumbnail: video.snippet.thumbnails.medium.url,
      };
    });

    const videoInfo = await Promise.all(videoInfoPromises);

    // Here you would typically save the course and video info to your database
    // For this example, we'll just return the collected data

    return NextResponse.json({ title, videoInfo });
  } catch (error) {
    console.error("Error in create-course route:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
