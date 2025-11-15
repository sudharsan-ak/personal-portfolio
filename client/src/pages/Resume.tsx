import React from "react";

export default function Resume() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Sudharsan Srinivasan - Resume
      </h1>
      <iframe
        src="/resume.pdf"
        title="Resume"
        className="w-full max-w-4xl h-[80vh] border border-gray-300 rounded-lg shadow-lg"
      />
      <a
        href="/resume.pdf"
        download
        className="mt-6 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-500 transition"
      >
        Download Resume
      </a>
    </div>
  );
}
