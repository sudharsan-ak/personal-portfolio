// client/src/pages/API.tsx

import React, { useState } from "react";

export default function APIPage() {
  const [quote, setQuote] = useState("");
  const [time, setTime] = useState("");

  // Fetch random quote
  const fetchQuote = async () => {
    try {
      const res = await fetch("/api/quote");
      const data = await res.json();
      setQuote(JSON.stringify(data, null, 2));
    } catch (err) {
      setQuote("Error fetching quote");
    }
  };

  // Copy quote to clipboard
  const copyQuote = () => {
    if (!quote) return;
    navigator.clipboard.writeText(quote);
    alert("Quote copied to clipboard!");
  };

  // Fetch current time
  const fetchTime = async () => {
    try {
      const res = await fetch("/api/time");
      const data = await res.json();
      setTime(JSON.stringify(data, null, 2));
    } catch (err) {
      setTime("Error fetching time");
    }
  };

  // Copy time to clipboard
  const copyTime = () => {
    if (!time) return;
    navigator.clipboard.writeText(time);
    alert("Time copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {/* Quote Endpoint */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">GET /api/quote</h2>
        <p className="text-gray-300 mb-4">
          Returns a random inspirational programming quote.
        </p>

        <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4">
          <button
            onClick={fetchQuote}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
          >
            Try It
          </button>

          {quote && (
            <button
              onClick={copyQuote}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
            >
              Copy Quote
            </button>
          )}
        </div>

        {quote && (
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-700">
            {quote}
          </pre>
        )}
      </section>

      {/* Time Endpoint */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">GET /api/time</h2>
        <p className="text-gray-300 mb-4">
          Returns the current server time in UTC.
        </p>

        <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4">
          <button
            onClick={fetchTime}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
          >
            Try It
          </button>

          {time && (
            <button
              onClick={copyTime}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
            >
              Copy Time
            </button>
          )}
        </div>

        {time && (
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-700">
            {time}
          </pre>
        )}
      </section>
    </div>
  );
}
