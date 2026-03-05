import { useState } from "react";
import {
  Plus,
  Users,
  BookOpen,
  HelpCircle,
  Star,
  Clock,
  MapPin,
  Zap,
  ArrowRightLeft,
  Calendar,
  UserPlus,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/hooks/use-toast";
import { usePosts, createPost } from "@/lib/api";

interface CommunityPanelProps {
  searchQuery: string;
}

const CommunityPanel = ({ searchQuery }: CommunityPanelProps) => {
  const [activeSubTab, setActiveSubTab] = useState("lend-borrow");
  const [isLendBorrowModalOpen, setIsLendBorrowModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const [newPost, setNewPost] = useState({
    type: "lend" as "lend" | "borrow",
    title: "",
    category: "",
    duration: "",
    description: "",
  });

  const [newQuery, setNewQuery] = useState({
    title: "",
    description: "",
    tags: "",
  });

  const [newGroup, setNewGroup] = useState({
    name: "",
    subject: "",
    schedule: "",
    location: "",
    maxMembers: "8",
    description: "",
  });

  // ===== Backend posts per type =====
  const {
    data: queryPosts = [],
    isLoading: isQueryLoading,
    isError: isQueryError,
  } = usePosts("query");

  const {
    data: lendPosts = [],
    isLoading: isLendLoading,
    isError: isLendError,
  } = usePosts("lend");

  const {
    data: borrowPosts = [],
    isLoading: isBorrowLoading,
    isError: isBorrowError,
  } = usePosts("borrow");

  const {
    data: groups = [],
    isLoading: isGroupsLoading,
    isError: isGroupsError,
  } = usePosts("study-group");

  const lendBorrowPosts = [
    ...(lendPosts as any[]),
    ...(borrowPosts as any[]),
  ];

  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; type: string }) =>
      createPost(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  // ===== Handlers =====

  const handlePostSubmit = async () => {
    if (!newPost.title || !newPost.category) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        title: newPost.title,
        description: `${newPost.description || ""}${
          newPost.duration ? ` Duration: ${newPost.duration}` : ""
        } Category: ${newPost.category}`.trim(),
        type: newPost.type,
      });

      toast({
        title: newPost.type === "lend" ? "Item Listed! 🎁" : "Request Posted! 🙏",
        description: "5 karma points for community participation!",
      });

      setIsLendBorrowModalOpen(false);
      setNewPost({
        type: "lend",
        title: "",
        category: "",
        duration: "",
        description: "",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Could not create post.",
        variant: "destructive",
      });
    }
  };

  const handleQuerySubmit = async () => {
    if (!newQuery.title) {
      toast({ title: "Missing title", variant: "destructive" });
      return;
    }
    try {
      const tagsStr = newQuery.tags?.trim();
      const tagsSuffix = tagsStr ? ` Tags: ${tagsStr}` : "";

      await createMutation.mutateAsync({
        title: newQuery.title,
        description: `${newQuery.description || ""}${tagsSuffix}`.trim(),
        type: "query",
      });

      toast({
        title: "Query Posted! 💡",
        description: "The community will help you out!",
      });
      setIsQueryModalOpen(false);
      setNewQuery({ title: "", description: "", tags: "" });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Could not create post.",
        variant: "destructive",
      });
    }
  };

  const handleGroupSubmit = async () => {
    if (!newGroup.name || !newGroup.subject) {
      toast({ title: "Missing fields", variant: "destructive" });
      return;
    }
    try {
      const contentLines = [
        newGroup.description || "",
        `Subject: ${newGroup.subject}`,
        `Schedule: ${newGroup.schedule || "TBD"}`,
        `Location: ${newGroup.location || "TBD"}`,
        `Max members: ${parseInt(newGroup.maxMembers, 10) || 0}`,
      ]
        .filter(Boolean)
        .join("\n");

      await createMutation.mutateAsync({
        title: newGroup.name,
        description: contentLines,
        type: "study-group",
      });

      toast({
        title: "Study Group Created! 📚",
        description: "15 karma points for organizing!",
      });
      setIsGroupModalOpen(false);
      setNewGroup({
        name: "",
        subject: "",
        schedule: "",
        location: "",
        maxMembers: "8",
        description: "",
      });
    } catch (err) {
      toast({
        title: "Error",
        description: (err as Error).message || "Could not create group.",
        variant: "destructive",
      });
    }
  };

  const filteredQueryPosts = (queryPosts as any[]).filter((p) => {
    const q = searchQuery.toLowerCase();
    const text = (p.title || "").toLowerCase();
    const body = (p.description || p.content || "").toLowerCase();
    return text.includes(q) || body.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Sub-tabs */}
      <Tabs value={activeSubTab} onValueChange={setActiveSubTab}>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <TabsList className="glass-card border border-border/50 p-1">
            <TabsTrigger
              value="lend-borrow"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs"
            >
              <ArrowRightLeft className="w-4 h-4 mr-1" />
              Lend/Borrow
            </TabsTrigger>
            <TabsTrigger
              value="queries"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Queries
            </TabsTrigger>
            <TabsTrigger
              value="study-groups"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground font-display text-xs"
            >
              <BookOpen className="w-4 h-4 mr-1" />
              Study Groups
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            {/* Lend/Borrow action */}
            {activeSubTab === "lend-borrow" && (
              <Dialog
                open={isLendBorrowModalOpen}
                onOpenChange={setIsLendBorrowModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/50">
                  <DialogHeader>
                    <DialogTitle className="font-display text-gradient">
                      Lend or Borrow
                    </DialogTitle>
                    <DialogDescription className="font-mono text-sm">
                      Share resources with your fellow chaos dwellers.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="flex gap-2">
                      <Button
                        variant={
                          newPost.type === "lend" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          setNewPost((prev) => ({ ...prev, type: "lend" }))
                        }
                      >
                        I'm Lending
                      </Button>
                      <Button
                        variant={
                          newPost.type === "borrow" ? "default" : "outline"
                        }
                        className="flex-1"
                        onClick={() =>
                          setNewPost((prev) => ({ ...prev, type: "borrow" }))
                        }
                      >
                        I Need to Borrow
                      </Button>
                    </div>
                    <Input
                      placeholder="Item title"
                      value={newPost.title}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Select
                      value={newPost.category}
                      onValueChange={(v) =>
                        setNewPost((prev) => ({ ...prev, category: v }))
                      }
                    >
                      <SelectTrigger className="bg-muted/50">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent className="glass-card">
                        <SelectItem value="Electronics">Electronics</SelectItem>
                        <SelectItem value="Books">Books</SelectItem>
                        <SelectItem value="Clothing">Clothing</SelectItem>
                        <SelectItem value="Tools">Tools</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Duration (e.g., 1 week, 2 days)"
                      value={newPost.duration}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          duration: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Textarea
                      placeholder="Description..."
                      value={newPost.description}
                      onChange={(e) =>
                        setNewPost((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="hero"
                      onClick={handlePostSubmit}
                      disabled={createMutation.isLoading}
                    >
                      Post
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Queries action */}
            {activeSubTab === "queries" && (
              <Dialog
                open={isQueryModalOpen}
                onOpenChange={setIsQueryModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Ask
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/50">
                  <DialogHeader>
                    <DialogTitle className="font-display text-gradient">
                      Ask the Community
                    </DialogTitle>
                    <DialogDescription className="font-mono text-sm">
                      No question is too dumb. Probably.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Your question"
                      value={newQuery.title}
                      onChange={(e) =>
                        setNewQuery((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Textarea
                      placeholder="More details..."
                      value={newQuery.description}
                      onChange={(e) =>
                        setNewQuery((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Tags (comma separated, UI only)"
                      value={newQuery.tags}
                      onChange={(e) =>
                        setNewQuery((prev) => ({
                          ...prev,
                          tags: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="hero"
                      onClick={handleQuerySubmit}
                      disabled={createMutation.isLoading}
                    >
                      Post Query
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}

            {/* Study groups action */}
            {activeSubTab === "study-groups" && (
              <Dialog
                open={isGroupModalOpen}
                onOpenChange={setIsGroupModalOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="hero" size="sm" className="gap-1">
                    <Plus className="w-4 h-4" />
                    Create Group
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass-card border-border/50">
                  <DialogHeader>
                    <DialogTitle className="font-display text-gradient">
                      Create Study Group
                    </DialogTitle>
                    <DialogDescription className="font-mono text-sm">
                      Misery loves company. Study groups are basically that.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="Group name"
                      value={newGroup.name}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Subject/Course (e.g., MATH 201)"
                      value={newGroup.subject}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          subject: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Schedule (e.g., Mon & Wed, 4-6 PM)"
                      value={newGroup.schedule}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          schedule: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Location"
                      value={newGroup.location}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          location: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Input
                      placeholder="Max members"
                      type="number"
                      value={newGroup.maxMembers}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          maxMembers: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                    <Textarea
                      placeholder="Description..."
                      value={newGroup.description}
                      onChange={(e) =>
                        setNewGroup((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      className="bg-muted/50"
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      variant="hero"
                      onClick={handleGroupSubmit}
                      disabled={createMutation.isLoading}
                    >
                      Create
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {/* Lend/Borrow Tab */}
        <TabsContent value="lend-borrow" className="mt-6">
          {isLendLoading || isBorrowLoading ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                Loading lend/borrow posts...
              </p>
            </div>
          ) : isLendError || isBorrowError ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-destructive">
                Failed to load lend/borrow posts
              </p>
            </div>
          ) : lendBorrowPosts.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                No lend/borrow posts yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to share or request something.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lendBorrowPosts.map((post: any) => (
                <Card
                  key={post._id || post.id}
                  className="glass-card border-border/50 hover:border-primary/50 transition-all"
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <Badge
                        className={
                          post.type === "lend"
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary/20 text-secondary"
                        }
                      >
                        {post.type === "lend"
                          ? "📦 LENDING"
                          : "🙏 BORROWING"}
                      </Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Zap className="w-3 h-3 text-primary" />
                        <span>{post.karma ?? 0}</span>
                      </div>
                    </div>
                    <CardTitle className="font-display text-lg mt-2">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {post.description || post.content}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.duration || "Flexible duration"}
                      </span>
                      <span>
                        {post.createdAt
                          ? new Date(post.createdAt).toLocaleString()
                          : ""}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        @{post.postedBy ||
                          post.userId?.username ||
                          post.author?.username ||
                          "anonymous"}
                      </span>
                      <Button variant="outline" size="sm" className="text-xs">
                        {post.type === "lend" ? "Request" : "Offer Help"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Queries Tab */}
        <TabsContent value="queries" className="mt-6">
          {isQueryLoading ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                Loading community posts...
              </p>
            </div>
          ) : isQueryError ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-destructive">
                Failed to load community posts
              </p>
            </div>
          ) : filteredQueryPosts.length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                No community posts found
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Be the first to ask something.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQueryPosts.map((post: any) => (
                <Card
                  key={post._id}
                  className="glass-card border-border/50 hover:border-accent/50 transition-all"
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex flex-col items-center gap-1 text-center">
                        <Star className="w-4 h-4 text-accent" />
                        <span className="text-[10px] text-muted-foreground">
                          post
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-foreground hover:text-accent transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {post.description || post.content}
                        </p>
                        <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <span>
                              @{post.userId?.username ||
                                post.author?.username ||
                                "anonymous"}
                            </span>
                          </div>
                          <span>
                            {post.createdAt
                              ? new Date(post.createdAt).toLocaleString()
                              : ""}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Study Groups Tab */}
        <TabsContent value="study-groups" className="mt-6">
          {isGroupsLoading ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                Loading study groups...
              </p>
            </div>
          ) : isGroupsError ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-destructive">
                Failed to load study groups
              </p>
            </div>
          ) : (groups as any[]).length === 0 ? (
            <div className="text-center py-12 glass-card rounded-xl">
              <p className="font-display text-lg text-foreground">
                No study groups yet
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Create one and invite others.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(groups as any[]).map((group: any) => {
                const members = group.members ?? 0;
                const maxMembers = group.maxMembers ?? 0;
                const isFull = maxMembers > 0 ? members >= maxMembers : false;
                const subject = group.subject || "Study Group";

                return (
                  <Card
                    key={group._id || group.id}
                    className="glass-card border-border/50 hover:border-secondary/50 transition-all"
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                          <BookOpen className="w-3 h-3 mr-1" />
                          {subject}
                        </Badge>
                        {maxMembers > 0 && (
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {members}/{maxMembers}
                            </span>
                          </div>
                        )}
                      </div>
                      <CardTitle className="font-display text-lg mt-2">
                        {group.name || group.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <p className="text-sm text-muted-foreground">
                        {group.description || group.content}
                      </p>
                      <div className="space-y-2 text-xs text-muted-foreground">
                        {(group.schedule ||
                          group.description?.includes("Schedule:") ||
                          group.content?.includes("Schedule:")) && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-3 h-3 text-primary" />
                            <span>
                              {group.schedule || "See details in description"}
                            </span>
                          </div>
                        )}
                        {(group.location ||
                          group.description?.includes("Location:") ||
                          group.content?.includes("Location:")) && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-3 h-3 text-secondary" />
                            <span>
                              {group.location ||
                                "Location mentioned in description"}
                            </span>
                          </div>
                        )}
                      </div>
                      {maxMembers > 0 && (
                        <Progress
                          value={(members / maxMembers) * 100}
                          className="h-1.5"
                        />
                      )}
                      <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          by @
                          {group.createdBy ||
                            group.userId?.username ||
                            group.author?.username ||
                            "anonymous"}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs border-secondary/50 text-secondary hover:bg-secondary/10"
                          disabled={isFull}
                        >
                          <UserPlus className="w-3 h-3 mr-1" />
                          {isFull ? "Full" : "Join"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommunityPanel;
