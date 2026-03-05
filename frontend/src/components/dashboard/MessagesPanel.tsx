import { useEffect, useMemo, useState } from "react";
import {
  Shield,
  Lock,
  Send,
  CheckCheck,
  Check,
  Clock,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  useMessages,
  useSendMessage,
  useApproveClaim,
  useItem,
  useUserProfile,
  useMarkConversationRead,
} from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface Message {
  id: string;
  content: string;
  sender: "me" | "them";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
  encrypted: boolean;
  itemId?: string;
}

interface Conversation {
  id: string; // chatId = other user's USERNAME (perspective-based)
  otherUserId: string;
  participant: string; // other user's username
  itemTitle: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  verified: boolean;
  messages: Message[];
}

interface MessagesPanelProps {
  messageTarget?: { id: string; username: string } | null;
}

// 🔐 Claim Approval UI (same as your version)
const ClaimApprovalSection = ({
  message,
  itemId,
  myId,
}: {
  message: Message;
  itemId: string;
  myId: string;
}) => {
  const approveMutation = useApproveClaim();
  const { data: item } = useItem(itemId);

  const finderId = item?.userId?.id || item?.userId?._id;
  const isFinder = finderId === myId;
  const isPending = item?.status === "pending";

  if (!isFinder || !isPending || message.sender === "me") return null;

  return (
    <div className="p-4 bg-secondary/20 rounded-lg border border-secondary/30 mt-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-secondary" />
        <p className="text-sm font-medium text-secondary">CLAIM VERIFICATION</p>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        This user answered your verification questions. Approve if correct:
      </p>
      <div className="space-y-2 mb-4">
        {message.content
          .split("\n")
          .filter(
            (line) => line.includes("Verification") || line.match(/^\d+\./)
          )
          .map((line, i) => (
            <p key={i} className="text-xs bg-muted/50 p-2 rounded">
              {line}
            </p>
          ))}
      </div>
      <Button
        variant="success"
        size="sm"
        className="w-full font-medium"
        onClick={() => approveMutation.mutate(itemId)}
        disabled={approveMutation.isPending}
      >
        {approveMutation.isPending ? (
          <>
            <CheckCircle className="w-4 h-4 mr-2 animate-spin" />
            Approving.
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            ✅ APPROVE CLAIM & Remove from Found
          </>
        )}
      </Button>
      {item?.status === "claimed" && (
        <Badge variant="secondary" className="mt-2 w-full justify-center">
          ✅ Claim Completed
        </Badge>
      )}
    </div>
  );
};

