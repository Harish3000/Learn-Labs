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

interface UploadPdfDialogProps {
  children: ReactNode;
}

const UploadPdfDialog: React.FC<UploadPdfDialogProps> = ({ children }) => {
  const generateUploadUrl = useMutation(api.storage.generateUploadUrl);
  const addFileEntry = useMutation(api.storage.AddFileEntryToDb);
  const getFileUrl = useMutation(api.storage.getFileUrl);
  // const user =useUser();
  const embeddDocument = useAction(api.myAction.ingest);

  const [file, setFile] = React.useState<File | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [fileName, setFileName] = React.useState("");
  const [open, setOpen] = React.useState(false);

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
    console.log("storageId", storageId);

    const fileId = uuid4();
    const fileUrl = await getFileUrl({ storageId: storageId });
    const response = await addFileEntry({
      fileId: fileId,
      storageId: storageId,
      fileName: fileName ?? "Untitled",
      fileUrl: fileUrl ?? "",
      createdBy: "user._id"
    });
    console.log("response", response);

    //API call to fetch PDF process Data
    const ApiResp = await axios.get("/api/pdf-loader?pdfUrl=" + fileUrl);
    console.log("ApiResp", ApiResp.data.result);
    await embeddDocument({
      splitText: ApiResp.data.result,
      fileId: fileId
    });
    // console.log(embeddResult);
    setLoading(false);
    setOpen(false);
  };

  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)} className="w-full gap-2">
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
            <Button type="button" variant="secondary">
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
