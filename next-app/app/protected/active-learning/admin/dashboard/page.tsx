"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import Courses from "./components/Courses";
import Students from "./components/Students";
import Preferences from "../../final-data/analysis/page";
import { useUserFromCookie } from "@/utils/restrictClient";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<string>("Courses");
  const user = useUserFromCookie();
  const userEmail = user?.email || "admin@learnlabs.com";

  return (
    <div className="flex min-h-screen">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userEmail={userEmail}
      />
      <div className="flex-1 p-6">
        {activeTab === "Courses" && <Courses />}
        {activeTab === "Students" && <Students />}
        {activeTab === "Preferences" && <Preferences />}
      </div>
    </div>
  );
}
