// src/pages/Dashboard.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  User,
  LogOut,
  Package,
  MapPin,
  MessageSquare,
  Users,
  Zap,
  Award,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import LostPanel from "@/components/dashboard/LostPanel";
import FoundPanel from "@/components/dashboard/FoundPanel";
import MessagesPanel from "@/components/dashboard/MessagesPanel";
import CommunityPanel from "@/components/dashboard/CommunityPanel";
import NotificationsPopover from "@/components/dashboard/NotificationsPopover";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<
    "lost" | "found" | "messages" | "community"
  >("lost");

  // NEW: who to message when switching into Messages tab
  const [messageTarget, setMessageTarget] = useState<{
    id: string;
    username: string;
  } | null>(null);

  // simple auth protection: redirect if no token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/"); // back to landing if not logged in
    }
  }, [navigate]);

  // TODO: later replace with real user data from /api/auth/profile
  const user = {
    name: "LostSoul",
    email: "student@fork.edu",
    karma: 420,
    badges: ["Early Adopter", "Item Finder", "Community Helper"],
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background cyber-grid relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse-glow"
          style={{ animationDelay: "1s" }}
        />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl animate-float" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass-card border-b border-border/50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <span className="text-2xl">🍴</span>
              <span className="font-display font-bold text-lg text-gradient hidden sm:inline">
                ForkMEtoFind
              </span>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xl relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search lost items, found items, or community..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50 border-border/50 focus:border-primary/50 focus:ring-primary/20"
              />
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <NotificationsPopover />

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-foreground" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-primary rounded-full border-2 border-background animate-pulse" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-64 glass-card border-border/50"
                >
                  <div className="p-3 border-b border-border/50">
                    <p className="font-display font-semibold text-foreground">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">
                      {user.email}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Zap className="w-3 h-3 text-primary" />
                      <span className="text-xs text-primary font-mono">
                        {user.karma} karma points
                      </span>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground px-2 py-1">
                      Badges
                    </p>
                    <div className="flex flex-wrap gap-1 px-2 pb-2">
                      {user.badges.map((badge) => (
                        <Badge
                          key={badge}
                          variant="secondary"
                          className="text-[10px] bg-primary/10 text-primary border-primary/30"
                        >
                          {badge}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/50" />
                  <DropdownMenuItem
                    className="cursor-pointer text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 relative z-10">
        {/* Welcome Banner */}
        <div className="glass-card neon-border rounded-xl p-6 mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-secondary/5" />
          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                Welcome back, <span className="text-gradient">{user.name}</span>
              </h1>
              <p className="text-muted-foreground mt-1 font-mono text-sm">
                Ready to find what's lost in the chaos? 🔍
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="font-display text-2xl font-bold text-primary">
                  12
                </p>
                <p className="text-xs text-muted-foreground">Items Found</p>
              </div>
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="font-display text-2xl font-bold text-secondary">
                  5
                </p>
                <p className="text-xs text-muted-foreground">Items Claimed</p>
              </div>
              <div className="text-center px-4 py-2 glass-card rounded-lg">
                <p className="font-display text-2xl font-bold text-accent">
                  23
                </p>
                <p className="text-xs text-muted-foreground">Helped Others</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="w-full"
        >
          <TabsList className="w-full md:w-auto glass-card border border-border/50 p-1 gap-1 h-auto flex-wrap">
            <TabsTrigger
              value="lost"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <Package className="w-4 h-4" />
              <span>Lost</span>
              <Badge className="ml-1 bg-destructive/20 text-destructive text-[10px]">
                3
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="found"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <MapPin className="w-4 h-4" />
              <span>Found</span>
              <Badge className="ml-1 bg-primary/20 text-primary text-[10px]">
                7
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="messages"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
              <Badge className="ml-1 bg-secondary/20 text-secondary text-[10px]">
                2
              </Badge>
            </TabsTrigger>
            <TabsTrigger
              value="community"
              className="flex items-center gap-2 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs md:text-sm px-3 md:px-4 py-2"
            >
              <Users className="w-4 h-4" />
              <span>Community</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-6">
            <TabsContent value="lost" className="m-0">
              <LostPanel
                searchQuery={searchQuery}
                onMessageOwner={(id, username) => {
                  setMessageTarget({ id, username });
                  setActiveTab("messages");
                }}
              />
            </TabsContent>
            <TabsContent value="found" className="m-0">
              <FoundPanel
                searchQuery={searchQuery}
                onMessageFinder={(id, username) => {
                  setMessageTarget({ id, username });
                  setActiveTab("messages");
                }}
              />
            </TabsContent>
            <TabsContent value="messages" className="m-0">
              <MessagesPanel messageTarget={messageTarget} />
            </TabsContent>
            <TabsContent value="community" className="m-0">
              <CommunityPanel searchQuery={searchQuery} />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
