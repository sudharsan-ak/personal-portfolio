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

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Public REST API</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold">GET /api/quote</h2>
        <p className="text-gray-300 mb-4">
          Returns a random inspirational programming quote.
        </p>

        <button
          onClick={fetchQuote}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          Try It
        </button>

        {quote && (
          <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded">
            {quote}
          </pre>
        )}
      </section>
    </div>
  );
}
