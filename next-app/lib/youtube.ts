import { google } from "googleapis";
import { YoutubeTranscript as getYouTubeTranscript } from "youtube-transcript";
import { VideoInfo } from "@/types/video";

const youtube = google.youtube({
  version: "v3",
  auth: process.env.NEXT_PUBLIC_YOUTUBE_API_KEY,
});

export async function getVideoInfo(url: string): Promise<VideoInfo> {
  const videoId = new URL(url).searchParams.get("v");
  if (!videoId) throw new Error("Invalid YouTube URL");

  const response = await youtube.videos.list({
    part: ["snippet", "contentDetails"],
    id: [videoId],
  });

  const video = response.data.items?.[0];
  if (!video) throw new Error("Video not found");

  return {
    id: videoId,
    title: video.snippet?.title || "Untitled",
    publishedAt: video.snippet?.publishedAt || "Unknown",
    channelTitle: video.snippet?.channelTitle || "Unknown",
    duration: video.contentDetails?.duration || "Unknown",
    thumbnail: video.snippet?.thumbnails?.medium?.url || "/placeholder.svg",
    verified: false,
    source: "youtube",
    url: `https://www.youtube.com/watch?v=${videoId}`,
  };
}

export async function getTranscript(videoId: string) {
  try {
    const transcript = await getYouTubeTranscript.fetchTranscript(videoId);
    console.log(transcript);
    return transcript;
  } catch (error) {
    console.error("Error fetching transcript:", error);
    throw error;
  }
}
