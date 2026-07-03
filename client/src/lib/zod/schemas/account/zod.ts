import { z } from "zod";

export const updateAccountSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit comporter au moins 2 caractères." })
    .max(25, { message: "Le nom doit comporter au maximum 25 caractères." }),
  forename: z
    .string()
    .min(2, { message: "Le prénom doit comporter au moins 2 caractères." })
    .max(25, { message: "Le prénom doit comporter au maximum 25 caractères." }),
  username: z
    .string()
    .min(2, { message: "Le nom d'utilisateur doit comporter au moins 2 caractères." })
    .max(25, { message: "Le nom d'utilisateur doit comporter au maximum 25 caractères." })
    .regex(/^[^A-Z\s]+$/, { message: "Le nom d'utilisateur ne doit pas contenir d'espaces ni de lettres majuscules." }),
  email: z.string().email({ message: "Adresse e-mail invalide." }),
  bio: z.string().max(160, { message: "La bio ne peut excéder 160 caractères." }).optional().or(z.literal('')),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(6, { message: "Le mot de passe actuel doit comporter au moins 6 caractères." }),
    newPassword: z
      .string()
      .min(6, { message: "Le nouveau mot de passe doit comporter au moins 6 caractères." })
      .max(25, { message: "Le mot de passe doit comporter au maximum 25 caractères." }),
    newPasswordConfirm: z.string().min(6, { message: "La confirmation du nouveau mot de passe doit comporter au moins 6 caractères." }),
  })
  .refine((data) => data.newPassword === data.newPasswordConfirm, {
    message: "Les mots de passe ne correspondent pas.",
    path: ["newPasswordConfirm"],
  });

export const deleteAccountSchema = z.object({
  checkApproval: z.boolean().refine((val) => val === true, {
    message: "Veuillez cocher la case pour confirmer la suppression de votre compte.",
  }),
  password: z.string().min(6, { message: "Le mot de passe doit comporter au moins 6 caractères." }),
});
