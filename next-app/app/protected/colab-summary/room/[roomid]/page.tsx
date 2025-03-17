"use client";

import useUser from "../../../../../hooks/colab-summary/useUser";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import RecordMeeting from "../[roomid]/comp/RecordMeeting";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

const Room = ({ params }: { params: { roomid: string } }) => {
  const { fullName } = useUser();
  const roomID = params.roomid;
  const meetingContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [meetingEnded, setMeetingEnded] = useState(false);
  const [userID, setUserID] = useState("");
  const [breakroomID, setBreakroomID] = useState<number | null>(null);
  const [isFetched, setIsFetched] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        let token = Cookies.get("sb-mmvkkgidcuocgkvxjljd-auth-token");
        if (!token) {
          console.warn("Token not found in cookies");
          return;
        }

        if (token.startsWith("base64-")) {
          token = token.replace("base64-", "");
        }

        const decodedToken = jwtDecode(atob(token));
        const userId = decodedToken?.sub ?? "";

        setUserID(userId);

        const storedData = localStorage.getItem("breakroomData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          const userBreakroom = parsedData.find(
            (room: any) => room.student_id === userId
          );

          if (userBreakroom) {
            setBreakroomID(userBreakroom.id);
          }
        }
      } catch (error) {
        console.error("Error decoding token", error);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    if (breakroomID && userID && !isFetched) {
      const fetchBreakroomDetails = async () => {
        try {
          const response = await fetch(
            `/api/colab-summary/session?breakroomID=${breakroomID}&userID=${userID}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            throw new Error("Failed to fetch breakroom details.");
          }

          const data = await response.json();
          setBreakroomID(data[0].id);
          setIsFetched(true);
        } catch (error) {
          console.error("Error fetching breakroom details:", error);
          toast.error("Error fetching breakroom details.");
        }
      };

      fetchBreakroomDetails();
    }
  }, [breakroomID, userID, isFetched]);

  // Function to store the URL in the database
  const storeUrlInDatabase = async (
    url: string,
    name: string,
    roomID: string,
    userID: string,
    breakroomID: number
  ) => {
    try {
      const response = await fetch("/api/colab-summary/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, name, roomID, userID, breakroom_id: breakroomID }),
      });

      const responseDataRow = await response.json();  
      localStorage.setItem("breakroomAttendance", JSON.stringify(responseDataRow.data));

      if (!response.ok) {
        console.error("Failed to store URL in database");
      }
    } catch (error) {
      console.error("Error storing URL:", error);
    }
  };

  useEffect(() => {
    if (!userID || !breakroomID) return;

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

    const zp = ZegoUIKitPrebuilt.create(kitToken);

    const shareableLink =
      window.location.protocol +
      "//" +
      window.location.host +
      window.location.pathname +
      "?roomID=" +
      roomID;

    storeUrlInDatabase(shareableLink, fullName, roomID, userID, breakroomID);

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
  }, [roomID, userID, breakroomID]);

  useEffect(() => {
    if (meetingContainerRef.current && !meetingEnded && userID) {
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
  }, [roomID, fullName, meetingEnded, userID]);

  return (
    <div>
      <div className="w-full h-screen" ref={meetingContainerRef}></div>
      <RecordMeeting meetingData={{ roomID, userID }} meetingEnded={meetingEnded} />
    </div>
  );
};

export default Room;
