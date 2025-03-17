// src/app/protected/active-learning/lecture/components/VideoPlayer.tsx

"use client"; // Mark as client component

import React, { useState, useRef, useEffect } from "react";
import ReactPlayer from "react-player";
import QuestionPopup from "./QuestionPopup";
import { Button } from "@/components/ui/button";
import { Play, Pause, Volume2, Maximize } from "lucide-react";

interface TranscriptChunk {
  chunk_id: number;
  start_time: string;
  end_time: string;
}

interface Question {
  question_id: number;
  chunk_id: number;
  difficulty: string;
  question: string;
  options: { [key: string]: string };
  answer: string;
}

interface Performance {
  question_id: number;
  displayed_difficulty: string;
  attempts: number;
  time_taken: number;
  final_result: boolean;
}

interface VideoPlayerProps {
  videoUrl: string;
  transcriptChunks: TranscriptChunk[];
  questions: Question[];
  onTimeUpdate: (time: number) => void;
  onPerformanceUpdate: (performance: Performance) => void;
  lastPerformance: Performance | null;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoUrl,
  transcriptChunks,
  questions,
  onTimeUpdate,
  onPerformanceUpdate,
  lastPerformance,
}) => {
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [lastChunkId, setLastChunkId] = useState<number | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  useEffect(() => {
    console.log("VideoPlayer: Component mounted");
    const interval = setInterval(() => {
      if (playerRef.current) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);
        onTimeUpdate(time);

        const chunkEnding = transcriptChunks.find(
          (chunk) =>
            time >= parseFloat(chunk.end_time) - 0.1 &&
            time < parseFloat(chunk.end_time) + 0.1 &&
            chunk.chunk_id !== lastChunkId
        );
        if (chunkEnding && !showQuestion) {
          const chunkQuestions = questions.filter(
            (q) => q.chunk_id === chunkEnding.chunk_id
          );
          if (chunkQuestions.length > 0) {
            const difficulty = determineDifficulty();
            const question =
              chunkQuestions.find((q) => q.difficulty === difficulty) ||
              chunkQuestions[0];
            setCurrentQuestion(question);
            setShowQuestion(true);
            setPlaying(false);
            setLastChunkId(chunkEnding.chunk_id);
            console.log(
              "VideoPlayer: Showing question for chunk:",
              chunkEnding.chunk_id,
              "Difficulty:",
              difficulty
            );
          }
        }
      }
    }, 100);
    return () => clearInterval(interval);
  }, [
    transcriptChunks,
    questions,
    onTimeUpdate,
    showQuestion,
    lastChunkId,
    lastPerformance,
  ]);

  const determineDifficulty = (): string => {
    const difficulties = ["1", "2", "3"];
    if (!lastPerformance) {
      const randomDifficulty =
        difficulties[Math.floor(Math.random() * difficulties.length)];
      console.log(
        "VideoPlayer: First question, random difficulty:",
        randomDifficulty
      );
      return randomDifficulty;
    }
    const { final_result, displayed_difficulty, attempts } = lastPerformance;
    console.log("VideoPlayer: Last performance:", lastPerformance);

    if (final_result) {
      if (attempts === 1) {
        if (displayed_difficulty === "1") return "2";
        if (displayed_difficulty === "2") return "3";
        return "3";
      } else if (attempts === 2) {
        return displayed_difficulty;
      } else {
        if (displayed_difficulty === "3") return "2";
        if (displayed_difficulty === "2") return "1";
        return "1";
      }
    } else {
      if (displayed_difficulty === "3") return "2";
      if (displayed_difficulty === "2") return "1";
      return "1";
    }
  };

  const handleQuestionClose = (performance: Performance) => {
    console.log(
      "VideoPlayer: Question popup closed with performance:",
      performance
    );
    setShowQuestion(false);
    onPerformanceUpdate(performance);
    setPlaying(true);
    console.log("VideoPlayer: Video resumed immediately after popup close");
  };

  const handlePlayPause = () => {
    setPlaying(!playing);
    console.log("VideoPlayer: Play/Pause toggled, playing:", !playing);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    console.log("VideoPlayer: Volume changed to:", newVolume);
  };

  const handleFullscreen = () => {
    if (playerRef.current?.getInternalPlayer()) {
      playerRef.current.getInternalPlayer().requestFullscreen();
      console.log("VideoPlayer: Fullscreen requested");
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <div className="relative">
      <div className="border-4 border-black rounded-lg overflow-hidden">
        <ReactPlayer
          ref={playerRef}
          url={videoUrl}
          playing={playing}
          volume={volume}
          controls={false}
          width="100%"
          height="100%"
          onPlay={() => {
            setPlaying(true);
            console.log("VideoPlayer: Video started playing");
          }}
          onPause={() => {
            setPlaying(false);
            console.log("VideoPlayer: Video paused");
          }}
          onDuration={(dur) => setDuration(dur)}
        />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Button onClick={handlePlayPause} variant="outline">
          {playing ? (
            <Pause className="h-6 w-6" />
          ) : (
            <Play className="h-6 w-6" />
          )}
        </Button>
        <span>
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
        <div className="flex items-center">
          <Volume2 className="h-6 w-6 mr-2" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={volume}
            onChange={handleVolumeChange}
            className="w-24"
            aria-label="Volume"
          />
        </div>
        <Button onClick={handleFullscreen} variant="outline">
          <Maximize className="h-6 w-6" />
        </Button>
      </div>
      {showQuestion && currentQuestion && (
        <QuestionPopup
          question={currentQuestion}
          onClose={handleQuestionClose}
        />
      )}
    </div>
  );
};

export default VideoPlayer;
