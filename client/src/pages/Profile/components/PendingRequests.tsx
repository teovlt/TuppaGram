import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Loading } from "@/components/customs/loading";
import { Check, X, UserPlus } from "lucide-react";
import { toast } from "sonner";

export const PendingRequests = () => {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        setLoading(true);
        const res = await axiosConfig.get("/friendships/pending");
        setRequests(res.data.requests);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, []);

  const handleAccept = async (friendshipId: string) => {
    try {
      await axiosConfig.put(`/friendships/accept/${friendshipId}`);
      setRequests((prev) => prev.filter((r) => r._id !== friendshipId));
      toast.success("Demande d'ami acceptée !");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    }
  };

  const handleDecline = async (friendshipId: string) => {
    try {
      await axiosConfig.put(`/friendships/decline/${friendshipId}`);
      setRequests((prev) => prev.filter((r) => r._id !== friendshipId));
      toast.success("Demande refusée");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    }
  };

  if (loading) return <Loading />;

  if (requests.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Aucune demande d'ami en attente</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-w-xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Demandes d'ami ({requests.length})</h3>
      {requests.map((req) => (
        <Card key={req._id} className="flex items-center gap-4 p-4">
          <Link to={`/user/${req.requester?._id}`}>
            <Avatar className="w-12 h-12">
              <AvatarImage src={req.requester?.avatar} />
              <AvatarFallback>{req.requester?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/user/${req.requester?._id}`} className="font-semibold hover:underline block truncate">
              {req.requester?.username}
            </Link>
            {req.requester?.bio && (
              <p className="text-xs text-muted-foreground truncate">{req.requester.bio}</p>
            )}
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" onClick={() => handleAccept(req._id)} className="gap-1">
              <Check size={14} /> Accepter
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDecline(req._id)}>
              <X size={14} />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
