import React, { useState, useRef, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import InteractiveCard from "@/components/ui/InteractiveCard";

interface ApiEndpoint {
  title: string;
  description: string;
  path: string;
  copyKey?: string;
  type?: "input" | "timezone" | "get" | "time" | "quote";
  action?: string;
}

const timezones = [
  "UTC","Africa/Johannesburg","America/New_York","America/Chicago",
  "America/Denver","America/Los_Angeles","America/Sao_Paulo","America/Toronto",
  "Asia/Kolkata","Asia/Tokyo","Asia/Shanghai","Asia/Singapore",
  "Australia/Sydney","Australia/Melbourne","Europe/London","Europe/Berlin",
  "Europe/Paris","Europe/Moscow","Pacific/Auckland"
];

export default function APIPage() {
  const endpoints: ApiEndpoint[] = [
    { title: "Random Quote", description: "Returns a random programming quote.", path: "/api/tools", copyKey: "quote", type: "quote", action: "quote" },
    { title: "Current Time", description: "Returns the current server time in UTC.", path: "/api/tools", copyKey: "localTime", type: "time", action: "time" },
    { title: "SHA256 Hash Generator", description: "Send text and receive its SHA256 hash.", path: "/api/tools", copyKey: "hash", type: "input", action: "hash" },
    { title: "Word Counter", description: "Counts the number of words in the text.", path: "/api/tools", copyKey: "words", type: "input", action: "wordcount" },
    { title: "Character Counter", description: "Counts the number of characters in the text.", path: "/api/tools", copyKey: "characters", type: "input", action: "charcount" },
    { title: "Timezone Converter", description: "Convert a given time from one timezone to another.", path: "/api/tools", type: "timezone", action: "timezone" },
    { title: "Projects", description: "Fetch projects from AWS Lambda (Supabase-backed). Supports optional query parameter: limit.", path: "https://nxlxvfrsvyk7jjxdchbgaqxyvm0otytd.lambda-url.us-east-2.on.aws/" || "/api/projects", type: "get" }
  ];

  const [responses, setResponses] = useState<Record<string, any>>({});
  const [inputs, setInputs] = useState<Record<string, any>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const projectScrollRefs = useRef<Record<string, HTMLDivElement>>({});
  const [scrollState, setScrollState] = useState<Record<string, { left: boolean; right: boolean }>>({});

  const fetchData = async (endpoint: ApiEndpoint) => {
    try {
      let body: any = {};

      if (endpoint.type === "input") {
        body = {
          action: endpoint.action,
          text: inputs[endpoint.title] ?? ""
        };
      } else if (endpoint.type === "timezone") {
        const tzInput = inputs[endpoint.title] || {};
        body = {
          action: "timezone",
          ...tzInput,
          hour: tzInput.hour !== undefined && tzInput.hour !== "" ? Number(tzInput.hour) : 12,
          minute: tzInput.minute !== undefined && tzInput.minute !== "" ? Number(tzInput.minute) : 0,
          fromTimezone: tzInput.fromTimezone || "UTC",
          toTimezone: tzInput.toTimezone || "UTC",
          ampm: tzInput.ampm || "AM",
        };
      } else if (endpoint.type === "quote") {
        body = { action: "quote" };
      } else if (endpoint.type === "time") {
        body = { action: "time", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone };
      }

      let url = endpoint.path;
      if (endpoint.type === "get") {
        const limit = inputs[endpoint.title]?.limit;
        if (limit && limit !== "") {
          url += `?limit=${encodeURIComponent(limit)}`;
        }
      }

      const res = await fetch(url, {
        method: endpoint.type === "get" ? "GET" : "POST",
        headers: endpoint.type === "get" ? {} : { "Content-Type": "application/json" },
        body: endpoint.type === "get" ? undefined : JSON.stringify(body),
      });

      const data = await res.json();
      setResponses(prev => ({ ...prev, [endpoint.title]: data }));

      if (endpoint.title === "Projects") {
        setTimeout(() => updateScrollButtons(endpoint.title), 100);
      }
    } catch {
      setResponses(prev => ({ ...prev, [endpoint.title]: { error: "Error fetching data" } }));
    }
  };

  const copyData = (title: string, key: string) => {
    const data = responses[title];
    if (!data || data[key] === undefined) return;
    navigator.clipboard.writeText(data[key].toString());
    setToast(`Copied: "${data[key]}"`);
    setTimeout(() => setToast(null), 2000);
  };

  const toggleExpand = (title: string) => {
    setExpanded(prev => ({ ...prev, [title]: !prev[title] }));
    setResponses(prev => ({ ...prev, [title]: undefined }));
  };

  const scrollProjects = (title: string, direction: "left" | "right") => {
    const container = projectScrollRefs.current[title];
    if (!container) return;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === "right" ? scrollAmount : -scrollAmount, behavior: "smooth" });
  };

  const updateScrollButtons = (title: string) => {
    const container = projectScrollRefs.current[title];
    if (!container) return;
    const atStart = container.scrollLeft <= 0;
    const atEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1;
    setScrollState(prev => ({ ...prev, [title]: { left: !atStart, right: !atEnd } }));
  };

  const handleScroll = (title: string) => updateScrollButtons(title);

  useEffect(() => {
    if (responses["Projects"]?.data) {
      updateScrollButtons("Projects");
    }
  }, [responses]);

  return (
    <div className="p-8 max-w-5xl mx-auto relative">
      <h1 className="text-4xl font-bold mb-6 text-center">Public REST API</h1>

      {endpoints.map(endpoint => {
        const response = responses[endpoint.title];
        const isExpanded = expanded[endpoint.title];

        return (
          <section key={endpoint.title} className="mb-6 border border-gray-700 rounded">
            <div
              className="flex justify-between items-center p-4 cursor-pointer bg-gray-900 hover:bg-gray-800 transition-colors duration-200"
              onClick={() => toggleExpand(endpoint.title)}
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
                    value={inputs[endpoint.title] ?? ""}
                    onChange={e => setInputs(prev => ({ ...prev, [endpoint.title]: e.target.value }))}
                    className="w-full sm:w-auto px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 mb-4"
                  />
                )}

                {endpoint.type === "timezone" && (
                  <div className="flex flex-col sm:flex-row sm:gap-4 gap-2 mb-4 items-center">
                    {["fromTimezone","hour","minute","ampm","toTimezone"].map(field => {
                      if (field === "fromTimezone" || field === "toTimezone") {
                        return (
                          <div className="flex flex-col" key={field}>
                            <label className="mb-1">{field==="fromTimezone"?"From Timezone":"To Timezone"}</label>
                            <select
                              value={inputs[endpoint.title]?.[field] || "UTC"}
                              onChange={e => setInputs(prev => ({ ...prev, [endpoint.title]: { ...prev[endpoint.title], [field]: e.target.value } }))}
                              className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
                            >
                              {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
                            </select>
                          </div>
                        );
                      } else if (field==="ampm") {
                        return (
                          <div className="flex flex-col" key={field}>
                            <label className="mb-1">AM/PM</label>
                            <select
                              value={inputs[endpoint.title]?.ampm || "AM"}
                              onChange={e => setInputs(prev => ({ ...prev, [endpoint.title]: { ...prev[endpoint.title], ampm: e.target.value } }))}
                              className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700"
                            >
                              <option value="AM">AM</option>
                              <option value="PM">PM</option>
                            </select>
                          </div>
                        );
                      } else {
                        return (
                          <div className="flex flex-col" key={field}>
                            <label className="mb-1">{field==="hour"?"Hour":"Minute"}</label>
                            <input
                              type="number"
                              min={0}
                              max={field==="hour"?12:59}
                              value={inputs[endpoint.title]?.[field]??""}
                              onChange={e => setInputs(prev => ({ ...prev, [endpoint.title]: { ...prev[endpoint.title], [field]: e.target.value } }))}
                              className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 w-20"
                            />
                          </div>
                        );
                      }
                    })}
                  </div>
                )}

                {endpoint.title === "Projects" && (
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="number"
                      min={1}
                      placeholder="Limit"
                      value={inputs[endpoint.title]?.limit || ""}
                      onChange={e =>
                        setInputs(prev => ({
                          ...prev,
                          [endpoint.title]: { ...prev[endpoint.title], limit: e.target.value }
                        }))
                      }
                      className="px-4 py-2 rounded bg-gray-900 text-white border border-gray-700 w-24"
                    />
                    <span className="text-sm text-gray-400" title="Optional: Limit how many projects to fetch">❔</span>
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
                      onClick={() => copyData(endpoint.title, endpoint.copyKey!)}
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors duration-200 w-full sm:w-auto"
                    >
                      Copy {endpoint.copyKey}
                    </button>
                  )}
                </div>

                {response && endpoint.title !== "Projects" && (
                  <div>
                    <pre className="mt-4 p-4 bg-gray-700 text-green-400 rounded overflow-x-auto break-words max-w-full shadow-lg border border-gray-600">
                      {JSON.stringify(response, null, 2)}
                    </pre>
                  </div>
                )}

                {response && endpoint.title === "Projects" && Array.isArray(response.data) && (
                  <div className="relative">
                    {scrollState[endpoint.title]?.left && (
                      <button
                        onClick={() => scrollProjects(endpoint.title, "left")}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        ◀
                      </button>
                    )}

                    <div
                      ref={el => { if (el) projectScrollRefs.current[endpoint.title] = el; }}
                      onScroll={() => handleScroll(endpoint.title)}
                      className="overflow-x-auto py-2 snap-x snap-mandatory flex gap-4 px-2 scroll-smooth"
                    >
                      {response.data.map((project: any, index: number) => (
                        <InteractiveCard
                          key={index}
                          className="
                            group flex-shrink-0 w-80 snap-start
                            bg-white text-gray-900
                            rounded-2xl border border-gray-200 shadow-sm
                            transition-all duration-200
                            hover:bg-gray-900 hover:text-white hover:shadow-lg hover:-translate-y-1
                          "
                        >
                          <div className="flex flex-col space-y-3 p-5">
                            <div className="space-y-1">
                              <h3 className="text-xl font-semibold leading-snug text-gray-900 group-hover:text-white transition-colors">
                                {project.title}
                              </h3>

                              <p className="text-xs font-medium tracking-wide uppercase text-gray-500 group-hover:text-gray-300 transition-colors">
                                {project.year}
                              </p>
                            </div>

                            <p className="text-sm leading-relaxed text-gray-700 group-hover:text-gray-200 transition-colors line-clamp-4">
                              {project.description}
                            </p>

                            <div className="flex flex-wrap gap-2 pt-1">
                              {project.technologies?.map((tech: string, i: number) => (
                                <Badge
                                  key={i}
                                  variant="secondary"
                                  className="
                                    rounded-full
                                    px-3 py-1 text-xs font-medium
                                    bg-gray-100 text-gray-800 border border-gray-200
                                    group-hover:bg-gray-700 group-hover:text-white group-hover:border-gray-600
                                    transition-colors
                                  "
                                >
                                  {tech}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </InteractiveCard>
                      ))}
                    </div>

                    {scrollState[endpoint.title]?.right && (
                      <button
                        onClick={() => scrollProjects(endpoint.title, "right")}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-gray-700 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
                      >
                        ▶
                      </button>
                    )}
                  </div>
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
          .animate-fade-in { animation: fade-in 0.3s ease-out; }
        `}
      </style>
    </div>
  );
}
