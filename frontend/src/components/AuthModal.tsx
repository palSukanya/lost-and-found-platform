import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Utensils, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { login, signup } from "../lib/api";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "login" | "signup";
  setMode: (mode: "login" | "signup") => void;
}

const AuthModal = ({ isOpen, onClose, mode, setMode }: AuthModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { name, email, password } = formData;

      let data;
      if (mode === "login") {
        data = await login(email, password);
      } else {
        data = await signup(name, email, password);
      }

      localStorage.setItem("token", data.token);

      onClose();              // close modal
      navigate("/dashboard"); // redirect to dashboard
    } catch (e: any) {
      setError(e.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="glass-card border-primary/30 max-w-md"
        aria-describedby={undefined}
      >
        <DialogHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-primary/10 border border-primary/30">
              <Utensils className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="font-display text-2xl text-gradient">
            {mode === "login" ? "Welcome Back, Forker!" : "Join the Fork Zone"}
          </DialogTitle>
          <p className="text-muted-foreground text-sm mt-2">
            {mode === "login"
              ? "Lost something? Or found someone else's chaos?"
              : "Ready to embrace the chaos of lost items?"}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          {mode === "signup" && (
            <div className="space-y-2">
              <Label htmlFor="name" className="text-foreground">
                Full Name
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Your glorious name"
                  className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  disabled={loading}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="forker@college.edu"
                className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground">
              Password
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Super secret fork code"
                className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground disabled:opacity-50"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-destructive text-center mt-2 text-sm">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="hero"
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                {mode === "login"
                  ? "Entering Fork Zone..."
                  : "Forking you in..."}
              </>
            ) : mode === "login" ? (
              "Enter the Fork Zone"
            ) : (
              "Become a Forker"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-muted-foreground text-sm">
            {mode === "login" ? "New to the chaos?" : "Already forking around?"}
            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-primary hover:text-primary/80 ml-2 font-medium"
              disabled={loading}
            >
              {mode === "login" ? "Sign Up" : "Log In"}
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AuthModal;
