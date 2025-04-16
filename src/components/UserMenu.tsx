
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
import { useNavigate } from "react-router-dom";
import { User, LogOut, FileText, Settings } from "lucide-react";

interface UserMenuProps {
  isMobile?: boolean;
}

export default function UserMenu({ isMobile = false }: UserMenuProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
      <Button onClick={() => navigate("/auth")} variant="outline">
        Login
      </Button>
    );
  }

  // For mobile view, show a simplified menu
  if (isMobile) {
    return (
      <div className="space-y-3">
        <div className="text-sm font-medium text-gray-500">
          Signed in as <span className="font-bold text-[#6E5DC6]">{user.email?.split("@")[0]}</span>
        </div>

        <Button
          onClick={() => navigate("/saved-plans")}
          variant="outline"
          className="w-full justify-start"
        >
          <FileText className="h-4 w-4 mr-2" />
          Saved Plans
        </Button>

        <Button
          onClick={() => navigate("/preferences")}
          variant="outline"
          className="w-full justify-start"
        >
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </Button>

        <Button
          onClick={async () => {
            await signOut();
          }}
          variant="outline"
          className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
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
        <Button variant="outline" className="relative">
          <User className="h-4 w-4 mr-2" />
          <span className="hidden md:inline">{user.email?.split("@")[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/saved-plans")}>
          <FileText className="h-4 w-4 mr-2" />
          Saved Plans
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate("/preferences")}>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
          }}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
