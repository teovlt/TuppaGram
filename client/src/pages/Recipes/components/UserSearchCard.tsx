import { useState } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Clock, UserCheck, Check, X } from "lucide-react";
import { toast } from "sonner";

interface UserSearchCardProps {
  user: any;
  friendshipStatus: { status: string; direction?: string; friendship?: any } | null;
  onStatusChange?: () => void;
}

export const UserSearchCard = ({ user, friendshipStatus, onStatusChange }: UserSearchCardProps) => {
  const [loading, setLoading] = useState(false);
  const [localStatus, setLocalStatus] = useState(friendshipStatus);

  const handleSendRequest = async () => {
    try {
      setLoading(true);
      const res = await axiosConfig.post(`/friendships/request/${user._id}`);
      toast.success(res.data.message);
      setLocalStatus({ status: "pending", direction: "outgoing", friendship: res.data.friendship });
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi");
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    if (!localStatus?.friendship?._id) return;
    try {
      setLoading(true);
      await axiosConfig.put(`/friendships/accept/${localStatus.friendship._id}`);
      toast.success("Demande acceptée !");
      setLocalStatus({ status: "accepted", direction: undefined, friendship: localStatus.friendship });
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async () => {
    if (!localStatus?.friendship?._id) return;
    try {
      setLoading(true);
      await axiosConfig.put(`/friendships/decline/${localStatus.friendship._id}`);
      toast.success("Demande refusée");
      setLocalStatus({ status: "none", friendship: null });
      onStatusChange?.();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    } finally {
      setLoading(false);
    }
  };

  const status = localStatus?.status || "none";
  const direction = localStatus?.direction;

  return (
    <Card className="flex items-center gap-4 p-4 transition-all hover:shadow-md">
      <Link to={`/user/${user._id}`}>
        <Avatar className="w-14 h-14">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="text-lg">{user.username?.charAt(0)}</AvatarFallback>
        </Avatar>
      </Link>

      <div className="flex-1 min-w-0">
        <Link to={`/user/${user._id}`} className="font-semibold hover:underline block truncate">
          {user.username}
        </Link>
        {user.fullname && (
          <p className="text-sm text-muted-foreground truncate">{user.fullname}</p>
        )}
        {user.bio && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>
        )}
      </div>

      <div className="flex-shrink-0">
        {status === "none" && (
          <Button size="sm" onClick={handleSendRequest} disabled={loading} className="gap-1.5">
            <UserPlus size={14} /> Ajouter
          </Button>
        )}
        {status === "pending" && direction === "outgoing" && (
          <Button size="sm" variant="secondary" disabled className="gap-1.5">
            <Clock size={14} /> En attente
          </Button>
        )}
        {status === "pending" && direction === "incoming" && (
          <div className="flex gap-1.5">
            <Button size="sm" onClick={handleAccept} disabled={loading} className="gap-1">
              <Check size={14} /> Accepter
            </Button>
            <Button size="sm" variant="outline" onClick={handleDecline} disabled={loading}>
              <X size={14} />
            </Button>
          </div>
        )}
        {status === "accepted" && (
          <Button size="sm" variant="outline" disabled className="gap-1.5 text-green-600">
            <UserCheck size={14} /> Ami
          </Button>
        )}
      </div>
    </Card>
  );
};
