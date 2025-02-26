"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

export default function ProcessPage() {
  const [totalProgress, setTotalProgress] = useState(0);
  const [currentVideoProgress, setCurrentVideoProgress] = useState(0);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const processVideos = async () => {
      const videosParam = searchParams.get("videos");
      if (!videosParam) return;

      const videos = JSON.parse(decodeURIComponent(videosParam));
      console.log(videos);
      const totalVideos = videos.length;

      for (let i = 0; i < totalVideos; i++) {
        setCurrentVideoIndex(i);
        setCurrentVideoProgress(0);

        try {
          const response = await fetch("/api/active-learning/process-videos", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ video: videos[i] }),
          });

          if (response.ok) {
            console.log(`Video ${i + 1} processed successfully`);
          } else {
            console.error(
              `Failed to process video ${i + 1}:`,
              await response.text()
            );
          }
        } catch (error) {
          console.error(`Error processing video ${i + 1}:`, error);
        }

        // Simulate progress for each video (10 seconds)
        for (let j = 0; j <= 100; j += 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          setCurrentVideoProgress(j);
          setTotalProgress(((i * 100 + j) / (totalVideos * 100)) * 100);
        }
      }

      setIsProcessing(false);
    };

    processVideos();
  }, []);

  const handleGoToFinalData = () => {
    router.push("/protected/active-learning/final-data");
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold mb-6 text-center"
      >
        Processing Videos
      </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-xl font-semibold">Total Progress</h2>
        <ProgressBar value={totalProgress} />

        <h2 className="text-xl font-semibold mt-4">
          Current Video Progress (Video {currentVideoIndex + 1})
        </h2>
        <ProgressBar value={currentVideoProgress} />
      </motion.div>

      {!isProcessing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <Button
            onClick={handleGoToFinalData}
            className="w-64 h-16 text-xl bg-white text-black hover:bg-gray-100"
          >
            Go to Final Data
          </Button>
        </motion.div>
      )}
    </div>
  );
}
