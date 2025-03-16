import { createClient } from "@supabase/supabase-js";
import { FC, useState } from "react";
import { FaFlag, FaRobot, FaThumbsUp, FaUser } from "react-icons/fa";
import GetChat from "./api/getChat";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const ChatBotComponent: FC = () => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState<
    { user: string; bot: string; liked: boolean; disliked: boolean }[]
  >([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message;
    setChat((prev) => [
      ...prev,
      { user: userMessage, bot: "", liked: false, disliked: false },
    ]);
    setMessage("");
    setLoading(true);

    try {
      const data = await GetChat(userMessage, "");

      setChat((prev) => {
        const updatedChat = [...prev];
        updatedChat[updatedChat.length - 1].bot = data;
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

  const sendFeedback = async (
    userMessage: string,
    botResponse: string,
    thumbsUp: boolean,
    index: number
  ) => {
    try {
      const { data, error } = await supabase.from("feedback").insert([
        {
          user_message: userMessage,
          bot_response: botResponse,
          thumbs_up: thumbsUp,
        },
      ]);
      if (error) throw error;

      setChat((prev) => {
        const updatedChat = [...prev];
        updatedChat[index] = {
          ...updatedChat[index],
          liked: thumbsUp,
          disliked: !thumbsUp,
        };
        return updatedChat;
      });

      console.log("Feedback submitted successfully:", data);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const formatBotResponse = (response: string) => {
    try {
      // Try parsing the response as JSON first
      const parsedResponse = JSON.parse(response);

      const resContent = parsedResponse.res ?? "No response provided";
      const timestampContent = parsedResponse.timestamp;

      return (
        <div className="text-gray-300">
          <p className="text-white">{resContent}</p>

          <div className="mt-2">
            <strong className="text-gray-400">Timestamps:</strong>
            <div className="mt-1 flex flex-wrap">
              {timestampContent ? (
                typeof timestampContent === "string" ? (
                  timestampContent
                    .split(", ")
                    .filter((time: string) => time.trim() !== "")
                    .map((time: string, index: number) => (
                      <span
                        key={index}
                        className="text-blue-500 font-bold ml-1 p-1 rounded"
                      >
                        {time}
                      </span>
                    ))
                ) : Array.isArray(timestampContent) ? (
                  timestampContent.map((time: number, index: number) => (
                    <span
                      key={index}
                      className="text-blue-500 font-bold ml-1 p-1 rounded"
                    >
                      {time.toFixed(2)}s
                    </span>
                  ))
                ) : (
                  <span className="text-yellow-500 ml-1 p-1 rounded">
                    {String(timestampContent)}
                  </span>
                )
              ) : (
                <span className="text-gray-500 ml-1 p-1 rounded">
                  No timestamps provided
                </span>
              )}
            </div>
          </div>
        </div>
      );
    } catch (error) {
      // If parsing fails, assume it's a non-JSON response and display it raw
      console.error("Error parsing response:", error);

      return (
        <div className="text-gray-300">
          <p className="text-white">
            {response || "Failed to parse bot response"}
          </p>
        </div>
      );
    }
  };

  return (
    <div className="fixed right-4 bottom-16 w-80 h-[85vh] bg-gray-800 border border-gray-700 rounded-lg shadow-lg flex flex-col overflow-hidden">
      <div className="bg-gray-900 text-white text-lg font-semibold p-4 rounded-t-lg">
        Live Doubt Clarification
      </div>

      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-white">
        {chat.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center space-x-2">
              <FaUser className="text-blue-400" />
              <p className="text-blue-400 font-semibold">You: {item.user}</p>
            </div>
            <div className="flex items-center space-x-2">
              <FaRobot className="text-gray-400" />
              <div className="text-gray-300 text-container break-words">
                {item.bot ? formatBotResponse(item.bot) : "Loading..."}
              </div>
              {item.bot && (
                <div className="ml-2 space-x-2">
                  <button
                    onClick={() =>
                      sendFeedback(item.user, item.bot, true, index)
                    }
                    className={`p-1 transition duration-200 ${
                      item.liked
                        ? "text-green-500"
                        : "text-gray-400 hover:text-green-500"
                    }`}
                  >
                    <FaThumbsUp />
                  </button>
                  <button
                    onClick={() =>
                      sendFeedback(item.user, item.bot, false, index)
                    }
                    className={`p-1 transition duration-200 ${
                      item.disliked
                        ? "text-red-500"
                        : "text-gray-400 hover:text-red-500"
                    }`}
                  >
                    <FaFlag />
                  </button>
                </div>
              )}
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
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ChatBotComponent;
