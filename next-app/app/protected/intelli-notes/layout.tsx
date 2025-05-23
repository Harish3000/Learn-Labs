"use client";

import React from "react";
import DashboardLayout from "./dashboard/layout";
import AdminLayout from "./admin/layout";
import { useRestrictClient } from "@/utils/restrictClient"; // Adjust the import path as needed

interface IntelliNotesProps {
  children: React.ReactNode;
}

const IntelliNotes: React.FC<IntelliNotesProps> = ({ children }) => {
  const { user, loading } = useRestrictClient(["admin", "user"]); // Allow both roles but render different layouts

  // Show loading screen until we have user data
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );
  }

  // Render the correct layout based on user role
  return user?.user_metadata?.role === "admin" ? (
    <AdminLayout>{children}</AdminLayout>
  ) : (
    <DashboardLayout>{children}</DashboardLayout>
  );
};

export default IntelliNotes;
