import React, { useState } from "react";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey: string;
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

  const [responses, setResponses] = useState<Record<string, Record<string, any>>>({});
  const [toast, setToast] = useState<string | null>(null);

  const fetchData = async (path: string) => {
    try {
      const res = await fetch(path);
      const data = await res.json();
      setResponses((prev) => ({ ...prev, [path]: data }));
    } catch {
      setResponses((prev) => ({ ...prev, [path]: { error: "Error fetching data" } }));
    }
  };

  const copyData = (path: string, key: string) => {
    const data = responses[path];
    if (!data || !data[key]) return;

    navigator.clipboard.writeText(data[key]);
    setToast(`Copied: "${data[key]}"`);

    // Hide toast after 2 seconds
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
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

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* Tailwind animation */}
      <style>
        {`
          @keyframes fade-in {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
        `}
      </style>
    </div>
  );
}
