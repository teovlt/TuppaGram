import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Trash2, Plus, Image as ImageIcon, X } from "lucide-react";
import { toast } from "sonner";

export const CreateRecipeForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    preparationTime: "",
    estimatedPrice: "$",
    type: "Main Course",
    difficulty: "Medium",
    isPublic: true,
  });

  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [steps, setSteps] = useState<string[]>([""]);
  const [diet, setDiet] = useState<string[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  const handleAddIngredient = () => setIngredients([...ingredients, ""]);
  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const handleAddStep = () => setSteps([...steps, ""]);
  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };
  const handleStepChange = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = value;
    setSteps(newSteps);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.preparationTime) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        preparationTime: Number(formData.preparationTime),
        ingredients: ingredients.filter(i => i.trim() !== ""),
        steps: steps.filter(s => s.trim() !== ""),
        diet,
        photos: photoUrls,
      };

      const res = await axiosConfig.post("/recipes", payload);
      toast.success("Recette créée avec succès !");
      navigate(`/recipes/${res.data.recipe._id}`);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la création");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label>Titre de la recette *</Label>
        <Input 
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="ex: Poulet Basquaise"
        />
      </div>

      <div className="space-y-2">
        <Label>Description *</Label>
        <Textarea 
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Une brève description de votre plat..."
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Temps de préparation (minutes) *</Label>
          <Input 
            type="number"
            value={formData.preparationTime}
            onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
            placeholder="ex: 45"
            min="1"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Photos de la recette</Label>
        {photoUrls.length > 0 && (
          <div className="flex flex-wrap gap-4 mb-4">
            {photoUrls.map((url, i) => (
              <div key={i} className="relative inline-block w-32 h-32">
                <img src={url} alt={`Preview ${i}`} className="object-cover w-full h-full border rounded-lg" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute w-6 h-6 rounded-full top-1 right-1"
                  onClick={() => handleRemovePhoto(i)}
                >
                  <X size={12} />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex items-center w-full max-w-sm">
          <label className="flex flex-col items-center justify-center w-full h-24 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-muted/50">
            <div className="flex flex-col items-center justify-center text-muted-foreground">
              <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
              <p className="text-sm font-medium">Ajouter une photo</p>
            </div>
            <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={loading} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label>Type de plat</Label>
          <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Starter">Entrée</SelectItem>
              <SelectItem value="Main Course">Plat principal</SelectItem>
              <SelectItem value="Dessert">Dessert</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Difficulté</Label>
          <Select value={formData.difficulty} onValueChange={(val) => setFormData({ ...formData, difficulty: val })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Easy">Facile</SelectItem>
              <SelectItem value="Medium">Moyen</SelectItem>
              <SelectItem value="Hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Ingredients */}
      <div className="p-4 space-y-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center justify-between">
          <Label className="text-base">Ingrédients</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
            <Plus size={16} className="mr-2"/> Ajouter
          </Button>
        </div>
        {ingredients.map((ing, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input 
              value={ing}
              onChange={(e) => handleIngredientChange(i, e.target.value)}
              placeholder="ex: 200g de farine"
            />
            {ingredients.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(i)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="p-4 space-y-4 border rounded-lg bg-card text-card-foreground">
        <div className="flex items-center justify-between">
          <Label className="text-base">Étapes de préparation</Label>
          <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
            <Plus size={16} className="mr-2"/> Ajouter
          </Button>
        </div>
        {steps.map((step, i) => (
          <div key={i} className="flex gap-2">
            <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-accent text-accent-foreground">
              {i + 1}
            </div>
            <Textarea 
              value={step}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStepChange(i, e.target.value)}
              placeholder="Décrivez l'étape..."
            />
            {steps.length > 1 && (
              <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStep(i)}>
                <Trash2 size={16} className="text-destructive" />
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center space-x-2">
        <Switch 
          id="public-mode" 
          checked={formData.isPublic}
          onCheckedChange={(checked: boolean) => setFormData({ ...formData, isPublic: checked })}
        />
        <Label htmlFor="public-mode">Rendre cette recette publique</Label>
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Création en cours..." : "Publier la recette"}
      </Button>
    </form>
  );
};
