import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Search, Utensils, Users } from "lucide-react";
import { Loading } from "@/components/customs/loading";
import { UserSearchCard } from "./components/UserSearchCard";

export const RecipesIndex = () => {
  // Recipe state
  const [recipes, setRecipes] = useState<any[]>([]);
  const [recipeLoading, setRecipeLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [difficulty, setDifficulty] = useState("");

  // User search state
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<any[]>([]);
  const [userLoading, setUserLoading] = useState(false);
  const [friendStatuses, setFriendStatuses] = useState<Record<string, any>>({});
  const [userPage, setUserPage] = useState(1);
  const [hasMoreUsers, setHasMoreUsers] = useState(false);
  const [loadingMoreUsers, setLoadingMoreUsers] = useState(false);

  // --- Recipe logic ---
  const fetchRecipes = async () => {
    try {
      setRecipeLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (type && type !== "all") params.append("type", type);
      if (difficulty && difficulty !== "all") params.append("difficulty", difficulty);

      const response = await axiosConfig.get(`/recipes?${params.toString()}`);
      setRecipes(response.data.recipes);
    } catch (error) {
      console.error(error);
    } finally {
      setRecipeLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
    // Fetch users initially
    handleUserSearch(undefined, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, difficulty]);

  const handleRecipeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRecipes();
  };

  // --- User search logic ---
  const handleUserSearch = async (e?: React.FormEvent, resetPage = true) => {
    e?.preventDefault();
    const query = userQuery.trim();
    if (resetPage && query.length === 1) return; // Allow 0 length for initial fetch, but block 1 char

    const pageToFetch = resetPage ? 1 : userPage + 1;

    try {
      if (resetPage) {
        setUserLoading(true);
        setUserPage(1);
      } else {
        setLoadingMoreUsers(true);
      }

      const res = await axiosConfig.get(
        `/users/search?q=${encodeURIComponent(userQuery.trim())}&page=${pageToFetch}`
      );
      const newUsers = res.data.users;

      setUserResults((prev) => (resetPage ? newUsers : [...prev, ...newUsers]));
      setHasMoreUsers(res.data.hasMore);
      if (!resetPage) setUserPage(pageToFetch);

      // Fetch friendship status for NEW users only
      const statuses: Record<string, any> = resetPage ? {} : { ...friendStatuses };
      await Promise.all(
        newUsers.map(async (user: any) => {
          if (statuses[user._id]) return; // already fetched
          try {
            const statusRes = await axiosConfig.get(`/friendships/status/${user._id}`);
            statuses[user._id] = statusRes.data;
          } catch {
            statuses[user._id] = { status: "none" };
          }
        }),
      );
      setFriendStatuses(statuses);
    } catch (error) {
      console.error(error);
    } finally {
      if (resetPage) setUserLoading(false);
      else setLoadingMoreUsers(false);
    }
  };

  return (
    <div className="container p-4 mx-auto md:p-8">
      <h1 className="mb-8 text-3xl font-bold">Découvrir</h1>

      <Tabs defaultValue="recipes" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="recipes" className="gap-2">
            <Utensils size={16} /> Recettes
          </TabsTrigger>
          <TabsTrigger value="users" className="gap-2">
            <Users size={16} /> Utilisateurs
          </TabsTrigger>
        </TabsList>

        {/* Recipes Tab */}
        <TabsContent value="recipes">
          <form onSubmit={handleRecipeSearch} className="flex flex-col gap-4 mb-8 md:flex-row">
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
                <SelectItem value="Snack">Encas</SelectItem>
                <SelectItem value="Drink">Boisson</SelectItem>
                <SelectItem value="Side">Accompagnement</SelectItem>
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

          {recipeLoading && recipes.length === 0 ? (
            <Loading />
          ) : (
            <>
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
                          <span className="font-medium text-accent">
                            {(recipe.preparationTime || 0) + (recipe.cookingTime || 0)} min
                          </span>
                          <span className="flex items-center gap-1 text-yellow-500">
                            <Star size={16} fill="currentColor" />{" "}
                            {recipe.averageRating > 0 ? recipe.averageRating.toFixed(1) : "Nouveau"}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {recipes.length === 0 && !recipeLoading && (
                <div className="py-12 text-center text-muted-foreground">
                  Aucune recette ne correspond à votre recherche.
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <form onSubmit={handleUserSearch} className="flex gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                placeholder="Rechercher un utilisateur par nom..."
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={userLoading || userQuery.trim().length === 1}>
              Rechercher
            </Button>
          </form>

          {userLoading ? (
            <Loading />
          ) : (
            <div className="space-y-3 max-w-2xl mx-auto pb-8">
              {userResults.length > 0 ? (
                <>
                  {userResults.map((user) => (
                    <UserSearchCard
                      key={user._id}
                      user={user}
                      friendshipStatus={friendStatuses[user._id] || null}
                      onStatusChange={() => {
                        // For simplicity, refetching current page if status changes
                        handleUserSearch(undefined, true);
                      }}
                    />
                  ))}
                  {hasMoreUsers && (
                    <div className="flex justify-center pt-4">
                      <Button
                        variant="outline"
                        onClick={() => handleUserSearch(undefined, false)}
                        disabled={loadingMoreUsers}
                      >
                        {loadingMoreUsers ? "Chargement..." : "Charger plus"}
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                  <p>Aucun utilisateur trouvé.</p>
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
