"use client";
import { FC, useState } from "react";
import { FaRobot, FaUser } from "react-icons/fa";
import GetChat from "./api/getChat";

const ChatBotComponent: FC = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<{ user: string; bot: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChat((prev) => [...prev, { user: userMessage, bot: "" }]);
    setMessage("");
    setLoading(true);

    try {
      const data = await GetChat(userMessage);

      setChat((prev) => {
        const updatedChat = [...prev];
        updatedChat[updatedChat.length - 1].bot = data; // Bot's response
        return updatedChat;
      });
    } catch (error) {
      setChat((prev) => {
        const updatedChat = [...prev];
        updatedChat[updatedChat.length - 1].bot =
          "Sorry, something went wrong. Please try again.";
        return updatedChat;
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper function to highlight any text inside square brackets
  const formatBotResponse = (response: string) => {
    // Updated regex to match any content inside square brackets
    const bracketedContentRegex = /\[([^\]]+)\]/g;
    const parts = response.split(bracketedContentRegex);
    const matches = response.match(bracketedContentRegex);

    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {matches && matches[index] && (
              <span className="text-blue-400 text-black font-bold ml-1 p-1 rounded">
                {matches[index]}
              </span>
            )}
          </span>
        ))}
      </>
    );
  };

  return (
    <div className="fixed right-4 bottom-16 w-80 h-[85vh] bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white text-lg font-semibold p-4 rounded-t-lg">
        Live Doubt Clarification
      </div>

      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-white">
        {chat.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center space-x-2">
              <FaUser className="text-blue-400" />
              <p className="text-blue-400 font-semibold">You: {item.user}</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaRobot className="text-gray-400" />
              <p className="text-gray-300">
                Bot: {item.bot ? formatBotResponse(item.bot) : "Loading..."}
              </p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center space-x-2">
            <FaRobot className="text-gray-400" />
            <p className="text-gray-300">Bot: Thinking...</p>
          </div>
        )}
      </div>

      {/* Input Box */}
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
          disabled={loading}
          className={`ml-2 p-2 rounded-lg transition duration-200 ${
            loading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Send.." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBotComponent;
