"use client";

import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
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
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

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
  lecture_live_end?: string;
  joined_students: string[];
}

const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
);

export default function Courses() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedLectureId, setSelectedLectureId] = useState<number | null>(
    null
  );
  const [startDateTime, setStartDateTime] = useState<Date | null>(null);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, loading: userLoading } = useRestrictClient(["admin"]);

  useEffect(() => {
    const fetchLectures = async () => {
      if (!user) {
        console.log("No user available yet");
        return;
      }
      const lecturerEmail = user.user_metadata.email;
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

  const handleScheduleClick = (lectureId: number) => {
    setSelectedLectureId(lectureId);
    const lecture = lectures.find((l) => l.lecture_id === lectureId);
    if (lecture) {
      setStartDateTime(
        lecture.lecture_live_start === "N/A"
          ? null
          : new Date(lecture.lecture_live_start)
      );
      setEndDateTime(
        lecture.lecture_live_end === "N/A" || !lecture.lecture_live_end
          ? null
          : new Date(lecture.lecture_live_end)
      );
    }
    setShowScheduleModal(true);
  };

  const handleScheduleSubmit = async () => {
    if (!selectedLectureId || !startDateTime || !endDateTime) return;

    setIsSubmitting(true);

    const formatDateTime = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const formattedStart = formatDateTime(startDateTime);
    const formattedEnd = formatDateTime(endDateTime);

    try {
      const response = await fetch(
        "/api/active-learning/admin-dashboard/update-lecture-schedule",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lectureId: selectedLectureId,
            lecture_live_start: formattedStart,
            lecture_live_end: formattedEnd,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to update schedule");

      // Update local state
      setLectures((prevLectures) =>
        prevLectures.map((lecture) =>
          lecture.lecture_id === selectedLectureId
            ? {
                ...lecture,
                lecture_live_start: formattedStart,
                lecture_live_end: formattedEnd,
              }
            : lecture
        )
      );

      setShowScheduleModal(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

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
        borderWidth: 3, // Increased from 1 to 3 to make line thicker
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
        min: new Date("2025-03-10T00:00:00").toISOString(),
        max: new Date("2025-03-17T23:59:59").toISOString(),
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        beginAtZero: true,
        max: 5, // Added max value of 5 for y-axis
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
        <Line
          data={chartData}
          options={chartOptions}
          height={300}
          width={600}
        />
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
                  <div className="mt-auto flex justify-end space-x-2">
                    <Link
                      href={`/protected/active-learning/final-data?lectureId=${lecture.lecture_id}`}
                    >
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        Edit
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleScheduleClick(lecture.lecture_id)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      Schedule
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      <Link href="/protected/active-learning/create-course">
        <Button
          variant="outline"
          className="fixed bottom-4 right-4 bg-black text-white hover:bg-white hover:text-black hover:border-2 hover:border-black text-lg py-6 px-8 rounded-xl shadow-lg transition-colors duration-200"
        >
          Create Course
        </Button>
      </Link>

      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Schedule Lecture</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Start Date and Time
              </label>
              <DatePicker
                selected={startDateTime}
                onChange={(date: Date | null) => setStartDateTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-full p-2 border rounded"
                placeholderText="Select start date and time"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                End Date and Time
              </label>
              <DatePicker
                selected={endDateTime}
                onChange={(date: Date | null) => setEndDateTime(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy-MM-dd HH:mm"
                className="w-full p-2 border rounded"
                placeholderText="Select end date and time"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                onClick={handleScheduleSubmit}
                className="bg-black text-white px-4 py-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Spinner /> : "OK"}
              </Button>
              <Button
                onClick={() => setShowScheduleModal(false)}
                className="bg-white text-black border-4 border-black px-4 py-2 hover:bg-white"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
