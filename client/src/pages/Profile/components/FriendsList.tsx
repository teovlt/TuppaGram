import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loading } from "@/components/customs/loading";
import { Search, UserMinus, X } from "lucide-react";
import { toast } from "sonner";
import { PendingRequests } from "./PendingRequests";

interface FriendsListProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  isOwnProfile: boolean;
}

export const FriendsList = ({ open, onOpenChange, userId, isOwnProfile }: FriendsListProps) => {
  const [friends, setFriends] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchFilter, setSearchFilter] = useState("");

  useEffect(() => {
    if (!open) return;
    const fetchFriends = async () => {
      try {
        setLoading(true);
        const res = await axiosConfig.get(`/friendships/friends/${userId}`);
        setFriends(res.data.friends);
      } catch (error) {
        toast.error("Erreur lors du chargement des amis");
      } finally {
        setLoading(false);
      }
    };
    fetchFriends();
  }, [open, userId]);

  const handleRemoveFriend = async (friendshipId: string) => {
    try {
      await axiosConfig.delete(`/friendships/${friendshipId}`);
      setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId));
      toast.success("Ami supprimé");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    }
  };

  const filteredFriends = friends.filter((f) =>
    f.user?.username?.toLowerCase().includes(searchFilter.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Liste d'amis ({friends.length})</DialogTitle>
        </DialogHeader>

        {isOwnProfile && (
          <div className="mb-4">
            <PendingRequests />
          </div>
        )}

        {friends.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <Input
              placeholder="Rechercher un ami..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="pl-9"
            />
          </div>
        )}

        {loading ? (
          <div className="py-8">
            <Loading />
          </div>
        ) : (
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {filteredFriends.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">
                {friends.length === 0 ? "Aucun ami pour le moment" : "Aucun résultat"}
              </p>
            ) : (
              filteredFriends.map((f) => (
                <div key={f.friendshipId} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Link to={`/user/${f.user?._id}`} onClick={() => onOpenChange(false)}>
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={f.user?.avatar} />
                      <AvatarFallback>{f.user?.username?.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/user/${f.user?._id}`}
                      className="font-semibold hover:underline block truncate"
                      onClick={() => onOpenChange(false)}
                    >
                      {f.user?.username}
                    </Link>
                    {f.user?.bio && (
                      <p className="text-xs text-muted-foreground truncate">{f.user.bio}</p>
                    )}
                  </div>
                  {isOwnProfile && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="flex-shrink-0 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveFriend(f.friendshipId)}
                    >
                      <UserMinus size={16} />
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
