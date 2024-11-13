import React from "react";

interface PdfViewerProps {
  fileUrl: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ fileUrl }) => {
  console.log(fileUrl);
  return (
    <div>
      <iframe
        src={fileUrl + "#toolbar=0"}
        height="90vh"
        width="100%"
        className="h-[900vh]"
      />
    </div>
  );
};

export default PdfViewer;
