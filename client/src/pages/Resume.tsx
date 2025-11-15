import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Resume() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth * 0.95;
      setPageWidth(width > 800 ? 800 : width);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.1, 0.5));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background/70 dark:bg-card/70 backdrop-blur-md p-4 md:p-8">
      {/* Title and Controls */}
      <div className="w-full max-w-[900px] relative mb-6 flex justify-center items-center">
        <h1 className="text-2xl md:text-4xl font-bold text-foreground dark:text-background text-center">
          Sudharsan Srinivasan - Resume
        </h1>
      
        <div className="absolute right-0 flex items-center gap-3">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition"
          >
            -
          </button>
          <span className="font-semibold">{(scale * 100).toFixed(0)}%</span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition"
          >
            +
          </button>
      
          <a
            href="/Sudharsan Srinivasan Resume 2025.pdf"
            download="Sudharsan Srinivasan Resume 2025.pdf"
            className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80 transition"
          >
            Download Resume
          </a>
        </div>
      </div>


      {/* PDF */}
      <div className="w-full flex justify-center">
        <Document
          file="/resume.pdf"
          onLoadSuccess={onDocumentLoadSuccess}
          loading={<p className="text-indigo-500">Loading Resume...</p>}
        >
          {Array.from(new Array(numPages), (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={pageWidth * scale} // scale applied directly
              renderTextLayer={false}
              renderAnnotationLayer={true}
            />
          ))}
        </Document>
      </div>
    </div>
  );
}
