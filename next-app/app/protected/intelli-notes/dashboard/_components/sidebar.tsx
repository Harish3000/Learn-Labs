// "use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Shield, Upload } from "lucide-react";
import chatImage from "/app/mini.png";
import UploadPdfDialog from "./upload-pdf-dialog";

import { Button } from "@/components/ui/button";
import { Layout } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export default function Sidebar() {
  // const uploadProgress = {
  //   current: 2,
  //   total: 5
  // };

  return (
    <div className="fixed left-0 top-16 bottom-20 z-40 w-64 overflow-y-auto border-r bg-background p-4 shadow-lg">
      <div className="flex flex-col h-full">
        <div className="flex-grow space-y-6">
          <div className="flex items-center justify-center">
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
          <UploadPdfDialog>
              <Button className="w-full gap-2">
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

        {/* <div className="mt-auto space-y-2"> */}
        {/* <Progress
            value={(uploadProgress.current / uploadProgress.total) * 100}
          />
          <p className="text-xs text-muted-foreground">
            {uploadProgress.current} PDF out of {uploadProgress.total} pdf
            uploaded
          </p> */}

        {/* </div> */}
        <div className="absolute bottom-8 w[80%]">
          <Progress value={33} />
          <p className="text-sm mt-1">2 out of 5 Pdf Uploaded</p>
          <p className="text-xs text-gray-400 mt-2">
            Upgrade to upload more PDF
          </p>
        </div>
      </div>
    </div>
  );
}
