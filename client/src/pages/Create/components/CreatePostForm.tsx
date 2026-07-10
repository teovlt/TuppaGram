import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Image as ImageIcon, X, MapPin, Hash, Globe, Users, Lock } from "lucide-react";

const VISIBILITY_OPTIONS = [
  { value: "public", label: "Public", description: "Visible par tous", icon: Globe },
  { value: "friends", label: "Amis", description: "Visible par vos amis", icon: Users },
  { value: "private", label: "Privé", description: "Visible uniquement par vous", icon: Lock },
];

export const CreatePostForm = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthContext();
  const [loading, setLoading] = useState(false);

  // Content
  const [text, setText] = useState("");
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [recipeRef, setRecipeRef] = useState<string>("none");
  const [myRecipes, setMyRecipes] = useState<any[]>([]);

  // New fields
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [location, setLocation] = useState("");
  const [visibility, setVisibility] = useState<string>("public");

  useEffect(() => {
    const fetchMyRecipes = async () => {
      try {
        if (authUser?._id) {
          const res = await axiosConfig.get(`/recipes/user/${authUser._id}`);
          setMyRecipes(res.data.recipes);
        }
      } catch (e) {}
    };
    fetchMyRecipes();
  }, [authUser]);

  // --- Tag handlers ---
  const handleAddTag = () => {
    const tag = tagInput.trim().replace(/^#/, "").toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  // --- Photo upload (multiple) ---
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
      setPhotoUrls([...photoUrls, res.data.url]);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de l'upload de l'image");
    } finally {
      setLoading(false);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotoUrls(photoUrls.filter((_, i) => i !== index));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && photoUrls.length === 0) {
      toast.error("Le post ne peut pas être totalement vide");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        text,
        photos: photoUrls,
        recipeRef: recipeRef !== "none" ? recipeRef : undefined,
        tags,
        location,
        visibility,
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

  const currentVisibility = VISIBILITY_OPTIONS.find((v) => v.value === visibility);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Text */}
      <div className="space-y-2">
        <Label className="text-base font-medium">Que voulez-vous partager ?</Label>
        <Textarea
          value={text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setText(e.target.value)}
          placeholder="J'ai testé ce plat incroyable hier soir..."
          rows={5}
          className="resize-none"
        />
        <div className="flex justify-end">
          <span className={`text-xs ${text.length > 2000 ? "text-destructive" : "text-muted-foreground"}`}>
            {text.length}/2000
          </span>
        </div>
      </div>

      {/* Photos */}
      <div className="space-y-3">
        <Label>Photos</Label>
        {photoUrls.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {photoUrls.map((url, i) => (
              <div key={i} className="relative group aspect-square overflow-hidden rounded-lg border">
                <img src={url} alt={`Photo ${i + 1}`} className="object-cover w-full h-full" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute w-7 h-7 rounded-full top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemovePhoto(i)}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}
          </div>
        )}
        {photoUrls.length < 5 && (
          <label className="flex flex-col items-center justify-center w-full h-28 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-muted/50 hover:border-primary/40">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm font-medium">Cliquez pour uploader</p>
              <p className="text-xs">JPG, PNG ou WEBP (Max 5Mo) · {photoUrls.length}/5</p>
            </div>
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={loading} />
          </label>
        )}
      </div>

      <Separator />

      {/* Tags */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><Hash size={14} /> Tags</Label>
        <div className="flex items-center gap-2">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Ajoutez un tag et appuyez Entrée"
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddTag} disabled={tags.length >= 10}>
            Ajouter
          </Button>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="gap-1 cursor-pointer hover:bg-destructive/10" onClick={() => handleRemoveTag(tag)}>
                #{tag} <X size={12} />
              </Badge>
            ))}
          </div>
        )}
        <p className="text-xs text-muted-foreground">{tags.length}/10 tags</p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2"><MapPin size={14} /> Lieu (optionnel)</Label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="ex: Paris, France"
        />
      </div>

      {/* Visibility */}
      <div className="space-y-2">
        <Label>Visibilité</Label>
        <div className="grid grid-cols-3 gap-2">
          {VISIBILITY_OPTIONS.map((v) => (
            <button
              key={v.value}
              type="button"
              onClick={() => setVisibility(v.value)}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border text-sm transition-all ${
                visibility === v.value
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/20 hover:bg-muted/50"
              }`}
            >
              <v.icon size={18} />
              <span className="font-medium">{v.label}</span>
              <span className="text-[10px] text-muted-foreground hidden md:block">{v.description}</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Recipe link */}
      <div className="space-y-2">
        <Label>Lier une recette (optionnel)</Label>
        <Select value={recipeRef} onValueChange={setRecipeRef}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez une recette" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">Aucune recette</SelectItem>
            {myRecipes.map((r) => (
              <SelectItem key={r._id} value={r._id}>{r.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full" disabled={loading || text.length > 2000}>
        {loading ? "Publication..." : "Publier le Post"}
      </Button>
    </form>
  );
};
