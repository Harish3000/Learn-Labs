"use client";
import { FC, useState } from "react";

const ChatBotComponent: FC = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    console.log("Message sent:", message);
    setMessage("");
  };

  return (
    <div className="fixed right-4 bottom-16 w-80 h-5/6 bg-gray-800 border border-gray-600 rounded-md shadow-lg p-4">
      <div className="text-lg font-semibold mb-4 text-white border-b border-gray-600 pb-2">
        Chat Bot
      </div>
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto mb-2 text-white">
          {/* Messages will appear here to be constructued*/}
        </div>
        <div className="flex flex-col mt-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full bg-gray-700 text-white border border-gray-600 p-2 rounded focus:outline-none focus:border-blue-500"
            placeholder="Type your doubt here..."
          />
          <button
            onClick={handleSend}
            className="mt-2 bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Ask
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBotComponent;
