
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { User, LogOut, FileText, Settings } from "lucide-react";

interface UserMenuProps {
  isMobile?: boolean;
}

export default function UserMenu({ isMobile = false }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  // Helper function to get user initials
  const getUserInitials = () => {
    if (!user || !user.email) return "";
    const username = user.email.split("@")[0] || "";
    // Get first letter and first letter after any non-letter character
    const initials = username.match(/\b\w/g) || [];
    return initials.slice(0, 2).join("").toUpperCase();
  };

  if (!user) {
    if (isMobile) {
      return (
        <Button
          onClick={() => navigate("/auth")}
          variant="outline"
          className="w-full justify-start"
        >
          <User className="h-4 w-4 mr-2" />
          Login / Register
        </Button>
      );
    }

    return (
      <Button onClick={() => navigate("/auth")} className="bg-[#4CAF50] hover:bg-[#45a049] text-white border-0">
        Login
      </Button>
    );
  }

  // For mobile view, show a simplified menu
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-2">
          <Avatar className="h-8 w-8 border-2 border-white">
            <AvatarFallback className="bg-[#FF6B6B] text-white text-xs font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="text-sm font-medium text-gray-500">
            Signed in as <span className="font-bold text-[#FF6B6B]">{user.email?.split("@")[0]}</span>
          </div>
        </div>

        <Button
          onClick={() => navigate("/saved-plans")}
          variant="outline"
          className="w-full justify-start text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10"
        >
          <FileText className="h-4 w-4 mr-2" />
          Saved Plans
        </Button>

        <Button
          onClick={() => navigate("/preferences")}
          variant="outline"
          className="w-full justify-start text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/10"
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>

        <Button
          onClick={async () => {
            await signOut();
          }}
          variant="outline"
          className="w-full justify-start bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/30 hover:bg-[#FF6B6B]/20"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    );
  }

  // For desktop view, show dropdown menu
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="relative border-[#FF6B6B] bg-[#FF6B6B] text-white hover:bg-[#FF5252] hover:border-[#FF5252] p-0 overflow-hidden">
          <Avatar className="h-9 w-9 border-2 border-white">
            <AvatarFallback className="bg-[#FF6B6B] text-white font-medium">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden md:inline ml-2 mr-2">{user.email?.split("@")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel className="text-[#FF6B6B] font-medium">My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/saved-plans")} className="text-[#1a1e3a] hover:text-[#FF6B6B] focus:text-[#FF6B6B] focus:bg-[#FF6B6B]/10">
          <FileText className="h-4 w-4 mr-2 text-[#FF6B6B]" />
          Saved Plans
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/preferences")} className="text-[#1a1e3a] hover:text-[#FF6B6B] focus:text-[#FF6B6B] focus:bg-[#FF6B6B]/10">
          <Settings className="h-4 w-4 mr-2 text-[#FF6B6B]" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
          }}
          className="text-[#FF6B6B] hover:bg-[#FF6B6B]/10 focus:bg-[#FF6B6B]/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
