
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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const { getContentPlan, updateContentPlan } = useContentPlan();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Detect if user is on mobile device
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(isMobileDevice);

      if (isMobileDevice) {
        console.log("Mobile device detected, applying special handling");
        // Add a small delay for mobile devices to ensure everything is loaded properly
        setTimeout(() => {
          // Force a re-render on mobile devices
          setRetryCount(prev => prev + 1);
        }, 500);
      }
    };

    checkMobile();
  }, []);

  // Effect to handle page visibility changes (especially important for mobile)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('Page became visible, refreshing content plan data');
        // Force a refresh when the page becomes visible again
        if (isMobile) {
          setRetryCount(prev => prev + 1);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isMobile]);

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

      console.log(`Loading content plan with ID: ${id} for user: ${user.id}, retry count: ${retryCount}`);
      setIsLoading(true);
      setLoadError(null);

      try {
        // Add a small delay to ensure any previous operations are complete
        await new Promise(resolve => setTimeout(resolve, 100));

        // For mobile devices, add a slightly longer delay to ensure proper rendering
        if (isMobile) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }

        const plan = await getContentPlan(id);

        if (!plan) {
          console.log(`Content plan with ID ${id} not found`);
          setLoadError("Content plan not found");

          // Only navigate back if this is not a retry attempt
          if (retryCount === 0) {
            toast.error("Content plan not found");
            navigate("/saved-plans");
          }
          return;
        }

        // Validate the plan structure
        if (!plan.posts || !Array.isArray(plan.posts) || plan.posts.length === 0) {
          console.error("Invalid posts data in content plan:", plan.posts);
          setLoadError("The content plan contains invalid data");

          // Only navigate back if this is not a retry attempt
          if (retryCount === 0) {
            toast.error("The content plan contains invalid data. Please try again or contact support.");
            navigate("/saved-plans");
          }
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
        setLoadError(null);
      } catch (error: any) {
        console.error("Error loading content plan:", error);
        setLoadError(error.message || 'Unknown error');

        // Only navigate back if this is not a retry attempt
        if (retryCount === 0) {
          toast.error(`Failed to load content plan: ${error.message || 'Unknown error'}`);
          navigate("/saved-plans");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadContentPlan();
  }, [id, user, navigate, getContentPlan, retryCount]);

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
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#6E5DC6] mx-auto mb-4" />
            <p className="text-gray-600">Loading content plan...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state with retry button
  if (loadError) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
            <div className="text-red-500 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Failed to load content plan</h3>
            <p className="text-gray-600 mb-6">{loadError}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={() => setRetryCount(prev => prev + 1)}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/saved-plans")}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to Saved Plans
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!contentPlan) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
            <h3 className="text-xl font-semibold mb-2">Content plan not found</h3>
            <p className="text-gray-600 mb-6">The content plan you're looking for could not be loaded.</p>
            <Button
              onClick={() => navigate("/saved-plans")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Saved Plans
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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

          <div className={`bg-white rounded-xl shadow-md overflow-hidden p-4 sm:p-6 ${isMobile ? 'mobile-content' : ''}`}>
            {/* Add a refresh button for mobile users */}
            {isMobile && (
              <div className="mb-4 text-right">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast.loading("Refreshing content...");
                    setTimeout(() => {
                      window.location.reload();
                    }, 300);
                  }}
                  className="text-xs"
                >
                  Refresh Content
                </Button>
              </div>
            )}

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
