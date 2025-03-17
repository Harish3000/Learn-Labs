"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const MODEL_NAME = process.env.NEXT_PUBLIC_COLLAB_SUMMARY_MODEL_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_COLLAB_SUMMARY_GEMINI_API_KEY!;

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [responseData, setResponseData] = useState<string>("");
  const [correctness, setCorrectness] = useState<string>("");
  const [missed, setMissed] = useState<string>("");
  const [breakroom_id, setBreakroomID] = useState<number>(-1);
  const [breakroomData, setBreakroomData] = useState<any[]>([]);
  const [breakroomAttendanceDataID, setBreakroomAttendanceDataID] = useState<any>();
  const [isFetched, setIsFetched] = useState(false);
  const router = useRouter();
  const [userID, setUserID] = useState("");

  // updateCorrectnessAndMissedPoints
  const [summaryCorrectness, setSummaryCorrectness] = useState<any>();
  const [summaryMissedPoints, setSummaryMissedPoints] = useState<any>();
  const [videoID, setVideoID] = useState<any>();
  const [lectureID, setLectureID] = useState<any>();
  const [lectureContent, setLectureContent] = useState<any>();
  const [lectureText, setLectureText] = useState<any>();
  const [studentSummary, setStudentSummary] = useState<any>();
  const [finalSummary, setFinalSummary] = useState<any>();

  useEffect(() => {
    const fetchData = async () => {
      try {
        let token = Cookies.get("sb-mmvkkgidcuocgkvxjljd-auth-token");
        if (token) {
          if (token.startsWith("base64-")) {
            token = token.replace("base64-", "");
          }
          const decodedToken = jwtDecode(atob(token));
          const userId = decodedToken?.sub ?? "";
          setUserID(userId);
        } else {
          console.warn("Token not found in cookies");
        }

        const storedData = localStorage.getItem("breakroomData");

        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setBreakroomData(parsedData);

          for (const room of breakroomData) {
            if (room.student_id === userID) {
              setBreakroomID(room.breakroom_id);
              setVideoID(room.video_id);
              setLectureID(room.lecture_id);
              break;
            }
          }
        }

        const storedDataAttendance = localStorage.getItem("breakroomAttendance");
        if (storedDataAttendance) {
          const parsedDataAttendance = JSON.parse(storedDataAttendance);
          setBreakroomAttendanceDataID(parsedDataAttendance.id);
        }

      } catch (error) {
        console.error("Error decoding token", error);
      }
    };

    fetchData();
  }, [userID]);

  useEffect(() => {
    if (breakroom_id != -1 && userID != '' && !isFetched) {
      const fetchBreakroomDetails = async () => {
        try {
          const response = await fetch(`/api/colab-summary/session?breakroomID=${breakroom_id}&userID=${userID}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (!response.ok) {
            throw new Error("Failed to fetch breakroom details.");
          }

          const data = await response.json();
          setBreakroomID(data.id);
          setIsFetched(true);
        } catch (error) {
          console.error("Error fetching breakroom details:", error);
        }
      };

      fetchBreakroomDetails();
    }
  }, [breakroom_id, userID]);

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(event.target.value);
  };

  const storeSummaryInDatabase = async (
    summary: string,
    responseData: string,
    correctness: string,
    missed: string,
    breakroomAttendanceDataID: any,
  ) => {
    try {
      const response = await fetch("/api/colab-summary/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          summary,
          responseData,
          correctness,
          missed,
          breakroomAttendanceDataID
        }),
      });

      if (!response.ok) {
        console.error("Failed to store summary in database");
        return response;
      } else {
        return response;
      }
    } catch (error) {
      console.error("Error storing summary:", error);
    }
  };

  const handleSubmit = async () => {
    const generatedResponse = await runChat(summary);

    if (!generatedResponse) {
      console.error("Generated response is empty.");
      return;
    }

    if (breakroom_id != -1) {
      const response = await storeSummaryInDatabase(summary, generatedResponse, correctness, missed, breakroomAttendanceDataID);
      const submittedSummary = await response?.json();
      const lectureData = await fetchLectureData();
      await updateCorrectnessAndMissedPoints(submittedSummary.data);

      setTimeout(() => {
        // setLoading(false);
        router.push(`/protected/colab-summary/dashboard`);
      }, 25000);
    }
  };

  const runChat = async (prompt: string) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      setResponseData(response);
      return response;
    } catch (error) {
      console.error("Error running chat:", error);
      return "";
    }
  };

  const runChat2 = async (prompt: string) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 1,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      const response = result.response.text();

      return response;
    } catch (error) {
      console.error("Error running chat:", error);
      return "";
    }
  };

  const runChatForDetailedAnalysis = async (studentSummary: string, lectureText: string) => {
    console.log("running chat...");
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 0.7,
        topK: 50,
        topP: 0.85,
        maxOutputTokens: 2048,
      };

      const prompt = `
The goal is to compare the student's summary of a lecture with the original lecture content.
- Analyze the summary for correctness and completeness.
- Check if the summary accurately represents all key points of the lecture.
- Highlight major points the student missed.

**Lecture Content:**
"${lectureText}"

**Student's Summary:**
"${studentSummary}"

Please respond with a JSON object in the following format:
{
  "correctness_score": percentage_value,   // Percentage of correctness, ranging from 0 to 100
  "missing_points": [
    "missing_point_1",  // Example: 'The lecture discussed the types of operating systems.'
    "missing_point_2"   // Example: 'The summary did not mention the system's structure in detail.'
  ]
}
`;

      // Start the chat session with the prompt
      const chat = model.startChat({
        generationConfig,
        history: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
      });

      const result = await chat.sendMessage(prompt);
      var response = result.response.text();

      console.log("Gemini response:", response);
      response = response.replace(/\/\/.*$/gm, '').trim();

      // Check if the response starts with the expected JSON structure
      try {
        const parsedResponse = JSON.parse(response);
        console.log("parsedResponse : ",parsedResponse);
        setSummaryCorrectness(parsedResponse.correctness_score);
        setSummaryMissedPoints(parsedResponse.missing_points);

      } catch (jsonError) {
        console.error("Error parsing Gemini response:", jsonError);
        console.log("Full response received:", response);
      }

      return response;
    } catch (error) {
      console.error("Error running chat for detailed analysis:", error);
      return "";
    }
  };

  async function updateCorrectnessAndMissedPoints(data: any) {
    setStudentSummary(data.student_input);

    if (lectureText && studentSummary) {
      // Proceed with the chat analysis only after both lectureText and studentSummary are available
      const generatedResponse = await runChatForDetailedAnalysis(studentSummary, lectureText);
      if (generatedResponse) {
        const finalSummary = await runChat2(lectureText);
        setFinalSummary(finalSummary);
        localStorage.setItem("finalSummary", JSON.stringify(finalSummary));
        localStorage.setItem("summaryID", JSON.stringify(data.id));

        if (summaryCorrectness && summaryMissedPoints) {
          console.log("updating...");
          await updateSummary(data.id, summaryCorrectness, summaryMissedPoints);
        }
      }
    } else {
      console.error("Lecture content or student summary is not available.");
    }
  }

  const updateSummary = async (id: any, summaryCorrectness: string, summaryMissedPoints: string) => {
    console.log("updating summary...");
    console.log("summary correctness : ", summaryCorrectness);
    console.log("summary missing points : ", summaryMissedPoints);
    try {
      const response = await fetch("/api/colab-summary/lecturecontent", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: id,
          summaryCorrectness: summaryCorrectness,
          summaryMissedPoints: summaryMissedPoints
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Error updating Summary:", data.error);
      }

    } catch (error) {
      console.error("Error making API call:", error);
    }
  };

  const fetchLectureData = async () => {
    try {
      const response = await fetch(`/api/colab-summary/lecturecontent?lectureID=${lectureID}&videoID=${videoID}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch breakroom details.");
      }

      const data = await response.json();

      if (Array.isArray(data)) {
        const concatenatedText = data
          .sort((a, b) => Number(a.chunk_sequence) - Number(b.chunk_sequence))
          .map(item => item.text)
          .join(" ")
          .replace(/\d+ms:\s*/g, '')
          .replace(/\s*\|\s*/g, '');

        setLectureText(concatenatedText);
      } else {
        console.error("Invalid data format:", data);
      }

      setLectureContent(data);
      localStorage.setItem("lectureContent", JSON.stringify(lectureContent));

    } catch (error) {
      console.error("Error fetching breakroom details:", error);
      toast.error("Error fetching breakroom details.");
    }
  };

  return (
    <main>
      <h1 className="text-4xl font-semibold text-gray-800 mb-6 text-center">
        Submit your summary here
      </h1>

      <div className="flex flex-col items-center w-full max-w-screen-xl mx-auto">
        <textarea
          value={summary}
          onChange={handleInputChange}
          placeholder="Enter your summary"
          className="p-6 border rounded-lg w-full text-black bg-white mb-6 shadow-md 
     focus:outline-none focus:ring-2 focus:ring-green-500 resize-none 
     h-[500px] max-w-full"
        />
        <button
          onClick={handleSubmit}
          className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 text-lg"
        >
          Submit
        </button>
      </div>
    </main>
  );
}
