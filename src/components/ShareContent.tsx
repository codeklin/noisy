
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { Check, Facebook, Linkedin, Share2, Twitter } from "lucide-react";
import { SocialMediaConnection } from "@/types/socialMedia";
import { Post } from "@/types";
import { toast } from "sonner";
import { parseJsonArray } from "@/types/supabase";

export interface ShareContentProps {
  post: Post;
}

export function ShareContent({ post }: ShareContentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const { user } = useAuth();

  const socialConnections: SocialMediaConnection[] = user?.user_metadata?.social_media
    ? parseJsonArray<SocialMediaConnection>(user.user_metadata.social_media)
    : [];

  const connectedAccounts = socialConnections.filter(conn => conn.isConnected);

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleShare = async () => {
    if (selectedPlatforms.length === 0) {
      toast.error("Please select at least one platform to share to", {
        closeButton: true,
        duration: 5000
      });
      return;
    }

    setIsSharing(true);

    try {
      // In a real app, we would send this to a backend API
      // to handle the actual posting to social media platforms

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success message
      toast.success(`Content shared to ${selectedPlatforms.join(", ")}!`, {
        closeButton: true,
        duration: 5000
      });
      setIsOpen(false);
      setSelectedPlatforms([]);
    } catch (error) {
      console.error("Error sharing content:", error);
      toast.error("Failed to share content. Please try again.", {
        closeButton: true,
        duration: 5000
      });
    } finally {
      setIsSharing(false);
    }
  };

  if (connectedAccounts.length === 0) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1"
          aria-label="Share content to social media"
        >
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto custom-scrollbar">
        <DialogHeader>
          <DialogTitle>Share to Social Media</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="border rounded-md p-4">
            <p className="text-sm font-medium mb-2">Post content:</p>
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              <p className="text-sm text-gray-500">{post.content}</p>
              {post.hashtags && post.hashtags.length > 0 && (
                <p className="text-sm text-blue-500 mt-2">
                  {post.hashtags.map(tag => `#${tag}`).join(' ')}
                </p>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">Choose platforms:</p>
            <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar">
              <div className="space-y-2">
                {connectedAccounts.map((account) => (
                <button
                  key={account.platform}
                  type="button"
                  className={`flex items-center p-2 rounded-md cursor-pointer w-full text-left ${
                    selectedPlatforms.includes(account.platform)
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-muted border'
                  }`}
                  onClick={() => togglePlatform(account.platform)}
                  aria-label={`Select ${account.platform} for sharing`}
                  aria-pressed={selectedPlatforms.includes(account.platform)}
                >
                  {account.platform === 'facebook' && <Facebook className="h-5 w-5 mr-2 text-blue-600" />}
                  {account.platform === 'twitter' && <Twitter className="h-5 w-5 mr-2 text-blue-400" />}
                  {account.platform === 'linkedin' && <Linkedin className="h-5 w-5 mr-2 text-blue-700" />}
                  <span className="flex-1 capitalize">{account.platform}</span>
                  {selectedPlatforms.includes(account.platform) && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleShare} disabled={isSharing || selectedPlatforms.length === 0}>
            {isSharing ? "Sharing..." : "Share Now"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
