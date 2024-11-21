"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import PdfViewer from "../_components/pdf-viewer";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import TextEditor from "../_components/text-editor";

const Workspace: React.FC = () => {
  const params = useParams() as { fileId: string };
  const { fileId } = params;

  // Ensure useQuery is typed to return a FileInfo or undefined
  const fileInfo = useQuery(api.storage.GetFileRecord, { fileId: fileId });

  useEffect(() => {
    if (fileInfo) {
      console.log(fileInfo);
    }
  }, [fileInfo]);

  return (
    <div className="grid grid-cols-2">
      <div>
        {/* Text editor */}
        <TextEditor fileId={fileId} />
      </div>
      <div>
        {/* Pdf viewer */}
        {fileInfo?.fileUrl ? (
          <PdfViewer
            fileUrl={fileInfo.fileUrl}
            fileName={fileInfo.fileName || "Untitled"} // Fallback if fileName is undefined
          />
        ) : (
          <p>No file available</p>
        )}
      </div>
    </div>
  );
};

export default Workspace;
