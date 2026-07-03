import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";
import { Loading } from "@/components/customs/loading";

export const RecipesIndex = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const fetchRecipes = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (type && type !== "all") params.append("type", type);
      if (difficulty && difficulty !== "all") params.append("difficulty", difficulty);

      const response = await axiosConfig.get(`/recipes?${params.toString()}`);
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch, we can use a debounce for search if needed later
    fetchRecipes();
  }, [type, difficulty]); // Only refetch automatically when select filters change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes();
  };

  if (loading && recipes.length === 0) return <Loading />;

  return (
    <div className="container p-4 mx-auto md:p-8">
      <h1 className="mb-8 text-3xl font-bold">Découvrir des Recettes</h1>

      {/* Filters and Search */}
      <form onSubmit={handleSearch} className="flex flex-col gap-4 mb-8 md:flex-row">
        <Input
          placeholder="Rechercher par nom ou ingrédient..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1"
        />
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Type de plat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les types</SelectItem>
            <SelectItem value="Starter">Entrée</SelectItem>
            <SelectItem value="Main Course">Plat</SelectItem>
            <SelectItem value="Dessert">Dessert</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficulty} onValueChange={setDifficulty}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Difficulté" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes</SelectItem>
            <SelectItem value="Easy">Facile</SelectItem>
            <SelectItem value="Medium">Moyen</SelectItem>
            <SelectItem value="Hard">Difficile</SelectItem>
          </SelectContent>
        </Select>
        <Button type="submit">Rechercher</Button>
      </form>

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {recipes.map((recipe) => (
          <Link to={`/recipes/${recipe._id}`} key={recipe._id}>
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
                <p className="text-sm text-muted-foreground line-clamp-2">{recipe.description}</p>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-accent">{recipe.preparationTime} min</span>
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star size={16} fill="currentColor" /> {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "Nouveau"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {recipes.length === 0 && !loading && (
        <div className="py-12 text-center text-muted-foreground">
          Aucune recette ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
};
