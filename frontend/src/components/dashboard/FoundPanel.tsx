import { useState } from "react";
import {
  Plus,
  Package,
  MapPin,
  Clock,
  Shield,
  CheckCircle,
  Lock,
  Unlock,
  X,
  Camera,
  Grid,
  List,
  Filter,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { useCreateItem, useItems, useSubmitClaim } from "@/lib/api";

interface FoundItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  timeFound?: string;
  description: string;
  image?: string; // ✅ will store Cloudinary URL now
  status: "open" | "claimed" | "pending";
  userId: { _id: string; username: string };
  verificationQuestions: string[];
  createdAt: string;
}

interface FoundPanelProps {
  searchQuery: string;
}

const categories = [
  "Electronics",
  "Academics",
  "Documents",
  "Clothing",
  "Accessories",
  "Keys",
  "Other",
];

const locations = [
  "Library",
  "Cafeteria",
  "Engineering Building",
  "Science Complex",
  "Gym",
  "Parking Lot",
  "Dorm Area",
  "Student Center",
  "Other",
];

export default function FoundPanel({ searchQuery }: FoundPanelProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FoundItem | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [claimAnswers, setClaimAnswers] = useState<string[]>([]);
  const [claimStep, setClaimStep] = useState<
    "questions" | "pending" | "success"
  >("questions");

  const [newItem, setNewItem] = useState({
    title: "",
    category: "",
    location: "",
    description: "",
    verificationQ1: "",
    verificationQ2: "",
  });

  const { data: itemsData, isLoading } = useItems(
    "found",
    filterCategory === "all" ? undefined : filterCategory
  );

  const createItemMutation = useCreateItem();
  const submitClaimMutation = useSubmitClaim();

  const foundItems: FoundItem[] = (itemsData as FoundItem[]) || [];

  const filteredItems = foundItems.filter((item: FoundItem) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!newItem.title || !newItem.category || !newItem.location) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        type: "found",
        location: newItem.location,
        verificationQuestions: [
          newItem.verificationQ1,
          newItem.verificationQ2,
        ].filter((q) => q.trim()),
        image: imageFile ?? undefined, // ✅ send file
      });

      toast({
        title: "✅ Item Posted!",
        description: "Thanks for being a good human! +10 karma points.",
      });

      setIsModalOpen(false);
      setNewItem({
        title: "",
        category: "",
        location: "",
        description: "",
        verificationQ1: "",
        verificationQ2: "",
      });
      setUploadedImage(null);
      setImageFile(null);
    } catch (error: any) {
      toast({
        title: "❌ Error",
        description: error.message || "Failed to post found item",
        variant: "destructive",
      });
    }
  };

  const handleClaim = (item: FoundItem) => {
    setSelectedItem(item);
    setClaimAnswers(new Array(item.verificationQuestions.length).fill(""));
    setClaimStep("questions");
    setIsClaimModalOpen(true);
  };

  const submitClaim = async () => {
    if (!selectedItem) return;

    const allAnswered = claimAnswers.every((a) => a.trim().length > 0);
    if (!allAnswered) {
      toast({
        title: "Answer All Questions",
        description:
          "You must answer all verification questions to claim this item.",
        variant: "destructive",
      });
      return;
    }

    setClaimStep("pending");
    try {
      await submitClaimMutation.mutateAsync({
        itemId: selectedItem._id,
        claimAnswers,
      });

      setClaimStep("success");
      setIsClaimModalOpen(false);

      toast({
        title: "✅ Claim Submitted!",
        description: `Verification answers sent to ${selectedItem.userId.username}. They'll review and contact you if correct.`,
      });
    } catch (error: any) {
      setClaimStep("questions");
      toast({
        title: "Error",
        description: error.message || "Failed to submit claim",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">
            AVAILABLE
          </Badge>
        );
      case "pending":
        return (
          <Badge className="bg-secondary/20 text-secondary border-secondary/30 text-[10px]">
            CLAIM PENDING
          </Badge>
        );
      case "claimed":
        return (
          <Badge className="bg-muted text-muted-foreground text-[10px]">
            CLAIMED
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={filterCategory}
            onValueChange={(value) => setFilterCategory(value)}
          >
            <SelectTrigger className="w-40 glass-card border-border/50">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent className="glass-card border-border/50">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex items-center glass-card rounded-lg p-1 border border-border/50">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Report Found Item
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gradient">
                Report Found Item
              </DialogTitle>
              <DialogDescription className="font-mono text-sm">
                Found something? Be a hero. Someone&apos;s probably panicking
                right now.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Image Upload */}
              <div className="space-y-2">
                <Label className="font-display text-sm">
                  Item Photo (Recommended)
                </Label>
                <div className="flex items-center gap-4">
                  {uploadedImage ? (
                    <div className="relative w-24 h-24">
                      <img
                        src={uploadedImage}
                        alt="Upload"
                        className="w-full h-full object-cover rounded-lg border border-border/50"
                      />
                      <Button
                        size="icon"
                        variant="destructive"
                        className="absolute -top-2 -right-2 w-6 h-6"
                        onClick={() => {
                          setUploadedImage(null);
                          setImageFile(null);
                        }}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                      <Camera className="w-6 h-6 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground mt-1">
                        Upload
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="font-display text-sm">Item Title *</Label>
                  <Input
                    placeholder="What did you find?"
                    value={newItem.title}
                    onChange={(e) =>
                      setNewItem({ ...newItem, title: e.target.value })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-display text-sm">Category *</Label>
                  <Select
                    value={newItem.category}
                    onValueChange={(value) =>
                      setNewItem({ ...newItem, category: value })
                    }
                  >
                    <SelectTrigger className="bg-muted/50 border-border/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className="glass-card border-border/50">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-display text-sm">
                  Where did you find it? *
                </Label>
                <Select
                  value={newItem.location}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, location: value })
                  }
                >
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="glass-card border-border/50">
                    {locations.map((loc) => (
                      <SelectItem key={loc} value={loc}>
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-display text-sm">
                  Description (Don&apos;t reveal everything!)
                </Label>
                <Textarea
                  placeholder="Describe just enough so the owner knows it's theirs..."
                  value={newItem.description}
                  onChange={(e) =>
                    setNewItem({ ...newItem, description: e.target.value })
                  }
                  className="bg-muted/50 border-border/50 min-h-[100px]"
                />
              </div>

              <div className="p-4 glass-card rounded-lg border border-secondary/30 space-y-4">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-secondary" />
                  <Label className="font-display text-sm text-secondary">
                    Verification Questions
                  </Label>
                </div>
                <div className="space-y-3">
                  <Input
                    placeholder="Question 1"
                    value={newItem.verificationQ1}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        verificationQ1: e.target.value,
                      })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                  <Input
                    placeholder="Question 2"
                    value={newItem.verificationQ2}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        verificationQ2: e.target.value,
                      })
                    }
                    className="bg-muted/50 border-border/50"
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={createItemMutation.isPending}
              >
                {createItemMutation.isPending ? (
                  "Posting..."
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Post Found Item
                  </>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items */}
      {isLoading ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg text-foreground">
            Loading found items...
          </p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg text-foreground">
            No found items match your search
          </p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }
        >
          {filteredItems.map((item) => (
            <Card
              key={item._id}
              className="glass-card border-border hover:border-secondary/50 transition-all group"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {getStatusBadge(item.status)}
                    <CardTitle className="font-display text-lg mt-2 group-hover:text-secondary transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                  <div className="p-2 bg-secondary/10 rounded-full">
                    <Shield className="w-4 h-4 text-secondary" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {/* ✅ SHOW IMAGE */}
                {item.image && (
                  <div className="w-full h-40 overflow-hidden rounded-lg border border-border/50">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                )}

                <p className="text-sm text-muted-foreground line-clamp-2">
                  {item.description}
                </p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Package className="w-3 h-3 text-secondary" />
                    <span>{item.category}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="w-3 h-3 text-primary" />
                    <span>{item.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-3 h-3 text-accent" />
                    <span>
                      {item.timeFound ||
                        new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/50 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    found by @{item.userId.username}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs border-secondary/50 text-secondary hover:bg-secondary/10"
                    onClick={() => handleClaim(item)}
                    disabled={item.status === "claimed"}
                  >
                    {item.status === "claimed" ? (
                      <>
                        <Lock className="w-3 h-3 mr-1" />
                        Claimed
                      </>
                    ) : (
                      <>
                        <Unlock className="w-3 h-3 mr-1" />
                        Claim This
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Claim Modal */}
      <Dialog open={isClaimModalOpen} onOpenChange={setIsClaimModalOpen}>
        <DialogContent className="glass-card border-border/50 max-w-md">
          {claimStep === "questions" && selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display text-xl flex items-center gap-2">
                  <Shield className="w-5 h-5 text-secondary" />
                  Verify Ownership
                </DialogTitle>
                <DialogDescription className="font-mono text-sm">
                  Answer these questions to prove this is yours.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                {selectedItem.verificationQuestions.map((q, i) => (
                  <div key={i} className="space-y-2">
                    <Label className="font-display text-sm text-secondary">
                      {q}
                    </Label>
                    <Input
                      placeholder="Your answer..."
                      value={claimAnswers[i] || ""}
                      onChange={(e) => {
                        const newAnswers = [...claimAnswers];
                        newAnswers[i] = e.target.value;
                        setClaimAnswers(newAnswers);
                      }}
                      className="bg-muted/50 border-border/50"
                    />
                  </div>
                ))}
              </div>

              <DialogFooter>
                <Button
                  variant="ghost"
                  onClick={() => setIsClaimModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="hero"
                  onClick={submitClaim}
                  disabled={submitClaimMutation.isPending}
                >
                  {submitClaimMutation.isPending ? (
                    "Submitting..."
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}

          {claimStep === "pending" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
              <p className="font-display text-lg text-foreground">
                Verifying your claim...
              </p>
            </div>
          )}

          {claimStep === "success" && (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="font-display text-lg text-foreground">
                Claim Submitted!
              </p>
              <Button
                variant="hero"
                className="mt-6"
                onClick={() => setIsClaimModalOpen(false)}
              >
                Got it!
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
