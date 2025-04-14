
import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 font-bold text-xl">
          <CalendarDays className="h-6 w-6 text-brand-purple" />
          <Link to="/" className="hover:opacity-80 transition-opacity">
            ContentCrafter
          </Link>
        </div>
        <nav className="flex items-center gap-4">
          <Link 
            to="/" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Home
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
