import { axiosConfig } from "@/config/axiosConfig";
import { useState } from "react";
import { toast } from "sonner";
import { getColumns } from "./columns";
import { DataTable } from "@/components/customs/dataTable";
import { Dialog, DialogHeader, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const AdminPosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [postCount, setPostCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);

  async function fetchPosts(page: number = 0, size: number = 10) {
    setLoading(true);
    try {
      const response = await axiosConfig.get(`/posts/admin/all?page=${page}&size=${size}`);
      setPosts(response.data.posts);
      setPostCount(response.data.count);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  function callback(action: string, data: any) {
    if (action === "delete") {
      const post = posts.find((p) => p._id === data);
      setSelectedPost(post);
      setDeleteDialogOpen(true);
    }
  }

  const confirmDelete = async () => {
    if (!selectedPost) return;
    try {
      await axiosConfig.delete(`/posts/${selectedPost._id}`);
      toast.success("Publication supprimée");
      setDeleteDialogOpen(false);
      fetchPosts();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur de suppression");
    }
  };

  return (
    <div>
      <div className="container px-4 mx-auto">
        <DataTable
          columns={getColumns(callback)}
          data={posts}
          dataCount={postCount}
          fetchData={fetchPosts}
          isLoading={loading}
          callback={callback}
          searchElement="content"
        />
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer la publication</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer la publication de "{selectedPost?.author?.username}" ? Cette action est irréversible.
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