const MessagesPanel = ({ messageTarget }: MessagesPanelProps) => {
  const { data: rawMessages = [], isLoading } = useMessages();
  const { data: profile } = useUserProfile();
  const sendMutation = useSendMessage();
  const markReadMutation = useMarkConversationRead();

  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEncryption, setShowEncryption] = useState(true);

  const myId = profile?._id || profile?.id || "";

  // Group messages by OTHER USER's username → chatId = username
  const conversations = useMemo<Conversation[]>(() => {
    const map = new Map<string, Conversation>();

    for (const m of rawMessages as any[]) {
      if (!m.senderId || !m.receiverId || !myId) continue;
      const isMeSender = m.senderId._id === myId;
      const otherUser = isMeSender ? m.receiverId : m.senderId;

      const chatId = otherUser.username || "user";
      const otherUserId = otherUser._id;

      const existing =
        map.get(chatId) ||
        ({
          id: chatId, // perspective-based chatId
          otherUserId,
          participant: otherUser.username || "user",
          itemTitle: "Chat",
          lastMessage: "",
          timestamp: "",
          unread: 0,
          verified: true,
          messages: [],
        } as Conversation);

      const msg: Message = {
        id: m._id,
        content: m.text,
        sender: isMeSender ? "me" : "them",
        timestamp: new Date(m.createdAt).toLocaleTimeString(),
        status: m.status,
        encrypted: true,
        itemId: m.itemId || undefined,
      };

      existing.messages.push(msg);
      existing.lastMessage = m.text;
      existing.timestamp = msg.timestamp;

      if (msg.sender === "them" && m.status !== "read") {
        existing.unread += 1;
      }

      map.set(chatId, existing);
    }

    for (const conv of map.values()) {
      conv.messages.sort((a, b) =>
        a.timestamp > b.timestamp ? 1 : -1
      );
    }

    return Array.from(map.values());
  }, [rawMessages, myId]);

  // If Dashboard passed a message target (e.g. from Lost/Found card)
  useEffect(() => {
    if (!messageTarget) return;

    const existing = conversations.find(
      (c) => c.participant === messageTarget.username
    );
    if (existing) {
      setSelectedConversation(existing);
    } else {
      const stub: Conversation = {
        id: messageTarget.username,
        otherUserId: messageTarget.id,
        participant: messageTarget.username,
        itemTitle: "New chat",
        lastMessage: "",
        timestamp: "",
        unread: 0,
        verified: true,
        messages: [],
      };
      setSelectedConversation(stub);
    }
  }, [messageTarget, conversations]);

  // Mark conversation as read when opened
  useEffect(() => {
    if (!selectedConversation) return;
    if (!selectedConversation.unread) return;
    markReadMutation.mutate(selectedConversation.participant);
  }, [selectedConversation, markReadMutation]);

  // Real-time: listen for socket events & refetch
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    socket.on("new-message", () => {
      // React Query invalidation is already done in useSendMessage on success;
      // here you could optionally trigger a refetch via QueryClient if needed.
    });

    socket.on("typing", ({ from }) => {
      // TODO: show "typing" indicator in UI if from === selectedConversation.otherUserId
    });

    return () => {
      socket.off("new-message");
      socket.off("typing");
    };
  }, []);

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    sendMutation.mutate({
      receiverUsername: selectedConversation.participant,
      text: newMessage.trim(),
      // optional itemId for claim context
    });
    setNewMessage("");
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div className="glass-card border-border/50 rounded-xl overflow-hidden">
      <div className="flex h-[600px]">
        {/* Conversation list */}
        <div className="w-full md:w-80 border-r border-border/50 flex flex-col">
          <div className="p-4 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-secondary" />
              <h2 className="font-display font-semibold text-foreground">
                Secure Messages
              </h2>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-mono">
              End-to-end encrypted • Verification required
            </p>
          </div>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading conversations...
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <Lock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No conversations yet
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Claim or report an item to start chatting
                </p>
              </div>
            ) : (
              <div className="p-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv)}
                    className={`w-full p-3 rounded-lg text-left transition-all ${
                      selectedConversation?.id === conv.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10 border border-border/50">
                        <AvatarFallback className="bg-gradient-to-br from-primary/50 to-secondary/50 text-foreground font-display text-xs">
                          {getInitials(conv.participant)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-display text-sm text-foreground truncate">
                            @{conv.participant}
                          </span>
                          <span className="text-[10px] text-muted-foreground">
                            {conv.timestamp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Badge className="bg-primary/20 text-primary border-primary/30 text-[8px] px-1 py-0">
                            VERIFIED
                          </Badge>
                          <span className="text-[10px] text-muted-foreground truncate">
                            {conv.itemTitle}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread > 0 && (
                        <Badge
                          variant="secondary"
                          className="ml-2 text-[10px] px-1.5 py-0"
                        >
                          {conv.unread}
                        </Badge>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Conversation content */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b border-border/50 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-sm text-foreground">
                      @{selectedConversation.participant}
                    </span>
                    <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">
                      <Shield className="w-3 h-3 mr-1" />
                      Verified
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Messages are stored securely and visible only to you and the
                    other person.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowEncryption((s) => !s)}
                  >
                    {showEncryption ? (
                      <Eye className="w-4 h-4" />
                    ) : (
                      <EyeOff className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${
                        msg.sender === "me"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[80%] p-3 rounded-xl ${
                          msg.sender === "me"
                            ? "bg-primary text-primary-foreground rounded-br-sm"
                            : "glass-card border border-border/50 rounded-bl-sm"
                        }`}
                      >
                        {showEncryption && msg.encrypted && (
                          <div className="flex items-center gap-1 mb-1">
                            <Lock className="w-2.5 h-2.5 text-current opacity-50" />
                            <span className="text-[8px] opacity-50 font-mono">
                              encrypted
                            </span>
                          </div>
                        )}
                        <p className="text-sm whitespace-pre-line">
                          {msg.content}
                        </p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className="text-[10px] opacity-60">
                            {msg.timestamp}
                          </span>
                          {msg.sender === "me" && (
                            <>
                              {msg.status === "read" ? (
                                <CheckCheck className="w-3 h-3 text-secondary" />
                              ) : msg.status === "delivered" ? (
                                <CheckCheck className="w-3 h-3 opacity-60" />
                              ) : (
                                <Check className="w-3 h-3 opacity-60" />
                              )}
                            </>
                          )}
                        </div>

                        {msg.itemId && (
                          <ClaimApprovalSection
                            message={msg}
                            itemId={msg.itemId}
                            myId={myId}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="Type a secure message."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                    className="bg-muted/50 border-border/50"
                  />
                  <Button
                    variant="hero"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={sendMutation.isLoading}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full glass-card border border-border/50 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="font-display text-lg text-foreground">
                  Select a conversation
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your messages are end-to-end encrypted
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPanel;
