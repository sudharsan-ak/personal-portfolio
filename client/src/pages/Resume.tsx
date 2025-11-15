import React from "react";

export default function Resume() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background/70 dark:bg-card/70 backdrop-blur-md p-6">
      <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center text-foreground dark:text-background">
        Sudharsan Srinivasan - Resume
      </h1>

      {/* PDF Viewer */}
      <iframe
        src="/resume.pdf"
        title="Resume"
        className="w-full max-w-4xl h-[80vh] border border-border rounded-xl shadow-lg"
      />

      {/* Download Button */}
      <a
        href="/resume.pdf"
        download
        className="mt-6 px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-md hover:bg-primary/80 transition"
      >
        Download Resume
      </a>
    </div>
  );
}
