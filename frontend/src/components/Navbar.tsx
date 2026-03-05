import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, Utensils, Info, Briefcase } from "lucide-react";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");

  const openAuth = (mode: "login" | "signup") => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Utensils className="w-8 h-8 text-primary animate-pulse-glow" />
              <span className="font-display font-bold text-xl md:text-2xl text-gradient">
                ForkME<span className="text-foreground">to</span>Find
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <button 
                onClick={() => scrollToSection("what-we-do")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <Info className="w-4 h-4" />
                What We Do
              </button>
              <button 
                onClick={() => scrollToSection("services")}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                <Briefcase className="w-4 h-4" />
                Our Services
              </button>
              <div className="flex items-center gap-3 ml-4">
                <Button variant="outline" onClick={() => openAuth("login")}>
                  Log In
                </Button>
                <Button variant="hero" onClick={() => openAuth("signup")}>
                  Sign Up
                </Button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden text-foreground p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-border/30 animate-fade-in-up">
              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => scrollToSection("what-we-do")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  <Info className="w-4 h-4" />
                  What We Do
                </button>
                <button 
                  onClick={() => scrollToSection("services")}
                  className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors font-medium py-2"
                >
                  <Briefcase className="w-4 h-4" />
                  Our Services
                </button>
                <div className="flex flex-col gap-3 pt-4 border-t border-border/30">
                  <Button variant="outline" onClick={() => openAuth("login")} className="w-full">
                    Log In
                  </Button>
                  <Button variant="hero" onClick={() => openAuth("signup")} className="w-full">
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        mode={authMode}
        setMode={setAuthMode}
      />
    </>
  );
};

export default Navbar;
