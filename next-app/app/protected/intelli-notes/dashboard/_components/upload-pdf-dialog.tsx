"use client";

import * as React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Loader2Icon } from "lucide-react";
import { v4 as uuid4 } from "uuid";
// import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface UploadPdfDialogProps {
  children: ReactNode;
  isMaxFile: boolean;
}

interface UserRole {
  user_metadata: {
    role: string;
  };
}

const UploadPdfDialog: React.FC<UploadPdfDialogProps> = ({ children, isMaxFile }) => {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const addFileEntry = useMutation(api.storage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.storage.getFileUrl);
  // const user =useUser();
  const embeddDocument = useAction(api.myAction.ingest);

  const OnFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0]);
    }
  };

  const OnUpload = async () => {
    setLoading(true);

    // Step 1: Get a short-lived upload URL
    const postUrl = await generateUploadUrl();
    console.log("postUrl", postUrl); // Log to verify URL

    // Step 2: POST the file to the URL
    const result = await fetch(postUrl, {
      method: "POST",
      headers: { "Content-Type": file?.type || "application/pdf" },
      body: file
    });

    if (!result.ok) {
      throw new Error(`Upload failed with status: ${result.status}`);
    }
    const { storageId } = await result.json();
    console.log("Storage Id", storageId);

    const fileId = uuid4();
    const fileUrl = await getFileUrl({ storageId: storageId });
    const response = await addFileEntry({
      fileId: fileId,
      storageId: storageId,
      fileName: fileName ?? "Untitled",
      fileUrl: fileUrl ?? "",
      createdBy: "Admin"
    });
    console.log("Response", response);

    //API call to fetch PDF process Data
    const ApiResp = await axios.get(
      "/api/intellinote/pdf-loader?pdfUrl=" + fileUrl
    );
    console.log("ApiResp", ApiResp.data.result);

    if (ApiResp.data.result) {
      const embed = await embeddDocument({
        splitText: Array.isArray(ApiResp.data.result)
          ? ApiResp.data.result
          : [ApiResp.data.result],
        fileId: fileId
      });
      console.log("Embed", embed);
    }

    setLoading(false);
    setOpen(false);

    toast.info("File is Ready to view");
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="w-full gap-2"
          disabled={isMaxFile}>
          <Upload className="h-4 w-4" /> Upload PDF
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload PDF file</DialogTitle>
          <DialogDescription asChild>
            <div>
              <h2 className="mt-5">Select a file to upload</h2>
              <div className="gap-2 p-3 rounded-md border">
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(event) => OnFileSelect(event)}
                />
              </div>
              <div className="mt-2">
                <label>File Name *</label>
                <Input
                  placeholder="File Name"
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </DialogClose>
          <Button onClick={OnUpload} disabled={loading}>
            {loading ? <Loader2Icon className="animate-spin" /> : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UploadPdfDialog;
