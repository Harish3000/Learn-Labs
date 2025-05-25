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
import { sync } from "framer-motion";

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
  const [summaryAnalysis, setSummaryAnalysis] = useState<any>(null);
  const [lectureContent, setLectureContent] = useState("");
  const [summaryID, setSummaryID] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [lectureID, setLectureID] = useState<any>();
  const [lectureData, setLectureData] = useState<any>(null);

  useEffect(() => {
    const SUmmaryAnalysisData = localStorage.getItem("summaryAnalysis");

    // Check if finalSummaryData is null before parsing
    if (SUmmaryAnalysisData) {
      const parsedData = JSON.parse(SUmmaryAnalysisData);
      setSummaryAnalysis(parsedData);
    } else {
      // Handle the case when there's no data in localStorage
      setSummaryAnalysis(null); // Or set a default value if needed
    }

    const lecturePara = localStorage.getItem("lectureContent");
    if (lecturePara) {
      setLectureContent(lecturePara); // directly set it
    } else {
      setLectureContent(""); // fallback
    }

    const lectureID = localStorage.getItem("lectureID");
    setLectureID(lectureID);

    const storedSummaryID = localStorage.getItem("summaryID");
    setSummaryID(storedSummaryID);

    if (lectureID) {
      fetchLectureData(lectureID);
    }


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

  //Fetch lecture data based on the lecture ID
  const fetchLectureData = async (lectureID: string) => {
    try {
      const response = await fetch(
        `/api/colab-summary/lectureData?lectureID=${lectureID}`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error("Error fetching lecture data:", data.error);
        setLectureData(null); // Or handle as needed
      } else {
        setLectureData(data[0]); // Assuming data is an array with one lecture
        console.log("lecture data : ", data[0]);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setLectureData(null);
    } finally {
      setLoading(false);
    }
  };

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

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-white text-xl font-semibold">
        <div className="flex flex-col items-center">
          <div className="animate-spin w-10 h-10 mb-4 border-4 border-white border-t-transparent rounded-full"></div>
          <p>Hang on... fetching data</p>
        </div>
      </div>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-semibold text-gray-800 mb-4 text-center mt-4">Student Dashboard</h1>
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Sidebar (2/5 width) */}
          <div className="lg:col-span-2 bg-white shadow-lg p-4 rounded-md">
            <div className="text-gray-600">
              <h3 className="text-xl font-semibold mb-2">Lecture Information</h3>
              {lectureData ? (
                <div className="space-y-1 text-lg">
                  <p><span className="font-semibold">Title:</span> {lectureData.lecture_title}</p>
                  <p><span className="font-semibold">Description:</span> {lectureData.description}</p>
                  <p><span className="font-semibold">Lecturer Email:</span> {lectureData.lecturer_email}</p>
                  <p><span className="font-semibold">Upload Date:</span> {new Date(lectureData.upload_date).toLocaleDateString()}</p>
                  <p><span className="font-semibold">Live Start:</span> {lectureData.lecture_live_start}</p>
                  <p><span className="font-semibold">Live End:</span> {lectureData.lecture_live_end}</p>
                </div>
              ) : (
                <p className="text-lg text-red-500 text-justify">No lecture data available</p>
              )}
            </div>

            <div className="mt-4">
              <h3 className="text-xl font-semibold mb-2">Final Summary</h3>
              <p className="text-lg text-justify">{summaries[0]?.model_summary || "No finalized summary available."}</p>
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
          </div>
        </div>
      </div>

    </main>
  );
}
