import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import { ZoomIn, ZoomOut, RefreshCcw, Download } from "lucide-react";

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

  const zoomInHandler = () => setScale((prev) => Math.min(prev + 0.1, 3));
  const zoomOutHandler = () => setScale((prev) => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setScale(1.0);

  const Buttons = () => (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        onClick={zoomOutHandler}
        title="Zoom Out"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/80 transition"
      >
        <ZoomOut className="w-5 h-5" />
      </button>

      <span className="font-semibold text-lg">{(scale * 100).toFixed(0)}%</span>

      <button
        onClick={zoomInHandler}
        title="Zoom In"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/80 transition"
      >
        <ZoomIn className="w-5 h-5" />
      </button>
  
      <button
        onClick={resetZoom}
        title="Reset to 100%"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow hover:bg-primary/80 transition"
      >
        <RefreshCcw className="w-5 h-5" />
      </button>

      <a
        href="/Sudharsan Srinivasan Resume 2026.pdf"
        download="Sudharsan Srinivasan Resume 2026.pdf"
        className="px-4 py-2 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80 transition"
      >
        Download Resume
      </a>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background/70 dark:bg-card/70 backdrop-blur-md p-4 md:p-8">
      {/* Desktop Controls (top-right) */}
      <div className="w-full max-w-[900px] flex justify-end mb-3 hidden md:flex">
        <Buttons />
      </div>

      {/* Centered Title */}
      <h1 className="w-full max-w-[900px] text-2xl md:text-4xl font-bold text-foreground dark:text-background text-center mb-6">
        Sudharsan Srinivasan - Resume
      </h1>

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
              width={pageWidth * scale}
              renderTextLayer={false}
              renderAnnotationLayer={true}
            />
          ))}
        </Document>
      </div>

      {/* Mobile Controls (below PDF) */}
      <div className="w-full max-w-[900px] flex justify-center mt-4 md:hidden">
        <Buttons />
      </div>
    </div>
  );
}
