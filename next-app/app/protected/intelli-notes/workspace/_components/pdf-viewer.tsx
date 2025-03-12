import React from "react";

interface PdfViewerProps {
  fileUrl: string;
  fileName: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl, fileName }) => {
  console.log("PDF Viewer initialized with fileUrl:", fileUrl);
  console.log("PDF Viewer initialized with fileName:", fileName);

  return (
    <>
      <div className="p-4 flex items-center justify-between shadow-md">
        <div className="flex-1">
          <h2 className="text-lg font-bold flex-1 text-center">{fileName}</h2>
        </div>
      </div>
      <div>
        <iframe
          // src={fileUrl + "#toolbar=0"}
          src={fileUrl}
          width="100%"
          className="overflow-scroll h-[90vh]"
        />
      </div>
    </>
  );
};

export default PdfViewer;
