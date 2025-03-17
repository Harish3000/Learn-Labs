export interface VideoInfo {
  id: string;
  title: string;
  publishedAt: string;
  channelTitle: string;
  duration: string;
  thumbnail: string;
  verified: boolean;
  source: "youtube" | "google_drive";
  url: string;
}
