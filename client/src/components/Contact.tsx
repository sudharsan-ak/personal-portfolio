import { Mail, Linkedin, Github, Phone } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveButton from "@/components/ui/InteractiveButton";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        toast({ title: "Success", description: data.message });
        setForm({ name: "", email: "", message: "" });
      } else {
        toast({ title: "Error", description: data.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Something went wrong", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30"
    >
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Connect With Me
        </h2>

        {/* Two-column layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left column: Contact cards (compact) */}
          <div className="space-y-4">
            <InteractiveCard className="group p-4">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:sudharsanak1010@gmail.com"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  sudharsanak1010@gmail.com
                </a>
              </div>
            </InteractiveCard>

            <InteractiveCard className="group p-4">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" />
                <a
                  href="tel:+16822830833"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  (682) 283-0833
                </a>
              </div>
            </InteractiveCard>

            <InteractiveCard className="group p-4">
              <div className="flex items-center gap-3">
                <Linkedin className="h-5 w-5 text-primary" />
                <a
                  href="https://linkedin.com/in/sudharsan-srinivasan10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  linkedin.com/in/sudharsan-srinivasan10
                </a>
              </div>
            </InteractiveCard>

            <InteractiveCard className="group p-4">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5 text-primary" />
                <a
                  href="https://github.com/sudharsan-ak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  github.com/sudharsan-ak
                </a>
              </div>
            </InteractiveCard>
          </div>

          {/* Right column: Contact form */}
          <InteractiveCard className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                name="name"
                placeholder="Your Name"
                value={form.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Your Email"
                value={form.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                required
              />
              <textarea
                name="message"
                placeholder="Your Message"
                value={form.message}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-primary focus:border-primary transition"
                rows={5}
                required
              />
              <InteractiveButton
                size="lg"
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading ? "Sending..." : "Send Message"}
              </InteractiveButton>
            </form>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
