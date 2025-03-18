"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRestrictClient, useUserFromCookie } from "@/utils/restrictClient";
import { useRouter } from "next/navigation";

interface Lecture {
  lecture_id: number;
  lecture_title: string;
  description: string;
  lecture_live_start: string;
  lecture_live_end: string;
  is_active: boolean;
  videos: {
    video_url: string;
    video_title: string;
  }[];
}

export default function UpcomingLectures() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useUserFromCookie();
  const router = useRouter();

  // Fetch lectures
  useEffect(() => {
    const fetchLectures = async () => {
      console.log("Fetching lectures...");
      try {
        const response = await fetch("/api/active-learning/get-lecture-data");
        const data = await response.json();

        if (data.error) {
          console.error("API error:", data.error);
          return;
        }

        console.log("Lectures received:", data.lectures);
        setLectures(data.lectures);
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  // Function to validate YYYY-MM-DD format and ensure it's a real date
  const isValidDateString = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    if (!year || !month || !day) return false;
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false; // Basic check, could be refined for month-specific max days
    return true;
  };

  // Function to check if the lecture is currently joinable (date only)
  const isJoinable = (start: string, end: string) => {
    const now = new Date();
    const nowDateStr = now.toISOString().split("T")[0]; // e.g., "2025-03-18"

    // Handle "N/A" cases
    if (start === "N/A" || end === "N/A") {
      console.log("Lecture has N/A date, not joinable:", { start, end });
      return false;
    }

    // Check if start and end are in "YYYY-MM-DD HH:MM:SS" format
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!dateTimeRegex.test(start) || !dateTimeRegex.test(end)) {
      console.error("Invalid date format:", { start, end });
      return false;
    }

    // Extract YYYY-MM-DD directly from the string
    const startDateStr = start.split(" ")[0]; // e.g., "2025-03-18"
    const endDateStr = end.split(" ")[0]; // e.g., "2025-03-18"

    // Validate the extracted dates
    if (!isValidDateString(startDateStr) || !isValidDateString(endDateStr)) {
      console.error("Invalid date values:", { startDateStr, endDateStr });
      return false;
    }

    // Log minimal info
    console.log("Checking joinable:", {
      start,
      end,
      result: startDateStr <= nowDateStr && nowDateStr <= endDateStr,
    });

    // Compare dates only
    return startDateStr <= nowDateStr && nowDateStr <= endDateStr;
  };

  // Sort lectures: joinable at top (most recent first), then non-joinable (upcoming first)
  const sortedLectures = [...lectures].sort((a, b) => {
    const aJoinable = isJoinable(a.lecture_live_start, a.lecture_live_end);
    const bJoinable = isJoinable(b.lecture_live_start, b.lecture_live_end);

    if (aJoinable && !bJoinable) return -1; // Joinable lectures come first
    if (!aJoinable && bJoinable) return 1;

    // Within joinable: most recent start date first (descending)
    if (aJoinable && bJoinable) {
      return b.lecture_live_start.localeCompare(a.lecture_live_start);
    }

    // Within non-joinable: upcoming first (ascending)
    return a.lecture_live_start.localeCompare(b.lecture_live_start);
  });

  // Function to handle joining a lecture
  const handleJoinLecture = async (lecture_id: number) => {
    try {
      const response = await fetch("/api/active-learning/join-lecture", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lecture_id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join lecture");
      }

      console.log(`Successfully joined lecture: ${lecture_id}`);
      router.push(`/protected/active-learning/lecture/${lecture_id}`);
    } catch (error) {
      console.error("Error joining lecture:", error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading lectures...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Upcoming Lectures</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {sortedLectures.map((lecture) => {
            const joinable = isJoinable(
              lecture.lecture_live_start,
              lecture.lecture_live_end
            );
            return (
              <motion.div
                key={lecture.lecture_id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="relative group"
              >
                <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 w-[400px] h-[450px]">
                  <CardContent className="p-4 h-full flex flex-col">
                    <div className="relative w-full h-48 mb-4">
                      <Image
                        src="/placeholder.png"
                        alt={lecture.lecture_title}
                        fill
                        className="object-cover rounded-lg"
                        onError={(e) => {
                          console.log(
                            `Image load error for ${lecture.lecture_title}`
                          );
                          e.currentTarget.src = "/placeholder.png";
                        }}
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <h2 className="text-xl font-semibold mb-2">
                        {lecture.lecture_title}
                      </h2>

                      <p className="text-gray-600 mb-2">
                        {lecture.description || "No description available"}
                      </p>

                      <p className="text-sm text-gray-500 mb-2">
                        Instructor: Mr. Perera
                      </p>

                      <p className="text-sm text-gray-500 mb-4">
                        Starts: {lecture.lecture_live_start}
                      </p>

                      <div className="mt-auto flex justify-end">
                        {joinable ? (
                          <Button
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() =>
                              handleJoinLecture(lecture.lecture_id)
                            }
                          >
                            Join
                          </Button>
                        ) : (
                          <Button
                            disabled
                            className="bg-gray-400 cursor-not-allowed"
                          >
                            Upcoming...
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      <Link href="/my-notes">
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 bg-black text-white hover:bg-white hover:text-black hover:border-2 hover:border-black text-lg py-6 px-8 rounded-xl shadow-lg transition-colors duration-200"
          onClick={() => console.log("Navigating to my notes")}
        >
          Go to My Notes
        </Button>
      </Link>
    </div>
  );
}
