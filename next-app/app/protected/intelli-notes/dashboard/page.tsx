"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

const Page: React.FC = () => {
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "user._id"
  });
  console.log("file list", fileList);
  return (
    <div>
      <h2 className="font-bold text-3xl">Workspace</h2>
    </div>
  );
};

export default Page;
