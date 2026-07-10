import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Image as ImageIcon, X, Clock, ChefHat, UtensilsCrossed, Users, Lightbulb, GripVertical } from "lucide-react";
import { toast } from "sonner";

const CUISINE_OPTIONS = [
  "Française", "Italienne", "Japonaise", "Chinoise", "Mexicaine", "Indienne",
  "Thaïlandaise", "Marocaine", "Libanaise", "Coréenne", "Américaine", "Espagnole", "Autre",
];

const DIET_OPTIONS = [
  "Végétarien", "Végan", "Sans gluten", "Sans lactose", "Halal", "Casher", "Keto", "Paleo",
];

const TYPE_OPTIONS = [
  { value: "Starter", label: "Entrée" },
  { value: "Main Course", label: "Plat principal" },
  { value: "Dessert", label: "Dessert" },
  { value: "Snack", label: "Encas" },
  { value: "Drink", label: "Boisson" },
  { value: "Side", label: "Accompagnement" },
];

const DIFFICULTY_OPTIONS = [
  { value: "Easy", label: "Facile", emoji: "🟢" },
  { value: "Medium", label: "Moyen", emoji: "🟡" },
  { value: "Hard", label: "Difficile", emoji: "🔴" },
];

const PRICE_OPTIONS = [
  { value: "$", label: "Économique ($)" },
  { value: "$$", label: "Modéré ($$)" },
  { value: "$$$", label: "Coûteux ($$$)" },
];

interface RecipeStep {
  text: string;
  duration: string; // stored as string for input, converted to number on submit
}

