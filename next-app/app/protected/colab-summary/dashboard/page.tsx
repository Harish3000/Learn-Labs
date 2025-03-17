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

ChartJS.register(ArcElement, Tooltip, Legend, Title);

// Define a type for the summary data
interface Summary {
  firstname: string;
  accuracy: number;
  gemini_summary: string;
}

export default function Summaries() {
  // Specify the type for the summaries state
  const [summaries, setSummaries] = useState<Summary[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [finalSummary, setFinalSummary] = useState<any>();
  const [lectureContent, setLectureContent] = useState<any>();

  useEffect(() => {
    const finalSummary = localStorage.getItem("finalSummary");
    setFinalSummary(finalSummary);

    const fetchSummaries = async () => {
      try {
        const response = await fetch("/api/colab-summary/gemini");
        const data = await response.json();
        
        if (!response.ok) {
          console.error("Error fetching summaries:", data.error);
        } else {
          setSummaries(data); // Assume the data is in the correct format
        }
      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    const lectureData = localStorage.getItem("lectureContent");
    setLectureContent(lectureContent);

    fetchSummaries();
  }, []);

  return (
    <main>
      <div>
        <h1 className="text-4xl font-semibold text-gray-800 mb-4">
          Student Dashboard
        </h1>

        <section>
          <h2>Lecture : </h2>
        </section>


      </div>
    </main>
  );
}
