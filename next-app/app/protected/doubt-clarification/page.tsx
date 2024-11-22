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
      <h1>Doubt Clarification</h1>

      {/* Button to trigger transcript fetch */}
      <button
        onClick={handleFetchTranscript}
        style={{
          backgroundColor: "white",
          color: "black",
          border: "1px solid #ccc",
        }}
      >
        Fetch Transcript
      </button>
      {/* Conditionally render GetTranscript */}
      {fetchTranscript && <GetTranscript req="a" res="b" />}

      <ChatBotComponent />
    </div>
  );
};

export default DoubtClarification;
