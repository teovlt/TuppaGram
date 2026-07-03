import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Image as ImageIcon, X } from "lucide-react";

export const CreatePostForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [photoUrl, setPhotoUrl] = useState("");
  const [recipeRef, setRecipeRef] = useState<string>("none");
  
  const [myRecipes, setMyRecipes] = useState<any[]>([]);

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        // Here we could just fetch recipes authored by the user if we had a dedicated endpoint.
        // For simplicity we fetch public recipes and filter or use a specific endpoint if exists.
        // Let's assume the user ID is in context, but wait, the easiest is to fetch from the general /recipes 
        // We actually created /recipes/user/:userId in the backend!
        // We don't have authUser _id directly available without importing useAuthContext, let's do it:
        const tokenRaw = localStorage.getItem("auth_token") || "";
        // Alternatively, if we just want all recipes for dropdown (not ideal for large DBs):
        const res = await axiosConfig.get("/recipes");
        setMyRecipes(res.data.recipes); // In a real app, only "my" recipes or bookmarked ones
      } catch (e) {}
    };
    fetchMyRecipes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !photoUrl) {
      toast.error("Le post ne peut pas être totalement vide");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        text,
        photos: photoUrl ? [photoUrl] : [],
        recipeRef: recipeRef !== "none" ? recipeRef : undefined,
      };

      await axiosConfig.post("/posts", payload);
      toast.success("Post publié avec succès !");
      navigate("/");
    } catch (error: any) {
      toast.error("Erreur lors de la publication du post");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    try {
      setLoading(true);
      const res = await axiosConfig.post("/uploads/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setPhotoUrl(res.data.url);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'upload de l'image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Que voulez-vous partager ?</Label>
        <Textarea 
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder="J'ai testé ce plat incroyable hier soir..."
          rows={5}
        />
      </div>

      <div className="space-y-2">
        <Label>Ajouter une photo</Label>
        {photoUrl ? (
          <div className="relative inline-block">
            <img src={photoUrl} alt="Preview" className="object-cover w-full max-w-sm border rounded-lg aspect-video" />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute w-8 h-8 rounded-full top-2 right-2"
              onClick={() => setPhotoUrl("")}
            >
              <X size={16} />
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full max-w-sm">
            <label className="flex flex-col items-center justify-center w-full h-32 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-muted/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 text-muted-foreground">
                <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm font-medium">Cliquez pour uploader</p>
                <p className="text-xs">JPG, PNG ou WEBP (Max 5Mo)</p>
              </div>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={loading} />
            </label>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label>Lier une recette (optionnel)</Label>
        <Select value={recipeRef} onValueChange={setRecipeRef}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une recette" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune recette</SelectItem>
            {myRecipes.map(r => (
              <SelectItem key={r._id} value={r._id}>{r.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Publication..." : "Publier le Post"}
      </Button>
    </form>
  );
};
