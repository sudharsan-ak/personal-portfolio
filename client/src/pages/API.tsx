// client/src/pages/API.tsx

import React, { useState } from "react";
import { useToast } from "@/components/hooks/use-toast"; // adjust path if needed

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey: string;
}

export default function APIPage() {
  const { toast } = useToast();

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

  const [responses, setResponses] = useState<Record<string, Record<string, any>>>({});

  const fetchData = async (path: string) => {
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [path]: data }));
    } catch (err) {
      setResponses((prev) => ({ ...prev, [path]: { error: "Error fetching data" } }));
    }
  };

  const copyData = (path: string, key: string) => {
    const data = responses[path];
    if (!data || !data[key]) return;

    navigator.clipboard.writeText(data[key]);
    toast({
      title: "Copied!",
      description: `"${data[key]}" copied to clipboard.`,
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map((endpoint) => (
        <section key={endpoint.path} className="mb-12">
          <h2 className="text-2xl font-semibold mb-2">GET {endpoint.path}</h2>
          <p className="text-gray-300 mb-4">{endpoint.description}</p>

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

          {responses[endpoint.path] && (
            <pre className="mt-4 p-4 bg-gray-800 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-700">
              {Object.entries(responses[endpoint.path]).map(([k, v]) => (
                <div key={k}>
                  <span className="font-semibold text-green-300">{k}:</span> {v}
                </div>
              ))}
            </pre>
          )}
        </section>
      ))}
    </div>
  );
}
