import React from "react";

export default function Resume() {
  return (
    <div className="min-h-screen w-full bg-background/70 dark:bg-card/70 backdrop-blur-md p-0">
      {/* PDF Viewer full screen */}
      <iframe
        src="/resume.pdf"
        title="Sudharsan Srinivasan Resume"
        className="w-full h-screen"
        style={{ border: "none" }}
      />

      {/* Download Button overlayed at bottom-right */}
      <a
        href="/Sudharsan Srinivasan Resume 2025.pdf"
        download="Sudharsan Srinivasan Resume 2025.pdf"
        className="fixed bottom-6 right-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80 transition z-50"
      >
        Download Resume
      </a>
    </div>
  );
}
