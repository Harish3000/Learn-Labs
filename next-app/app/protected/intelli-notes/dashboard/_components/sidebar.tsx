"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Upload } from "lucide-react";
import chatImage from "/app/mini.png";
import UploadPdfDialog from "./upload-pdf-dialog";

import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import axios from "axios";

// interface UserRole {
//   user_metadata: {
//     role: string;
//   };
// }

export default function Sidebar() {
  // const [userRole, setUserRole] = useState<UserRole | null>(null);
  // const [isLoading, setIsLoading] = useState(true);

  const fileList = useQuery(api.storage.GetUserFiles, {
    createdBy: "Admin"
  });

  // Fetch user role on component mount
  // useEffect(() => {
  //   const fetchUserRole = async () => {
  //     try {
  //       const response = await axios.get(
  //         '/api/intellinote/check-role?roles=["Admin"]'
  //       );
  //       setUserRole(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch user role:", error);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserRole();
  // }, []);

  // const isAdmin = userRole?.user_metadata.role === "Admin";
  // const isMaxFile = fileList?.length >= 5;

  return (
    <div className="fixed left-0 top-0 bottom-0 z-40 w-64 overflow-y-auto border-r bg-background p-4 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-6">
          <div className="flex items-center justify-left">
            <Image
              src={chatImage}
              alt="Logo"
              width={60}
              height={60}
              className="rounded-lg"
            />
            <p className="text-sm">
              <b>INTELLINOTE</b>
            </p>
          </div>

          {/* Upload button is disabled if user is not admin or max files reached */}
          {/* <UploadPdfDialog isMaxFile={isMaxFile || !isAdmin}>
            <Button
              className="w-full gap-2 m-5"
              disabled={isLoading || !isAdmin || isMaxFile}
              title={
                !isAdmin
                  ? "Only admins can upload files"
                  : isMaxFile
                    ? "Maximum files reached"
                    : ""
              }
            >
              <Upload className="h-4 w-4" /> Upload PDF
              {isLoading && "Loading..."}
            </Button>
          </UploadPdfDialog> */}

          <UploadPdfDialog isMaxFile={fileList?.length >= 5 ? true : false}>
            <Button className="w-full gap-2 m-5">
              <Upload className="h-4 w-4" /> Upload PDF
            </Button>
          </UploadPdfDialog>

          <nav className="flex flex-col space-y-3">
            <div className="flex gap-2 item-center p-3  hover:bg-slate-100 rounded-lg cursor-poniter">
              <Layout />
              <Link href="#workspace" className="text-sm font-medium">
                <h2> Workspace</h2>
              </Link>
            </div>

            <div className="flex gap-2 item-center p-3 hover:bg-slate-100 rounded-lg cursor-poniter">
              <Shield />
              <Link href="#upgrade" className="text-sm font-medium">
                Upgrade
              </Link>
            </div>
          </nav>
        </div>
        <div className="absolute bottom-8 w[80%]">
          <Progress value={(fileList?.length / 5) * 100} />
          <p className="text-sm mt-1">5 files can be Uploaded</p>
        </div>
      </div>
    </div>
  );
}
