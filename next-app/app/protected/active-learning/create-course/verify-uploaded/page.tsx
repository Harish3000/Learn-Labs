"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface VideoInfo {
  id: string;
  title: string;
  url: string;
  source: string;
  verified: boolean;
}

export default function VerifyUploadedPage() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const url = searchParams.get("url");
    const title = searchParams.get("title");

    if (!url || !title) {
      console.error("Missing URL or title in query parameters");
      setIsLoading(false);
      return;
    }

    // Construct video info for a single Cloudinary video
    const video: VideoInfo = {
      id: url.split("/").pop()?.split(".")[0] || "uploaded-video", // Extract a simple ID from URL
      title: decodeURIComponent(title),
      url: decodeURIComponent(url),
      source: "cloudinary",
      verified: false,
    };
    console.log("Video info initialized:", video);
    setVideoInfo(video);
    setIsLoading(false);
  }, [searchParams]);

  const toggleVerified = () => {
    if (videoInfo) {
      console.log("Toggling verification for video:", videoInfo);
      setVideoInfo((prev) => prev && { ...prev, verified: !prev.verified });
    }
  };

  const handleStartConversion = () => {
    if (!videoInfo || !videoInfo.verified) {
      console.error("Video not verified or missing");
      return;
    }
    console.log("Starting conversion with video:", videoInfo);
    router.push(
      `/protected/active-learning/process?videos=${encodeURIComponent(JSON.stringify([videoInfo]))}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!videoInfo) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        No video found to verify
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Verify Uploaded Video
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-4">
            <video
              src={videoInfo.url}
              controls
              className="w-full h-auto mb-4 rounded"
            />
            <h2 className="text-xl font-semibold mb-2">{videoInfo.title}</h2>
            <p>Source: {videoInfo.source}</p>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              onClick={toggleVerified}
              variant={videoInfo.verified ? "default" : "outline"}
              className={`w-full ${
                videoInfo.verified
                  ? "bg-green-500 hover:bg-green-600"
                  : "bg-blue-500 hover:bg-blue-600"
              }`}
            >
              {videoInfo.verified ? (
                <CheckCircle className="mr-2 h-4 w-4" />
              ) : (
                <XCircle className="mr-2 h-4 w-4" />
              )}
              {videoInfo.verified ? "Verified" : "Verify"}
            </Button>
            <Button
              onClick={handleStartConversion}
              disabled={!videoInfo.verified}
              className={`w-full h-12 text-lg ${
                videoInfo.verified
                  ? "bg-white text-black hover:bg-gray-100"
                  : "bg-gray-300 text-gray-500"
              }`}
            >
              Start Conversion
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
