
import { Heart, Calendar, Facebook, Twitter, Linkedin } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-b from-background to-primary/5 border-t pb-16 md:pb-0">
      <div className="container max-w-7xl mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl">
              <img src="/plogo.png" alt="Noisy Logo" className="h-9 w-9 rounded-md" />
              <span className="font-bold text-xl">
                <span className="bg-gradient-to-r from-[#FF3B45] to-[#6E5DC6] bg-clip-text text-transparent">Noisy</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground max-w-xs">
              Create, plan, and export your social media content calendar seamlessly. Get a full month of content in minutes.
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Links</h3>
            <nav className="flex flex-col space-y-2">
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Home
              </Link>
              <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </nav>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground">Follow Us</h3>
            <div className="flex space-x-3">
              <a
                href="#"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5 text-blue-600" />
              </a>
              <a
                href="#"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5 text-sky-400" />
              </a>
              <a
                href="#"
                className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5 text-blue-800" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-sm text-muted-foreground">
            Built with <Heart className="inline-block h-4 w-4 text-[#FF3B45]" /> by Noisy
          </p>
          <p className="text-center text-sm text-muted-foreground">
            © {currentYear} Noisy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
