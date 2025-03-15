"use client";

import useUser from "../../../../../hooks/colab-summary/useUser";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { v4 as uuid } from "uuid";
import Swal from "sweetalert2";
import RecordMeeting from "../[roomid]/comp/RecordMeeting";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

const Room = ({ params }: { params: { roomid: string } }) => {
  const { fullName } = useUser();
  const roomID = params.roomid;
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [userID, setUserID] = useState('');

  useEffect(() => {
    try {
      // Retrieve token from cookies
      let token = Cookies.get("sb-mmvkkgidcuocgkvxjljd-auth-token");
      if (token) {

        if (token.startsWith("base64-")) {
          token = token.replace("base64-", "");
        }

        const decodedToken = jwtDecode(atob(token));

        const userId = decodedToken?.sub?? "";

        setUserID(userId);
      } else {
        console.warn("Token not found in local storage");
      }
    } catch (error) {
      console.error("Error decoding token", error);
    }
  }, []);

  // Function to store the URL in the database
  const storeUrlInDatabase = async (url: string, name: string, roomID: string, userID: string) => {
    try {
      const response = await fetch("/api/colab-summary/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, name, roomID, userID }),
      });

      if (!response.ok) {
        console.error("Failed to store URL in database");
      }
    } catch (error) {
      console.error("Error storing URL:", error);
    }
  };

  useEffect(() => {
    if (!userID) return;

    // Generate Kit Token
    const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
    const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      appID,
      serverSecret,
      roomID,
      userID,
      fullName || "user" + Date.now(),
      720
    );

    // Create instance object from Kit Token
    const zp = ZegoUIKitPrebuilt.create(kitToken);

    // Generate the shareable link
    const shareableLink =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?roomID=" +
      roomID;

    storeUrlInDatabase(shareableLink, fullName, roomID, userID);

    // Timer to end the meeting after 10 minutes
    const endMeetingTimer = setTimeout(() => {
      setMeetingEnded(true);
      Swal.fire({
        title: "Meeting Ended",
        text: "The meeting has ended. Thank you for joining!",
        icon: "info",
        confirmButtonText: "OK",
      }).then(() => {
        router.push("/protected/colab-summary/gemini");
      });
    }, 0.5 * 60 * 1000); // 10 minutes in milliseconds   

    return () => {
      clearTimeout(endMeetingTimer);
      zp.destroy();
    };
  }, [roomID, userID]); // Ensure it runs only when dependencies change

  useEffect(() => {
    if (meetingContainerRef.current && !meetingEnded && userID) {
      // Start the call only if the meeting has not ended
      const appID = parseInt(process.env.NEXT_PUBLIC_ZEGO_APP_ID!);
      const serverSecret = process.env.NEXT_PUBLIC_ZEGO_SERVER_SECRET!;
      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID, // Logged-in user ID
        fullName || "user" + Date.now(),
        720
      );

      // Create instance object from Kit Token
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
  }, [roomID, fullName, meetingEnded, userID]); // Ensure userID is available before running

  return (
    <div>
      <div className="w-full h-screen" ref={meetingContainerRef}></div>
      <RecordMeeting meetingData={{roomID, userID}} meetingEnded={meetingEnded} />
    </div>
  );
};

export default Room;
