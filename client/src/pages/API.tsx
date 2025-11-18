// client/src/pages/API.tsx

import React, { useState } from "react";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey: string; // key to copy from response
}

export default function APIPage() {
  const endpoints: ApiEndpoint[] = [
    {
      title: "Random Quote",
      description: "Returns a random inspirational programming quote.",
      path: "/api/quote",
      copyKey: "quote",
    },
    {
      title: "Current Time",
      description: "Returns the current server time in UTC.",
      path: "/api/time",
      copyKey: "currentTime",
    },
  ];

  // Store responses dynamically by path
  const [responses, setResponses] = useState<Record<string, string>>({});

  // Fetch API data
  const fetchData = async (path: string) => {
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponses((prev) => ({
        ...prev,
        [path]: JSON.stringify(data, null, 2),
      }));
    } catch (err) {
      setResponses((prev) => ({ ...prev, [path]: "Error fetching data" }));
    }
  };

  // Copy only relevant value from JSON
  const copyData = (path: string, key: string) => {
    const responseStr = responses[path];
    if (!responseStr) return;

    try {
      const parsed = JSON.parse(responseStr);
      const value = parsed[key];
      if (!value) return;

      navigator.clipboard.writeText(value);
      alert(`Copied: ${value}`);
    } catch {
      alert("Error copying value");
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map((endpoint) => (
        <section key={endpoint.path} className="mb-12">
          <h2 className="text-2xl font-semibold mb-2">GET {endpoint.path}</h2>
          <p className="text-gray-300 mb-4">{endpoint.description}</p>

          {/* Responsive Buttons */}
          <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4">
            <button
              onClick={() => fetchData(endpoint.path)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
            >
              Try It
            </button>

            {responses[endpoint.path] && (
              <button
                onClick={() => copyData(endpoint.path, endpoint.copyKey)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
              >
                Copy
              </button>
            )}
          </div>

          {/* Output */}
          {responses[endpoint.path] && (
            <pre className="mt-4 p-4 bg-gray-800 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-700">
              {responses[endpoint.path]}
            </pre>
          )}
        </section>
      ))}
    </div>
  );
}
