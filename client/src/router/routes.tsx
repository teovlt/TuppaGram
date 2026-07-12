import { Routes, Route, Navigate } from "react-router-dom";
import { LayoutWrapper } from "./layoutWrapper";
import { ProtectedRoute } from "@/router/protectedRoute";
import { Home } from "@/pages/Home";
import { RecipesIndex } from "@/pages/Recipes/index";
import { RecipeDetail } from "@/pages/Recipes/detail";
import { CreateContentIndex } from "@/pages/Create/index";
import { EditRecipe } from "@/pages/Create/editRecipe";
import { Profile } from "@/pages/Profile/index";
import { Index } from "@/pages/Admin";
import { Logs } from "@/pages/Admin/components/logs";
import { Users } from "@/pages/Admin/components/users";
import { AdminRecipes } from "@/pages/Admin/components/recipes";
import { AdminPosts } from "@/pages/Admin/components/posts";
import { Dashboard } from "@/pages/Admin/components/dashboard";
import { Login } from "@/pages/Authentication/login";
import { Register } from "@/pages/Authentication/register";

import { RegisterGoogleForm } from "@/pages/Authentication/registerGoogleForm";

export const Router = () => {
  return (
    <Routes>
      <Route element={<LayoutWrapper withLayout={false} />}>
        <Route
          path="/login"
          element={
            <ProtectedRoute authRequired={false}>
              <Login />
            </ProtectedRoute>
          }
        />
        <Route
          path="/register"
          element={
            <ProtectedRoute authRequired={false}>
              <Register />
            </ProtectedRoute>
          }
        />

        <Route
          path="/register/google"
          element={
            <ProtectedRoute authRequired={false}>
              <RegisterGoogleForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute authRequired={true} role="admin">
              <Index />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="recipes" element={<AdminRecipes />} />
          <Route path="posts" element={<AdminPosts />} />
          <Route path="logs" element={<Logs />} />

        </Route>
      </Route>

      <Route element={<LayoutWrapper />}>
        <Route
          path="/"
          element={
            <ProtectedRoute authRequired={true}>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute authRequired={true}>
              <RecipesIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute authRequired={true}>
              <RecipeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create"
          element={
            <ProtectedRoute authRequired={true}>
              <CreateContentIndex />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute authRequired={true}>
              <EditRecipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/:id"
          element={
            <ProtectedRoute authRequired={true}>
              <Profile />
            </ProtectedRoute>
          }
        />
      </Route>
    </Routes>
  );
};
