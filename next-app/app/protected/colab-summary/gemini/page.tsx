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
  const [breakroomAttendanceDataID,setBreakroomAttendanceDataID] = useState<any>();
  const [isFetched, setIsFetched] = useState(false);
  const router = useRouter();
  const [userID, setUserID] = useState("");

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
          toast.error("Error fetching breakroom details.");
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
        toast.error("Failed to submit summary");
      } else {
        toast.success("Summary submitted successfully!");
      }
    } catch (error) {
      console.error("Error storing summary:", error);
      toast.error("Error submitting summary");
    }
  };

  const handleSubmit = async () => {
    const generatedResponse = await runChat(summary);

    if (!generatedResponse) {
      console.error("Generated response is empty.");
      toast.error("Error generating summary.");
      return;
    }

    if (breakroom_id != -1) {
      await storeSummaryInDatabase(summary, generatedResponse, correctness, missed, breakroomAttendanceDataID);
      router.push(`/protected/colab-summary/dashboard`);
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
      toast.error("Error generating summary");
      return "";
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
