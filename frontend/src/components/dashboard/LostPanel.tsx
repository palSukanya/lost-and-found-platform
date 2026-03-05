import { useState } from 'react';
import {
  Plus,
  Package,
  MapPin,
  Clock,
  DollarSign,
  Filter,
  Grid,
  List,
  AlertTriangle,
  Camera,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { useCreateItem, useItems, useSendFoundMessage } from '@/lib/api';

interface LostItem {
  _id: string;
  title: string;
  category: string;
  location: string;
  timeLost?: string;
  reward?: string;
  description: string;
  image?: string; // ✅ added
  status: 'open' | 'claimed';
  userId: { _id: string; username: string };
  verificationQuestions: string[];
  createdAt: string;
}

interface LostPanelProps {
  searchQuery: string;
}

const categories = ['Electronics', 'Academics', 'Documents', 'Clothing', 'Accessories', 'Keys', 'Other'] as const;
const locations = ['Library', 'Cafeteria', 'Engineering Building', 'Science Complex', 'Gym', 'Parking Lot', 'Dorm Area', 'Student Center', 'Other'] as const;

export default function LostPanel({ searchQuery }: LostPanelProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterCategory, setFilterCategory] = useState<'all' | typeof categories[number]>('all');

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null); // ✅ NEW

  const [newItem, setNewItem] = useState({
    title: '',
    category: '',
    location: '',
    timeLost: '',
    reward: '',
    description: '',
    verificationQ1: '',
    verificationQ2: ''
  });

  const { data: itemsData, isLoading } = useItems('lost');
  const createItemMutation = useCreateItem();
  const sendFoundMessageMutation = useSendFoundMessage();

  const lostItems: LostItem[] = itemsData || [];

  const filteredItems = lostItems.filter((item: LostItem) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file); // ✅ important

      const reader = new FileReader();
      reader.onloadend = () => setUploadedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!newItem.title || !newItem.category || !newItem.location) {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    try {
      await createItemMutation.mutateAsync({
        title: newItem.title,
        description: newItem.description,
        category: newItem.category,
        type: 'lost' as const,
        location: newItem.location,
        reward: newItem.reward || undefined,
        timeLost: newItem.timeLost || undefined,
        verificationQuestions: [newItem.verificationQ1, newItem.verificationQ2].filter(q => q.trim()),
        image: imageFile ?? undefined, // ✅ send file to backend
      });

      toast({
        title: '✅ Item Reported!',
        description: 'Your lost item has been posted to the chaos!'
      });

      setIsModalOpen(false);
      setNewItem({
        title: '',
        category: '',
        location: '',
        timeLost: '',
        reward: '',
        description: '',
        verificationQ1: '',
        verificationQ2: ''
      });

      setUploadedImage(null);
      setImageFile(null); // ✅ reset
    } catch (error: any) {
      toast({
        title: '❌ Error',
        description: error.message || 'Failed to report item',
        variant: 'destructive'
      });
    }
  };

  const handleIFoundThis = async (item: LostItem) => {
    try {
      await sendFoundMessageMutation.mutateAsync({
        receiverId: item.userId._id,
        itemId: item._id,
        text: `🎉 I FOUND YOUR "${item.title.toUpperCase()}"!\n\nFound at: ${item.location}\n\nLet's arrange pickup and verification. Reply to coordinate time/location!`
      });
      toast({ title: '📤 Message Sent!', description: `Notification sent to ${item.userId.username}` });
    } catch (error: any) {
      toast({ title: '❌ Error', description: error.message || 'Failed to send message', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value as any)}>
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
        </div>

        <div className="flex items-center glass-card rounded-lg p-1 border border-border/50">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" className="gap-2">
              <Plus className="w-4 h-4" />
              Report Lost Item
            </Button>
          </DialogTrigger>

          <DialogContent className="glass-card border-border/50 max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display text-xl text-gradient">
                Report Lost Item
              </DialogTitle>
              <DialogDescription className="font-mono text-sm">
                Lost something? Let the campus chaos know.
              </DialogDescription>
            </DialogHeader>

            {/* Image Upload */}
            <div className="space-y-2">
              <Label className="font-display text-sm">Item Photo (Optional)</Label>
              <div className="flex items-center gap-4">
                {uploadedImage && (
                  <div className="relative w-24 h-24">
                    <img
                      src={uploadedImage}
                      alt="Upload preview"
                      className="w-full h-full object-cover rounded-lg border border-border/50"
                    />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="absolute -top-2 -right-2 w-6 h-6"
                      onClick={() => {
                        setUploadedImage(null);
                        setImageFile(null); // ✅
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                )}

                <label className="w-24 h-24 border-2 border-dashed border-border/50 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground mt-1">Upload</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label className="font-display text-sm">Item Title *</Label>
                <Input
                  placeholder="What did you lose?"
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display text-sm">Category *</Label>
                <Select value={newItem.category} onValueChange={(v) => setNewItem({ ...newItem, category: v })}>
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

              <div className="space-y-2">
                <Label className="font-display text-sm">Location *</Label>
                <Select value={newItem.location} onValueChange={(v) => setNewItem({ ...newItem, location: v })}>
                  <SelectTrigger className="bg-muted/50 border-border/50">
                    <SelectValue placeholder="Where did you lose it?" />
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
                <Label className="font-display text-sm">Time Lost</Label>
                <Input
                  type="datetime-local"
                  value={newItem.timeLost}
                  onChange={(e) => setNewItem({ ...newItem, timeLost: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-display text-sm">Reward (Optional)</Label>
                <Input
                  placeholder="e.g., $20"
                  value={newItem.reward}
                  onChange={(e) => setNewItem({ ...newItem, reward: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="font-display text-sm">Description</Label>
              <Textarea
                placeholder="Describe your item..."
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="bg-muted/50 border-border/50 min-h-[100px]"
              />
            </div>

            {/* Verification Questions */}
            <div className="p-4 glass-card rounded-lg border border-primary/30 space-y-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <Label className="font-display text-sm text-primary">Verification Questions</Label>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Q1"
                  value={newItem.verificationQ1}
                  onChange={(e) => setNewItem({ ...newItem, verificationQ1: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
                <Input
                  placeholder="Q2"
                  value={newItem.verificationQ2}
                  onChange={(e) => setNewItem({ ...newItem, verificationQ2: e.target.value })}
                  className="bg-muted/50 border-border/50"
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="hero" onClick={handleSubmit} disabled={createItemMutation.isPending}>
                {createItemMutation.isPending ? 'Posting...' : 'Report Lost Item'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Items Grid/List */}
      {isLoading ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg text-foreground">Loading lost items...</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="text-center py-12 glass-card rounded-xl">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-display text-lg text-foreground">No lost items found</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 space-y-4' : 'space-y-4'}>
          {filteredItems.map((item) => (
            <Card key={item._id} className="glass-card border-border hover:border-primary/50 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2 bg-destructive/20 text-destructive border-destructive/30 text-[10px]">
                      LOST
                    </Badge>
                    <CardTitle className="font-display text-lg group-hover:text-gradient transition-all">
                      {item.title}
                    </CardTitle>
                  </div>

                  {item.reward && (
                    <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 rounded-full">
                      <DollarSign className="w-3 h-3 text-primary" />
                      <span className="text-xs font-mono text-primary">Reward</span>
                    </div>
                  )}
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

                <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>

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
                    <span>{item.timeLost || new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">by {item.userId.username}</span>

                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => handleIFoundThis(item)}
                    disabled={item.status === 'claimed' || sendFoundMessageMutation.isPending}
                  >
                    {sendFoundMessageMutation.isPending ? 'Sending...' : 'I Found This!'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
