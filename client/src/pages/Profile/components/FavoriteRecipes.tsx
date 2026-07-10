import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, Bookmark } from "lucide-react";
import { Loading } from "@/components/customs/loading";

export const FavoriteRecipes = () => {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      try {
        setLoading(true);
        const res = await axiosConfig.get("/interactions/bookmarks");
        setBookmarks(res.data.bookmarks);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  if (loading) return <Loading />;

  if (bookmarks.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <Bookmark className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p>Vous n'avez aucune recette dans vos favoris</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
      {bookmarks.map((bookmark) => {
        const recipe = bookmark.recipe;
        if (!recipe) return null; // Defensive check if recipe was deleted
        
        return (
          <Link to={`/recipes/${recipe._id}`} key={bookmark._id}>
            <Card className="h-full transition-shadow hover:shadow-lg">
              {recipe.photos && recipe.photos.length > 0 ? (
                <div className="w-full h-48 overflow-hidden rounded-t-lg">
                  <img src={recipe.photos[0]} alt={recipe.title} className="object-cover w-full h-full" />
                </div>
              ) : (
                <div className="flex items-center justify-center w-full h-48 bg-muted rounded-t-lg text-muted-foreground">
                  Aucune image
                </div>
              )}
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-xl line-clamp-1">{recipe.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-accent">
                    {(recipe.preparationTime || 0) + (recipe.cookingTime || 0)} min
                  </span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} fill="currentColor" /> {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "Nouveau"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
};
