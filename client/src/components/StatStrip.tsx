import { motion, useInView, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";

interface Stat {
  target: number;
  suffix: string;
  label: string;
}

const STATS: Stat[] = [
  { target: 6, suffix: "+", label: "Years Experience" },
  { target: 4, suffix: "", label: "Roles Held" },
  { target: 500, suffix: "+", label: "Users Impacted" },
  { target: 7, suffix: "", label: "Shipped Projects" },
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
  return (
    <section className="px-4 sm:px-6 lg:px-8 -mt-4 mb-8 md:mb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 rounded-2xl border border-border overflow-hidden divide-x divide-y md:divide-y-0 divide-border bg-card shadow-sm"
      >
        {STATS.map((stat) => (
          <div key={stat.label} className="px-6 py-5 text-center">
            <div className="text-3xl font-bold text-primary tabular-nums">
              <StatNumber target={stat.target} suffix={stat.suffix} />
            </div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mt-1.5">
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
