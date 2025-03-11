"use client";

import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Title,
  Tooltip,
} from "chart.js";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";

// Register chart components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// FeedbackChart component
const FeedbackChart = ({ feedbackData }: { feedbackData: any[] }) => {
  const thumbsUpCount = feedbackData.filter((item) => item.thumbs_up).length;
  const thumbsDownCount = feedbackData.length - thumbsUpCount;

  const chartData = {
    labels: ["Thumbs Up", "Thumbs Down"],
    datasets: [
      {
        label: "Feedback Count",
        data: [thumbsUpCount, thumbsDownCount],
        backgroundColor: ["#4CAF50", "#F44336"],
        borderColor: ["#4CAF50", "#F44336"],
        borderWidth: 1,
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
        text: "Feedback Summary",
      },
    },
  };

  return (
    <div className="h-72">
      <Bar data={chartData} options={chartOptions} />
    </div>
  );
};

// FeedbackTable component
const FeedbackTable = ({ feedbackData }: { feedbackData: any[] }) => {
  return (
    <table className="w-full table-auto">
      <thead>
        <tr>
          <th className="text-left py-2 px-4 border-b">User</th>
          <th className="text-left py-2 px-4 border-b">Message</th>
          <th className="text-left py-2 px-4 border-b">Thumbs Up</th>
          <th className="text-left py-2 px-4 border-b">Timestamp</th>
        </tr>
      </thead>
      <tbody>
        {feedbackData.map((feedback) => (
          <tr key={feedback.id}>
            <td className="py-2 px-4 border-b">{feedback.user_message}</td>
            <td className="py-2 px-4 border-b">{feedback.bot_response}</td>
            <td className="py-2 px-4 border-b">
              {feedback.thumbs_up ? "👍" : "👎"}
            </td>
            <td className="py-2 px-4 border-b">
              {new Date(feedback.created_at).toLocaleString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
};

// Dashboard component
const Dashboard = () => {
  const [feedbackData, setFeedbackData] = useState<any[]>([]);

  useEffect(() => {
    // Sample feedback data
    setFeedbackData([
      {
        id: "1",
        user_message: "What is the capital of France?",
        bot_response: "The capital of France is Paris.",
        thumbs_up: true,
        created_at: "2025-03-10T12:00:00Z",
      },
      {
        id: "2",
        user_message: "Explain photosynthesis.",
        bot_response:
          "Photosynthesis is the process by which plants make their own food.",
        thumbs_up: false,
        created_at: "2025-03-10T12:05:00Z",
      },
      {
        id: "3",
        user_message: "How does gravity work?",
        bot_response:
          "Gravity is the force that attracts objects towards the center of the earth.",
        thumbs_up: true,
        created_at: "2025-03-10T12:10:00Z",
      },
      {
        id: "4",
        user_message: "What is the speed of light?",
        bot_response: "The speed of light is 299,792 kilometers per second.",
        thumbs_up: true,
        created_at: "2025-03-10T12:15:00Z",
      },
    ]);
  }, []);

  return (
    <div className="bg-gray-50 pt-1">
      <div className="flex-1 ml-0 p-2 ">
        <h1 className="text-3xl font-semibold mb-6">
          Welcome to the Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatisticCard title="Total Feedback" value="100" />
          <StatisticCard title="Positive Ratings" value="38" />
          <StatisticCard title="Positive Ratings" value="42" />
        </div>

        {/* Feedback Chart */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Feedback Summary</h3>
          <FeedbackChart feedbackData={feedbackData} />
        </div>

        {/* Feedback Table */}
        <div className="mt-10 bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-xl font-semibold mb-4">Recent Feedback</h3>
          <FeedbackTable feedbackData={feedbackData} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
