"use client";

import { useEffect } from "react";
import GetTranscript from "./api/getTranscript";
import ChatBotComponent from "./chatbot";

const DoubtClarification = (props: { searchParams: any }) => {
  useEffect(() => {
    console.log("Doubt Clarification page mounted");

    console.log("searchParams:", props.searchParams);

    return () => {
      console.log("Doubt Clarification page unmounted");
    };
  }, []);

  return (
    <div>
      <h1>Doubt Clarification</h1>
      <p>This is where IFS Clears doubts.</p>
      <GetTranscript req="a" res="b" />
      <ChatBotComponent />
    </div>
  );
};

export default DoubtClarification;
