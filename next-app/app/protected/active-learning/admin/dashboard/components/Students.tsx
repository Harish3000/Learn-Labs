"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Bar, Line } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

// Define data interfaces
interface EloScore {
  student_id: string;
  elo: number;
}

interface PerformanceOverTime {
  date: string;
  averageCorrect: number;
}

interface StudentEloDetail {
  student_id: string;
  totalAttempted: number;
  percentageCorrect: number;
  averageAttempts: number;
  averageTimeTaken: number;
  elo: number;
}

interface HardestQuestion {
  question_id: number;
  question: string;
  avgAttempts: number;
  avgTimeTaken: number;
  successRate: number;
  difficultyScore: number;
}

interface StudentHardestPerformance {
  student_id: string;
  question_id: number;
  question_text: string;
  attempts: number;
  time_taken: number;
  final_result: boolean;
}

interface LecturePerformance {
  lecture_id: number;
  lecture_title: string;
  averageCorrect: number;
}

interface MostActiveStudent {
  student_id: string;
  lecture_id: number;
  lecture_title: string;
  totalAttempts: number;
  totalCorrect: number;
  correctPercentage: number;
}

interface VariabilityQuestion {
  question_id: number;
  question: string;
  avgTimeTaken: number;
  timeStdDev: number;
  avgAttempts: number;
  totalAttempts: number;
}

interface StudentPerformanceData {
  eloScores: EloScore[];
  performanceOverTime: PerformanceOverTime[];
  studentEloDetails: StudentEloDetail[];
  hardestQuestions: HardestQuestion[];
  studentHardestPerformance: StudentHardestPerformance[];
  lecturePerformance: LecturePerformance[];
  mostActiveStudents: MostActiveStudent[];
  variabilityQuestions: VariabilityQuestion[];
  topPerformers: EloScore[];
}

export default function Students() {
  console.log("Students component mounted");

  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Initiating data fetch for student performance");
    const fetchData = async () => {
      try {
        const response = await fetch(
          "/api/active-learning/admin-dashboard/get-student-performance"
        );
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const result = await response.json();
        if (result.error) {
          console.error("API error:", result.error);
        } else {
          console.log("Data fetched successfully:", {
            eloScoresCount: result.eloScores.length,
            studentEloDetailsCount: result.studentEloDetails.length,
          });
          setData(result);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    console.log("Rendering loading state");
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!data) {
    console.log("No data available to render");
    return <div className="text-center py-10">No data available</div>;
  }

  console.log("Rendering Students component with data");

  // Area Chart: Performance Over Time
  const performanceOverTimeData = {
    labels: data.performanceOverTime.map((p) => p.date),
    datasets: [
      {
        label: "Average Correct",
        data: data.performanceOverTime.map((p) => p.averageCorrect),
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        fill: true, // Makes it an Area Chart
        tension: 0.3,
      },
    ],
  };
  const performanceOverTimeOptions = {
    scales: {
      x: {
        type: "time" as const,
        time: { unit: "day" as const },
        title: { display: true, text: "Date" },
      },
      y: {
        beginAtZero: true,
        max: 1,
        title: { display: true, text: "Average Correct" },
      },
    },
  };

  // List: Student ELO Details
  const studentEloDetails = data.studentEloDetails;

  // Bar Chart: Lecture Performance
  const lecturePerformanceData = {
    labels: data.lecturePerformance.map((l) => l.lecture_title),
    datasets: [
      {
        label: "Average Correct",
        data: data.lecturePerformance.map((l) => l.averageCorrect),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };
  const lecturePerformanceOptions = {
    scales: {
      y: {
        beginAtZero: true,
        max: 1,
        title: { display: true, text: "Average Correct" },
      },
      x: { title: { display: true, text: "Lecture Title" } },
    },
  };

  // List: Top Performing (Hardest) Questions
  const hardestQuestions = data.hardestQuestions;

  // Bar Chart: Top Performers by ELO
  const topPerformersData = {
    labels: data.topPerformers.map((t) => t.student_id),
    datasets: [
      {
        label: "ELO Score",
        data: data.topPerformers.map((t) => t.elo),
        backgroundColor: "rgba(255, 159, 64, 0.6)",
        borderColor: "rgba(255, 159, 64, 1)",
        borderWidth: 1,
      },
    ],
  };
  const topPerformersOptions = {
    indexAxis: "y" as const,
    scales: {
      x: { beginAtZero: true, title: { display: true, text: "ELO Score" } },
      y: { title: { display: true, text: "Student ID" } },
    },
    plugins: { legend: { display: false } },
  };

  // List: Student Performance on Hardest Questions
  const studentHardestPerformance = data.studentHardestPerformance;

  // List: Most Active Students by Lecture
  const mostActiveStudents = data.mostActiveStudents;

  // List: Questions with Most Variability
  const variabilityQuestions = data.variabilityQuestions;

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">
        Student Performance Dashboard
      </h1>

      {/* Area Chart: Performance Over Time */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Performance Over Time</h2>
        <Line
          data={performanceOverTimeData}
          options={performanceOverTimeOptions}
        />
      </div>

      {/* List: Student ELO Details */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">Student ELO Details</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Attempted
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Correct
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time (s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ELO
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentEloDetails.map((student) => (
              <tr key={student.student_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.totalAttempted}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.percentageCorrect.toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.averageAttempts.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.averageTimeTaken.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.elo}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart: Lecture Performance */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Lecture Performance</h2>
        <Bar
          data={lecturePerformanceData}
          options={lecturePerformanceOptions}
        />
      </div>

      {/* List: Top Performing (Hardest) Questions */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Top Performing (Hardest) Questions
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time (s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Success Rate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difficulty Score
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {hardestQuestions.map((q) => (
              <tr key={q.question_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {q.question_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {q.question}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.avgAttempts.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.avgTimeTaken.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(q.successRate * 100).toFixed(2)}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.difficultyScore.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bar Chart: Top Performers by ELO */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4">Top Performers by ELO</h2>
        <Bar
          data={topPerformersData}
          options={topPerformersOptions}
          height={100}
        />
      </div>

      {/* List: Student Performance on Hardest Questions */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Student Performance on Hardest Questions
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Taken (s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Correct
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {studentHardestPerformance.map((perf, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {perf.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perf.question_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {perf.question_text}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perf.attempts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perf.time_taken.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {perf.final_result ? "Yes" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* List: Most Active Students by Lecture */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Most Active Students by Lecture
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Student ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lecture ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lecture Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Correct
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                % Correct
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {mostActiveStudents.map((student) => (
              <tr key={`${student.student_id}-${student.lecture_id}`}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {student.student_id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.lecture_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {student.lecture_title}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.totalAttempts}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.totalCorrect}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {student.correctPercentage.toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* List: Questions with Most Variability */}
      <div className="bg-white p-6 rounded-lg shadow overflow-x-auto">
        <h2 className="text-2xl font-semibold mb-4">
          Questions with Most Variability
        </h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Question
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time (s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Time Std Dev
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Attempts
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Attempts
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {variabilityQuestions.map((q) => (
              <tr key={q.question_id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {q.question_id}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {q.question}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.avgTimeTaken.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.timeStdDev.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.avgAttempts.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {q.totalAttempts}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
