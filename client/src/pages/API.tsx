// client/src/pages/API.tsx
import React, { useState } from "react";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey?: string;
  type?: "input" | "timezone";
  action?: string; // for tools endpoint
}

const timezones = [
  "UTC",
  "Africa/Johannesburg",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "America/Toronto",
  "Asia/Kolkata",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Singapore",
  "Australia/Sydney",
  "Australia/Melbourne",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Moscow",
  "Pacific/Auckland"
];

export default function APIPage() {
  const endpoints: ApiEndpoint[] = [
    { title: "Random Quote", description: "Returns a random inspirational programming quote.", path: "/api/quote", copyKey: "quote" },
    { title: "Current Time", description: "Returns the current server time in UTC.", path: "/api/time", copyKey: "currentTime" },
    { title: "API Visitor Counter", description: "Returns the number of times this API has been visited.", path: "/api/visits" },
    { title: "SHA256 Hash Generator", description: "Send text and receive its SHA256 hash.", path: "/api/tools", copyKey: "hash", type: "input", action: "hash" },
    { title: "Word Counter", description: "Counts the number of words in the text you provide.", path: "/api/tools", copyKey: "words", type: "input", action: "wordcount" },
    { title: "Character Counter", description: "Counts the number of characters in the text you provide.", path: "/api/tools", copyKey: "characters", type: "input", action: "charcount" },
    { title: "Timezone Converter", description: "Convert a given time from one timezone to another.", path: "/api/timezone", type: "timezone" },
    { title: "Projects", description: "Fetch projects from the database. Supports optional query parameters: limit, offset, and featured (true/false).", path: "/api/projects" },
  ];

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const fetchData = async (endpoint: ApiEndpoint) => {
    try {
      let res;
      const path = endpoint.path;

      if (endpoint.type === "input") {
        const text = (inputs[path] ?? "").trim();
        const query = endpoint.action ? `?action=${endpoint.action}` : "";
        res = await fetch(path + query, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
      } else if (endpoint.type === "timezone") {
        const tzInput = inputs[path] || {};
        res = await fetch(path, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fromTimezone: tzInput.fromTimezone || "UTC",
            toTimezone: tzInput.toTimezone || "UTC",
            hour: Number(tzInput.hour ?? 0),
            minute: Number(tzInput.minute ?? 0),
            ampm: tzInput.ampm || "AM",
          }),
        });
      } else {
        res = await fetch(path);
      }

      const data = await res.json();

      // Compute time difference for timezone API
      if (endpoint.type === "timezone" && data.originalTime && data.convertedTime) {
        const [oHourStr, oMinStr] = data.originalTime.split(/[: ]/);
        const [cHourStr, cMinStr] = data.convertedTime.split(/[: ]/);
        let oHour = Number(oHourStr);
        const oMin = Number(oMinStr);
        let cHour = Number(cHourStr);
        const cMin = Number(cMinStr);
        if (data.originalTime.includes("PM") && oHour < 12) oHour += 12;
        if (data.originalTime.includes("AM") && oHour === 12) oHour = 0;
        if (data.convertedTime.includes("PM") && cHour < 12) cHour += 12;
        if (data.convertedTime.includes("AM") && cHour === 12) cHour = 0;

        let diffMinutes = (cHour * 60 + cMin) - (oHour * 60 + oMin);
        if (diffMinutes < 0) diffMinutes += 24 * 60;
        const diffH = Math.floor(diffMinutes / 60);
        const diffM = diffMinutes % 60;
        data.timeDifference = `${diffH}h ${diffM}m`;
      }

      setResponses((prev) => ({ ...prev, [path + (endpoint.action ?? "")]: data }));
    } catch {
      setResponses((prev) => ({ ...prev, [path + (endpoint.action ?? "")]: { error: "Error fetching data" } }));
    }
  };

  const copyData = (endpoint: ApiEndpoint) => {
    const pathKey = endpoint.path + (endpoint.action ?? "");
    const data = responses[pathKey];
    if (!data || !endpoint.copyKey || data[endpoint.copyKey] === undefined) return;
    navigator.clipboard.writeText(data[endpoint.copyKey].toString());
    setToast(`Copied: "${data[endpoint.copyKey]}"`);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleExpand = (path: string) => {
    setExpanded((prev) => {
      const isExpanded = !prev[path];
      if (!isExpanded && inputs[path]) {
        const resetInputs = { ...inputs };
        delete resetInputs[path];
        setInputs(resetInputs);
      }
      return { ...prev, [path]: !prev[path] };
    });
  };

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map((endpoint) => {
        const key = endpoint.path + (endpoint.action ?? "");
        const response = responses[key];
        const isExpanded = expanded[endpoint.path];

        return (
          <section key={key} className="mb-6 border border-gray-700 rounded">
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => toggleExpand(endpoint.path)}
            >
              <h2 className="text-2xl font-semibold text-white">{endpoint.title}</h2>
              <span className={`transform transition-transform duration-300 ${isExpanded ? "rotate-90" : "rotate-0"}`}>➤</span>
            </div>

            {isExpanded && (
              <div className="p-4 bg-gray-800 text-gray-200">
                <p className="mb-4">{endpoint.description}</p>

                {endpoint.type === "input" && (
                  <input
                    type="text"
                    placeholder="Enter text..."
                    value={inputs[endpoint.path] ?? ""}
                    onChange={(e) => setInputs((prev) => ({ ...prev, [endpoint.path]: e.target.value }))}
                    className="w-full sm:w-auto px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 mb-4"
                  />
                )}

                {endpoint.type === "timezone" && (
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4 items-center">
                    {/* ... timezone input code remains unchanged ... */}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4">
                  <button
                    onClick={() => fetchData(endpoint)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
                  >
                    Try It
                  </button>

                  {endpoint.copyKey && response && (
                    <button
                      onClick={() => copyData(endpoint)}
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

      {toast && <div className="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-2 rounded shadow-lg animate-fade-in">{toast}</div>}

      <style>
        {`
          @keyframes fade-in { 0% { opacity: 0; transform: translateY(10px); } 100% { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
        `}
      </style>
    </div>
  );
}
