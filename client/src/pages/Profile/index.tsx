import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { axiosConfig } from "@/config/axiosConfig";
import { useAuthContext } from "@/contexts/authContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loading } from "@/components/customs/loading";
import { PostCard } from "@/pages/Home/components/PostCard";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Star, Edit2, UserPlus, Clock, UserCheck, UserMinus, Users } from "lucide-react";
import { toast } from "sonner";
import { Account } from "@/pages/Account";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import { updateAccountSchema } from "@/lib/zod/schemas/account/zod";
import { InputFile } from "@/components/customs/inputFile";
import { FriendsList } from "@/pages/Profile/components/FriendsList";
import { FavoriteRecipes } from "@/pages/Profile/components/FavoriteRecipes";

export const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { authUser } = useAuthContext();
  
  const [profileUser, setProfileUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [openEditProfile, setOpenEditProfile] = useState(false);
  const [openFriendsList, setOpenFriendsList] = useState(false);

  // Friendship state
  const [friendshipStatus, setFriendshipStatus] = useState<any>(null);
  const [friendsCount, setFriendsCount] = useState(0);

  const isOwnProfile = authUser?._id === id;

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // Get user info
        const userRes = await axiosConfig.get(`/users/public/${id}`);
        setProfileUser(userRes.data.user);

        // Get user posts
        const postsRes = await axiosConfig.get(`/posts/user/${id}`);
        setPosts(postsRes.data.posts);

        // Get user recipes
        const recipesRes = await axiosConfig.get(`/recipes/user/${id}`);
        setRecipes(recipesRes.data.recipes);

        // Get friendship status (if not own profile)
        if (!isOwnProfile) {
          try {
            const statusRes = await axiosConfig.get(`/friendships/status/${id}`);
            setFriendshipStatus(statusRes.data);
          } catch {
            setFriendshipStatus({ status: "none" });
          }
        }

        // Get friends count
        try {
          const friendsRes = await axiosConfig.get(`/friendships/friends/${id}`);
          setFriendsCount(friendsRes.data.friends.length);
        } catch {
          setFriendsCount(0);
        }

      } catch (error) {
        toast.error("Impossible de charger le profil");
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [id]);

  // --- Friendship handlers ---
  const handleSendRequest = async () => {
    try {
      const res = await axiosConfig.post(`/friendships/request/${id}`);
      toast.success(res.data.message);
      setFriendshipStatus({ status: "pending", direction: "outgoing", friendship: res.data.friendship });
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de l'envoi");
    }
  };

  const handleAcceptRequest = async () => {
    if (!friendshipStatus?.friendship?._id) return;
    try {
      await axiosConfig.put(`/friendships/accept/${friendshipStatus.friendship._id}`);
      toast.success("Demande acceptée !");
      setFriendshipStatus({ status: "accepted", friendship: friendshipStatus.friendship });
      setFriendsCount((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    }
  };

  const handleRemoveFriend = async () => {
    if (!friendshipStatus?.friendship?._id) return;
    try {
      await axiosConfig.delete(`/friendships/${friendshipStatus.friendship._id}`);
      toast.success("Ami supprimé");
      setFriendshipStatus({ status: "none", friendship: null });
      setFriendsCount((prev) => Math.max(prev - 1, 0));
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur");
    }
  };

  const handlePostDeleted = (deletedId: string) => {
    setPosts(posts.filter((p) => p._id !== deletedId));
  };

  const updateForm = useForm<z.infer<typeof updateAccountSchema>>({
    resolver: zodResolver(updateAccountSchema) as any,
    defaultValues: {
      name: authUser?.name || "",
      forename: authUser?.forename || "",
      username: authUser?.username || "",
      email: authUser?.email || "",
      bio: authUser?.bio || "",
    },
  });

  const onUpdateSubmit: SubmitHandler<z.infer<typeof updateAccountSchema>> = async (values) => {
    try {
      setUpdateLoading(true);
      const response = await axiosConfig.put(`/users/${authUser?._id}`, values);
      toast.success(response.data.message);
      if (typeof setProfileUser === 'function') {
        setProfileUser(response.data.user);
      }
      if ((window as any).__updateAuthUser) {
        (window as any).__updateAuthUser(response.data.user);
      }
      setOpenEditProfile(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur lors de la mise à jour");
    } finally {
      setUpdateLoading(false);
    }
  };

  const updateProfilePic = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdateLoading(true);
    const file = e.target.files?.[0];
    if (!file?.type.includes("image")) {
      toast.error("Type de fichier invalide");
      setUpdateLoading(false);
      return;
    }
    const formData = new FormData();
    formData.append("avatar", file);
    try {
      const response = await axiosConfig.post(`/uploads/avatar/${authUser?._id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(response.data.message);
      setProfileUser(response.data.user);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erreur upload");
    } finally {
      setUpdateLoading(false);
    }
  };

  // --- Friendship button rendering ---
  const renderFriendshipButton = () => {
    if (isOwnProfile) return null;
    const status = friendshipStatus?.status || "none";
    const direction = friendshipStatus?.direction;

    if (status === "none") {
      return (
        <Button onClick={handleSendRequest} className="gap-2">
          <UserPlus size={16} /> Ajouter en ami
        </Button>
      );
    }
    if (status === "pending" && direction === "outgoing") {
      return (
        <Button variant="secondary" disabled className="gap-2">
          <Clock size={16} /> Demande envoyée
        </Button>
      );
    }
    if (status === "pending" && direction === "incoming") {
      return (
        <div className="flex gap-2">
          <Button onClick={handleAcceptRequest} className="gap-2">
            <UserPlus size={16} /> Accepter
          </Button>
          <Button variant="outline" onClick={handleRemoveFriend}>
            Refuser
          </Button>
        </div>
      );
    }
    if (status === "accepted") {
      return (
        <Button variant="outline" onClick={handleRemoveFriend} className="gap-2 text-green-600 hover:text-destructive hover:border-destructive">
          <UserCheck size={16} /> Ami
        </Button>
      );
    }
    return null;
  };

  if (loading) return <Loading />;
  if (!profileUser) return <div className="p-8 text-center">Profil introuvable</div>;

  const tabCount = isOwnProfile ? 4 : 3;

  return (
    <div className="container max-w-4xl p-4 mx-auto md:p-8">
      {/* Header Profile */}
      <div className="flex flex-col items-center gap-6 pb-8 border-b md:flex-row md:items-start md:gap-10">
        <Avatar className="w-32 h-32 md:w-40 md:h-40">
          <AvatarImage src={profileUser.avatar} />
          <AvatarFallback className="text-4xl">{profileUser.username?.charAt(0)}</AvatarFallback>
        </Avatar>

        <div className="flex flex-col items-center flex-1 space-y-4 md:items-start">
          <div className="flex flex-col items-center gap-4 md:flex-row">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{profileUser.username}</h1>
              {isOwnProfile && (
                <Button variant="ghost" size="icon" onClick={() => setOpenEditProfile(true)}>
                  <Edit2 className="w-5 h-5" />
                </Button>
              )}
            </div>
            {renderFriendshipButton()}
          </div>

          <div className="flex gap-6 text-sm">
            <div className="flex flex-col items-center md:flex-row md:gap-1">
              <span className="font-bold">{posts.length}</span> publications
            </div>
            <button
              className="flex flex-col items-center md:flex-row md:gap-1 hover:opacity-75 transition-opacity"
              onClick={() => setOpenFriendsList(true)}
            >
              <span className="font-bold">{friendsCount}</span> amis
            </button>
          </div>

          <div className="text-center md:text-left">
            <p className="font-semibold">{profileUser.name} {profileUser.forename}</p>
            {profileUser.bio && <p className="mt-1 text-sm whitespace-pre-wrap">{profileUser.bio}</p>}
          </div>
        </div>
      </div>

      {/* Tabs for Posts, Recipes, Settings */}
      <Tabs defaultValue="posts" className="w-full mt-8">
        <TabsList className={`grid w-full mb-8 ${isOwnProfile ? "grid-cols-4" : "grid-cols-2"}`}>
          <TabsTrigger value="posts">Publications</TabsTrigger>
          <TabsTrigger value="recipes">Recettes</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="favorites">Favoris</TabsTrigger>}
          {isOwnProfile && <TabsTrigger value="settings">Paramètres</TabsTrigger>}
        </TabsList>
        
        <TabsContent value="posts">
          <div className="max-w-xl mx-auto space-y-6">
            {posts.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">Aucune publication</p>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onPostDeleted={handlePostDeleted} />
              ))
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="recipes">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recipes.length === 0 ? (
              <div className="col-span-full py-8 text-center text-muted-foreground">Aucune recette</div>
            ) : (
              recipes.map((recipe) => (
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
              ))
            )}
          </div>
        </TabsContent>

        {isOwnProfile && (
          <TabsContent value="favorites">
            <FavoriteRecipes />
          </TabsContent>
        )}

        {isOwnProfile && (
          <TabsContent value="settings">
            <div className="w-full">
              <Account />
            </div>
          </TabsContent>
        )}
      </Tabs>

      {/* Friends List Dialog */}
      <FriendsList
        open={openFriendsList}
        onOpenChange={setOpenFriendsList}
        userId={id!}
        isOwnProfile={isOwnProfile}
      />

      {/* Edit Profile Dialog */}
      <Dialog open={openEditProfile} onOpenChange={setOpenEditProfile}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Modifier le profil</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex flex-col items-center gap-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profileUser.avatar} className="object-cover" />
                <AvatarFallback>{profileUser.username?.charAt(0)}</AvatarFallback>
              </Avatar>
              <InputFile buttonText="Changer la photo" id="profile-picture" disabled={updateLoading} onChange={updateProfilePic} />
            </div>

            <Form {...updateForm}>
              <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row">
                  <FormField
                    control={updateForm.control}
                    name="forename"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Prénom</FormLabel>
                        <FormControl><Input placeholder="John" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={updateForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Nom</FormLabel>
                        <FormControl><Input placeholder="Doe" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={updateForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl><Input placeholder="john_doe" {...field} disabled /></FormControl>
                      <p className="text-xs text-muted-foreground">Le nom d'utilisateur ne peut pas être modifié.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl><Input placeholder="john@example.com" {...field} disabled /></FormControl>
                      <p className="text-xs text-muted-foreground">L'adresse email ne peut pas être modifiée.</p>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={updateForm.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl><Textarea placeholder="Parlez un peu de vous..." {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="pt-4 flex justify-end">
                  <Button type="submit" disabled={updateLoading}>
                    {updateLoading ? "Sauvegarde..." : "Enregistrer"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
