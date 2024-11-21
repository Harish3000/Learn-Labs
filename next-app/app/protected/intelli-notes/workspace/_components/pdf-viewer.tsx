import React from "react";
import { Button } from "@/components/ui/button";

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, fileName }) => {
  console.log(fileUrl);
  return (
    <>
      <div className="p-4 flex items-center justify-between shadow-md">
        <div className="flex-1">
          {/* This empty div helps push the heading to the center */}
        </div>
        <h2 className="text-lg font-bold flex-1 text-center">{fileName}</h2>
        <div className="flex-1 flex justify-end">
          <Button size="sm">Save</Button>
        </div>
      </div>
      <div>
        <iframe
          src={fileUrl + "#toolbar=0"}
          width="100%"
          className="overflow-scroll h-[90vh]"
        />
      </div>
    </>
  );
};

export default PdfViewer;
