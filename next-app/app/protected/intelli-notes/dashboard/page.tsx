"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Pdf from "/app/pdf.png";
import Image from "next/image";
// import SyncButton from "../dashboard/_components/sync-button";

const Dashboard: React.FC = () => {
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "admin"
  });

  console.log("file list", fileList);

  return (
    <div className="grid grid-cols-2 md:grid-cold-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-10">
      <h2 className="font-bold text-3xl">Workspace</h2>
      {/* <SyncButton /> */}
      <div>
        {Array.isArray(fileList) &&
          fileList.map((file, index) => (
            <div
              key={index}
              className="flex p-5 shadow-md rounded-md flex-col items-center justify-center border cursor-pointer hover:scale-105 transition-all"
            >
              <Image src={Pdf} alt="file" width={50} height={50} />
              <h2 className="mt-3 font-medium text-lg">{file?.fileName}</h2>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Dashboard;
