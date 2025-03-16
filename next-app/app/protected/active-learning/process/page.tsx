"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import ProgressBar from "@/components/ProgressBar";

interface Video {
  id: string;
  url: string;
}

export default function ProcessPage() {
  const [totalProgress, setTotalProgress] = useState<number>(0);
  const [maxProgress, setMaxProgress] = useState<number>(0);
  const maxProgressRef = useRef<number>(0);
  const [currentPhase, setCurrentPhase] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const hasProcessed = useRef<boolean>(false);

  const PROGRESS_DURATION: number = 3 * 60 * 1000; // 3 minutes
  const PHASE_DURATION: number = 3000; // 3 seconds per phase

  const phases: string[] = [
    "Fetching lecture details...",
    "Analyzing lecture...",
    "Transcribing lecture...",
    "Generating Chapters...",
    "Creating Questions...",
    "Creating answers...",
    "Finalizing...",
    "Completed!",
  ];

  useEffect(() => {
    const processVideos = async () => {
      if (hasProcessed.current) return;
      hasProcessed.current = true;

      const videosParam = searchParams.get("videos");
      if (!videosParam) return;

      let videos: Video[];
      try {
        videos = JSON.parse(decodeURIComponent(videosParam)) as Video[];
      } catch (error) {
        console.error("Failed to parse videos:", error);
        return;
      }
      const totalVideos: number = videos.length;

      const startTime: number = Date.now();
      let animationInterval: NodeJS.Timeout = setInterval(() => {
        const elapsed: number = Date.now() - startTime;
        const progressFraction: number = Math.min(
          elapsed / PROGRESS_DURATION,
          1
        );
        const newProgress: number = progressFraction * 75;

        if (newProgress > maxProgressRef.current) {
          maxProgressRef.current = newProgress;
          setTotalProgress(newProgress);
          setMaxProgress(newProgress);
        }

        const phaseIndex: number = Math.min(
          Math.floor((newProgress / 75) * (phases.length - 1)),
          phases.length - 2
        );
        if (phaseIndex > currentPhase) setCurrentPhase(phaseIndex);

        if (newProgress >= 75) clearInterval(animationInterval);
      }, 100);

      for (let i = 0; i < totalVideos; i++) {
        try {
          const response: Response = await fetch(
            "/api/active-learning/process-videos",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ video: videos[i] }),
            }
          );

          if (!response.ok) {
            console.error(
              `Failed to process video ${i + 1}:`,
              await response.text()
            );
          } else {
            console.log(`Video ${i + 1} processed successfully`);
          }
        } catch (error) {
          console.error(`Error processing video ${i + 1}:`, error);
        }

        for (let j = 0; j <= 100; j += 10) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      clearInterval(animationInterval);
      const currentProgress: number = maxProgressRef.current;
      const currentPhaseAtResponse: number = currentPhase;
      const remainingPhases: number =
        phases.length - currentPhaseAtResponse - 1;
      const transitionDuration: number = PHASE_DURATION * remainingPhases;
      const remainingProgress: number = 100 - currentProgress;

      let startTransitionTime: number | null = null;

      const smoothTransition = (timestamp: number) => {
        if (startTransitionTime === null) startTransitionTime = timestamp;
        const elapsed: number = timestamp - startTransitionTime;
        const progressFraction: number = Math.min(
          elapsed / transitionDuration,
          1
        );
        const newProgress: number =
          currentProgress + remainingProgress * progressFraction;

        if (newProgress > maxProgressRef.current) {
          maxProgressRef.current = newProgress;
          setTotalProgress(newProgress);
          setMaxProgress(newProgress);
        }

        const phaseProgress: number = Math.floor(elapsed / PHASE_DURATION);
        const newPhase: number = Math.min(
          currentPhaseAtResponse + phaseProgress,
          phases.length - 1
        );
        if (newPhase > currentPhase) setCurrentPhase(newPhase);

        if (progressFraction < 1) {
          requestAnimationFrame(smoothTransition);
        } else {
          maxProgressRef.current = 100;
          setTotalProgress(100);
          setMaxProgress(100);
          setCurrentPhase(phases.length - 1);
          setIsProcessing(false);
        }
      };

      requestAnimationFrame(smoothTransition);
    };

    processVideos();
  }, [searchParams, phases.length]);

  const handleGoToFinalData = (): void => {
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

        <motion.div
          key={currentPhase}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="text-lg text-center"
        >
          {phases[currentPhase]}
        </motion.div>
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
