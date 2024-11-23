"use client";
import { FC, useState } from "react";
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
        updatedChat[updatedChat.length - 1].bot = data; // Bots response
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

  return (
    <div className="fixed right-4 bottom-16 w-80 h-[85vh] bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col">
      <div className="bg-gray-900 text-white text-lg font-semibold p-4 rounded-t-lg">
        Live Doubt Clarification
      </div>
      <div className="flex-1 p-4 overflow-y-auto space-y-2 text-white">
        {chat.map((item, index) => (
          <div key={index}>
            <p className="text-blue-400 font-semibold">You: {item.user}</p>
            <p className="text-gray-300">Bot: {item.bot || "..."}</p>
          </div>
        ))}
        {loading && <p className="text-gray-300">Bot: Thinking...</p>}
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
          disabled={loading}
          className={`ml-2 p-2 rounded-lg transition duration-200 ${
            loading
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-black text-white hover:bg-blue-700"
          }`}
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBotComponent;
