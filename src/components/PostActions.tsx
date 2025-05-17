import { useState } from "react";
import { Post } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Copy,
  Pencil,
  Save,
  Share2,
  Check,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { ShareContent } from "./ShareContent";
import { useAuth } from "@/hooks/useAuth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PostActionsProps {
  post: Post;
  onEdit: () => void;
  onSave?: (name: string) => void;
}

export function PostActions({ post, onEdit, onSave }: PostActionsProps) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [saveName, setSaveName] = useState("");

  const handleCopy = async () => {
    try {
      // Create content with hashtags
      const content = post.content +
        (post.hashtags && post.hashtags.length > 0
          ? "\n\n" + post.hashtags.map(tag => `#${tag}`).join(' ')
          : "");

      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Content copied to clipboard");

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy content:", error);
      toast.error("Failed to copy content to clipboard");
    }
  };

  const handleSaveSubmit = () => {
    if (!saveName.trim()) {
      toast.error("Please enter a name for this content");
      return;
    }

    if (onSave) {
      onSave(saveName);
      setSaveDialogOpen(false);
      setSaveName("");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex items-center gap-1"
        aria-label="Copy content to clipboard"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
        {copied ? "Copied" : "Copy"}
      </Button>

      {user && (
        <>
          <ShareContent post={post} />

          <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                aria-label="Save content to your account"
              >
                <Save className="h-4 w-4" aria-hidden="true" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Content</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="save-name">Content Name</Label>
                <Input
                  id="save-name"
                  value={saveName}
                  onChange={(e) => setSaveName(e.target.value)}
                  placeholder="Enter a name for this content"
                  className="mt-2"
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSaveDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveSubmit}>
                  Save Content
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}

      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        className="flex items-center gap-1"
        aria-label="Edit this content"
      >
        <Pencil className="h-4 w-4" aria-hidden="true" />
        Edit
      </Button>
    </div>
  );
}
