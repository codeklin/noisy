
import { Link } from "react-router-dom";
import { Sparkles, Menu } from 'lucide-react';
import { useState } from "react";
import UserMenu from "./UserMenu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Header = () => {
  return (
    <header className="border-b bg-white py-3">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo-icon.svg" alt="Postit Logo" className="h-9 w-9" />
            <span className="font-bold text-xl">
              <span className="text-[#6E5DC6]">Post</span>
              <span className="text-[#ea384c]">it</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-[#6E5DC6] text-sm font-medium transition-colors">
                Home
              </Link>
              <Link to="/viral-content" className="text-gray-600 hover:text-[#6E5DC6] text-sm font-medium transition-colors">
                <span className="flex items-center">
                  <Sparkles className="h-3 w-3 mr-1 text-[#ea384c]" />
                  Viral Content
                </span>
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-gray-100 transition-colors">
                  <Menu className="h-6 w-6 text-gray-600" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[250px] sm:w-[300px]">
                <div className="flex flex-col space-y-4 mt-8">
                  <Link to="/viral-content" className="text-gray-600 hover:text-[#6E5DC6] text-base font-medium transition-colors py-2">
                    <span className="flex items-center">
                      <Sparkles className="h-4 w-4 mr-2 text-[#ea384c]" />
                      Viral Content
                    </span>
                  </Link>
                  <Link to="/saved-plans" className="text-gray-600 hover:text-[#6E5DC6] text-base font-medium transition-colors py-2">
                    Saved Plans
                  </Link>
                  <Link to="/about" className="text-gray-600 hover:text-[#6E5DC6] text-base font-medium transition-colors py-2">
                    About
                  </Link>
                  <div className="pt-4 mt-4 border-t">
                    <UserMenu isMobile={true} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
