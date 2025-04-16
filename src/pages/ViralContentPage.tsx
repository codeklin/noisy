import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViralContentForm, { ViralContentFormData } from "@/components/ViralContentForm";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, RefreshCw, Save } from "lucide-react";
import { useContentPlan } from "@/hooks/useContentPlan";
import { useAuth } from "@/context/AuthContext";
import { SaveContentDialog } from "@/components/SaveContentDialog";
import { PostPlan } from "@/types";
import { exportToPDF, exportToDOCX } from "@/lib/exportHelpers";

const ViralContentPage = () => {
  const [posts, setPosts] = useState<PostPlan>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const { generatePlan, useAI, setUseAI, isGenerating } = useContentPlan();
  const { user } = useAuth();

  const handleFormSubmit = async (formData: ViralContentFormData) => {
    try {
      // Create a minimal brand info object for the generator
      const brandInfo = {
        brandName: formData.brandName || "Your Brand",
        businessDescription: formData.targetDescription || "A business targeting " + formData.audience.join(", "),
        targetAudience: formData.audience.join(", "),
        contentThemes: [formData.postType],
        tone: formData.tonePreference,
        specialDays: "",
        ctaExamples: ""
      };

      // Show loading toast with ID for tracking
      const loadingToastId = toast.loading("Generating your viral content plan...");

      console.log("Starting content generation with:", { brandInfo, formData });

      // Generate content plan using the viral content data
      const contentPlan = await generatePlan(brandInfo, formData);

      // Dismiss specific loading toast
      toast.dismiss(loadingToastId);

      console.log("Content plan received:", contentPlan);

      if (contentPlan && contentPlan.length > 0) {
        console.log(`Setting ${contentPlan.length} posts to state`);
        setPosts(contentPlan);
        toast.success("Viral content plan generated successfully!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error("Content plan is empty or invalid", contentPlan);
        throw new Error("No content was generated");
      }
    } catch (error) {
      console.error("Error generating viral content plan:", error);
      toast.dismiss(); // Dismiss any loading toast
      toast.error("Failed to generate content plan. Please try again.");
    }
  };

  const handleEditPost = (postId: string, newContent: string) => {
    const updatedPosts = posts.map(post =>
      post.id === postId ? { ...post, content: newContent } : post
    );

    setPosts(updatedPosts);
    toast.success("Post updated successfully!");
  };

  const handleExport = async (platform: 'facebook' | 'twitter' | 'linkedin' | 'all') => {
    try {
      // Export only to DOCX format
      await exportToDOCX(posts, platform);

      toast.success(`Content plan exported as document successfully!`);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export content plan. Please try again.");
    }
  };

  const handleRegenerateContent = async () => {
    toast.error("Please fill the form again to regenerate content.");
  };

  // Use useEffect to log when posts state changes
  useEffect(() => {
    console.log(`Posts state updated: ${posts.length} posts available`);
  }, [posts]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#f8e1eb] via-[#f0f4ff] to-[#e6f7ff] py-10">
        {/* Background dots pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#FF3B45_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#0B2D93_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
        </div>
        <div className="container max-w-7xl mx-auto px-4">
          <div className="text-center mb-8 relative z-10">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent mb-2">Viral Content Generator</h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Create high-converting, viral content for social media using proven strategies from top creators
            </p>
          </div>

          {posts && posts.length > 0 ? (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50 relative z-10">
              <div className="p-6">
                <div className="mb-4 flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {posts.length} posts generated
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {user && (
                      <Button
                        onClick={() => setSaveDialogOpen(true)}
                        className="gap-2 bg-[#6E5DC6] hover:bg-[#5D4DB3]"
                      >
                        <Save className="h-4 w-4" />
                        Save Content Plan
                      </Button>
                    )}
                    <Button
                      onClick={handleRegenerateContent}
                      className="gap-2"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Generate New Content
                    </Button>
                  </div>
                </div>

                <PlatformTabs
                  posts={posts}
                  onEditPost={handleEditPost}
                  onExport={handleExport}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 lg:col-start-3">
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50 relative z-10">
                  <div className="p-6">
                    <ViralContentForm
                      onSubmit={handleFormSubmit}
                      isGenerating={isGenerating}
                      useAI={useAI}
                      setUseAI={setUseAI}
                    />
                  </div>
                </div>

                <div className="mt-8 text-center relative z-10">
                  <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/50">
                    <Sparkles className="h-5 w-5 mr-2 text-[#FF3B45]" />
                    <span className="bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent font-medium">Fill out the form above to generate viral content</span>
                    <ArrowDown className="h-5 w-5 ml-2 text-[#0B2D93] animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Save Dialog */}
      {posts.length > 0 && (
        <SaveContentDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          brandInfo={{
            brandName: "Viral Content",
            businessDescription: "Generated viral content",
            targetAudience: "Custom audience",
            contentThemes: ["viral"],
            tone: "engaging",
            specialDays: "",
            ctaExamples: ""
          }}
          posts={posts}
          onSaveComplete={(id) => {
            if (id) {
              toast.success("Content plan saved successfully!");
            }
          }}
        />
      )}
    </div>
  );
};

export default ViralContentPage;
