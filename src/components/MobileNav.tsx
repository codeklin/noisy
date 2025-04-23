import { Link, useLocation } from "react-router-dom";
import { Sparkles, BookMarked, User, Zap, ShieldCheck } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";

const MobileNav = () => {
  const location = useLocation();
  const { user, isAdmin } = useAuth();

  // Scroll to top when location changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Determine if we should show 5 or 6 items in the nav
  const showAdminLink = isAdmin;
  const navItemClass = `flex flex-col items-center justify-center w-full h-full`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t z-50 md:hidden">
      <div className={`flex justify-around items-center h-16 ${showAdminLink ? 'text-xs' : ''}`}>

        <Link
          to="/generator"
          className={`${navItemClass} ${
            isActive("/generator") ? "text-[#FF3B45]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Zap className="h-5 w-5" />
          <span className="text-xs mt-1">Generator</span>
        </Link>

        <Link
          to="/viral-content"
          className={`${navItemClass} ${
            isActive("/viral-content") ? "text-[#FF3B45]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <Sparkles className="h-5 w-5" />
          <span className="text-xs mt-1">Viral</span>
        </Link>

        <Link
          to="/saved-plans"
          className={`${navItemClass} ${
            isActive("/saved-plans") ? "text-[#0B2D93]" : "text-gray-500"
          }`}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <BookMarked className="h-5 w-5" />
          <span className="text-xs mt-1">Saved</span>
        </Link>

        {showAdminLink && (
          <Link
            to="/admin"
            className={`${navItemClass} ${
              isActive("/admin") ? "text-[#FF3B45]" : "text-gray-500"
            }`}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs mt-1">Admin</span>
          </Link>
        )}

        <Link
          to={user ? "/preferences" : "/auth"}
          className={`${navItemClass} ${
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
