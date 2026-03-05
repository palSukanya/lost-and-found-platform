import { useState } from "react";
import { MapPin, Package, RefreshCw, Bell, Handshake, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";

const services = [
  {
    icon: MapPin,
    title: "Lost Item Posting",
    tagline: "Cry for help, digitally",
    description: "Post your lost items with descriptions so detailed, even your item will be embarrassed. Include photos, last seen locations, and your level of desperation (1-10).",
    features: ["Photo uploads", "Location tagging", "Urgency levels"],
  },
  {
    icon: Package,
    title: "Found Item Reporting",
    tagline: "Be the hero nobody asked for",
    description: "Found something that's clearly not yours? Report it here and become the unexpected hero of someone's chaotic day. Karma points included.",
    features: ["Quick reporting", "Category matching", "Anonymous option"],
  },
  {
    icon: RefreshCw,
    title: "Lending & Borrowing",
    tagline: "Because sharing is caring... or desperation",
    description: "Need a charger? Calculator? Will to live? Borrow from fellow students who actually have their life together (temporarily).",
    features: ["Secure lending", "Return reminders", "Trust scores"],
  },
  {
    icon: Bell,
    title: "Smart Notifications",
    tagline: "Stalking, but make it helpful",
    description: "Get pinged the moment something matching your lost item appears. We're like Santa's elves, but for your misplaced belongings.",
    features: ["Real-time alerts", "Custom filters", "Daily digests"],
  },
  {
    icon: Handshake,
    title: "Community Queries",
    tagline: "Ask the hive mind",
    description: "Post questions to the community. 'Has anyone seen a red water bottle crying alone in Block C?' Yes, that's a valid query here.",
    features: ["Community answers", "Upvoting system", "Expert forkers"],
  },
  {
    icon: HelpCircle,
    title: "Lost & Found Hub",
    tagline: "The central station of chaos",
    description: "One dashboard to rule them all. Track your posts, messages, and the existential crisis of losing your third umbrella this semester.",
    features: ["Unified dashboard", "History tracking", "Analytics"],
  },
];

const ServicesSection = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  
  const openAuth = (mode: "login" | "signup") => {
      setAuthMode(mode);
      setIsAuthOpen(true);
  };
  
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-4 py-2 rounded-full glass-card border-secondary/30 text-secondary font-mono text-sm mb-6">
            // OUR_SERVICES.json
          </span>
          <h2 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl mb-6">
            <span className="text-foreground">Our </span>
            <span className="text-secondary">Forking</span>
            <span className="text-foreground"> Services</span>
          </h2>
          <p className="text-muted-foreground text-lg md:text-xl">
            Premium features that cost absolutely nothing. Because we're broke students too, 
            and we understand the struggle.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group glass-card rounded-2xl p-8 border-border/30 hover:border-secondary/50 transition-all duration-500 hover:shadow-[0_0_40px_hsl(var(--secondary)/0.2)]"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="p-4 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/10 border border-secondary/20 group-hover:scale-110 transition-transform duration-300">
                    <service.icon className="w-8 h-8 text-secondary" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-display font-bold text-xl text-foreground">
                      {service.title}
                    </h3>
                  </div>
                  <p className="text-primary font-mono text-sm mb-3">
                    "{service.tagline}"
                  </p>
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {service.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-full bg-muted/50 text-muted-foreground text-xs font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <div className="glass-card rounded-2xl p-8 md:p-12 border-primary/30 max-w-3xl mx-auto">
            <h3 className="font-display font-bold text-2xl md:text-3xl mb-4">
              Ready to <span className="text-gradient">Fork Around</span> and Find Out?
            </h3>
            <p className="text-muted-foreground mb-8">
              Join the chaos. It's free, it's fun, and it might just reunite you with 
              that pen you've been mourning for weeks.
            </p>
            <Button variant="hero" size="xl" onClick={() => openAuth("signup")}>
              Start Forking Now
            </Button>
          </div>
        </div>
      </div>
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
      />
    </section>
  );
};

export default ServicesSection;
