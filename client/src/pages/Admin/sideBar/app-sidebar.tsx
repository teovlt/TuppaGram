import * as React from "react";
import { Home, NotebookText, Presentation, UsersIcon } from "lucide-react";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, useSidebar } from "@/components/ui/sidebar";
import { useAuthContext } from "@/contexts/authContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ThemeChanger } from "@/components/Navbar/themeChanger";

const adminMenus = {
  navMain: [
    { title: "Tableau de bord", icon: Presentation, url: "/admin/dashboard", isActive: true },
    { title: "Utilisateurs", icon: UsersIcon, url: "/admin/users" },
    { title: "Recettes", icon: NotebookText, url: "/admin/recipes" },
    { title: "Publications", icon: NotebookText, url: "/admin/posts" },
    { title: "Journaux", icon: NotebookText, url: "/admin/logs" },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { authUser } = useAuthContext();
  const navigate = useNavigate();
  const { state } = useSidebar();

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader onClick={() => navigate("/")}>
        <Button variant="outline" className="p-4">
          <Home className="w-6 h-6" />
          {state === "expanded" ? <span>Retour à l'accueil</span> : null}
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={adminMenus.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <ThemeChanger />
        <NavUser user={authUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
