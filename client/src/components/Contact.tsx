import { Mail, Linkedin, Github, Phone } from "lucide-react";
import InteractiveCard from "@/components/ui/InteractiveCard";
import InteractiveButton from "@/components/ui/InteractiveButton";
import InteractiveIcon from "@/components/ui/InteractiveIcon";

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">
          Connect With Me
        </h2>

        {/* Intro & Email Button */}
        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground mb-8">
            I'm always open to discussing new opportunities, projects, or just having a chat about technology.
          </p>
          <InteractiveButton size="lg" asChild>
            <a href="mailto:sudharsanak1010@gmail.com" className="flex items-center gap-2">
              <Mail className="h-5 w-5" /> Send me an email
            </a>
          </InteractiveButton>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InteractiveCard>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:sudharsanak1010@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  sudharsanak1010@gmail.com
                </a>
              </div>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <a
                  href="tel:+16822830833"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  (682) 283-0833
                </a>
              </div>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Linkedin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">LinkedIn</h3>
                <a
                  href="https://linkedin.com/in/sudharsan-srinivasan10"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  linkedin.com/in/sudharsan-srinivasan10
                </a>
              </div>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Github className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">GitHub</h3>
                <a
                  href="https://github.com/sudharsan-ak"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
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
