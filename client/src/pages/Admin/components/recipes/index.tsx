import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AdminRecipes = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [recipeCount, setRecipeCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);

  async function fetchRecipes(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/recipes/admin/all?page=${page}&size=${size}`);
      setRecipes(response.data.recipes);
      setRecipeCount(response.data.count);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function callback(action: string, data: any) {
    if (action === "delete") {
      const recipe = recipes.find((r) => r._id === data);
      setSelectedRecipe(recipe);
      setDeleteDialogOpen(true);
    }
  }

  const confirmDelete = async () => {
    if (!selectedRecipe) return;
    try {
      await axiosConfig.delete(`/recipes/${selectedRecipe._id}`);
      toast.success("Recette supprimée");
      setDeleteDialogOpen(false);
      fetchRecipes();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de suppression");
    }
  };

  return (
    <div>
      <div className="container px-4 mx-auto">
        <DataTable
          columns={getColumns(callback)}
          data={recipes}
          dataCount={recipeCount}
          fetchData={fetchRecipes}
          isLoading={loading}
          callback={callback}
          searchElement="title"
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la recette</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la recette "{selectedRecipe?.title}" ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Annuler</Button>
            <Button variant="destructive" onClick={confirmDelete}>Supprimer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
