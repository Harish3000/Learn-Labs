"use client"; // Mark as client component

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import confetti from "canvas-confetti";

interface Question {
  question_id: number;
  question: string;
  options: string; // JSON string
  answer: string;
  difficulty: string;
}

interface Performance {
  question_id: number;
  displayed_difficulty: string;
  attempts: number;
  time_taken: number;
  final_result: boolean;
}

interface QuestionPopupProps {
  question: Question;
  onClose: (performance: Performance) => void;
}

const QuestionPopup: React.FC<QuestionPopupProps> = ({ question, onClose }) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);
  const [showTryAgain, setShowTryAgain] = useState(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState(false);
  const startTime = useRef(Date.now());
  const correctAnswerTime = useRef<number | null>(null); // Track time of correct answer

  useEffect(() => {
    console.log(
      "QuestionPopup: Mounted with question ID:",
      question.question_id
    );
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime.current) / 1000);
      const remaining = 10 - elapsed;
      setTimeLeft(remaining > 0 ? remaining : 0);
      console.log("QuestionPopup: Time left:", remaining);
      if (remaining <= 0) {
        clearInterval(timer);
        const finalTimeTaken =
          correctAnswerTime.current !== null
            ? correctAnswerTime.current
            : elapsed;
        if (!answeredCorrectly) {
          console.log(
            "QuestionPopup: Time up, closing with incorrect, time_taken:",
            finalTimeTaken
          );
          onClose({
            question_id: question.question_id,
            displayed_difficulty: question.difficulty,
            attempts,
            time_taken: finalTimeTaken,
            final_result: false,
          });
        } else {
          console.log(
            "QuestionPopup: Time up, closing with correct, time_taken:",
            finalTimeTaken
          );
          onClose({
            question_id: question.question_id,
            displayed_difficulty: question.difficulty,
            attempts,
            time_taken: finalTimeTaken,
            final_result: true,
          });
        }
      }
    }, 1000);
    return () => {
      clearInterval(timer);
      console.log("QuestionPopup: Timer cleared");
    };
  }, [question, onClose, answeredCorrectly]);

  const handleOptionClick = (option: string) => {
    console.log("QuestionPopup: Option clicked:", option);
    setSelectedOption(option);
    setAttempts((prev) => prev + 1);
    if (option === question.answer) {
      setAnsweredCorrectly(true);
      const timeTaken = (Date.now() - startTime.current) / 1000;
      correctAnswerTime.current = timeTaken; // Record time of correct answer
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
      console.log("QuestionPopup: Correct answer, time_taken:", timeTaken);
    } else {
      setShowTryAgain(true);
      console.log("QuestionPopup: Incorrect answer, showing try again");
    }
  };

  const handleTryAgain = () => {
    console.log("QuestionPopup: Try again clicked, resetting selection");
    setSelectedOption(null);
    setShowTryAgain(false);
  };

  // Parse the JSON string of options
  const parsedOptions: string[] = JSON.parse(question.options);

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        {showTryAgain ? (
          <>
            <h2 className="text-xl font-semibold mb-4 text-wrap break-words">
              Oops. Wrong answer. Try again
            </h2>
            <Button onClick={handleTryAgain} className="w-full">
              Try Again
            </Button>
          </>
        ) : answeredCorrectly ? (
          <div className="mt-4 text-green-600">
            <p className="text-base text-wrap break-words">
              Congratulations!! Get ready to continue the lecture in {timeLeft}{" "}
              seconds...
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold mb-4 text-wrap break-words">
              {question.question}
            </h2>
            <div className="grid gap-2 mb-4">
              {parsedOptions.map((option, index) => {
                const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                return (
                  <Button
                    key={optionKey}
                    onClick={() => handleOptionClick(optionKey)}
                    variant={
                      selectedOption === optionKey ? "default" : "outline"
                    }
                    className="w-full text-left text-sm text-wrap break-words py-2 h-auto"
                  >
                    {option}
                  </Button>
                );
              })}
            </div>
          </>
        )}
        <p className="mt-2 text-gray-500 text-sm">
          Time left: {timeLeft} seconds
        </p>
      </div>
    </div>
  );
};

export default QuestionPopup;
