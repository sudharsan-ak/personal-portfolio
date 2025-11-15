import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Resume() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isMobile, setIsMobile] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth * 0.95;
      setPageWidth(width > 800 ? 800 : width);
      setIsMobile(window.innerWidth < 768);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Zoom functions (desktop only)
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background/70 dark:bg-card/70 backdrop-blur-md p-2 md:p-6">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center text-foreground dark:text-background">
        Sudharsan Srinivasan - Resume
      </h1>

      {/* Zoom Controls only on desktop */}
      {!isMobile && (
        <div className="flex gap-2 mb-4">
          <button
            onClick={zoomOut}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition"
          >
            -
          </button>
          <button
            onClick={zoomIn}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 transition"
          >
            +
          </button>
        </div>
      )}

      {/* Scrollable PDF container */}
      <div
        className={`overflow-auto w-full max-w-[800px] border border-gray-300 rounded-md ${
          isMobile ? "" : "h-[80vh]"
        }`}
        style={{ cursor: !isMobile ? "grab" : "auto" }}
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: "100%",
          }}
        >
          <Document
            file="/resume.pdf"
            onLoadSuccess={onDocumentLoadSuccess}
            loading={<p className="text-indigo-500">Loading Resume...</p>}
          >
            {Array.from(new Array(numPages), (_, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                width={pageWidth}
                renderTextLayer={false}
                renderAnnotationLayer={true}
              />
            ))}
          </Document>
        </div>
      </div>

      {/* Download Button immediately below PDF on mobile */}
      <a
        href="/Sudharsan Srinivasan Resume 2025.pdf"
        download="Sudharsan Srinivasan Resume 2025.pdf"
        className="mt-4 md:mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80 transition"
      >
        Download Resume
      </a>
    </div>
  );
}
