import { NextResponse } from "next/server";
import { getVideoInfo } from "@/lib/youtube";
import { VideoInfo } from "@/types/video";

function convertGoogleDriveLinkToDirectDownload(googleDriveUrl: string) {
  const regex = /\/d\/(.*)\/view/;
  const matches = googleDriveUrl.match(regex);
  if (matches && matches[1]) {
    const fileId = matches[1];
    return `https://drive.google.com/uc?id=${fileId}`;
  } else {
    throw new Error("Invalid Google Drive URL");
  }
}

export async function POST(req: Request) {
  try {
    const { urls } = await req.json();
    const videoInfoPromises = urls.map(async (url: string) => {
      if (url.includes("youtube.com") || url.includes("youtu.be")) {
        return await getVideoInfo(url);
      } else if (url.includes("drive.google.com")) {
        const directUrl = convertGoogleDriveLinkToDirectDownload(url);
        return {
          id: url.match(/\/d\/(.*)\/view/)?.[1] || "",
          title: "Google Drive Video",
          publishedAt: "N/A",
          channelTitle: "N/A",
          duration: "23m 45s",
          thumbnail: "/placeholder.png",
          verified: false,
          source: "google_drive" as const,
          url: directUrl,
        } as VideoInfo;
      } else {
        throw new Error(`Unsupported URL: ${url}`);
      }
    });

    const videoInfo = await Promise.all(videoInfoPromises);
    return NextResponse.json(videoInfo);
  } catch (error) {
    console.error("Error verifying videos:", error);
    return NextResponse.json(
      { error: "Failed to verify videos" },
      { status: 500 }
    );
  }
}
