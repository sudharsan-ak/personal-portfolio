import { Mail, Linkedin, Github, Phone } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveButton from "@/components/ui/InteractiveButton";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setForm({ name: "", email: "", message: "" });
      } else {
        setError(data.message || "Something went wrong");
      }
    } catch (err) {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="contact"
      className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Connect With Me
        </h2>

        {/* Contact Form */}
        <form
          onSubmit={handleSubmit}
          className="max-w-xl mx-auto mb-12 space-y-4"
        >
          {success && (
            <p className="text-green-600 text-center">{success}</p>
          )}
          {error && <p className="text-red-600 text-center">{error}</p>}

          <input
            type="text"
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            value={form.message}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={5}
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? "Sending..." : "Send Message"}
          </button>
        </form>

        {/* Intro & Email Button */}
        <div className="text-center mb-12">
          <p className="text-lg text-foreground/80 transition-colors duration-200">
            I'm always open to discussing new opportunities, projects, or just
            having a chat about technology.
          </p>
          <div className="mt-8">
            <InteractiveButton size="lg" asChild>
              <a
                href="mailto:sudharsanak1010@gmail.com"
                className="flex items-center gap-2"
              >
                <Mail className="h-5 w-5" /> Send me an email
              </a>
            </InteractiveButton>
          </div>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <InteractiveCard className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors duration-200">
                  Email
                </h3>
                <a
                  href="mailto:sudharsanak1010@gmail.com"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  sudharsanak1010@gmail.com
                </a>
              </div>
            </div>
          </InteractiveCard>

          {/* Phone */}
          <InteractiveCard className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors duration-200">
                  Phone
                </h3>
                <a
                  href="tel:+16822830833"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  (682) 283-0833
                </a>
              </div>
            </div>
          </InteractiveCard>

          {/* LinkedIn */}
          <InteractiveCard className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Linkedin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors duration-200">
                  LinkedIn
                </h3>
                <a
                  href="https://linkedin.com/in/sudharsan-srinivasan10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  linkedin.com/in/sudharsan-srinivasan10
                </a>
              </div>
            </div>
          </InteractiveCard>

          {/* GitHub */}
          <InteractiveCard className="group">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 group-hover:text-foreground transition-colors duration-200">
                  GitHub
                </h3>
                <a
                  href="https://github.com/sudharsan-ak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-foreground/80 hover:text-primary transition-colors duration-200"
                >
                  github.com/sudharsan-ak
                </a>
              </div>
            </div>
          </InteractiveCard>
        </div>
      </div>
    </section>
  );
}
