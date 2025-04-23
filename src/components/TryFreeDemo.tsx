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
  type: "generator" | "viral" | "both";
  className?: string;
};

const TryFreeDemo = ({ type, className = "" }: TryFreeDemoProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { user, isPaidUser, hasUsedGeneratorDemo, hasUsedViralGeneratorDemo, markGeneratorDemoAsUsed, markViralGeneratorDemoAsUsed } = useAuth();
  const navigate = useNavigate();

  // For "both" type, consider demo used if either one is used
  const hasUsedDemo = type === "both"
    ? (hasUsedGeneratorDemo && hasUsedViralGeneratorDemo)
    : (type === "generator" ? hasUsedGeneratorDemo : hasUsedViralGeneratorDemo);

  // Default path and name based on type
  const generatorPath = type === "both"
    ? (hasUsedGeneratorDemo ? "/viral-content" : "/generator")
    : (type === "generator" ? "/generator" : "/viral-content");

  const generatorName = type === "both"
    ? "Free Demo"
    : (type === "generator" ? "Content Generator" : "Viral Content Generator");

  const handleTryDemo = () => {
    if (!user) {
      setDialogOpen(true);
      return;
    }

    if (isPaidUser) {
      navigate(generatorPath);
      return;
    }

    if (type === "both") {
      // For "both" type, check which demo is still available
      if (hasUsedGeneratorDemo && hasUsedViralGeneratorDemo) {
        toast.error(`You've already used your free demos. Please subscribe to continue.`);
        return;
      }

      // Navigate to whichever demo is still available
      if (!hasUsedGeneratorDemo) {
        markGeneratorDemoAsUsed();
        toast.success(`Enjoy your free Content Generator demo!`);
        navigate("/generator");
      } else {
        markViralGeneratorDemoAsUsed();
        toast.success(`Enjoy your free Viral Content Generator demo!`);
        navigate("/viral-content");
      }
      return;
    }

    // Handle single generator types
    if (hasUsedDemo) {
      toast.error(`You've already used your free ${generatorName} demo. Please subscribe to continue.`);
      return;
    }

    // Mark demo as used and navigate to generator
    const markDemoAsUsed = type === "generator" ? markGeneratorDemoAsUsed : markViralGeneratorDemoAsUsed;
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
        aria-label={
          isPaidUser
            ? `Access ${type === "both" ? "content generators" : type === "generator" ? "content generator" : "viral content generator"}`
            : (type === "both" && hasUsedGeneratorDemo && hasUsedViralGeneratorDemo) || (type !== "both" && hasUsedDemo)
              ? "Subscribe to access premium features"
              : `Try free ${type === "both" ? "generators" : type} demo`
        }
      >
        {isPaidUser ? (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            {type === "both" ? "Access Generators" : (type === "generator" ? "Go to Generator" : "Go to Viral Generator")}
          </>
        ) : (type === "both" && hasUsedGeneratorDemo && hasUsedViralGeneratorDemo) ||
           (type !== "both" && hasUsedDemo) ? (
          <>
            <Lock className="h-4 w-4" aria-hidden="true" />
            Subscribe to Access
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" aria-hidden="true" />
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
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              aria-label="Cancel and close dialog"
            >
              Cancel
            </Button>
            <Button
              onClick={handleLoginClick}
              className="gap-2"
              aria-label="Go to login and registration page"
            >
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              Login / Register
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TryFreeDemo;
