// app/lectures/page.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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

  if (loading) {
    return <div className="text-center py-10">Loading lectures...</div>;
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Upcoming Lectures</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {lectures.map((lecture) => (
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
                      <Link
                        href={`/protected/active-learning/lecture/${lecture.lecture_id}`}
                      >
                        <Button
                          className="bg-blue-600 hover:bg-blue-700"
                          onClick={() =>
                            console.log(
                              `Joining lecture: ${lecture.lecture_id}`
                            )
                          }
                        >
                          Join
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
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
