import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, Bookmark, ShoppingCart, Clock, ChefHat, Tag } from "lucide-react";
import { toast } from "sonner";
import { Loading } from "@/components/customs/loading";

export const RecipeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [recipe, setRecipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
    // Basic local storage implementation for now
    const existing = JSON.parse(localStorage.getItem("groceryList") || "[]");
    const updated = [...existing, ...(recipe?.ingredients || [])];
    localStorage.setItem("groceryList", JSON.stringify(updated));
    toast.success("Ingrédients ajoutés à la liste de courses !");
  };

  if (loading) return <Loading />;
  if (!recipe) return <div className="p-8 text-center">Recette introuvable</div>;

  return (
    <div className="container max-w-4xl p-4 mx-auto md:p-8">
      {/* Header */}
      <div className="flex flex-col gap-6 md:flex-row">
        {recipe.photos && recipe.photos.length > 0 ? (
          <div className="w-full md:w-1/2 h-64 md:h-96 rounded-xl overflow-hidden">
            <img src={recipe.photos[0]} alt={recipe.title} className="object-cover w-full h-full" />
          </div>
        ) : (
          <div className="flex items-center justify-center w-full bg-muted rounded-xl md:w-1/2 h-64 md:h-96 text-muted-foreground">
            Aucune image
          </div>
        )}
        
        <div className="flex flex-col justify-center flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold md:text-5xl">{recipe.title}</h1>
            <Button variant="ghost" size="icon" onClick={handleBookmark}>
              <Bookmark className={isBookmarked ? "fill-current text-accent" : ""} />
            </Button>
          </div>
          <p className="text-lg text-muted-foreground">{recipe.description}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
            <span className="flex items-center gap-1 text-yellow-500">
              <Star size={18} fill="currentColor" /> {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "Nouveau"}
            </span>
            <span className="flex items-center gap-1"><Clock size={18} /> {recipe.preparationTime} min</span>
            <span className="flex items-center gap-1"><ChefHat size={18} /> {recipe.difficulty}</span>
            <span className="flex items-center gap-1"><Tag size={18} /> {recipe.estimatedPrice}</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {recipe.diet?.map((d: string) => (
              <span key={d} className="px-3 py-1 text-xs rounded-full bg-accent/10 text-accent">
                {d}
              </span>
            ))}
          </div>

          <div className="pt-4 text-sm text-muted-foreground">
            Proposé par <span className="font-semibold text-foreground">{recipe.author?.username}</span>
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
          <ul className="space-y-3">
            {recipe.ingredients.map((ing: string, i: number) => (
              <li key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                {ing}
              </li>
            ))}
          </ul>
        </div>

        {/* Steps */}
        <div className="md:col-span-2 space-y-4">
          <h2 className="text-2xl font-semibold">Préparation</h2>
          <div className="space-y-6">
            {recipe.steps.map((step: string, i: number) => (
              <div key={i} className="flex gap-4">
                <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 font-bold rounded-full bg-accent text-accent-foreground">
                  {i + 1}
                </div>
                <p className="pt-1 leading-relaxed">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
