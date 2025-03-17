"use client";

import { Button } from "@/components/ui/button";
import { useUserFromCookie } from "@/utils/restrictClient";

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userEmail: string;
  height?: string; // Added optional height prop
}

export default function Navbar({
  activeTab,
  setActiveTab,
  userEmail,
  height = "500px", // Default value remains "fit"
}: NavbarProps) {
  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div
      className="w-64 bg-gray-100 p-4 flex flex-col gap-2 rounded-lg shadow-md sticky top-0"
      style={{ height: height }} // Apply height via inline style
    >
      <Button
        onClick={() => handleTabClick("Courses")}
        className={`w-full border-2 border-black ${
          activeTab === "Courses"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Courses
      </Button>
      <Button
        onClick={() => handleTabClick("Students")}
        className={`w-full border-2 border-black ${
          activeTab === "Students"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Students
      </Button>
      <Button
        onClick={() => handleTabClick("Preferences")}
        className={`w-full border-2 border-black ${
          activeTab === "Preferences"
            ? "bg-transparent text-black border-4"
            : "bg-black text-white border-2 hover:bg-white hover:text-black"
        }`}
      >
        Preferences
      </Button>
    </div>
  );
}
