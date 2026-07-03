import { z } from "zod";

export const createUserSchema = z.object({
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
  password: z.string().min(1, { message: "Le mot de passe est requis." }),
  role: z.string(),
});

export const updateUserSchema = z.object({
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
  role: z.string(),
  password: z.string().optional(),
});

export const deleteUserSchema = z.object({
  confirmDelete: z
    .string()
    .min(1, { message: "Confirmez la suppression en tapant \"DELETE\"." })
    .transform((val) => val.toUpperCase()),
});
