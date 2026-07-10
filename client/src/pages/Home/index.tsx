import { useState, useEffect } from "react";
import { axiosConfig } from "@/config/axiosConfig";
import { Loading } from "@/components/customs/loading";
import { PostCard } from "./components/PostCard";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";

export const Home = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      try {
        const res = await axiosConfig.get("/posts/feed");
        setPosts(res.data.posts);
      } catch (error) {
        console.error("Failed to load feed", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeed();
  }, []);

  const handlePostDeleted = (id: string) => {
    setPosts((prev) => prev.filter((p) => p._id !== id));
  };

  if (loading) return <Loading />;

  return (
    <div className="container max-w-xl p-4 mx-auto md:p-8">
      {posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 mt-12 space-y-6 text-center border border-dashed rounded-xl bg-card">
          <h2 className="text-2xl font-bold">Votre fil d'actualité est vide</h2>
          <p className="text-muted-foreground">
            Ajoutez des amis pour voir leur activité ici, ou partagez vos propres créations culinaires.
          </p>
          <Link to="/recipes">
            <Button variant="outline">Découvrir et ajouter des amis</Button>
          </Link>
          <Link to="/create">
            <Button className="gap-2">
              <PlusSquare size={16} /> Créer un post
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
          ))}
        </div>
      )}
    </div>
  );
};
