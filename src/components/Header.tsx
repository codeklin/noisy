
import { Link } from "react-router-dom";
import { Sparkles, Menu, Zap, ShieldCheck } from 'lucide-react';
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  const { isAdmin } = useAuth();
  return (
    <header className="sticky top-0 z-50 py-3 bg-[#1a1e3a] text-white transition-all duration-300 ease-in-out border-b border-[#2a2e4a]">
      <div className="flex justify-between items-center px-4 sm:px-6 max-w-7xl mx-auto">
        <Link to="/" className="flex items-center gap-2">
          <img src="/plogo.png" alt="Noisy Logo" className="h-9 w-9 rounded-md" />
          <span className="font-bold text-xl">
            <span className="text-white">Noisy</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-4">
            <Link to="/" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Home
            </Link>
            <Link to="/generator" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              <span className="flex items-center">
                <Zap className="h-3 w-3 mr-1 text-[#FF3B45]" />
                Generator
              </span>
            </Link>
            <Link to="/viral-content" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              <span className="flex items-center">
                <Sparkles className="h-3 w-3 mr-1 text-[#FF3B45]" />
                Viral Content
              </span>
            </Link>
            <Link to="/saved-plans" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Saved Plans
            </Link>
            <Link to="/about" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
              Contact
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                <span className="flex items-center">
                  <ShieldCheck className="h-3 w-3 mr-1 text-[#FF3B45]" />
                  Admin
                </span>
              </Link>
            )}
          </div>

          <UserMenu />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-md hover:bg-white/10 transition-colors">
                <Menu className="h-6 w-6 text-white" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <div className="flex flex-col space-y-4 mt-8">
                <Link to="/generator" className="text-gray-800 hover:text-[#FF3B45] text-base font-medium transition-colors py-2">
                  <span className="flex items-center">
                    <Zap className="h-4 w-4 mr-2 text-[#FF3B45]" />
                    Generator
                  </span>
                </Link>
                <Link to="/viral-content" className="text-gray-800 hover:text-[#FF3B45] text-base font-medium transition-colors py-2">
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2 text-[#FF3B45]" />
                    Viral Content
                  </span>
                </Link>
                <Link to="/saved-plans" className="text-gray-800 hover:text-[#0B2D93] text-base font-medium transition-colors py-2">
                  Saved Plans
                </Link>
                <Link to="/about" className="text-gray-800 hover:text-[#0B2D93] text-base font-medium transition-colors py-2">
                  About
                </Link>
                <Link to="/contact" className="text-gray-800 hover:text-[#FF3B45] text-base font-medium transition-colors py-2">
                  Contact
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-800 hover:text-[#FF3B45] text-base font-medium transition-colors py-2">
                    <span className="flex items-center">
                      <ShieldCheck className="h-4 w-4 mr-2 text-[#FF3B45]" />
                      Admin Dashboard
                    </span>
                  </Link>
                )}
                <div className="pt-4 mt-4 border-t">
                  <UserMenu isMobile={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
