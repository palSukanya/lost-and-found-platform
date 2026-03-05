import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Utensils, Sparkles, ArrowDown } from "lucide-react";
import AuthModal from "./AuthModal";

const quotes = [
  "Lost your calculator? Pen? Dignity?",
  "The only clg lost and found that runs on pure chaos",
  "Someone probably forked it already",
  "404: Your belongings found... maybe",
  "Where lost items come to haunt you",
  "Your stuff misses you. Probably.",
  "Finder's keepers? More like finder's... helpers",
  "Lost in the void? We've got a map.",
];

const HeroSection = () => {
  const [currentQuote, setCurrentQuote] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
        setIsAnimating(false);
      }, 300);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 cyber-grid opacity-30" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-3xl" />

      {/* Floating Fork Icons */}
      <div className="absolute top-20 left-10 animate-float opacity-20">
        <Utensils className="w-16 h-16 text-primary" />
      </div>
      <div className="absolute top-40 right-20 animate-float opacity-20" style={{ animationDelay: "2s" }}>
        <Utensils className="w-12 h-12 text-secondary" />
      </div>
      <div className="absolute bottom-40 left-20 animate-float opacity-20" style={{ animationDelay: "4s" }}>
        <Utensils className="w-10 h-10 text-accent" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-4xl mx-auto">
          {/* Sparkle Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border-primary/30 mb-8 animate-fade-in-up">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-muted-foreground">
              The Ultimate College Lost & Found
            </span>
          </div>

          {/* Main Title */}
          <h1 className="font-display font-black text-5xl md:text-7xl lg:text-8xl mb-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <span className="text-gradient glow-text">Fork</span>
            <span className="text-foreground">ME</span>
            <span className="text-muted-foreground">to</span>
            <span className="text-gradient glow-text">Find</span>
          </h1>

          {/* Animated Quote */}
          <div className="h-20 md:h-16 flex items-center justify-center mb-8">
            <p 
              className={`font-mono text-lg md:text-2xl text-primary/90 transition-all duration-300 ${
                isAnimating ? "opacity-0 translate-y-4" : "opacity-100 translate-y-0"
              }`}
            >
              "{quotes[currentQuote]}"
            </p>
          </div>

          {/* Subtitle */}
          <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto mb-10 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            The only lost and found system that speaks fluent <span className="text-primary">chaos</span>, 
            understands <span className="text-secondary">procrastination</span>, and runs entirely on 
            <span className="text-accent"> utensils someone probably forked</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <Button variant="hero" size="xl" onClick={() => openAuth("login")} className="group">
              <Utensils className="w-5 h-5 mr-2 group-hover:rotate-45 transition-transform" />
              Enter the Fork Zone
            </Button>
            <Button variant="neon" size="xl" onClick={() => scrollToSection("what-we-do")}>
              Discover the Chaos
            </Button>
          </div>
          <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
          mode={authMode}
          setMode={setAuthMode}
      />
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 md:gap-8 max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "0.8s" }}>
            <div className="glass-card rounded-xl p-4 md:p-6 border-border/30 hover:border-primary/50 transition-colors">
              <div className="font-display font-bold text-2xl md:text-4xl text-gradient">2.4K+</div>
              <div className="text-muted-foreground text-xs md:text-sm mt-1">Items Rescued</div>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-6 border-border/30 hover:border-secondary/50 transition-colors">
              <div className="font-display font-bold text-2xl md:text-4xl text-secondary">500+</div>
              <div className="text-muted-foreground text-xs md:text-sm mt-1">Happy Forkers</div>
            </div>
            <div className="glass-card rounded-xl p-4 md:p-6 border-border/30 hover:border-accent/50 transition-colors">
              <div className="font-display font-bold text-2xl md:text-4xl text-accent">99%</div>
              <div className="text-muted-foreground text-xs md:text-sm mt-1">Pure Chaos</div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="mt-16 animate-bounce">
            <button 
              onClick={() => scrollToSection("what-we-do")}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <ArrowDown className="w-6 h-6 mx-auto" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
