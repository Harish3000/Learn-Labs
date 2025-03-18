"use client";

import useUser from "../../../hooks/colab-summary/useUser";
import { useRouter } from "next/navigation";
import { UUID } from "node:crypto";
import { useEffect, useState } from "react";
import { v4 as uuid, UUIDTypes } from "uuid";
import { FaExclamationTriangle } from "react-icons/fa";

export default function Home() {
  const { fullName, setFullName } = useUser();
  const [roomID, setRoomID] = useState("");
  const router = useRouter();
  const [users, setUsers] = useState<BreakroomAttendance[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  interface BreakroomAttendance {
    id: number,
    student_id: UUID;
    video_id: string;
    lecture_id: number;
    breakroom_id: string;
    canCreateMeeting: boolean;
  }

  useEffect(() => {
    setFullName("");

    const updateBreakroomIds = async (breakroomID: string, ids: number[]) => {
      try {
        const response = await fetch("/api/colab-summary", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            breakroomID: breakroomID,
            ids: ids,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error("Error updating breakroom IDs:", data.error);
        }

      } catch (error) {
        console.error("Error making API call:", error);
      }
    };

    const assignBreakRooms = (data: BreakroomAttendance[]): BreakroomAttendance[] => {
      const shuffledStudents = [...data].sort(() => Math.random() - 0.5); // Shuffle students
      const updatedUsers: BreakroomAttendance[] = [];
      const studentSet = new Set<number>(); // Keep track of assigned students
      let roomNumber = 1;
    
      for (let i = 0; i < shuffledStudents.length; i += 4) {
        const group = shuffledStudents.slice(i, i + 4);
        const breakroomID = `BRK${String(roomNumber).padStart(3, "0")}`;
    
        group.forEach((student) => {
          if (!studentSet.has(student.id)) {
            updatedUsers.push({ ...student, breakroom_id: breakroomID });
            studentSet.add(student.id);
          }
        });
    
        roomNumber++;
      }
    
      return updatedUsers;
    };    

    const fetchBreakRoomData = async () => {
      try {
        const response = await fetch("/api/colab-summary");
        const data = await response.json();

        if (!response.ok) {
          console.error("Error fetching breakroom data:", data.error);
        } else {
          const updatedUsers = assignBreakRooms(data);
          setUsers(updatedUsers);

          // Extract breakroom IDs and student IDs
          const breakroomMap = updatedUsers.reduce((acc, user) => {
            if (!acc[user.breakroom_id]) {
              acc[user.breakroom_id] = [];
            }
            acc[user.breakroom_id].push(user.id);
            return acc;
          }, {} as Record<string, number[]>);

          await Promise.all(
            Object.entries(breakroomMap).map(([breakroomID, ids]) => updateBreakroomIds(breakroomID, ids))
          );

          const response = await fetch("/api/colab-summary", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          });
  
          const updatedbreakroomdata = await response.json();
          localStorage.setItem("breakroomData", JSON.stringify(updatedbreakroomdata));
        }

      } catch (error) {
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBreakRoomData();
  }, []);

  return (
    <div className="w-full h-screen">
      <section className="bg-grey text-purple-100">
        <div className="mx-auto max-w-screen-xl px-4 py-32 flex-col gap-24 flex h-screen items-center h-full">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="bg-gradient-to-r from-purple-400 via-blue-500 to-black bg-clip-text font-extrabold text-transparent text-5xl">
              {`Let the brainstorming begin!`}
            </h1>
            <h1 className="bg-gradient-to-r from-purple-500 via-blue-500 to-black bg-clip-text font-extrabold text-transparent text-5xl">
              <span className="block">Welcome to Your Team's Collaboration Hub!</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl sm:text-xl/relaxed text-blue-700">
              Remember, this space is all about connecting ideas and building on what’s already been shared.
              Let’s make it productive, engaging, and inspiring!
            </p>
            <div className="flex items-center justify-center gap-4 mt-6">
              <input
                type="text"
                id="name"
                onChange={(e) => setFullName(e.target.value.toString())}
                className="border rounded-md focus:border-transparent focus:outline-none focus:ring-0 px-4 py-2 w-full text-black bg-purple-100"
                placeholder="Enter your name"
              />
            </div>

            {fullName && fullName.length >= 3 && (
              <>
                <div className="flex items-center justify-center gap-4 mt-6">
                  <input
                    type="text"
                    id="roomid"
                    value={roomID}
                    onChange={(e) => setRoomID(e.target.value)}
                    className="border rounded-md focus:border-transparent focus:outline-none focus:ring-0 px-4 py-2 w-full text-black bg-blue-100"
                    placeholder="Enter room ID to join a meeting"
                  />
                  <button
                    className="rounded-md bg-purple-700 px-10 py-[11px] text-m font-medium text-white focus:outline-none sm:w-auto hover:bg-purple-800"
                    onClick={() => router.push(`/protected/colab-summary/room/${roomID}`)}
                    disabled={!roomID}
                  >
                    Join
                  </button>
                </div>
                <div className="mt-4 flex items-center justify-center">
                  <button
                    className="text-lg font-medium text-blue-400 hover:text-purple-500 hover:underline"
                    onClick={() => router.push(`/protected/colab-summary/room/${uuid()}`)}
                  >
                    Or create a new meeting
                  </button>
                </div>

              </>
            )}
          </div>
        </div>
      </section>
    </div>

  );
}