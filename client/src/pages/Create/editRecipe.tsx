import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { CreateRecipeForm } from "./components/CreateRecipeForm";
import { Loading } from "@/components/customs/loading";
import { toast } from "sonner";

export const EditRecipe = () => {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const [recipeData, setRecipeData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        const res = await axiosConfig.get(`/recipes/${id}`);
        const recipe = res.data.recipe;
        if (recipe.author._id !== authUser?._id) {
          toast.error("Non autorisé");
          navigate("/recipes");
          return;
        }
        setRecipeData(recipe);
      } catch (error) {
        toast.error("Erreur lors du chargement de la recette");
        navigate("/recipes");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchRecipe();
  }, [id, authUser, navigate]);

  if (loading) return <Loading />;
  if (!recipeData) return null;

  return (
    <div className="container max-w-2xl p-4 mx-auto md:p-8">
      <h1 className="mb-8 text-3xl font-bold text-center">Modifier la recette</h1>
      <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
        <CreateRecipeForm initialData={recipeData} recipeId={id} />
      </div>
    </div>
  );
};
