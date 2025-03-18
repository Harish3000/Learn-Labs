"use client";

import React from "react";
import DashboardLayout from "../intelli-notes/dashboard/layout";
import AdminLayout from "../intelli-notes/admin/layout";
import { useRestrictClient } from "@/utils/restrictClient"; // Adjust the import path as needed

interface IntelliNotesProps {
  children: React.ReactNode;
}

const IntelliNotes: React.FC<IntelliNotesProps> = ({ children }) => {
  const { user, loading } = useRestrictClient(["admin", "user"]); // Allow both roles but render different layouts

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex items-center justify-center h-screen w-full bg-gray-50">
      {user?.user_metadata?.role !== "admin" ? (
        <DashboardLayout>{children}</DashboardLayout>
      ) : (
        <AdminLayout>{children}</AdminLayout>
      )}
    </main>
  );
};

export default IntelliNotes;
