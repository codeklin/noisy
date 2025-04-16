import { Link, useLocation } from "react-router-dom";
import { Home, Sparkles, BookMarked, User, Zap } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const MobileNav = () => {
  const location = useLocation();
  const { user } = useAuth();

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/") ? "text-[#0B2D93]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Home className="h-5 w-5" />
          <span className="text-xs mt-1">Home</span>
        </Link>

        <Link
          to="/generator"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/generator") ? "text-[#FF3B45]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs mt-1">Generator</span>
        </Link>

        <Link
          to="/viral-content"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/viral-content") ? "text-[#FF3B45]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs mt-1">Viral</span>
        </Link>

        <Link
          to="/saved-plans"
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/saved-plans") ? "text-[#0B2D93]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BookMarked className="h-5 w-5" />
          <span className="text-xs mt-1">Saved</span>
        </Link>

        <Link
          to={user ? "/preferences" : "/auth"}
          className={`flex flex-col items-center justify-center w-full h-full ${
            isActive("/preferences") || isActive("/auth") ? "text-[#0B2D93]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <User className="h-5 w-5" />
          <span className="text-xs mt-1">{user ? "Profile" : "Login"}</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNav;
