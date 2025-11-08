import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mail, Linkedin, Github, MapPin, Phone } from "lucide-react";

export default function Contact() {
  return (
    <section id="contact" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center" data-testid="heading-contact">
          Get In Touch
        </h2>

        <div className="text-center mb-12">
          <p className="text-lg text-muted-foreground mb-8" data-testid="text-contact-intro">
            I'm always open to discussing new opportunities, projects, or just having a chat about technology.
          </p>
          <Button size="lg" asChild data-testid="button-email-primary">
            <a href="mailto:sudharsanak1010@gmail.com">
              <Mail className="h-5 w-5 mr-2" />
              Send me an email
            </a>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 hover-elevate" data-testid="card-contact-email">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Email</h3>
                <a
                  href="mailto:sudharsanak1010@gmail.com"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-email"
                >
                  sudharsanak1010@gmail.com
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-contact-phone">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Phone</h3>
                <a
                  href="tel:+16822830833"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  data-testid="link-phone"
                >
                  (682) 283-0833
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-contact-linkedin">
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
                  data-testid="link-linkedin-detail"
                >
                  linkedin.com/in/sudharsan-srinivasan10
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover-elevate" data-testid="card-contact-github">
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
                  data-testid="link-github-detail"
                >
                  github.com/sudharsan-ak
                </a>
              </div>
            </div>
          </Card>

          <Card className="p-6 md:col-span-2 hover-elevate" data-testid="card-contact-location">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-md">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">Location</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-location-detail">
                  Dallas, Texas
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
