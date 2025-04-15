
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useContentPlan } from "@/hooks/useContentPlan";
import { useAuth } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportToDOCX } from "@/lib/exportHelpers";
import { ArrowLeft, LoaderCircle, Save } from "lucide-react";
import { toast } from "sonner";
import { PostPlan } from "@/types";

export default function ContentPlanPage() {
  const { id } = useParams<{ id: string }>();
  const [posts, setPosts] = useState<PostPlan>([]);
  const [planName, setPlanName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const { getContentPlanById, updateContentPlan, isLoading } = useContentPlan();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
      return;
    }

    if (id) {
      loadContentPlan();
    }
  }, [id, user, authLoading]);

  const loadContentPlan = async () => {
    if (!id) return;
    
    const plan = await getContentPlanById(id);
    if (plan) {
      setPosts(plan.posts);
      setPlanName(plan.name);
    } else {
      navigate("/saved-plans");
    }
  };

  const handleEditPost = (postId: string, newContent: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, content: newContent } : post
    );
    
    setPosts(updatedPosts);
  };

  const handleSaveChanges = async () => {
    if (!id) return;
    
    setIsSaving(true);
    const success = await updateContentPlan(id, posts);
    setIsSaving(false);
    
    if (success) {
      toast.success("Changes saved successfully!");
    }
  };

  const handleExport = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => {
    try {
      // Export to PDF
      await exportToPDF(posts, platform);
      
      // Export to DOCX
      await exportToDOCX(posts, platform);
      
      toast.success(`Content plan exported successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export content plan. Please try again.");
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 py-10 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
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
          <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/saved-plans")}
                className="mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Saved Plans
              </Button>
              <h1 className="text-3xl font-bold text-[#6E5DC6]">{planName}</h1>
            </div>
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving}
              className="flex-shrink-0"
            >
              {isSaving ? (
                <>
                  <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden p-6">
            {posts.length > 0 ? (
              <PlatformTabs 
                posts={posts} 
                onEditPost={handleEditPost} 
                onExport={handleExport} 
              />
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No posts found in this content plan.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
