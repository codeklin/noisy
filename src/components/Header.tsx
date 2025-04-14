
import { useState, useEffect } from "react";
import { CalendarDays, Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2 font-bold text-xl">
            <span className="bg-primary rounded-full p-1.5 text-primary-foreground">
              <CalendarDays className="h-5 w-5" />
            </span>
            <Link 
              to="/" 
              className="bg-gradient-to-r from-primary to-brand-blue bg-clip-text text-transparent hover:opacity-80 transition-all"
            >
              ContentCrafter
            </Link>
          </div>
          
          {isMobile ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle Menu"
                onClick={toggleMobileMenu}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
              
              {/* Mobile menu */}
              {mobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-background border-b border-border animate-fade-in">
                  <nav className="container flex flex-col py-4 space-y-3">
                    <Link 
                      to="/" 
                      className="px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Home
                    </Link>
                    <Link 
                      to="/about" 
                      className="px-4 py-2 text-foreground hover:bg-accent rounded-md transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      About
                    </Link>
                  </nav>
                </div>
              )}
            </>
          ) : (
            <nav className="flex items-center gap-6">
              <Link 
                to="/" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                Home
              </Link>
              <Link 
                to="/about" 
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full"
              >
                About
              </Link>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
