// src/app/protected/active-learning/lecture/components/NavBar.tsx

"use client"; // Mark as client component

import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useParams } from "next/navigation";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface TranscriptChunk {
  chunk_id: number;
  start_time: string;
  end_time: string;
  text: string;
}

interface Lecture {
  lecture_title: string;
  description: string;
}

const NavBar: React.FC<{ currentTime: number; videoId: string }> = ({
  currentTime,
  videoId,
}) => {
  const [mounted, setMounted] = useState(false);
  const params = useParams();
  const lectureId = params.lectureId as string;
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [chapters, setChapters] = useState<TranscriptChunk[]>([]);
  const [highlightedChapter, setHighlightedChapter] = useState<number | null>(
    null
  );
  const [lastHighlighted, setLastHighlighted] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    console.log("NavBar: Component mounted");
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const fetchLecture = async () => {
      console.log("NavBar: Fetching lecture details for lectureId:", lectureId);
      const { data, error } = await supabase
        .from("lectures")
        .select("lecture_title, description")
        .eq("lecture_id", lectureId)
        .single();
      if (error) {
        console.error("NavBar: Error fetching lecture:", error);
      } else {
        console.log("NavBar: Lecture fetched:", data);
        setLecture(data);
      }
    };

    const fetchChapters = async () => {
      console.log("NavBar: Fetching chapters for videoId:", videoId);
      const { data, error } = await supabase
        .from("transcript_chunks")
        .select("chunk_id, start_time, end_time, text")
        .eq("video_id", videoId)
        .order("chunk_sequence", { ascending: true });
      if (error) {
        console.error("NavBar: Error fetching chapters:", error);
      } else {
        console.log("NavBar: Chapters fetched:", data);
        setChapters(data);
      }
    };

    fetchLecture();
    if (videoId) fetchChapters();
  }, [mounted, lectureId, videoId]);

  useEffect(() => {
    if (!mounted || chapters.length === 0) return;

    const currentChapter = chapters.find(
      (chapter) =>
        currentTime >= parseFloat(chapter.start_time) &&
        currentTime < parseFloat(chapter.end_time)
    );
    const newHighlighted = currentChapter?.chunk_id || null;
    if (newHighlighted !== lastHighlighted) {
      console.log(
        "NavBar: Chapter changed to:",
        newHighlighted,
        "at time:",
        currentTime
      );
      setHighlightedChapter(newHighlighted);
      setLastHighlighted(newHighlighted);
    }
  }, [currentTime, chapters, mounted, lastHighlighted]);

  if (!mounted) {
    return <div>Loading...</div>; // Simple placeholder to match server render
  }

  return (
    <div className="w-1/4 p-6 bg-gray-50 h-screen overflow-y-auto">
      {lecture ? (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            {lecture.lecture_title}
          </h1>
          <p className="text-gray-600 mt-2">{lecture.description}</p>
        </div>
      ) : (
        <p className="text-gray-500">Loading lecture...</p>
      )}
      <div>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Chapters</h2>
        <ul className="space-y-2">
          {chapters.map((chapter, index) => (
            <li
              key={chapter.chunk_id}
              className={`p-3 rounded-lg transition-colors ${
                highlightedChapter === chapter.chunk_id
                  ? "bg-blue-100 text-blue-800"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Chapter {index + 1}: {chapter.text.substring(0, 30)}...
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NavBar;
