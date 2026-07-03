import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Bell, Heart, MessageCircle, UserPlus, CheckCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";

export const NotificationSheet = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await axiosConfig.get("/notifications");
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.notifications.filter((n: any) => !n.read).length);
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    // Check initially
    fetchNotifications();
    // In a real app we might poll this or use websockets (Socket.IO is in this boilerplate actually).
    // For simplicity, we just fetch on mount and when opening the sheet.
  }, []);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axiosConfig.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "like": return <Heart size={16} className="text-red-500 fill-red-500" />;
      case "comment": return <MessageCircle size={16} className="text-blue-500" />;
      case "follow": return <UserPlus size={16} className="text-green-500" />;
      default: return <Bell size={16} />;
    }
  };

  const getTextForType = (type: string) => {
    switch (type) {
      case "like": return "A aimé votre publication";
      case "comment": return "A commenté votre publication";
      case "follow": return "A commencé à vous suivre";
      default: return "Nouvelle interaction";
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-red-500 rounded-full top-1 right-1">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex flex-col w-full sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b">
          <SheetTitle>Notifications</SheetTitle>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={handleMarkAllAsRead} className="h-8 gap-2 px-2 text-xs">
              <CheckCheck size={14} /> Tout marquer comme lu
            </Button>
          )}
        </SheetHeader>
        
        <div className="flex-1 py-4 space-y-4 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
              <Bell className="w-10 h-10 mb-2 opacity-20" />
              <p>Aucune notification</p>
            </div>
          ) : (
            notifications.map((notif) => (
              <Link 
                to={notif.link} 
                key={notif._id}
                onClick={() => setIsOpen(false)}
              >
                <div className={cn(
                  "flex items-start gap-4 p-4 rounded-lg transition-colors hover:bg-muted/80 mb-2 border",
                  !notif.read ? "bg-accent/5 border-accent/20" : "bg-card border-transparent"
                )}>
                  <div className="p-2 bg-background rounded-full shadow-sm mt-0.5">
                    {getIconForType(notif.type)}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <p className="text-sm font-medium">
                      {getTextForType(notif.type)}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 mt-2 rounded-full bg-accent" />
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
