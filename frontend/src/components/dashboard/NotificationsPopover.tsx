// frontend/src/components/dashboard/NotificationsPopover.tsx
import { useMemo, useState } from "react";
import { Bell, Package, MessageSquare, Users, CheckCircle, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, markNotificationAsRead } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface UiNotification {
  id: string;
  type: "lost" | "found" | "message" | "community" | "karma";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

const NotificationsPopover = () => {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: rawNotifications = [], isLoading } = useNotifications();

  const uiNotifications: UiNotification[] = useMemo(
  () =>
    rawNotifications.map((n: any): UiNotification => {
      let type: UiNotification["type"] = "community";
      let title = "Notification";

      if (n.type === "new-message") {
        type = "message";
        title = "New message";
      } else if (n.type === "claim-pending" || n.type === "claim-submitted") {
        type = "found";
        title = "Claim pending";
      } else if (n.type === "claim-approved" || n.type === "claim-completed") {
        type = "found";
        title = "Claim approved";
      } else if (n.type === "claim-rejected") {
        type = "found";
        title = "Claim rejected";
      } else if (n.type === "community-post") {
        type = "community";
        title = "New community post";
      }

      return {
        id: n._id,
        type,
        title,
        description: n.text,
        timestamp: new Date(n.createdAt).toLocaleString(),
        read: n.read,
      };
    }),
  [rawNotifications]
);


  const unreadCount = useMemo(
    () => uiNotifications.filter((n) => !n.read).length,
    [uiNotifications]
  );

  const markOneMutation = useMutation({
    mutationFn: (id: string) => markNotificationAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAsRead = (id: string) => {
    const target = uiNotifications.find((n) => n.id === id);
    if (!target || target.read) return;
    markOneMutation.mutate(id);
  };

  const markAllMutation = useMutation({
    mutationFn: async () => {
      await Promise.all(
        uiNotifications.filter((n) => !n.read).map((n) => markNotificationAsRead(n.id))
      );
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsRead = () => {
    if (!unreadCount) return;
    markAllMutation.mutate();
  };

  const getIcon = (type: UiNotification["type"]) => {
    switch (type) {
      case "lost":
        return <Package className="w-4 h-4 text-destructive" />;
      case "found":
        return <CheckCircle className="w-4 h-4 text-primary" />;
      case "message":
        return <MessageSquare className="w-4 h-4 text-secondary" />;
      case "community":
        return <Users className="w-4 h-4 text-accent" />;
      case "karma":
        return <span className="text-sm">⚡</span>;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <div className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-destructive flex items-center justify-center animate-pulse">
              <span className="text-[10px] font-bold text-destructive-foreground">
                {unreadCount}
              </span>
            </div>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0 glass-card border-border/50">
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-primary" />
            <span className="font-display font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 && (
              <Badge className="bg-primary/20 text-primary text-[10px]">
                {unreadCount} new
              </Badge>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-primary"
              onClick={markAllAsRead}
              disabled={markAllMutation.isLoading}
            >
              Mark all read
            </Button>
          )}
        </div>

        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading notifications...
            </div>
          ) : uiNotifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We&apos;ll notify you when something happens
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {uiNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 hover:bg-muted/50 transition-colors relative group cursor-pointer ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        !notification.read ? "bg-primary/10" : "bg-muted/50"
                      }`}
                    >
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-sm font-medium ${
                            !notification.read ? "text-foreground" : "text-muted-foreground"
                          }`}
                        >
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.description}
                      </p>
                      <div className="flex items-center gap-1 mt-1 text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span className="text-[10px]">{notification.timestamp}</span>
                      </div>
                    </div>
                    {/* Optional: local clear button only removes from UI, not backend */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="p-2 border-t border-border/50">
          <Button variant="ghost" className="w-full text-xs text-muted-foreground">
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsPopover;
