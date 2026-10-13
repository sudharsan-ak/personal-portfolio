import { useEffect, useState } from "react";
import { Github } from "lucide-react";
import fallbackImage from "@/assets/generated_images/GitHub_Contributions_Fallback.png";
import InteractiveCard from "@/components/ui/InteractiveCard";
import FadeInSection from "@/components/ui/FadeInSection";

const GITHUB_USERNAME = "sudharsan-ak";

export default function GitHubActivity() {
  const [useFallback, setUseFallback] = useState(false);
  const [totalContributions, setTotalContributions] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/github-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (typeof data.totalContributions === "number") {
          setTotalContributions(data.totalContributions);
        }
      })
      .catch(() => {
        // Silently skip the count, the graph still renders fine without it
      });
  }, []);

  return (
    <section id="github-activity" className="py-12 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <FadeInSection>
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">GitHub Activity</h2>
        </FadeInSection>

        <FadeInSection delay={0.1}>
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <InteractiveCard className="group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    @{GITHUB_USERNAME}
                  </h3>
                </div>
                <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors duration-200">
                  View full profile
                </span>
              </div>

              {totalContributions !== null && (
                <p className="text-sm font-medium mb-3">
                  {totalContributions.toLocaleString()} contributions in the last year
                </p>
              )}

              <div className="overflow-x-auto">
                {useFallback ? (
                  <img
                    src={fallbackImage}
                    alt={`${GITHUB_USERNAME}'s GitHub contribution graph`}
                    className="w-full min-w-[640px] rounded-lg"
                  />
                ) : (
                  <img
                    src={`https://ghchart.rshah.org/${GITHUB_USERNAME}`}
                    alt={`${GITHUB_USERNAME}'s GitHub contribution graph`}
                    className="w-full min-w-[640px] rounded-lg"
                    onError={() => setUseFallback(true)}
                  />
                )}
              </div>
            </InteractiveCard>
          </a>
        </FadeInSection>
      </div>
    </section>
  );
}
