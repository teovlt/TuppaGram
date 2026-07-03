import { Link, useNavigate } from "react-router-dom";
import { ThemeChanger } from "./themeChanger";
import { NotificationSheet } from "../customs/NotificationSheet";
import { Separator } from "../ui/separator";
import { Home, House, LogOut, Menu, User, Wrench, X, Utensils, PlusSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { logout, loading } = useLogout();
  const { authUser } = useAuthContext();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const closeDialogAndNavigate = (link: string) => {
    setIsOpen(false);
    navigate(link);
  };

  const mainLinks = [
    { label: "Accueil", path: "/", icon: Home, auth: true },
    { label: "Recettes", path: "/recipes", icon: Utensils, auth: true },
  ];

  const profileLinks = [
    { label: "Mon profil", path: `/user/${authUser?._id}`, icon: User, auth: true },
    { label: "Tableau de bord", path: "/admin/dashboard", icon: Wrench, auth: authUser?.role === "admin" },
  ];

  const mobileLinks = [
    ...mainLinks,
    { label: "Créer", path: "/create", icon: PlusSquare, auth: true },
    ...profileLinks
  ];

  return (
    <>
      <div className="sticky top-0 left-0 right-0 z-50 border-b bg-background">
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

        {/* Mobile */}
        <div className="flex items-center justify-between p-4 md:hidden">
          <div className="text-3xl font-extrabold text-accent">
            <Link to="/">Tuppagram</Link>
          </div>
          <Menu onClick={() => setIsOpen(!isOpen)} className="cursor-pointer" />
        </div>

        <div
          ref={menuRef}
          className={cn(
            "fixed top-0 right-0 w-4/5 h-screen overflow-hidden bg-background transition-transform duration-300 ease-in-out z-20",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          <div className="flex justify-end">
            <X onClick={() => setIsOpen(!isOpen)} className="m-4 cursor-pointer" />
          </div>
          <div className="flex flex-col gap-4 p-8 pt-2">
            {mobileLinks
              .filter((link) => link.auth === undefined || link.auth)
              .map((link) => (
                <Button
                  key={link.path}
                  onClick={() => closeDialogAndNavigate(link.path)}
                  variant="link"
                  className="flex items-center justify-start gap-4"
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Button>
              ))}
            {authUser && (
              <>
                <Separator />
                <Button onClick={() => logout()} variant="link" disabled={loading} className="flex items-center justify-start gap-4">
                  <LogOut className="w-4 h-4" />
                  Se déconnecter
                </Button>
              </>
            )}
            <Separator />
            <div className="flex items-center justify-center gap-4">
              <NotificationSheet />
              <ThemeChanger />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
