import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MessageCircle, Send, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { toast } from "sonner";
import { Loading } from "@/components/customs/loading";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MoreVertical, Edit2, Image as ImageIcon, X } from "lucide-react";

export const PostCard = ({ post, onPostDeleted }: { post: any; onPostDeleted?: (id: string) => void }) => {
  const { authUser } = useAuthContext();
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Initial fetch for likes and comments
    const fetchInteractions = async () => {
      try {
        const [likesRes, commentsRes] = await Promise.all([
          axiosConfig.get(`/interactions/likes/Post/${post._id}/count`),
          axiosConfig.get(`/interactions/comments/Post/${post._id}`)
        ]);
        setLikesCount(likesRes.data.count);
        setComments(commentsRes.data.comments);
        // We'd need an endpoint to check if specifically liked by me, or backend could send it
        // For now we assume false until clicked, or we handle it optimistically.
      } catch (e) {
        console.error(e);
      }
    };
    fetchInteractions();
  }, [post._id]);

  const handleLike = async () => {
    try {
      const res = await axiosConfig.post("/interactions/likes", {
        referenceModel: "Post",
        referenceId: post._id
      });
      setIsLiked(res.data.liked);
      setLikesCount(prev => res.data.liked ? prev + 1 : prev - 1);
    } catch (e) {
      toast.error("Erreur lors du like");
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const res = await axiosConfig.post("/interactions/comments", {
        referenceModel: "Post",
        referenceId: post._id,
        text: newComment
      });
      setComments([...comments, res.data.comment]);
      setNewComment("");
    } catch (e) {
      toast.error("Erreur lors de l'ajout du commentaire");
    }
  };

  const handleDelete = async () => {
    try {
      await axiosConfig.delete(`/posts/${post._id}`);
      toast.success("Post supprimé");
      if (onPostDeleted) onPostDeleted(post._id);
    } catch (e) {
      toast.error("Erreur lors de la suppression");
    }
  };

  const isAuthor = authUser?._id === post.author?._id;

  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(post.text || "");
  const [editPhotoUrl, setEditPhotoUrl] = useState(post.photos?.[0] || "");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editText && !editPhotoUrl) {
      toast.error("Le post ne peut pas être vide");
      return;
    }
    try {
      setIsUpdating(true);
      await axiosConfig.put(`/posts/${post._id}`, {
        text: editText,
        photos: editPhotoUrl ? [editPhotoUrl] : [],
        recipeRef: post.recipeRef?._id || "none"
      });
      toast.success("Post mis à jour !");
      post.text = editText;
      post.photos = editPhotoUrl ? [editPhotoUrl] : [];
      setIsEditing(false);
    } catch (e) {
      toast.error("Erreur lors de la modification");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setIsUpdating(true);
      const res = await axiosConfig.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setEditPhotoUrl(res.data.url);
    } catch (err: any) {
      toast.error("Erreur lors de l'upload");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-3">
          <Link to={`/user/${post.author?._id}`}>
            <Avatar className="w-10 h-10">
              <AvatarImage src={post.author?.avatar} />
              <AvatarFallback>{post.author?.username?.charAt(0)}</AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <Link to={`/user/${post.author?._id}`} className="font-semibold hover:underline">
              {post.author?.username}
            </Link>
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
        </div>
        {isAuthor && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)} className="cursor-pointer">
                <Edit2 className="w-4 h-4 mr-2" /> Modifier
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="cursor-pointer text-destructive focus:text-destructive">
                <Trash2 className="w-4 h-4 mr-2" /> Supprimer
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </CardHeader>
      
      <CardContent className="space-y-4">
        {post.text && <p className="text-sm whitespace-pre-wrap">{post.text}</p>}
        
        {post.photos && post.photos.length > 0 && (
          <div className="overflow-hidden border rounded-xl bg-muted">
            <img src={post.photos[0]} alt="Post media" className="object-cover w-full max-h-96" />
          </div>
        )}

        {post.recipeRef && (
          <Link to={`/recipes/${post.recipeRef._id}`}>
            <div className="flex gap-4 p-3 transition-colors border rounded-lg bg-accent/5 hover:bg-accent/10">
              {post.recipeRef.photos && post.recipeRef.photos[0] ? (
                <div className="flex-shrink-0 w-16 h-16 overflow-hidden rounded-md">
                  <img src={post.recipeRef.photos[0]} alt={post.recipeRef.title} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-md bg-muted" />
              )}
              <div className="flex flex-col justify-center">
                <span className="font-semibold line-clamp-1">{post.recipeRef.title}</span>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" /> 
                  {post.recipeRef.averageRating > 0 ? post.recipeRef.averageRating.toFixed(1) : "Nouveau"}
                </span>
              </div>
            </div>
          </Link>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4">
        <div className="flex items-center w-full gap-4 pt-2 border-t">
          <Button variant="ghost" size="sm" className="gap-2" onClick={handleLike}>
            <Heart className={isLiked ? "fill-red-500 text-red-500" : ""} size={20} />
            {likesCount}
          </Button>
          <Button variant="ghost" size="sm" className="gap-2" onClick={() => setShowComments(!showComments)}>
            <MessageCircle size={20} />
            {comments.length}
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-4">
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
              {comments.map((c) => (
                <div key={c._id} className="flex gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={c.author?.avatar} />
                    <AvatarFallback>{c.author?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col p-2 text-sm rounded-lg bg-muted/50">
                    <span className="font-semibold">{c.author?.username}</span>
                    <span>{c.text}</span>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-xs text-center text-muted-foreground">Aucun commentaire</p>}
            </div>
            <form onSubmit={handleComment} className="flex items-center gap-2">
              <Input 
                placeholder="Ajouter un commentaire..." 
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 rounded-full"
              />
              <Button size="icon" type="submit" variant="ghost" disabled={!newComment.trim()}>
                <Send size={16} />
              </Button>
            </form>
          </div>
        )}
      </CardFooter>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Modifier le post</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Message</Label>
              <Textarea 
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                placeholder="Votre message..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label>Photo</Label>
              {editPhotoUrl ? (
                <div className="relative inline-block w-full">
                  <img src={editPhotoUrl} alt="Preview" className="object-cover w-full h-32 border rounded-lg" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute w-6 h-6 rounded-full top-1 right-1"
                    onClick={() => setEditPhotoUrl("")}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-24 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-muted/50">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                      <p className="text-sm font-medium">Ajouter une photo</p>
                    </div>
                    <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleEditImageUpload} disabled={isUpdating} />
                  </label>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? "Modification..." : "Sauvegarder"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
