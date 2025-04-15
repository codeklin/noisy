
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandInfo, PostPlan } from "@/types";
import { useContentPlan } from "@/hooks/useContentPlan";

interface SaveContentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandInfo: BrandInfo;
  posts: PostPlan;
  onSaveComplete?: (id: string | null) => void;
}

export function SaveContentDialog({ 
  open, 
  onOpenChange, 
  brandInfo, 
  posts,
  onSaveComplete 
}: SaveContentDialogProps) {
  const [planName, setPlanName] = useState<string>("");
  const { savePlan, isSaving } = useContentPlan();

  const handleSave = async () => {
    const id = await savePlan(planName, brandInfo, posts);
    if (onSaveComplete) {
      onSaveComplete(id);
    }
    if (id) {
      onOpenChange(false);
      setPlanName("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Content Plan</DialogTitle>
          <DialogDescription>
            Give your content plan a name so you can easily find it later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="plan-name" className="text-right">
              Name
            </Label>
            <Input
              id="plan-name"
              placeholder="E.g. Q2 Marketing Campaign"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!planName.trim() || isSaving}
          >
            {isSaving ? "Saving..." : "Save Content Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
