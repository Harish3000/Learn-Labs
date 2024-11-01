"use client";

import { useChat } from "ai/react";
import { SendIcon, SquareIcon } from "lucide-react";
import Markdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import chatIntroImage from "/app/intellinote.png";
import chatImage from "/app/mini.png";

export function Chatbot() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, stop } =
    useChat({
      api: "api/chat"
    });

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-[1000px] mx-auto bg-background rounded-lg shadow-lg">
      <div className="flex-1 overflow-auto p-6">
        {messages.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full">
            <Image src={chatIntroImage} width={400} height={400} alt="AI" />
            <p className="text-lg text-muted-forground mt-4">
              Welcome to INTELLINOTE companion! Ask me anything about your
              Lectures.
            </p>
          </div>
        )}
        <div className="flex flex-col gap-4 w-full">
          {messages.map((message) =>
            message.role === "assistant" ? (
              <div key={message.id} className="flex items-start gap-3">
                <div className="p-2 border border-gray-700 rounded-full">
                  <Image src={chatImage} width={40} height={40} alt="AI" />
                </div>
                <div className="bg-muted rounded-lg p-3 max-w-[70%]">
                  {/* <p className="text-sm text-muted-foreground">
                    {message.content}
                  </p> */}
                  <Markdown className="text-sm">
                    {message.content}
                  </Markdown>
                </div>
              </div>
            ) : (
              <div key={message.id} className="flex justify-end">
                <div className="bg-primary rounded-lg p-3 max-w-[70%]">
                  <p className="text-sm text-primary-foreground">
                    {message.content}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-muted/50 px-4 py-3 flex items-center gap-2"
      >
        <div className="relative flex-1">
          <Textarea
            placeholder="Type your message..."
            className="rounded-lg pr-12 min-h-[64px]"
            rows={1}
            value={input}
            onChange={handleInputChange}
          />
          {!isLoading ? (
            <Button
              type="submit"
              size="icon"
              disabled={!input || isLoading}
              className="absolute bottom-3 right-3 rounded-full"
            >
              <SendIcon className="w-5 h-5" />
              <span className="sr-only">Send</span>
            </Button>
          ) : (
            <Button
              type="button"
              size="icon"
              disabled={!isLoading}
              onClick={stop}
              className="absolute bottom-3 right-3 rounded-full"
            >
              <SquareIcon className="w-5 h-5" fill="white" />
              <span className="sr-only">Send</span>
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
