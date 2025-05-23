"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";
import { VideoInfo } from "@/types/video";

export default function VerifyPage() {
  const [videoInfo, setVideoInfo] = useState<VideoInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const fetchVideoInfo = async () => {
      const urlsParam = searchParams.get("urls");
      if (!urlsParam) return;

      const urls = JSON.parse(decodeURIComponent(urlsParam));
      try {
        const response = await fetch("/api/active-learning/verify-videos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls }),
        });

        if (response.ok) {
          const fetchedInfo = await response.json();
          setVideoInfo(fetchedInfo);
        } else {
          console.error("Failed to fetch video info:", await response.text());
        }
      } catch (error) {
        console.error("Error fetching video info:", error);
      }
      setIsLoading(false);
    };

    fetchVideoInfo();
  }, [searchParams]);

  const toggleVerified = (id: string) => {
    setVideoInfo((prev) =>
      prev.map((video) =>
        video.id === id ? { ...video, verified: !video.verified } : video
      )
    );
  };

  const allVerified =
    videoInfo.length > 0 && videoInfo.every((video) => video.verified);

  const handleStartConversion = () => {
    const verifiedVideos = videoInfo.filter((video) => video.verified);
    router.push(
      `/protected/active-learning/process?videos=${encodeURIComponent(JSON.stringify(verifiedVideos))}`
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
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
        Verify Videos
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {videoInfo.map((video, index) => (
          <motion.div
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <Image
                  src={
                    video.thumbnail && video.thumbnail.trim() !== ""
                      ? video.thumbnail
                      : "/placeholder.png"
                  }
                  alt={video.title}
                  width={320}
                  height={180}
                  className="w-full h-auto mb-4 rounded"
                />
                <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                <p>Source: {video.source}</p>
                <p>Duration: {video.duration || "N/A"}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => toggleVerified(video.id)}
                  variant={video.verified ? "default" : "outline"}
                  className={`w-full ${
                    video.verified
                      ? "bg-green-500 hover:bg-green-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  }`}
                >
                  {video.verified ? (
                    <CheckCircle className="mr-2 h-4 w-4" />
                  ) : (
                    <XCircle className="mr-2 h-4 w-4" />
                  )}
                  {video.verified ? "Verified" : "Verify"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-center"
      >
        <Button
          onClick={handleStartConversion}
          disabled={!allVerified}
          className={`w-64 h-16 text-xl ${
            allVerified
              ? "bg-white text-black hover:bg-gray-100"
              : "bg-gray-300 text-gray-500"
          }`}
        >
          Start Conversion
        </Button>
      </motion.div>
    </div>
  );
}
