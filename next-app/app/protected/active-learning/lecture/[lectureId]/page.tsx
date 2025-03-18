"use client"; // Mark as client component

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import NavBar from "@/app/protected/active-learning/lecture/components/NavBar";
import VideoPlayer from "@/app/protected/active-learning/lecture/components/VideoPlayer";
import ChatPlaceholder from "@/app/protected/active-learning/lecture/components/ChatPlaceholder";
import { Button } from "@/components/ui/button";
import { useRestrictClient, useUserFromCookie } from "@/utils/restrictClient";
import { useRouter } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TranscriptChunk {
  chunk_id: number;
  start_time: string;
  end_time: string;
  text: string;
}

interface Question {
  question_id: number;
  chunk_id: number;
  difficulty: string;
  question: string;
  options: string; // Changed to string to match QuestionPopup
  answer: string;
}

interface Performance {
  question_id: number;
  displayed_difficulty: string;
  attempts: number;
  time_taken: number;
  final_result: boolean;
}

interface LecturePageProps {
  params: { lectureId: string };
}

// Spinner component for loading state
const Spinner = () => (
  <div className="inline-block animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
);

const LecturePage: React.FC<LecturePageProps> = ({ params }) => {
  const user = useUserFromCookie();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");
  const [videoId, setVideoId] = useState<string>("");
  const [transcriptChunks, setTranscriptChunks] = useState<TranscriptChunk[]>(
    []
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<Performance[]>(
    []
  );
  const [lastPerformance, setLastPerformance] = useState<Performance | null>(
    null
  );
  const [currentTime, setCurrentTime] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
    console.log("LecturePage: Component mounted");
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchVideoDetails = async () => {
      console.log(
        "LecturePage: Fetching video details for lectureId:",
        params.lectureId
      );
      const { data, error } = await supabase
        .from("videos")
        .select("video_id, video_url")
        .eq("lecture_id", params.lectureId)
        .single();
      if (error) {
        console.error("LecturePage: Error fetching video details:", error);
      } else {
        console.log("LecturePage: Video details fetched:", data);
        setVideoUrl(data.video_url);
        setVideoId(data.video_id);
      }
    };

    fetchVideoDetails();
  }, [mounted, params.lectureId]);

  useEffect(() => {
    if (!mounted || !videoId) return;

    const fetchTranscriptChunks = async () => {
      console.log(
        "LecturePage: Fetching transcript chunks for videoId:",
        videoId
      );
      const { data, error } = await supabase
        .from("transcript_chunks")
        .select("chunk_id, start_time, end_time, text")
        .eq("video_id", videoId)
        .order("chunk_sequence", { ascending: true });
      if (error) {
        console.error("LecturePage: Error fetching transcript chunks:", error);
      } else {
        console.log("LecturePage: Transcript chunks fetched:", data);
        setTranscriptChunks(data);
      }
    };

    const fetchQuestions = async () => {
      console.log(
        "LecturePage: Fetching questions for lectureId:",
        params.lectureId
      );
      const { data, error } = await supabase
        .from("questions")
        .select("question_id, chunk_id, difficulty, question, options, answer")
        .eq("lecture_id", params.lectureId);
      if (error) {
        console.error("LecturePage: Error fetching questions:", error);
      } else {
        console.log("LecturePage: Questions fetched:", data);
        setQuestions(data);
      }
    };

    fetchTranscriptChunks();
    fetchQuestions();
  }, [mounted, videoId, params.lectureId]);

  const handlePerformanceUpdate = (performance: Performance) => {
    console.log("LecturePage: Performance update received:", performance);
    setPerformanceMetrics((prev) => [...prev, performance]);
    setLastPerformance(performance);
  };

  const submitPerformance = async () => {
    console.log("LecturePage: Submitting performance metrics");
    const payload = {
      student_id: user?.email ?? "Anonymous",
      lecture_id: parseInt(params.lectureId),
      performance: performanceMetrics,
    };
    try {
      const response = await fetch("/api/active-learning/analyze_performance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error("Performance submission failed");
      }
      const result = await response.json();
      console.log("LecturePage: Performance submission result:", result);
      return { success: true };
    } catch (error) {
      console.error("LecturePage: Error submitting performance:", error);
      return { success: false, error };
    }
  };

  const handleOk = async () => {
    setIsSubmitting(true);
    const result = await submitPerformance();
    setIsSubmitting(false);
    if (result.success) {
      setShowConfirmModal(false);
      router.push("/protected/active-learning/lecture");
    } else {
      alert("Failed to submit performance. Please try again.");
    }
  };

  if (!mounted) {
    return <div>Loading...</div>; // Simple placeholder to match server render
  }

  return (
    <div className="flex min-h-screen">
      <NavBar currentTime={currentTime} videoId={videoId} />
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="max-w-4xl w-full">
          <VideoPlayer
            videoUrl={videoUrl}
            transcriptChunks={transcriptChunks}
            questions={questions}
            onTimeUpdate={setCurrentTime}
            onPerformanceUpdate={handlePerformanceUpdate}
            lastPerformance={lastPerformance}
          />
          <div className="mt-4 flex justify-end">
            <Button
              onClick={() => setShowConfirmModal(true)}
              className="px-4 py-2"
            >
              Leave
            </Button>
          </div>
        </div>
      </div>
      <ChatPlaceholder />
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <p>Do you want to leave and submit performance?</p>
            <div className="mt-4 flex justify-end space-x-2">
              <Button
                onClick={() => setShowConfirmModal(false)}
                className="bg-white text-black border-4 border-black px-4 py-2 hover:bg-white"
              >
                Cancel
              </Button>
              <Button
                onClick={handleOk}
                className="bg-black text-white px-4 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "OK"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LecturePage;
