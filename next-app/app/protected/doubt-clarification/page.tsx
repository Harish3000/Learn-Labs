"use client";

import { useEffect, useState } from "react";
import { FaFileAlt, FaMicrophone, FaRegCommentDots } from "react-icons/fa"; // Icons from react-icons
import GetTranscript from "./api/getT";
import ChatBotComponent from "./chatbot";

const DoubtClarification = (props: { searchParams: any }) => {
  const [fetchTranscript, setFetchTranscript] = useState(false);

  useEffect(() => {
    console.log("Doubt Clarification page mounted");
    console.log("searchParams:", props.searchParams);

    return () => {
      console.log("Doubt Clarification page unmounted");
    };
  }, []);

  const handleFetchTranscript = async () => {
    await GetTranscript();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Page Header */}
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-blue-600">
          Doubt Clarification Demo
        </h1>
        <p className="text-gray-500 mt-2">
          Fetch lecture transcripts and interact with the chatbot for
          personalized learning.
        </p>
      </header>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto">
        {/* Button Section */}
        <div className="flex justify-center mb-6">
          <button
            onClick={handleFetchTranscript}
            className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <FaFileAlt className="mr-2 text-lg" />
            Fetch Transcript
          </button>
        </div>

        {/* ChatBot Section */}
        <div className="mt-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-700 flex items-center mb-4">
            <FaRegCommentDots className="mr-2 text-blue-500" />
            Chat with the Bot
          </h2>
          <ChatBotComponent lectureId={props.searchParams.lectureId} />
        </div>
      </div>

      {/* Footer with Icons */}
      <footer className="mt-12 text-center text-gray-500">
        <p className="flex justify-center items-center">
          <FaMicrophone className="mr-2 text-lg text-blue-600" />
          Interactive Learning Platform &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default DoubtClarification;
