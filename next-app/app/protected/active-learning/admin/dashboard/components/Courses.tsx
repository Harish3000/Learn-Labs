"use client";

import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { useRestrictClient } from "@/utils/restrictClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

interface Lecture {
  lecture_id: number;
  lecture_title: string;
  lecture_live_start: string;
  joined_students: string[];
}

export default function Courses() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { user, loading: userLoading } = useRestrictClient(["admin"]);

  useEffect(() => {
    const fetchLectures = async () => {
      if (!user) {
        console.log("No user available yet");
        return;
      }
      const lecturerEmail = user.user_metadata.email; // Use email from user_metadata
      console.log(`Fetching lectures for email: ${lecturerEmail}`);
      const response = await fetch(
        `/api/active-learning/admin-dashboard/get-lecturer-lectures?email=${lecturerEmail}`
      );
      const data = await response.json();
      if (data.error) {
        console.error("API error:", data.error);
        return;
      }
      console.log("Lectures fetched:", data.lectures);
      setLectures(data.lectures);
      setLoading(false);
    };

    if (!userLoading) {
      console.log("User loaded, fetching lectures...");
      fetchLectures();
    } else {
      console.log("Waiting for user to load...");
    }
  }, [user, userLoading]);

  if (loading || userLoading || !user) {
    console.log("Rendering loading state...");
    return <div className="text-center py-10">Loading...</div>;
  }

  const chartData = {
    labels: lectures.map((lecture) => new Date(lecture.lecture_live_start)),
    datasets: [
      {
        label: "Engagement",
        data: lectures.map((lecture) => lecture.joined_students.length),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: {
          unit: "day" as const,
        },
        min: new Date("2025-03-10T00:00:00").toISOString(), // One week ago
        max: new Date("2025-03-17T23:59:59").toISOString(), // Today
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Engagement (Number of Students)",
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          title: (tooltipItems: { dataIndex: number }[]) => {
            const index = tooltipItems[0].dataIndex;
            return lectures[index].lecture_title;
          },
        },
      },
      legend: {
        display: true,
      },
    },
  };

  console.log("Rendering Courses component with lectures:", lectures);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Courses</h1>
      <div className="bg-white p-4 rounded-lg shadow">
        <Bar data={chartData} options={chartOptions} height={300} width={600} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {lectures.map((lecture) => (
            <motion.div
              key={lecture.lecture_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-4 flex flex-col h-full">
                  <h2 className="text-xl font-semibold mb-2">
                    {lecture.lecture_title}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Starts: {lecture.lecture_live_start}
                  </p>
                  <div className="mt-auto flex justify-end">
                    <Link
                      href={`/dashboard/edit-lecture/${lecture.lecture_id}`}
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Link href="/dashboard/create-lecture">
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 bg-black text-white hover:bg-white hover:text-black hover:border-2 hover:border-black text-lg py-6 px-8 rounded-xl shadow-lg transition-colors duration-200"
        >
          Create Course
        </Button>
      </Link>
    </div>
  );
}
