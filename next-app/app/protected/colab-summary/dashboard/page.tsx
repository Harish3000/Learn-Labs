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

  useEffect(() => {
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

    fetchSummaries();
  }, []);

  // Prepare data for the chart
  const chartData = {
    labels: summaries.map((item) => item.firstname),
    datasets: [
      {
        label: "Accuracy",
        data: summaries.map((item) => item.accuracy),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
        hoverBackgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4BC0C0",
          "#9966FF",
          "#FF9F40",
        ],
      },
    ],
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">
          What your friends think
        </h1>
        {loading ? (
          <p className="text-gray-600 mt-6">Loading summaries...</p>
        ) : summaries.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="overflow-x-auto">
                <table className="w-full bg-white rounded-lg shadow-lg border-collapse">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-4 border-b font-medium text-gray-700">
                        Name
                      </th>
                      <th className="p-4 border-b font-medium text-gray-700">
                        Summary
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaries.map((item, index) => (
                      <tr key={index} className="border-t">
                        <td className="p-4">{item?.firstname}</td>
                        <td className="p-4">{item?.gemini_summary}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center justify-center">
                <div className="w-full">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                    Accuracy Chart
                  </h2>
                  <Pie data={chartData} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <p className="text-gray-600 mt-6">No summaries available.</p>
        )}
      </div>
    </main>
  );
}
