"use client";

import { useEffect, useState } from "react";
import { Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { FaExclamationTriangle } from "react-icons/fa";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Define a type for the summary data
interface Summary {
  id: number;
  created_at: string;
  student_input: string;
  model_summary: string;
  correctness: string; // correctness is received as a string
  missed_points: string[];
  breakroom_details: number;
}

export default function Summaries() {
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [finalSummary, setFinalSummary] = useState<any>(null);
  const [lectureContent, setLectureContent] = useState<any[]>([]);
  const [summaryID, setSummaryID] = useState<string | null>(null);

  useEffect(() => {
    const finalSummaryData = localStorage.getItem("finalSummary");

    // Check if finalSummaryData is null before parsing
    if (finalSummaryData) {
      const parsedData = JSON.parse(finalSummaryData);
      setFinalSummary(parsedData);
    } else {
      // Handle the case when there's no data in localStorage
      setFinalSummary(null); // Or set a default value if needed
    }

    const lectureData = localStorage.getItem("lectureContent");
    if (lectureData) {
      try {
        const parsedData = JSON.parse(lectureData);
        if (Array.isArray(parsedData)) {
          setLectureContent(parsedData);
        } else {
          setLectureContent([]);
        }
      } catch (error) {
        console.error("Error parsing lecture content:", error);
        setLectureContent([]);
      }
    } else {
      setLectureContent([]);
    }

    const storedSummaryID = localStorage.getItem("summaryID");
    setSummaryID(storedSummaryID);

    const fetchSummaries = async () => {
      if (!storedSummaryID) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/colab-summary/gemini?summaryID=${storedSummaryID}`
        );
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching summaries:", data.error);
        } else {
          setSummaries(data);
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, []);

  // Prepare correctness data for the chart
  const correctnessPercentage = summaries[0]?.correctness
    ? Number(summaries[0]?.correctness)
    : 0;
  const incorrectPercentage = 100 - correctnessPercentage;

  const chartData = {
    labels: ["Correctness", "Incorrectness"],
    datasets: [
      {
        data: [correctnessPercentage, incorrectPercentage],
        backgroundColor: ["#4CAF50", "#FF5252"],
        hoverBackgroundColor: ["#45A049", "#E53935"],
      },
    ],
  };

  return (
    <main className="bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4 text-center mt-4">Student Dashboard</h1>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar (2/5 width) */}
          <div className="lg:col-span-2 bg-white shadow-lg p-4 rounded-md">
            <div className="text-gray-600">
              <h3 className="text-xl font-semibold mb-2">Lecture Information</h3>
              {lectureContent.length > 0 ? (
                <p className="text-lg text-justify">{lectureContent[0]?.lecture?.lecture_title}</p>
              ) : (
                <p className="text-lg text-red-500 text-justify">No lecture data available</p>
              )}
            </div>
            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Final Summary</h3>
              <p className="text-lg text-justify">{finalSummary || "No finalized summary available."}</p>
            </div>
          </div>

          {/* Main Content (3/5 width) */}
          <div className="lg:col-span-3 bg-white shadow-lg p-6 rounded-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Summary</h2>
            <p className="text-lg text-gray-600 text-justify">{summaries[0]?.student_input || "No summary available."}</p>

            {/* Correctness Chart */}
            {summaries.length > 0 && (
              <div className="w-full lg:w-1/2 mt-6 mx-auto">
                <h3 className="text-lg font-semibold mb-2">Correctness Analysis</h3>
                <Pie data={chartData} />
              </div>
            )}

            {/* Missed Points */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">What You Missed</h3>
              {summaries[0]?.missed_points ? (
                <ul className="list-disc list-inside pl-4">
                  {Array.isArray(summaries[0]?.missed_points)
                    ? summaries[0]?.missed_points.map((point, index) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))
                    : JSON.parse(summaries[0]?.missed_points).map((point: string, index: number) => (
                      <li key={index} className="text-gray-700">{point}</li>
                    ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-justify">No missed points recorded.</p>
              )}
            </div>

            {/* Warning Section */}
            <div className="mt-6 p-4 bg-red-500 text-white rounded-md flex items-center">
              <FaExclamationTriangle className="mr-2 text-7xl" />
              <p className="text-lg">
                If you have misused your meeting room time. This will be notified by your lecturer or instructor.
              </p>
            </div>

          </div>
        </div>
      </div>

    </main>
  );
}
