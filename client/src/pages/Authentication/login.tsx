import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { loginSchema } from "@/lib/zod/schemas/auth/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuthContext } from "@/contexts/authContext";
import { axiosConfig } from "@/config/axiosConfig";
import { toast } from "sonner";
import { useState } from "react";
import { OAuth } from "@/components/customs/oauth";

export const Login = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { setAuthUser } = useAuthContext();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: {
      loginName: "",
      password: "",
    },
  });

  async function login(values: z.infer<typeof loginSchema>) {
    try {
      setLoading(true);

      const isEmail = /\S+@\S+\.\S+/.test(values.loginName);
      const payload = {
        password: values.password,
        ...(isEmail ? { email: values.loginName } : { username: values.loginName }),
      };
      const response = await axiosConfig.post("/auth/login", payload);

      toast.success(response.data.message);
      setAuthUser(response.data.user);
      localStorage.setItem("accessToken", response.data.accessToken);
      navigate("/");
    } catch (error: any) {
      toast.error(error.response.data.error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-2 py-4 md:px-10 md:py-10">
      <div className="flex items-center self-center gap-2 text-3xl font-medium sm:text-4xl text-accent">Tuppagram</div>
      <div className="flex flex-col w-full max-w-md gap-6 bg-background p-4 md:p-8 lg:rounded-2xl lg:shadow">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl font-semibold">Content de vous revoir</h1>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(login)} className="w-full space-y-4">
              <FormField
                control={loginForm.control}
                name="loginName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom d'utilisateur ou email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormDescription>Entrez votre nom d'utilisateur ou email</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mot de passe</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormDescription>Entrez votre mot de passe</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full" disabled={loading}>
                Connexion
              </Button>

              {import.meta.env.VITE_FIREBASE_API_KEY && (
                <>
                  <div className="relative text-sm text-center after:border-border after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                    <span className="relative z-10 px-2 bg-background text-muted-foreground">Ou continuer avec</span>
                  </div>
                  <OAuth />
                </>
              )}
            </form>
          </Form>

          <div className="text-sm text-center md:text-base">
            Vous n'avez pas de compte ?{" "}
            <Link to="/register" className="underline underline-offset-4 text-accent">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
