// client/src/pages/API.tsx

import React, { useState } from "react";

export default function APIPage() {
  const [quote, setQuote] = useState("");

  const fetchQuote = async () => {
    try {
      const res = await fetch("/api/quote");
      const data = await res.json();
      setQuote(JSON.stringify(data, null, 2));
    } catch (err) {
      setQuote("Error fetching quote");
    }
  };

  const copyQuote = () => {
    if (!quote) return;
    navigator.clipboard.writeText(quote);
    alert("Quote copied to clipboard!");
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">GET /api/quote</h2>
        <p className="text-gray-300 mb-4">
          Returns a random inspirational programming quote.
        </p>

        {/* Responsive Buttons */}
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

        {/* Quote Output */}
        {quote && (
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-700">
            {quote}
          </pre>
        )}
      </section>
    </div>
  );
}
