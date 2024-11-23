"use client";

import { useEffect, useState } from "react";
import GetTranscript from "./api/getTranscript";
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

  const handleFetchTranscript = () => {
    setFetchTranscript(true);
  };

  return (
    <div>
      <h1>Doubt Clarification Demo </h1>
      <br />
      {/* Button to trigger transcript fetch */}
      <button
        onClick={handleFetchTranscript}
        className="px-4 py-2 bg-purple-500 text-black border border-gray-300 rounded-md shadow-sm hover:bg-gray-100 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
      >
        Fetch Transcript
      </button>
      {/* Conditionally render GetTranscript */}
      {fetchTranscript && <GetTranscript req="a" res="b" />}
      <ChatBotComponent />
      <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br /> <br />
      <br /> <br /> <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
      <br />
    </div>
  );
};

export default DoubtClarification;
