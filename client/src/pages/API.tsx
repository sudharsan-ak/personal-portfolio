// client/src/pages/API.tsx
import React, { useState } from "react";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey?: string; // Key to copy from the JSON
  type?: "input" | "timezone"; // indicates input-based or timezone API
}

const timezones = [
  "UTC",
  "America/New_York",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Australia/Sydney",
];

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
    {
      title: "Word Counter",
      description: "Counts the number of words in the text you provide.",
      path: "/api/word-count",
      copyKey: "words",
      type: "input",
    },
    {
      title: "Character Counter",
      description: "Counts the number of characters in the text you provide.",
      path: "/api/char-count",
      copyKey: "characters",
      type: "input",
    },
    {
      title: "Timezone Converter",
      description: "Convert a given time from one timezone to another.",
      path: "/api/timezone",
      type: "timezone",
    },
  ];

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchData = async (path: string, type?: string) => {
    try {
      let res;
      if (type === "input") {
        res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: inputs[path] || "" }),
        });
      } else if (type === "timezone") {
        res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(inputs[path]),
        });
      } else {
        res = await fetch(path);
      }

      const data = await res.json();
      setResponses((prev) => ({ ...prev, [path]: data }));
    } catch {
      setResponses((prev) => ({
        ...prev,
        [path]: { error: "Error fetching data" },
      }));
    }
  };

  const copyData = (path: string, key: string) => {
    const data = responses[path];
    if (!data || data[key] === undefined) return;

    navigator.clipboard.writeText(data[key].toString());
    setToast(`Copied: "${data[key]}"`);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const isExpanded = !prev[path];
      // Reset inputs if collapsing
      if (!isExpanded && inputs[path]) {
        const resetInputs = { ...inputs };
        delete resetInputs[path];
        setInputs(resetInputs);
      }
      return { ...prev, [path]: !prev[path] };
    });
    // Clear previous response
    setResponses((prev) => ({ ...prev, [path]: undefined }));
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map((endpoint) => {
        const response = responses[endpoint.path];
        const isExpanded = expanded[endpoint.path];

        return (
          <section key={endpoint.path} className="mb-6 border border-gray-700 rounded">
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => toggleExpand(endpoint.path)}
            >
              <h2 className="text-2xl font-semibold">{endpoint.title}</h2>
              <span
                className={`transform transition-transform duration-300 ${
                  isExpanded ? "rotate-90" : "rotate-0"
                }`}
              >
                ➤
              </span>
            </div>

            {isExpanded && (
              <div className="p-4 bg-gray-800 text-gray-200">
                <p className="mb-4">{endpoint.description}</p>

                {/* Input for text-based APIs */}
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

                {/* Timezone converter inputs */}
                {endpoint.type === "timezone" && (
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4 items-center">
                    <select
                      value={inputs[endpoint.path]?.fromTimezone || "UTC"}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [endpoint.path]: { ...prev[endpoint.path], fromTimezone: e.target.value },
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>

                    <input
                      type="number"
                      min={1}
                      max={12}
                      placeholder="Hour"
                      value={inputs[endpoint.path]?.hour || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [endpoint.path]: { ...prev[endpoint.path], hour: e.target.value },
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 w-20"
                    />

                    <input
                      type="number"
                      min={0}
                      max={59}
                      placeholder="Minute"
                      value={inputs[endpoint.path]?.minute || ""}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [endpoint.path]: { ...prev[endpoint.path], minute: e.target.value },
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 w-20"
                    />

                    <select
                      value={inputs[endpoint.path]?.ampm || "AM"}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [endpoint.path]: { ...prev[endpoint.path], ampm: e.target.value },
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>

                    <select
                      value={inputs[endpoint.path]?.toTimezone || "UTC"}
                      onChange={(e) =>
                        setInputs((prev) => ({
                          ...prev,
                          [endpoint.path]: { ...prev[endpoint.path], toTimezone: e.target.value },
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
                    >
                      {timezones.map((tz) => (
                        <option key={tz} value={tz}>
                          {tz}
                        </option>
                      ))}
                    </select>
                  </div>
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
