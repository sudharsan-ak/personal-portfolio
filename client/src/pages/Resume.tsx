import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function Resume() {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageWidth, setPageWidth] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [isDragging, setIsDragging] = useState(false);
  const [origin, setOrigin] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Responsive width
  useEffect(() => {
    const updateWidth = () => {
      const width = window.innerWidth * 0.95;
      setPageWidth(width > 800 ? 800 : width);
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Drag handlers for pan
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setOrigin({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({ x: e.clientX - origin.x, y: e.clientY - origin.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setOrigin({ x: touch.clientX - translate.x, y: touch.clientY - translate.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setTranslate({ x: touch.clientX - origin.x, y: touch.clientY - origin.y });
  };

  const handleTouchEnd = () => setIsDragging(false);

  // Zoom in/out functions
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.2, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.2, 0.5));

  return (
    <div className="min-h-screen flex flex-col items-center justify-start bg-background/70 dark:bg-card/70 backdrop-blur-md p-2 md:p-6">
      <h1 className="text-2xl md:text-4xl font-bold mb-4 text-center text-foreground dark:text-background">
        Sudharsan Srinivasan - Resume
      </h1>

      {/* Zoom Controls */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={zoomOut}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
        >
          -
        </button>
        <button
          onClick={zoomIn}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80"
        >
          +
        </button>
      </div>

      {/* PDF Document */}
      <div
        className="overflow-hidden"
        style={{
          width: pageWidth,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: "top left",
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

      {/* Download Button */}
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
