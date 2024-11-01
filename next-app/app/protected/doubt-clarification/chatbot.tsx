"use client";
import { FC, useState } from "react";

const ChatBotComponent: FC = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  return (
    <div className="fixed right-4 bottom-16 w-80 h-[90vh] bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col">
      <div className="bg-gray-900 text-white text-lg font-semibold p-4 rounded-t-lg">
        Chat Bot
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-white">
        {/* Messages will appear here */}
      </div>
      <div className="flex p-4 border-t border-gray-700">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 bg-gray-700 text-white border border-gray-600 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type your question here..."
        />
        <button
          onClick={handleSend}
          className="ml-2 bg-black text-white p-2 rounded-lg hover:bg-blue-700 transition duration-200"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBotComponent;
