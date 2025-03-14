"use client";

import { faThumbsDown, faThumbsUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { createClient } from "@supabase/supabase-js";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LineController,
  PointElement
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Utility function to clean bot response
const cleanBotResponse = (botResponse: string) => {
  try {
    // Try to parse the bot response if it's in JSON format
    const parsedResponse = JSON.parse(botResponse);

    // Extract the "res" and "timestamp" values if available
    if (parsedResponse && parsedResponse.res && parsedResponse.timestamp) {
      return `${parsedResponse.res} (Given Timestamp: ${parsedResponse.timestamp})`;
    }

    // If the response is not in the expected format, return it as-is
    return botResponse;
  } catch (error) {
    // If parsing fails, return the original bot response
    return botResponse;
  }
};

// FeedbackChart component (Bar Chart)
const FeedbackChart = ({ feedbackData }: { feedbackData: any[] }) => {
  const thumbsUpCount = feedbackData.filter((item) => item.thumbs_up).length;
  const thumbsDownCount = feedbackData.length - thumbsUpCount;

  const chartData = {
    labels: ["Thumbs Up", "Thumbs Down"],
    datasets: [
      {
        label: "Feedback Count",
        data: [thumbsUpCount, thumbsDownCount],
        backgroundColor: ["#22D3EE", "#F87171"],
        borderColor: ["#0EA5E9", "#F43F5E"],
        borderWidth: 1,
        borderRadius: 18,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            family: "Inter, sans-serif",
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: "Feedback Summary",
        font: {
          family: "Inter, sans-serif",
          size: 20,
          weight: "bold",
        },
        padding: {
          top: 20,
          bottom: 30,
        },
      },
    },
    layout: {
      padding: 20,
    },
  };

  return (
    <div className="h-72 bg-white shadow-lg rounded-lg p-6 flex justify-center pl-12">
      <Bar data={chartData} />
    </div>
  );
};

// LineFeedbackChart component (Line Chart)
const LineFeedbackChart = ({ feedbackData }: { feedbackData: any[] }) => {
  const chartData = {
    labels: feedbackData.map((feedback) =>
      new Date(feedback.created_at).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Thumbs Up Trend",
        data: feedbackData.map((feedback) => (feedback.thumbs_up ? 1 : 0)),
        fill: true,
        backgroundColor: "rgba(6, 182, 212, 0.2)",
        borderColor: "#06B6D4",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "#06B6D4",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        hoverBackgroundColor: "#06B6D4",
        hoverBorderColor: "#ffffff",
      },
      {
        label: "Thumbs Down Trend",
        data: feedbackData.map((feedback) => (feedback.thumbs_up ? 0 : 1)),
        fill: true,
        backgroundColor: "rgba(244, 63, 94, 0.2)",
        borderColor: "#F43F5E",
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: "#F43F5E",
        pointBorderColor: "#ffffff",
        pointBorderWidth: 2,
        pointRadius: 6,
        hoverBackgroundColor: "#F43F5E",
        hoverBorderColor: "#ffffff",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Feedback Trend Over Time",
      },
    },
  };

  return (
    <div className="h-72 bg-white shadow-lg rounded-lg p-6 flex justify-center pl-12">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
};

// StatisticCard component
const StatisticCard = ({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-2xl transition duration-300 ease-in-out">
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
};

// FeedbackTable component with pagination
const FeedbackTable = ({ feedbackData }: { feedbackData: any[] }) => {
  const [currentPage, setCurrentPage] = useState(1); // Track current page
  const rowsPerPage = 5; // Set number of rows per page

  // Calculate the index of the last row on the current page
  const indexOfLastRow = currentPage * rowsPerPage;

  // Calculate the index of the first row on the current page
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;

  // Get the current rows based on the current page
  const currentRows = feedbackData.slice(indexOfFirstRow, indexOfLastRow);

  // Calculate total pages
  const totalPages = Math.ceil(feedbackData.length / rowsPerPage);

  // Handle page change
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <div className="bg-white rounded-lg shadow-xl p-6 mt-6">
      <table className="min-w-full table-auto">
        <thead>
          <tr>
            <th className="text-left py-4 px-6 border-b text-sm font-semibold text-gray-600 uppercase tracking-wide">
              User Message
            </th>
            <th className="text-left py-4 px-6 border-b text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Bot Response
            </th>
            <th className="text-left py-4 px-6 border-b text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Satisfaction
            </th>
            <th className="text-left py-4 px-6 border-b text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Timestamp
            </th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((feedback) => (
            <tr
              key={feedback.id}
              className="hover:bg-gray-50 transition duration-300 ease-in-out hover:scale-105"
            >
              <td className="py-4 px-6 border-b text-sm text-gray-800 font-medium">
                {feedback.user_message}
              </td>
              <td className="py-4 px-6 border-b text-sm text-gray-800 font-medium">
                {/* Clean bot response before rendering */}
                {cleanBotResponse(feedback.bot_response)}
              </td>
              <td className="py-4 px-6 border-b text-sm text-gray-800 font-medium">
                {feedback.thumbs_up ? (
                  <FontAwesomeIcon
                    icon={faThumbsUp}
                    className="text-blue-500"
                  />
                ) : (
                  <FontAwesomeIcon icon={faThumbsDown} className="text-black" />
                )}
              </td>
              <td className="py-4 px-6 border-b text-sm text-gray-800 font-medium">
                {new Date(feedback.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="mt-4 flex justify-between items-center">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-gray-700">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="bg-gray-300 px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Page Numbers */}
      <div className="mt-4 flex justify-center space-x-2">
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-4 py-2 rounded-lg ${
              currentPage === index + 1
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            }`}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

// Dashboard component
const Dashboard = () => {
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeedbackData = async () => {
      const { data, error } = await supabase
        .from("feedback")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching feedback data:", error);
      } else {
        setFeedbackData(data);
      }
    };

    fetchFeedbackData();
  }, []);

  // Calculate statistics based on feedback data
  const totalFeedback = feedbackData.length;
  const thumbsUpCount = feedbackData.filter((item) => item.thumbs_up).length;
  const thumbsDownCount = totalFeedback - thumbsUpCount;

  return (
    <div className="bg-gray-50 min-h-screen pt-10 pb-20 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-semibold text-gray-800 mb-8">
          Welcome to the Instructor Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatisticCard title="Total Feedback" value={totalFeedback} />
          <StatisticCard title="Positive Ratings" value={thumbsUpCount} />
          <StatisticCard title="Negative Ratings" value={thumbsDownCount} />
        </div>

        <div className="mt-12">
          <FeedbackChart feedbackData={feedbackData} />
        </div>

        <div className="mt-12">
          <LineFeedbackChart feedbackData={feedbackData} />
        </div>

        <div className="mt-12">
          <FeedbackTable feedbackData={feedbackData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
