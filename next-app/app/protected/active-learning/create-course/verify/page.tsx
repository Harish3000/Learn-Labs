"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CheckCircle, XCircle } from "lucide-react";

interface VideoInfo {
  id: string;
  title: string;
  publishedAt: string;
  channelTitle: string;
  duration: string;
  thumbnail: string;
  verified: boolean;
}

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
      const response = await fetch("/api/active-learning/create-course", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ links: urls }),
      });

      if (!response.ok) throw new Error("Failed to fetch video info");
      const data = await response.json();
      setVideoInfo(
        data.videoInfo.map((video: any) => ({ ...video, verified: false }))
      );
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
        Verify YouTube Videos
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
                  src={video.thumbnail}
                  alt={video.title}
                  width={320}
                  height={180}
                  className="w-full h-auto mb-4 rounded"
                />
                <h2 className="text-xl font-semibold mb-2">{video.title}</h2>
                <p>Channel: {video.channelTitle}</p>
                <p>
                  Published: {new Date(video.publishedAt).toLocaleDateString()}
                </p>
                <p>Duration: {video.duration}</p>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={() => toggleVerified(video.id)}
                  variant={video.verified ? "default" : "outline"}
                  className={`w-full ${video.verified ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"}`}
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
          disabled={!allVerified}
          className={`w-64 h-16 text-xl ${allVerified ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-gray-500"}`}
          onClick={() => {
            // Here you would typically save the verified course data
            // For this example, we'll just log it and go back to the create course page
            console.log("Verified course data:", videoInfo);
            router.push("/protected/active-learning/create-course");
          }}
        >
          Start Conversion
        </Button>
      </motion.div>
    </div>
  );
}
