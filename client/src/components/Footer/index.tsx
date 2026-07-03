import { Link } from "react-router-dom";
import { Instagram, Twitter, Facebook } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="w-full py-8 mt-12 border-t bg-card text-card-foreground">
      <div className="container px-4 mx-auto md:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          
          {/* Brand & Baseline */}
          <div className="flex flex-col items-center md:items-start">
            <h2 className="text-xl font-bold tracking-tight text-accent">Tuppagram</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Le réseau social des passionnés de cuisine maison.
            </p>
          </div>

          {/* Useful Links */}
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
            <Link to="#" className="transition-colors hover:text-accent">À propos</Link>
            <Link to="#" className="transition-colors hover:text-accent">Contact</Link>
            <Link to="#" className="transition-colors hover:text-accent">Mentions légales</Link>
          </div>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Link to="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Instagram size={20} />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Twitter size={20} />
            </Link>
            <Link to="#" className="text-muted-foreground hover:text-accent transition-colors">
              <Facebook size={20} />
            </Link>
          </div>
        </div>
        
        <div className="pt-6 mt-6 text-xs text-center border-t text-muted-foreground">
          &copy; {new Date().getFullYear()} Tuppagram. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};
