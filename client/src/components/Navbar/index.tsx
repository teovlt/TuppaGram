import { Link, useNavigate } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { NotificationSheet } from "../customs/NotificationSheet";
import { Separator } from "../ui/separator";
import { Home, LogOut, User, Wrench, Utensils, PlusSquare, Compass } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAuthContext } from "@/contexts/authContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useLogout } from "@/hooks/useLogout";
import { AvatarWithStatusCell } from "@/components/customs/avatarStatusCell";

export const Navbar = () => {
  const navigate = useNavigate();
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();

  const mainLinks = [
    { label: "Accueil", path: "/", icon: Home, auth: true },
    { label: "Découvrir", path: "/recipes", icon: Compass, auth: true },
  ];

  const profileLinks = [
    { label: "Mon profil", path: `/user/${authUser?._id}`, icon: User, auth: true },
    { label: "Tableau de bord", path: "/admin/dashboard", icon: Wrench, auth: authUser?.role === "admin" },
  ];

  const mobileNavLinks = authUser ? [
    { label: "Accueil", path: "/", icon: Home },
    { label: "Découvrir", path: "/recipes", icon: Compass },
    { label: "Créer", path: "/create", icon: PlusSquare },
    { label: "Profil", path: `/user/${authUser._id}`, icon: User },
  ] : [
    { label: "Accueil", path: "/", icon: Home },
    { label: "Découvrir", path: "/recipes", icon: Compass },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        {/* Desktop */}
        <div className="hidden select-none md:flex items-center justify-between p-4 px-8 text-accent">
          <div className="text-3xl font-extrabold">
            <Link to="/">Tuppagram</Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {authUser ? (
                <>
                  {mainLinks
                    .filter((link) => link.auth)
                    .map((link) => (
                      <Button key={link.path} onClick={() => navigate(link.path)} variant="ghost" className="font-medium">
                        {link.label}
                      </Button>
                    ))}
                    
                  <Button onClick={() => navigate("/create")} className="gap-2 text-white bg-primary hover:bg-primary/90">
                    <PlusSquare size={18} /> Créer
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild className="hover:cursor-pointer">
                      <span>
                        <AvatarWithStatusCell user={authUser} />
                      </span>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-48" align="end">
                      <DropdownMenuLabel>
                        {authUser.name} {authUser.forename}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        {profileLinks
                          .filter((link) => link.auth)
                          .map((link) => (
                            <DropdownMenuItem
                              key={link.path}
                              className="flex items-center gap-2 hover:cursor-pointer"
                              onClick={() => navigate(link.path)}
                            >
                              <link.icon className="w-4 h-4" />
                              {link.label}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem className="flex items-center gap-2 text-destructive hover:text-destructive hover:cursor-pointer" onClick={() => logout()} disabled={loading}>
                          <LogOut className="w-4 h-4" />
                          Se déconnecter
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <Button onClick={() => navigate("/login")} variant="link">
                  Se connecter
                </Button>
              )}
            </div>
            <Separator orientation="vertical" className="h-8" />
            <div className="flex items-center justify-between gap-2">
              <NotificationSheet />
              <ThemeChanger />
            </div>
          </div>
        </div>

        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <div className="text-2xl font-extrabold text-accent">
            <Link to="/">Tuppagram</Link>
          </div>
          <div className="flex items-center gap-3">
            {authUser ? (
              <>
                <NotificationSheet />
                <ThemeChanger />
                <Button variant="ghost" size="icon" onClick={logout} disabled={loading} className="text-destructive">
                  <LogOut className="w-5 h-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => navigate("/login")} variant="default" size="sm">
                Connexion
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around h-16 border-t md:hidden bg-background pb-safe">
        {mobileNavLinks.map((link) => {
          const isActive = window.location.pathname === link.path;
          return (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full gap-1 transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-primary"
              )}
            >
              <link.icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{link.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
