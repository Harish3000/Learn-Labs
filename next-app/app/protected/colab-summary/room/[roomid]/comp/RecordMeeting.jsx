"use client";

import React, { useEffect, useState, useRef } from "react";
import useSpeechToText from "react-hook-speech-to-text";

function RecordMeeting({ meetingData, meetingEnded }) {
    const { roomID, userID } = meetingData; 
    // const [meetingEnded, setMeetingEnded] = useState(false);
    const [recording, setRecording] = useState(false);
    const hasStarted = useRef(false);
    const [userAnswer, setUserAnswer] = useState('');

    const {
        error,
        interimResult,
        results,
        startSpeechToText,
        stopSpeechToText,
        isRecording,
    } = useSpeechToText({
        continuous: true,
        useLegacyResults: false,
    });

    // Start recording automatically when the component mounts
    useEffect(() => {
        if (!meetingEnded && !hasStarted.current && !isRecording) {
            hasStarted.current = true;
            startSpeechToText()
                .then(() => setRecording(true))
                .catch((error) => {
                    console.error("Error starting speech recognition:", error);
                    hasStarted.current = false;
                });
        }
    }, [meetingEnded, isRecording]);

    // User answer
    useEffect(() => {
        if (results.length > 0) {
            setUserAnswer((prevAns) => prevAns + " " + results[results.length - 1]?.transcript);
        }
    }, [results]);

    // Trigger saving when the meeting ends
    useEffect(() => {
        if (meetingEnded) {
            stopSpeechToText();
            saveUserAnswer();
        }
    }, [meetingEnded]);

    // Function to store user answer in the database
    const saveUserAnswer = async () => {
        if (!userAnswer) return;

        try {
            const response = await fetch("/api/colab-summary/meeting", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ roomID, userID, userAnswer }),
            });

            if (!response.ok) {
                console.error("Failed to save user answer");
            }
        } catch (error) {
            console.error("Error saving user answer:", error);
        }
    };

    return (
        <div>
        </div>
    );
}

export default RecordMeeting;
