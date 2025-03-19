"use client";
import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import Pdf from "/app/pdf.png";
import Image from "next/image";
import Link from "next/link";

const Dashboard: React.FC = () => {
  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "Admin",
  });

  console.log("file list", fileList);

  return (
    <div>
      <h2 className="font-bold text-3xl">Workspace</h2>
      <div className="grid grid-cols-2 md:grid-cold-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mt-10">
        {fileList
          ? fileList?.map((file, index) => (
              <Link href={"/protected/intelli-notes/workspace/" + file.fileId}>
                <div
                  key={index}
                  className="flex p-5 shadow-md rounded-md flex-col items-center justify-center border cursor-pointer hover:scale-105 transition-all"
                >
                  <Image src={Pdf} alt="file" width={100} height={50} />
                  <h2 className="mt-3 font-medium text-lg">{file?.fileName}</h2>
                </div>
              </Link>
            ))
          : [1, 2, 3, 4, 5, 6, 7, 8].map((item, index) => (
              <div
                key={index}
                className="bg-slate-200 round-md h-[170px] w-[150px] animate-pulse"
              ></div>
            ))}
      </div>
    </div>
  );
};

export default Dashboard;
