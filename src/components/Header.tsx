
import { Link } from "react-router-dom";
import { Sparkles } from 'lucide-react';
import UserMenu from "./UserMenu";

const Header = () => {
  return (
    <header className="border-b bg-white py-3">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-[#6E5DC6] p-1.5 rounded-md">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-xl text-[#6E5DC6]">
              PostIt
            </span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-[#6E5DC6] text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/saved-plans" className="text-gray-600 hover:text-[#6E5DC6] text-sm font-medium transition-colors">
                Saved Plans
              </Link>
              <Link to="/about" className="text-gray-600 hover:text-[#6E5DC6] text-sm font-medium transition-colors">
                About
              </Link>
            </div>
            
            <UserMenu />
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
