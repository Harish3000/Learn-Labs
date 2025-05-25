"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const MODEL_NAME = process.env.NEXT_PUBLIC_COLLAB_SUMMARY_MODEL_NAME!;
const API_KEY = process.env.NEXT_PUBLIC_COLLAB_SUMMARY_GEMINI_API_KEY!;

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [responseData, setResponseData] = useState<string>("");
  const [breakroom_id, setBreakroomID] = useState<number>(-1);
  const [breakroomData, setBreakroomData] = useState<any[]>([]);
  const [isFetched, setIsFetched] = useState(false);
  const [userID, setUserID] = useState("");
  const [videoID, setVideoID] = useState<any>();
  const [lectureID, setLectureID] = useState<any>();
  const router = useRouter();

  const [finalSummary, setFinalSummary] = useState<string>("");
  const [score, setScore] = useState<number>(0);
  const [missingPoints, setMissingPoints] = useState<string[]>([]);
  const [breakroomAttendanceDataID, setBreakroomAttendanceDataID] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [lectureText, setLectureText] = useState<any>();
  const [lectureContent, setLectureContent] = useState<string>("");

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

          const matchedRoom = parsedData.find((room: any) => room.student_id === userID);
          if (matchedRoom) {
            setBreakroomID(matchedRoom.breakroom_id);
            setVideoID(matchedRoom.video_id);
            setLectureID(matchedRoom.lecture_id);

            localStorage.setItem("videoID", matchedRoom.video_id);
            localStorage.setItem("lectureID", matchedRoom.lecture_id);
          }
        }

        const storedAttendance = localStorage.getItem("breakroomAttendance");
        if (storedAttendance) {
          const parsedAttendance = JSON.parse(storedAttendance);
          setBreakroomAttendanceDataID(parsedAttendance.id);
        }
      } catch (error) {
        console.error("Error decoding token or fetching local data", error);
      }
    };

    fetchData();
  }, [userID]);

  useEffect(() => {
    const fetchBreakroomDetails = async () => {
      if (breakroom_id !== -1 && userID && !isFetched) {
        try {
          const response = await fetch(`/api/colab-summary/session?breakroomID=${breakroom_id}&userID=${userID}`);
          const data = await response.json();
          setBreakroomID(data.id);
          setIsFetched(true);
        } catch (error) {
          console.error("Error fetching breakroom details:", error);
        }
      }
    };

    fetchBreakroomDetails();
  }, [breakroom_id, userID]);

  const storeSummaryInDatabase = async (
    summary: string,
    responseData: any,
    correctness: number,
    missed: string[],
    breakroomAttendanceDataID: any
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
          breakroomAttendanceDataID,
        }),
      });

      if (!response.ok) {
        console.error("Failed to store summary in database");
        return null;
      }
      const result = await response.json();

      // Save the ID of the stored summary in localStorage
      const savedSummaryId = result?.data?.id;
      if (savedSummaryId) {
        localStorage.setItem("summaryID", savedSummaryId.toString());
      }

      return result;
    } catch (error) {
      console.error("Error storing summary:", error);
      return null;
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSummary(event.target.value);
  };

  const runChat = async (userInput: string, lectureContent: string) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `
        You are an AI assistant. 

        Given the lecture content and a student's summary input, do the following:

        1. Generate a final comprehensive summary that accurately covers the main points from the lecture content.
        2. Score the student's input for correctness on a scale from 0 to 100.
        3. Identify exactly three key points that are missing or underrepresented in the student's input compared to the lecture content.

        Return your response in the following strict JSON format **ONLY** (no extra text):

        {
          "final_summary": "<final comprehensive summary here>",
          "score": <correctness score as a number between 0 and 100>,
          "missing_points": [
            "<missing point 1>",
            "<missing point 2>",
            "<missing point 3>"
          ]
        }

        lecture_content:
        ${lectureContent}

        student_input:
        ${userInput}
        `;
      const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 1,
          topK: 1,
          topP: 1,
          maxOutputTokens: 2048,
        },
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },

          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
          },
        ],
      });
      const response = await result.response.text();
      // Find the first and last curly braces to extract JSON substring
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}');

      let parsedData = null;

      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonString = response.substring(jsonStart, jsonEnd + 1);
        try {
          parsedData = JSON.parse(jsonString);
          setResponseData(parsedData);
          console.log("Parsed JSON response:", parsedData);
          // setFinalSummary(parsedData.final_summary || "");
          // setScore(typeof parsedData.score === "number" ? parsedData.score : 0);
          // setMissingPoints(Array.isArray(parsedData.missing_points) ? parsedData.missing_points : []);

          localStorage.setItem(
            "summaryAnalysis",
            JSON.stringify({
              finalSummary: parsedData.final_summary || "",
              score: parsedData.score || 0,
              missingPoints: parsedData.missing_points || [],
            })
          );

        } catch (error) {
          // console.error("Failed to parse JSON:", error);
          // setResponseData(response);
        }
      } else {
        // console.warn("No JSON found in response");
        // setResponseData(response);
      }

      return response;
    } catch (error) {
      console.error("Error running chat:", error);
      return "";
    }
  };

  useEffect(() => {
    const storedSummaryAnalysis = localStorage.getItem("summaryAnalysis");
    if (storedSummaryAnalysis) {
      try {
        const parsedAnalysis = JSON.parse(storedSummaryAnalysis);
        setFinalSummary(parsedAnalysis.finalSummary || "");
        setScore(parsedAnalysis.score || 0);
        setMissingPoints(parsedAnalysis.missingPoints || []);
      } catch (err) {
        console.error("Failed to parse summaryAnalysis from localStorage:", err);
      }
    }
  }, []);

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

      // console.log("lecture data : ",data);

      if (Array.isArray(data)) {
        const concatenatedText = data
          .sort((a, b) => Number(a.chunk_sequence) - Number(b.chunk_sequence))
          .map(item => item.text)
          .join(" ")
          .replace(/\d+ms:\s*/g, '')
          .replace(/\s*\|\s*/g, '');

        console.log("Lecture content : ", concatenatedText);

        setLectureText(concatenatedText);
        localStorage.setItem("lectureContent", concatenatedText);
      } else {
        console.error("Invalid data format:", data);
      }

      // setLectureContent(data);
      // localStorage.setItem("lectureContent", JSON.stringify(data));

    } catch (error) {
      console.error("Error fetching breakroom details:", error);
      toast.error("Error fetching breakroom details.");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const generatedResponse = await runChat(summary, lectureContent);
    const storedSummaryAnalysis = localStorage.getItem("summaryAnalysis");

    let parsedSummary = null;

    if (storedSummaryAnalysis) {
      parsedSummary = JSON.parse(storedSummaryAnalysis);
    }

    if (generatedResponse) {
      toast.success("Summary processed!");

      // Store in DB after processing
      if (breakroomAttendanceDataID && parsedSummary) {
        await storeSummaryInDatabase(
          summary,
          parsedSummary.finalSummary,
          score,
          missingPoints,
          breakroomAttendanceDataID
        );

        const lectureData = await fetchLectureData();

        setTimeout(() => {
          setLoading(false);
          router.push(`/protected/colab-summary/dashboard`);
        }, 25000);

      } else {
        console.warn("No breakroomAttendanceDataID available to store summary");
        console.log("Running chat...");

      }

    } else {
      toast.error("Failed to process summary.");
    }
  };

  return (
    <main>

      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 text-white text-xl font-semibold">
          <div className="flex flex-col items-center">
            <div className="animate-spin w-10 h-10 mb-4 border-4 border-white border-t-transparent rounded-full"></div>
            <p>Hang on.. getting model response..</p>
          </div>
        </div>
      )}

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
          disabled={loading}
        />
        <button
          onClick={handleSubmit}
          className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200 text-lg"
          disabled={loading}
        >
          {loading ? "Processing..." : "Submit"}
        </button>
      </div>
    </main>
  );
}
