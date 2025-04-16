import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Lock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type TryFreeDemoProps = {
  type: "generator" | "viral";
  className?: string;
};

const TryFreeDemo = ({ type, className = "" }: TryFreeDemoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, isPaidUser, hasUsedGeneratorDemo, hasUsedViralGeneratorDemo, markGeneratorDemoAsUsed, markViralGeneratorDemoAsUsed } = useAuth();
  const navigate = useNavigate();

  const hasUsedDemo = type === "generator" ? hasUsedGeneratorDemo : hasUsedViralGeneratorDemo;
  const markDemoAsUsed = type === "generator" ? markGeneratorDemoAsUsed : markViralGeneratorDemoAsUsed;
  const generatorPath = type === "generator" ? "/generator" : "/viral-content";
  const generatorName = type === "generator" ? "Content Generator" : "Viral Content Generator";

  const handleTryDemo = () => {
    if (!user) {
      setDialogOpen(true);
      return;
    }

    if (isPaidUser) {
      navigate(generatorPath);
      return;
    }

    if (hasUsedDemo) {
      toast.error(`You've already used your free ${generatorName} demo. Please subscribe to continue.`);
      return;
    }

    // Mark demo as used and navigate to generator
    markDemoAsUsed();
    toast.success(`Enjoy your free ${generatorName} demo!`);
    navigate(generatorPath);
  };

  const handleLoginClick = () => {
    setDialogOpen(false);
    navigate("/auth");
  };

  return (
    <>
      <Button 
        onClick={handleTryDemo} 
        className={`gap-2 ${className}`}
        variant={isPaidUser ? "default" : hasUsedDemo ? "outline" : "default"}
      >
        {isPaidUser ? (
          <>
            <Sparkles className="h-4 w-4" />
            {type === "generator" ? "Go to Generator" : "Go to Viral Generator"}
          </>
        ) : hasUsedDemo ? (
          <>
            <Lock className="h-4 w-4" />
            Subscribe to Access
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Try Free Demo
          </>
        )}
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Login Required</DialogTitle>
            <DialogDescription>
              You need to be logged in to try the free demo. Create an account or login to continue.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row sm:justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLoginClick} className="gap-2">
              <Sparkles className="h-4 w-4" />
              Login / Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TryFreeDemo;
