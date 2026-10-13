import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { scrollToSection } from "@/lib/utils";

interface Stat {
  target: number;
  suffix: string;
  label: string;
  targetId?: string;
}

const BASE_STATS: Stat[] = [
  { target: 6, suffix: "+", label: "Years Experience", targetId: "experience" },
  { target: 4, suffix: "", label: "Roles Held", targetId: "experience" },
  { target: 500, suffix: "+", label: "Users Impacted" },
  { target: 7, suffix: "", label: "Shipped Projects", targetId: "projects" },
];

function StatNumber({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { duration: 1200, bounce: 0 });

  useEffect(() => {
    if (inView) motionValue.set(target);
  }, [inView, target, motionValue]);

  useEffect(() => {
    return spring.on("change", (v) => {
      if (ref.current) ref.current.textContent = `${Math.round(v)}${suffix}`;
    });
  }, [spring, suffix]);

  return <span ref={ref}>0{suffix}</span>;
}

export default function StatStrip() {
  const [githubContributions, setGithubContributions] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/github-stats")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (typeof data.totalContributions === "number") {
          setGithubContributions(data.totalContributions);
        }
      })
      .catch(() => {
        // Silently skip, the other 4 stats still render fine
      });
  }, []);

  const stats: Stat[] = githubContributions !== null
    ? [
        ...BASE_STATS,
        { target: githubContributions, suffix: "+", label: "GitHub Contributions", targetId: "github-activity" },
      ]
    : BASE_STATS;

  return (
    <section className="px-4 sm:px-6 lg:px-8 -mt-4 mb-8 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className={`max-w-7xl mx-auto grid grid-cols-2 ${
          stats.length === 5 ? "md:grid-cols-5" : "md:grid-cols-4"
        } rounded-2xl border border-border overflow-hidden divide-x divide-y md:divide-y-0 divide-border bg-card shadow-sm`}
      >
        {stats.map((stat) => {
          const content = (
            <>
              <div className="text-3xl font-bold text-primary tabular-nums">
                <StatNumber target={stat.target} suffix={stat.suffix} />
              </div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1.5">
                {stat.label}
              </div>
            </>
          );

          if (stat.targetId) {
            return (
              <button
                key={stat.label}
                onClick={() => scrollToSection(stat.targetId!)}
                className="px-6 py-5 text-center hover:bg-primary/5 transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
              >
                {content}
              </button>
            );
          }

          return (
            <div key={stat.label} className="px-6 py-5 text-center">
              {content}
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
