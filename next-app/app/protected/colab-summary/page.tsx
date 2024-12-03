"use client";

import useUser from "../../../hooks/colab-summary/useUser";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { v4 as uuid } from "uuid";

export default function Home() {
  const { fullName, setFullName } = useUser();
  const [roomID, setRoomID] = useState("");
  const router = useRouter();

  useEffect(() => {
    setFullName("");
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