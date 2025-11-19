// client/src/pages/API.tsx
import React, { useState } from "react";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey?: string; // Key to copy from the JSON
  type?: "input"; // indicates this API uses user input
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
    {
      title: "API Visitor Counter",
      description: "Returns the number of times this API has been visited.",
      path: "/api/visits",
    },
    {
      title: "SHA256 Hash Generator",
      description: "Send text and receive its SHA256 hash.",
      path: "/api/hash",
      copyKey: "hash",
      type: "input",
    },
  ];

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const isExpanded = !prev[path];
      if (!isExpanded && endpoints.find((e) => e.path === path)?.type === "input") {
        setInputs((inp) => ({ ...inp, [path]: "" }));
        setResponses((resp) => ({ ...resp, [path]: undefined }));
      }
      return { ...prev, [path]: isExpanded };
    });
  };

  const fetchData = async (path: string, type?: string) => {
    try {
      const res =
        type === "input"
          ? await fetch(path, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ text: inputs[path] || "" }),
            })
          : await fetch(path);

      const data = await res.json();
      setResponses((prev) => ({ ...prev, [path]: data }));
    } catch {
      setResponses((prev) => ({ ...prev, [path]: { error: "Error fetching data" } }));
    }
  };

  const copyData = (path: string, key: string) => {
    const data = responses[path];
    if (!data || data[key] === undefined) return;

    navigator.clipboard.writeText(data[key].toString());
    setToast(`Copied: "${data[key]}"`);
    setTimeout(() => setToast(null), 2000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map((endpoint) => {
        const response = responses[endpoint.path];
        const isOpen = expanded[endpoint.path] || false;

        return (
          <section key={endpoint.path} className="mb-6 border border-gray-700 rounded">
            {/* Header */}
            <div
              className={`flex justify-between items-center cursor-pointer p-4 rounded transition-colors duration-200
                ${isOpen ? "bg-gray-700" : "bg-gray-900 hover:bg-gray-800"}`}
              onClick={() => toggleExpand(endpoint.path)}
            >
              <h2 className="text-2xl font-semibold text-white">{endpoint.title}</h2>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${
                  isOpen ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </div>

            {isOpen && (
              <div className="p-4 bg-gray-800">
                <p className="mb-4 text-gray-300">{endpoint.description}</p>

                {endpoint.type === "input" && (
                  <input
                    type="text"
                    placeholder="Enter text..."
                    value={inputs[endpoint.path] || ""}
                    onChange={(e) =>
                      setInputs((prev) => ({ ...prev, [endpoint.path]: e.target.value }))
                    }
                    className="w-full sm:w-auto px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 mb-4"
                  />
                )}

                <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4">
                  <button
                    onClick={() => fetchData(endpoint.path, endpoint.type)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
                  >
                    Try It
                  </button>

                  {endpoint.copyKey && response && (
                    <button
                      onClick={() => copyData(endpoint.path, endpoint.copyKey!)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
                    >
                      Copy {endpoint.copyKey}
                    </button>
                  )}
                </div>

                {response && (
                  <pre className="mt-4 p-4 bg-gray-700 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-600">
                    {JSON.stringify(response, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </section>
        );
      })}

      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

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
