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

const MODEL_NAME = "gemini-1.0-pro";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;

export default function Home() {
  const [summary, setSummary] = useState<string>("");
  const [responseData, setResponseData] = useState<string>("");
  const router = useRouter();

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSummary(event.target.value);
  };

  const storeSummaryInDatabase = async (
    uid: string,
    email: string,
    firstname: string,
    gemini_summary: string,
    accuracy: number
  ) => {
    try {
      const response = await fetch("/api/colab-summary/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid,
          email,
          firstname,
          gemini_summary,
          accuracy,
        }),
      });

      if (!response.ok) {
        console.error("Failed to store summary in database");
        toast.error("Failed to submit summary");
      } else {
        toast.success("Summary submitted successfully!");
        setSummary(""); // Clear the input after submission
      }
    } catch (error) {
      console.error("Error storing summary:", error);
      alert("Error submitting summary");
    }
  };

  const runChat = async (prompt: string) => {
    try {
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const generationConfig = {
        temperature: 0.9,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      };

      const safetySettings = [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ];

      const formattedPrompt = `Summarize the following text and provide the accuracy percentage as a number from 0 to 100. Output the summary and accuracy in the following format(Always follow the same format when responsing back): Summary: [Summary] and Accuracy: [Accuracy]%: text : ${prompt}`;

      const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: [
          {
            role: "user",
            parts: [{ text: formattedPrompt }],
          },
        ],
      });

      const result = await chat.sendMessage(formattedPrompt);
      const response = result.response;
      setResponseData(response.text());

      console.log('Response Data : ',responseData);
    } catch (error) {
      console.error("Error running chat:", error);
      alert("Error generating summary");
    }
  };

  const extractSummary = (response: string) => {
    const summaryMatch = response.match(/Summary:\s*(.*?)(?=\n|$)/);
    return summaryMatch ? summaryMatch[1].trim() : "Summary not available";
  };

  const extractAccuracy = (response: string) => {
    const accuracyMatch = response.match(/Accuracy:\s*(\d+(\.\d+)?)%/);
    return accuracyMatch ? parseFloat(accuracyMatch[1]) : 0;
  };

  const handleSubmit = async () => {
    const user = localStorage.getItem("user");
    if (!user) {
      toast.error("User not found. Please log in.");
      return;
    }

    const parsedUser = JSON.parse(user);
    const { _id, email, firstname } = parsedUser.user;

    await runChat(summary);

    const geminiSummary = extractSummary(responseData);
    const accuracy = extractAccuracy(responseData);

    if (geminiSummary === "Summary not available" || accuracy === 0) {
      toast.error("Failed to generate a valid summary or accuracy.");
      return;
    }

    await storeSummaryInDatabase(_id, email, firstname, geminiSummary, accuracy);

    router.push(`/protected/colab-summary/dashboard`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50 w-full">
      <div className="w-full max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-gray-800 mb-4">Submit your summary here</h1>

        <div className="flex flex-col items-center w-full max-w-md mx-auto">
          <input
            type="text"
            value={summary}
            onChange={handleInputChange}
            placeholder="Enter your summary"
            className="p-4 border rounded-lg w-full text-black bg-white mb-4 shadow-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            onClick={handleSubmit}
            className="p-4 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition-all duration-200"
          >
            Submit
          </button>
        </div>
      </div>
    </main>
  );
}