export const CreateRecipeForm = ({
  initialData,
  recipeId,
}: {
  initialData?: any;
  recipeId?: string;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [currentSection, setCurrentSection] = useState(0);

  // Basic info
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [cuisine, setCuisine] = useState(initialData?.cuisine || "");
  const [type, setType] = useState(initialData?.type || "Main Course");

  // Time & difficulty
  const [preparationTime, setPreparationTime] = useState(initialData?.preparationTime?.toString() || "");
  const [cookingTime, setCookingTime] = useState(initialData?.cookingTime?.toString() || "");
  const [servings, setServings] = useState(initialData?.servings?.toString() || "2");
  const [difficulty, setDifficulty] = useState(initialData?.difficulty || "Medium");
  const [estimatedPrice, setEstimatedPrice] = useState(initialData?.estimatedPrice || "$$");

  // Ingredients & steps
  const [ingredients, setIngredients] = useState<string[]>(
    initialData?.ingredients?.length > 0 ? initialData.ingredients : [""]
  );
  const [steps, setSteps] = useState<RecipeStep[]>(
    initialData?.steps?.length > 0 
      ? initialData.steps.map((s: any) => ({ text: s.text, duration: s.duration?.toString() || "" }))
      : [{ text: "", duration: "" }]
  );

  // Diet tags
  const [diet, setDiet] = useState<string[]>(initialData?.diet || []);

  // Photos
  const [photoUrls, setPhotoUrls] = useState<string[]>(initialData?.photos || []);

  // Visibility & notes
  const [isPublic, setIsPublic] = useState(initialData?.isPublic ?? true);
  const [tips, setTips] = useState(initialData?.tips || "");

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  const sections = [
    { label: "Informations", icon: UtensilsCrossed },
    { label: "Temps & Difficulté", icon: Clock },
    { label: "Ingrédients", icon: ChefHat },
    { label: "Préparation", icon: GripVertical },
    { label: "Photos & Finalisation", icon: ImageIcon },
  ];

  // --- Ingredient handlers ---
  const handleAddIngredient = () => setIngredients([...ingredients, ""]);
  const handleRemoveIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };
  const handleIngredientChange = (index: number, value: string) => {
    const updated = [...ingredients];
    updated[index] = value;
    setIngredients(updated);
  };

  // --- Step handlers ---
  const handleAddStep = () => setSteps([...steps, { text: "", duration: "" }]);
  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };
  const handleStepChange = (index: number, field: keyof RecipeStep, value: string) => {
    const updated = [...steps];
    updated[index] = { ...updated[index], [field]: value };
    setSteps(updated);
  };

  // --- Diet toggle ---
  const toggleDiet = (d: string) => {
    setDiet((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  // --- Photo upload ---
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

  // --- Validation per section ---
  const validateSection = (section: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (section === 0) {
      if (!title.trim()) newErrors.title = "Le titre est requis";
      if (!description.trim()) newErrors.description = "La description est requise";
    }
    if (section === 1) {
      if (!preparationTime || Number(preparationTime) < 1) newErrors.preparationTime = "Temps de préparation requis";
    }
    if (section === 2) {
      const validIngredients = ingredients.filter((i) => i.trim() !== "");
      if (validIngredients.length === 0) newErrors.ingredients = "Au moins un ingrédient est requis";
    }
    if (section === 3) {
      const validSteps = steps.filter((s) => s.text.trim() !== "");
      if (validSteps.length === 0) newErrors.steps = "Au moins une étape est requise";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateSection(currentSection)) {
      setCurrentSection((prev) => Math.min(prev + 1, sections.length - 1));
    }
  };

  const handlePrev = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 0));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateSection(currentSection)) return;

    // Final overall validation
    if (!title.trim() || !description.trim() || !preparationTime) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        title: title.trim(),
        description: description.trim(),
        preparationTime: Number(preparationTime),
        cookingTime: Number(cookingTime) || 0,
        servings: Number(servings) || 2,
        estimatedPrice,
        type,
        cuisine,
        diet,
        difficulty,
        ingredients: ingredients.filter((i) => i.trim() !== ""),
        steps: steps
          .filter((s) => s.text.trim() !== "")
          .map((s) => ({
            text: s.text.trim(),
            duration: s.duration ? Number(s.duration) : undefined,
          })),
        photos: photoUrls,
        isPublic,
        tips: tips.trim(),
      };

      if (recipeId) {
        await axiosConfig.put(`/recipes/${recipeId}`, payload);
        toast.success("Recette mise à jour avec succès !");
        navigate(`/recipes/${recipeId}`);
      } else {
        const res = await axiosConfig.post("/recipes", payload);
        toast.success("Recette créée avec succès !");
        navigate(`/recipes/${res.data.recipe._id}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la création/mise à jour");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Step indicator */}
      <div className="flex items-center justify-between mb-6">
        {sections.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => {
              if (i < currentSection || validateSection(currentSection)) setCurrentSection(i);
            }}
            className={`flex flex-col items-center gap-1 flex-1 transition-all ${
              i === currentSection
                ? "text-primary"
                : i < currentSection
                  ? "text-primary/60"
                  : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all ${
                i === currentSection
                  ? "border-primary bg-primary text-primary-foreground"
                  : i < currentSection
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-muted-foreground/30"
              }`}
            >
              <s.icon size={18} />
            </div>
            <span className="hidden text-xs font-medium md:block">{s.label}</span>
            {i < sections.length - 1 && (
              <div className="absolute hidden w-full h-0.5 bg-muted-foreground/20" />
            )}
          </button>
        ))}
      </div>

      <Separator />

      {/* Section 0: Basic Info */}
      {currentSection === 0 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-semibold mb-1">Informations de base</h3>
            <p className="text-sm text-muted-foreground">Donnez un nom et une description à votre recette</p>
          </div>
          <div className="space-y-2">
            <Label>Titre de la recette <span className="text-destructive">*</span></Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Poulet Basquaise"
              className={errors.title ? "border-destructive" : ""}
            />
            {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
          </div>
          <div className="space-y-2">
            <Label>Description <span className="text-destructive">*</span></Label>
            <Textarea
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Une brève description de votre plat..."
              rows={4}
              className={errors.description ? "border-destructive" : ""}
            />
            <div className="flex justify-between">
              {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
              <p className="text-xs text-muted-foreground ml-auto">{description.length}/500</p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Type de plat</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TYPE_OPTIONS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cuisine</Label>
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger><SelectValue placeholder="Sélectionnez une cuisine" /></SelectTrigger>
                <SelectContent>
                  {CUISINE_OPTIONS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Section 1: Time & Difficulty */}
      {currentSection === 1 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-semibold mb-1">Temps & Difficulté</h3>
            <p className="text-sm text-muted-foreground">Définissez les informations pratiques</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock size={14} /> Temps de préparation (min) <span className="text-destructive">*</span></Label>
              <Input
                type="number"
                value={preparationTime}
                onChange={(e) => setPreparationTime(e.target.value)}
                placeholder="ex: 30"
                min="1"
                className={errors.preparationTime ? "border-destructive" : ""}
              />
              {errors.preparationTime && <p className="text-xs text-destructive">{errors.preparationTime}</p>}
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Clock size={14} /> Temps de cuisson (min)</Label>
              <Input
                type="number"
                value={cookingTime}
                onChange={(e) => setCookingTime(e.target.value)}
                placeholder="ex: 45"
                min="0"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label className="flex items-center gap-2"><Users size={14} /> Nombre de portions</Label>
              <Input
                type="number"
                value={servings}
                onChange={(e) => setServings(e.target.value)}
                placeholder="2"
                min="1"
                max="50"
              />
            </div>
            <div className="space-y-2">
              <Label>Difficulté</Label>
              <div className="flex gap-2">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <button
                    key={d.value}
                    type="button"
                    onClick={() => setDifficulty(d.value)}
                    className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg border text-sm font-medium transition-all ${
                      difficulty === d.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-muted-foreground/20 hover:bg-muted/50"
                    }`}
                  >
                    <span>{d.emoji}</span> {d.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Budget estimé</Label>
              <Select value={estimatedPrice} onValueChange={setEstimatedPrice}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRICE_OPTIONS.map((p) => (
                    <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Label>Régimes alimentaires</Label>
            <div className="flex flex-wrap gap-2">
              {DIET_OPTIONS.map((d) => (
                <Badge
                  key={d}
                  variant={diet.includes(d) ? "default" : "outline"}
                  className={`cursor-pointer transition-all ${
                    diet.includes(d)
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => toggleDiet(d)}
                >
                  {d}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Section 2: Ingredients */}
      {currentSection === 2 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ingrédients</h3>
              <p className="text-sm text-muted-foreground">Listez tous les ingrédients nécessaires</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddIngredient}>
              <Plus size={16} className="mr-2" /> Ajouter
            </Button>
          </div>
          {errors.ingredients && <p className="text-xs text-destructive">{errors.ingredients}</p>}
          <div className="space-y-3">
            {ingredients.map((ing, i) => (
              <div key={i} className="flex items-center gap-2 p-3 border rounded-lg bg-card/50">
                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <Input
                  value={ing}
                  onChange={(e) => handleIngredientChange(i, e.target.value)}
                  placeholder="ex: 200g de farine"
                  className="border-0 bg-transparent focus-visible:ring-0 shadow-none"
                />
                {ingredients.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveIngredient(i)} className="flex-shrink-0">
                    <Trash2 size={16} className="text-destructive" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: Steps */}
      {currentSection === 3 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Étapes de préparation</h3>
              <p className="text-sm text-muted-foreground">Décrivez chaque étape en détail</p>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={handleAddStep}>
              <Plus size={16} className="mr-2" /> Ajouter
            </Button>
          </div>
          {errors.steps && <p className="text-xs text-destructive">{errors.steps}</p>}
          <div className="space-y-4">
            {steps.map((step, i) => (
              <div key={i} className="p-4 border rounded-lg bg-card/50 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 mt-1 font-bold rounded-full bg-primary text-primary-foreground text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={step.text}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleStepChange(i, "text", e.target.value)}
                      placeholder="Décrivez l'étape en détail..."
                      rows={3}
                      className="border-0 bg-transparent focus-visible:ring-0 shadow-none resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-muted-foreground" />
                      <Input
                        type="number"
                        value={step.duration}
                        onChange={(e) => handleStepChange(i, "duration", e.target.value)}
                        placeholder="Durée (min)"
                        min="0"
                        className="w-32 h-8 text-sm"
                      />
                    </div>
                  </div>
                  {steps.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveStep(i)} className="flex-shrink-0">
                      <Trash2 size={16} className="text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 4: Photos & Finalization */}
      {currentSection === 4 && (
        <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
          <div>
            <h3 className="text-lg font-semibold mb-1">Photos & Finalisation</h3>
            <p className="text-sm text-muted-foreground">Ajoutez des photos et finalisez votre recette</p>
          </div>

          {/* Photos */}
          <div className="space-y-3">
            <Label>Photos de la recette</Label>
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
            <label className="flex flex-col items-center justify-center w-full h-24 transition-colors border-2 border-dashed rounded-lg cursor-pointer border-muted-foreground/25 hover:bg-muted/50 hover:border-primary/40">
              <div className="flex flex-col items-center justify-center text-muted-foreground">
                <ImageIcon className="w-6 h-6 mb-1 opacity-50" />
                <p className="text-sm font-medium">Cliquez pour ajouter une photo</p>
                <p className="text-xs">JPG, PNG ou WEBP (Max 5Mo)</p>
              </div>
              <input type="file" className="hidden" accept="image/jpeg,image/png,image/webp" onChange={handleImageUpload} disabled={loading} />
            </label>
          </div>

          <Separator />

          {/* Tips */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2"><Lightbulb size={14} /> Astuces du chef</Label>
            <Textarea
              value={tips}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTips(e.target.value)}
              placeholder="Partagez vos conseils et astuces pour réussir cette recette..."
              rows={3}
            />
          </div>

          {/* Public toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Visibilité</p>
              <p className="text-sm text-muted-foreground">
                {isPublic ? "Visible par tous les utilisateurs" : "Visible uniquement par vous"}
              </p>
            </div>
            <Switch
              id="public-mode"
              checked={isPublic}
              onCheckedChange={(checked: boolean) => setIsPublic(checked)}
            />
          </div>
        </div>
      )}

      <Separator />

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrev}
          disabled={currentSection === 0}
        >
          Précédent
        </Button>

        <span className="text-sm text-muted-foreground">
          {currentSection + 1} / {sections.length}
        </span>

        {currentSection < sections.length - 1 ? (
          <Button type="button" onClick={handleNext}>
            Suivant
          </Button>
        ) : (
          <Button type="submit" disabled={loading} className="min-w-[140px]">
            {loading ? "Création en cours..." : "Publier la recette"}
          </Button>
        )}
      </div>
    </form>
  );
};
