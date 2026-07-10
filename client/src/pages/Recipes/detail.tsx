import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Star, Bookmark, ShoppingCart, Clock, ChefHat, Tag, Users, Lightbulb, ChevronLeft, ChevronRight, Globe } from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/customs/loading";
import { useAuthContext } from "@/contexts/authContext";
import { Edit2 } from "lucide-react";

const difficultyColors: Record<string, string> = {
  Easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  Medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const difficultyLabels: Record<string, string> = {
  Easy: "Facile",
  Medium: "Moyen",
  Hard: "Difficile",
};

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuthContext();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const response = await axiosConfig.get(`/recipes/${id}`);
        setRecipe(response.data.recipe);
      } catch (error: any) {
        toast.error("Impossible de charger la recette");
      } finally {
        setLoading(false);
      }
    };
    fetchRecipe();
  }, [id]);

  const handleBookmark = async () => {
    try {
      const res = await axiosConfig.post("/interactions/bookmarks", { recipeId: id });
      setIsBookmarked(res.data.bookmarked);
      toast.success(res.data.message);
    } catch (error) {
      toast.error("Erreur lors de l'ajout aux favoris");
    }
  };

  const handleAddToGroceryList = () => {
    const existing = JSON.parse(localStorage.getItem("groceryList") || "[]");
    const updated = [...existing, ...(recipe?.ingredients || [])];
    localStorage.setItem("groceryList", JSON.stringify(updated));
    toast.success("Ingrédients ajoutés à la liste de courses !");
  };

  if (loading) return <Loading />;
  if (!recipe) return <div className="p-8 text-center">Recette introuvable</div>;

  const photos = recipe.photos || [];
  const totalTime = (recipe.preparationTime || 0) + (recipe.cookingTime || 0);

  return (
    <div className="container max-w-4xl p-4 mx-auto md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Photo Gallery */}
        {photos.length > 0 ? (
          <div className="relative w-full md:w-1/2 h-64 md:h-96 rounded-xl overflow-hidden">
            <img src={photos[currentPhotoIndex]} alt={recipe.title} className="object-cover w-full h-full" />
            {photos.length > 1 && (
              <>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute w-8 h-8 rounded-full left-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={() => setCurrentPhotoIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1))}
                >
                  <ChevronLeft size={16} />
                </Button>
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute w-8 h-8 rounded-full right-2 top-1/2 -translate-y-1/2 opacity-80 hover:opacity-100"
                  onClick={() => setCurrentPhotoIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0))}
                >
                  <ChevronRight size={16} />
                </Button>
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {photos.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={() => setCurrentPhotoIndex(i)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        i === currentPhotoIndex ? "bg-white w-4" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center w-full bg-muted rounded-xl md:w-1/2 h-64 md:h-96 text-muted-foreground">
            Aucune image
          </div>
        )}

        <div className="flex flex-col justify-center flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold md:text-5xl">{recipe.title}</h1>
            <div className="flex gap-2">
              {authUser?._id === recipe.author?._id && (
                <Link to={`/recipes/${recipe._id}/edit`}>
                  <Button variant="outline" size="icon">
                    <Edit2 size={18} />
                  </Button>
                </Link>
              )}
              <Button variant="ghost" size="icon" onClick={handleBookmark}>
                <Bookmark className={isBookmarked ? "fill-current text-accent" : ""} />
              </Button>
            </div>
          </div>
          <p className="text-lg text-muted-foreground">{recipe.description}</p>

          {/* Info badges grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 gap-1">
              <Star size={18} className="text-yellow-500" />
              <span className="text-lg font-bold">{recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "—"}</span>
              <span className="text-xs text-muted-foreground">Note</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 gap-1">
              <Clock size={18} className="text-primary" />
              <span className="text-lg font-bold">{totalTime} min</span>
              <span className="text-xs text-muted-foreground">Temps total</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 gap-1">
              <Users size={18} className="text-primary" />
              <span className="text-lg font-bold">{recipe.servings || 2}</span>
              <span className="text-xs text-muted-foreground">Portions</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-lg bg-muted/50 gap-1">
              <Tag size={18} className="text-primary" />
              <span className="text-lg font-bold">{recipe.estimatedPrice}</span>
              <span className="text-xs text-muted-foreground">Budget</span>
            </div>
          </div>

          {/* Difficulty & cuisine badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${difficultyColors[recipe.difficulty] || ""} border-0`}>
              <ChefHat size={12} className="mr-1" /> {difficultyLabels[recipe.difficulty] || recipe.difficulty}
            </Badge>
            {recipe.cuisine && (
              <Badge variant="secondary">
                <Globe size={12} className="mr-1" /> {recipe.cuisine}
              </Badge>
            )}
          </div>

          {/* Diet tags */}
          {recipe.diet && recipe.diet.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.diet.map((d: string) => (
                <Badge key={d} variant="outline" className="text-xs">
                  {d}
                </Badge>
              ))}
            </div>
          )}

          {/* Time breakdown */}
          {recipe.cookingTime > 0 && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Préparation : {recipe.preparationTime} min</span>
              <span>·</span>
              <span>Cuisson : {recipe.cookingTime} min</span>
            </div>
          )}

          <div className="pt-2 text-sm text-muted-foreground">
            Proposé par{" "}
            <Link to={`/user/${recipe.author?._id}`} className="font-semibold text-foreground hover:underline">
              {recipe.author?.username}
            </Link>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Content */}
      <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
        {/* Ingredients */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Ingrédients</h2>
            <Button variant="outline" size="sm" onClick={handleAddToGroceryList}>
              <ShoppingCart size={16} className="mr-2" /> Liste
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">Pour {recipe.servings || 2} portions</p>
          <ul className="space-y-3">
            {recipe.ingredients.map((ing: string, i: number) => (
              <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Préparation</h2>
          <div className="space-y-6">
            {recipe.steps.map((step: any, i: number) => {
              const stepText = typeof step === "string" ? step : step.text;
              const stepDuration = typeof step === "object" ? step.duration : null;
              return (
                <div key={i} className="flex gap-4">
                  <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-primary text-primary-foreground text-sm">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <p className="pt-1 leading-relaxed">{stepText}</p>
                    {stepDuration && stepDuration > 0 && (
                      <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 text-xs rounded-full bg-muted text-muted-foreground">
                        <Clock size={10} /> {stepDuration} min
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tips section */}
      {recipe.tips && (
        <>
          <Separator className="my-8" />
          <div className="p-6 rounded-xl bg-primary/5 border border-primary/10">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb size={20} className="text-primary" />
              <h3 className="text-lg font-semibold">Astuces du chef</h3>
            </div>
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{recipe.tips}</p>
          </div>
        </>
      )}
    </div>
  );
};
