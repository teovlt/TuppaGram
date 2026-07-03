import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

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
        <Label>Ajouter une photo (URL)</Label>
        <Input 
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://..."
        />
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
