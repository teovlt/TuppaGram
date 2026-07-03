import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema } from "@/lib/zod/schemas/auth/zod";
import { Form, FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { OAuth } from "./oauth";
import { Link } from "react-router-dom";

type RegisterFormProps = {
  onSubmit: (values: z.infer<any>) => Promise<void>;
  defaultValues?: Partial<z.infer<any>>;
  disabledFields?: string[];
  submitLabel?: string;
  loading?: boolean;
  oauth?: boolean;
};

export const RegisterForm = ({
  onSubmit,
  defaultValues = {},
  disabledFields = [],
  submitLabel,
  loading = false,
  oauth = false,
}: RegisterFormProps) => {
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema) as any,
    defaultValues: {
      name: "",
      forename: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      ...defaultValues,
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 px-2 py-4 md:px-10 md:py-10">
      <div className="flex items-center self-center gap-2 text-2xl font-medium sm:text-4xl text-accent">Tuppagram</div>
      <div className="flex flex-col w-full max-w-2xl gap-6 bg-background p-4 md:p-8 sm:rounded-2xl sm:shadow">
        <div className="text-center">
          <h1 className="text-xl md:text-2xl">{oauth ? "Créer un compte" : "Créer un mot de passe"}</h1>
        </div>
        <div className="flex flex-col items-center gap-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="w-full space-y-4">
              <div className="flex flex-col gap-4 md:flex-row md:items-center">
                {[
                  { name: "forename", label: "Prénom" },
                  { name: "name", label: "Nom" },
                ].map((field) => (
                  <FormField
                    key={field.name}
                    control={form.control}
                    name={field.name as any}
                    render={({ field: f }) => (
                      <FormItem className="w-full">
                        <FormLabel>{field.label}</FormLabel>
                        <FormControl>
                          <Input {...f} disabled={disabledFields.includes(field.name)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {[
                { name: "username", label: "Nom d'utilisateur", desc: "Entrez votre nom d'utilisateur" },
                { name: "email", label: "Email", desc: "Entrez votre email" },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input {...f} disabled={disabledFields.includes(field.name)} />
                      </FormControl>
                      <FormDescription>{field.desc}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              {[
                { name: "password", label: "Mot de passe", desc: "Entrez votre mot de passe" },
                { name: "confirmPassword", label: "Confirmer le mot de passe", desc: "Entrez à nouveau votre mot de passe pour vérification" },
              ].map((field) => (
                <FormField
                  key={field.name}
                  control={form.control}
                  name={field.name as any}
                  render={({ field: f }) => (
                    <FormItem>
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Input type="password" {...f} disabled={disabledFields.includes(field.name)} />
                      </FormControl>
                      <FormDescription>{field.desc}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}

              <Button type="submit" className="w-full" disabled={loading}>
                {submitLabel || "S'inscrire"}
              </Button>

              {import.meta.env.VITE_FIREBASE_API_KEY && oauth && (
                <>
                  <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                    <span className="relative z-10 bg-background px-2 text-muted-foreground">Ou continuer avec</span>
                  </div>
                  <OAuth />
                </>
              )}
            </form>
          </Form>
          {oauth && (
            <div className="text-center text-sm md:text-base">
              Vous avez déjà un compte ?{" "}
              <Link to="/login" className="underline underline-offset-4 text-accent">
                Connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
