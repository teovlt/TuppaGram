import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRecipeForm } from "./components/CreateRecipeForm";
import { CreatePostForm } from "./components/CreatePostForm";

export const CreateContentIndex = () => {
  return (
    <div className="container max-w-2xl p-4 mx-auto md:p-8">
      <h1 className="mb-8 text-3xl font-bold text-center">Créer</h1>

      <Tabs defaultValue="post" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="post">Post Social</TabsTrigger>
          <TabsTrigger value="recipe">Nouvelle Recette</TabsTrigger>
        </TabsList>
        
        <TabsContent value="post">
          <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
            <CreatePostForm />
          </div>
        </TabsContent>
        
        <TabsContent value="recipe">
          <div className="p-6 border rounded-xl bg-card text-card-foreground shadow-sm">
            <CreateRecipeForm />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
