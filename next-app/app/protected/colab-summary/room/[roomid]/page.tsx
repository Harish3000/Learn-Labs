"use client";

import useUser from "../../../../../hooks/colab-summary/useUser";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import Swal from "sweetalert2";

const Room = ({ params }: { params: { roomid: string } }) => {
  const { fullName } = useUser();
  const roomID = params.roomid;
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // State to handle whether the meeting has ended or not
  const [meetingEnded, setMeetingEnded] = useState(false);

  // Function to store the URL in the database
  const storeUrlInDatabase = async (url: string, name: string) => {
    try {
      const response = await fetch('/api/colab-summary/session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, name }),
      });

      if (!response.ok) {
        console.error('Failed to store URL in database');
      }
    } catch (error) {
      console.error('Error storing URL:', error);
    }
  };

  useEffect(() => {
    // generate Kit Token
    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      uuid(), // Logged in user id
      fullName || "user" + Date.now(),
      720
    );

    // Create instance object from Kit Token.
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Generate the shareable link
    const shareableLink =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?roomID=" +
      roomID;

    storeUrlInDatabase(shareableLink, fullName);

    // Timer to end the meeting after 10 minutes
    const endMeetingTimer = setTimeout(() => {
      zp.destroy(); // Leave the room after 10 minutes
      setMeetingEnded(true); // Set meeting ended state
      Swal.fire({
        title: "Meeting Ended",
        text: "The meeting has ended. Thank you for joining!",
        icon: "info",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/protected/colab-summary/inputpage"); // Navigate to the end page
      });
    }, 10 * 60 * 1000); // 10 minutes in milliseconds

    // Clean up the timer when the component unmounts
    return () => {
      clearTimeout(endMeetingTimer);
      zp.destroy();
    };

  }, [roomID, fullName, router]); // Dependency array for useEffect

  useEffect(() => {
    if (meetingContainerRef.current && !meetingEnded) {
      // start the call only if the meeting has not ended
      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        uuid(), // Logged in user id
        fullName || "user" + Date.now(),
        720
      );

      // Create instance object from Kit Token.
      const zp = ZegoUIKitPrebuilt.create(kitToken);

      zp.joinRoom({
        container: meetingContainerRef.current,
        sharedLinks: [
          {
            name: "Shareable link",
            url: window.location.href,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.VideoConference,
        },
        maxUsers: 4,
      });
    }
  }, [roomID, fullName, meetingEnded]); // Ensure it runs only if meeting hasn't ended

  return <div className="w-full h-screen" ref={meetingContainerRef}></div>;
};

export default Room;
