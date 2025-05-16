
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContentPlan } from "@/hooks/useContentPlan";
import { BrandInfo, PostPlan } from "@/types";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import PlatformTabs from "@/components/PlatformTabs";
import { toast } from "sonner";

export default function ContentPlanPage() {
  const { id } = useParams<{ id: string }>();
  const [contentPlan, setContentPlan] = useState<{ name: string; brandInfo: BrandInfo; posts: PostPlan } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { getContentPlan, updateContentPlan } = useContentPlan();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      console.log("No authenticated user, redirecting to auth page");
      navigate("/auth");
      return;
    }

    const loadContentPlan = async () => {
      if (!id) {
        console.log("No content plan ID provided");
        navigate("/saved-plans");
        return;
      }

      console.log(`Loading content plan with ID: ${id} for user: ${user.id}`);
      setIsLoading(true);

      try {
        const plan = await getContentPlan(id);

        if (!plan) {
          console.log(`Content plan with ID ${id} not found`);
          navigate("/saved-plans");
          toast.error("Content plan not found");
          return;
        }

        // Validate the plan structure
        if (!plan.posts || !Array.isArray(plan.posts) || plan.posts.length === 0) {
          console.error("Invalid posts data in content plan:", plan.posts);
          toast.error("The content plan contains invalid data. Please try again or contact support.");
          navigate("/saved-plans");
          return;
        }

        // Validate each post has the required fields
        const invalidPosts = plan.posts.filter(post =>
          !post.id || !post.platform || !post.content || !post.date || !Array.isArray(post.hashtags)
        );

        if (invalidPosts.length > 0) {
          console.error("Some posts have invalid structure:", invalidPosts);
          // Try to fix the posts by adding missing fields with defaults
          const fixedPosts = plan.posts.map(post => ({
            id: post.id || crypto.randomUUID(),
            platform: post.platform || 'facebook',
            content: post.content || 'No content available',
            date: post.date || new Date().toISOString(),
            hashtags: Array.isArray(post.hashtags) ? post.hashtags : []
          }));

          plan.posts = fixedPosts;
          toast.warning("Some content had issues and was automatically fixed");
        }

        console.log(`Successfully loaded content plan: ${plan.name} with ${plan.posts.length} posts`);
        setContentPlan(plan);
      } catch (error: any) {
        console.error("Error loading content plan:", error);
        toast.error(`Failed to load content plan: ${error.message || 'Unknown error'}`);
        navigate("/saved-plans");
      } finally {
        setIsLoading(false);
      }
    };

    loadContentPlan();
  }, [id, user, navigate, getContentPlan]);

  const handleEditPost = async (postId: string, newContent: string) => {
    if (!contentPlan) {
      console.log("Cannot edit post: No content plan loaded");
      return;
    }

    if (!id) {
      console.log("Cannot edit post: No content plan ID");
      return;
    }

    console.log(`Editing post with ID: ${postId}`);

    const updatedPosts = contentPlan.posts.map(post =>
      post.id === postId ? { ...post, content: newContent } : post
    );

    // Update local state immediately for better UX
    setContentPlan({ ...contentPlan, posts: updatedPosts });

    try {
      const success = await updateContentPlan(id, { posts: updatedPosts });

      if (success) {
        console.log("Post updated successfully in database");
        toast.success("Post updated successfully!");
      } else {
        console.error("Failed to update post in database");
        toast.error("Failed to update post");
      }
    } catch (error: any) {
      console.error("Error updating post:", error);
      toast.error(`Failed to update post: ${error.message || 'Unknown error'}`);
    }
  };

  const handleExport = (platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => {
    toast.success(`Content plan exported for ${platform}!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6E5DC6]" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!contentPlan) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <div className="mb-6">
            <Button
              variant="ghost"
              className="mb-4 flex items-center gap-1"
              onClick={() => navigate("/saved-plans")}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Saved Plans
            </Button>
            <h1 className="text-3xl font-bold text-[#6E5DC6]">{contentPlan.name}</h1>
          </div>

          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            <PlatformTabs
              posts={contentPlan.posts}
              onEditPost={handleEditPost}
              onExport={handleExport}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
