
import { useState, useEffect } from "react";
import { BrandInfo, PostPlan } from "@/types";
import { exportToPDF, exportToDOCX } from "@/lib/exportHelpers";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandInfoForm from "@/components/BrandInfoForm";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, LightbulbIcon, FileTextIcon, CheckCircleIcon, RefreshCw, Save } from "lucide-react";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import { useContentPlan } from "@/hooks/useContentPlan";
import { useAuth } from "@/context/AuthContext";
import { SaveContentDialog } from "@/components/SaveContentDialog";

const Index = () => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [posts, setPosts] = useState<PostPlan>([]);
  const [activeTab, setActiveTab] = useState<'ideas' | 'posts' | 'results'>('ideas');
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const { generatePlan, useAI, setUseAI, isGenerating } = useContentPlan();
  const { user } = useAuth();

  const handleFormSubmit = async (formData: BrandInfo) => {
    try {
      const contentPlan = await generatePlan(formData);
      setPosts(contentPlan);
      setBrandInfo(formData);
      setActiveTab('posts');

      toast.success("Up-to-date content plan generated successfully for 2025!");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Error generating content plan:", error);
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

  const handleRegenerateContent = async () => {
    if (!brandInfo) {
      toast.error("No brand information available. Please fill the form first.");
      setActiveTab('ideas');
      return;
    }

    try {
      const contentPlan = await generatePlan(brandInfo);
      setPosts(contentPlan);

      toast.success("Fresh 2025 content plan regenerated successfully!");
    } catch (error) {
      console.error("Error regenerating content plan:", error);
      toast.error("Failed to regenerate content plan. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 relative overflow-hidden bg-gradient-to-br from-[#f8e1eb] via-[#f0f4ff] to-[#e6f7ff]">
        {/* Background dots pattern */}
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute inset-0 bg-[radial-gradient(#FF3B45_1px,transparent_1px)] [background-size:20px_20px]"></div>
        </div>
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#0B2D93_1.5px,transparent_1.5px)] [background-size:30px_30px]"></div>
        </div>
        {!posts.length && (
          <>
            <HeroSection />
            <FeaturesSection />
          </>
        )}

        <section className="py-10 px-4 md:py-16 bg-[#F5F4FF]/30">
          <div className="container max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b overflow-x-auto">
                <button
                  className={`flex items-center gap-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'ideas'
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]'
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => setActiveTab('ideas')}
                >
                  <LightbulbIcon size={16} />
                  Ideas
                </button>
                <button
                  className={`flex items-center gap-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'posts'
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]'
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => posts.length > 0 && setActiveTab('posts')}
                >
                  <FileTextIcon size={16} />
                  Posts
                </button>
                <button
                  className={`flex items-center gap-1 px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium whitespace-nowrap ${
                    activeTab === 'results'
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]'
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => posts.length > 0 && setActiveTab('results')}
                >
                  <CheckCircleIcon size={16} />
                  Results
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-3 sm:p-6">
                {activeTab === 'ideas' && (
                  <div className="max-w-3xl mx-auto relative z-10">
                    <h2 className="text-2xl font-bold text-center bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent mb-6">
                      Generate up-to-date 2025 content for your brand!
                    </h2>

                    <div className="mt-8">
                      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50">
                        <BrandInfoForm
                          onSubmit={handleFormSubmit}
                          isGenerating={isGenerating}
                          useAI={useAI}
                          setUseAI={setUseAI}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'posts' && posts.length > 0 && (
                  <div>
                    <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
                      <div className="text-xs sm:text-sm text-gray-500">
                        {posts.length} posts generated
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user && (
                          <Button
                            onClick={() => setSaveDialogOpen(true)}
                            className="gap-1 sm:gap-2 bg-[#6E5DC6] hover:bg-[#5D4DB3] text-xs sm:text-sm"
                            size="sm"
                          >
                            <Save className="h-3 w-3 sm:h-4 sm:w-4" />
                            Save Plan
                          </Button>
                        )}
                        <Button
                          onClick={handleRegenerateContent}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm"
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
                          Regenerate
                        </Button>
                      </div>
                    </div>

                    <PlatformTabs
                      posts={posts}
                      onEditPost={handleEditPost}
                      onExport={handleExport}
                    />

                    <div className="mt-6 sm:mt-10 text-center">
                      <Button
                        onClick={() => {
                          setPosts([]);
                          setBrandInfo(null);
                          setActiveTab('ideas');
                        }}
                        variant="outline"
                        className="gap-1 sm:gap-2 text-xs sm:text-sm"
                        size="sm"
                      >
                        Generate New Plan
                      </Button>
                    </div>
                  </div>
                )}

                {activeTab === 'results' && posts.length > 0 && (
                  <div className="text-center">
                    <div className="mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-2xl font-bold text-[#6E5DC6] mb-3 sm:mb-4">Content Generation Complete</h2>
                      <p className="text-sm sm:text-base text-gray-600">
                        Your up-to-date 2025 content plan is ready! You can now export it or continue editing.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4">
                      <Button
                        onClick={() => handleExport('all')}
                        className="bg-[#6E5DC6] hover:bg-[#5D4DB3] text-sm"
                        size="sm"
                      >
                        Export All Posts
                      </Button>
                      {user && (
                        <Button
                          onClick={() => setSaveDialogOpen(true)}
                          className="bg-[#6E5DC6] hover:bg-[#5D4DB3] text-sm"
                          size="sm"
                        >
                          <Save className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
                          Save Plan
                        </Button>
                      )}
                      <Button
                        onClick={() => setActiveTab('posts')}
                        variant="outline"
                        className="text-sm"
                        size="sm"
                      >
                        Back to Posts
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Save Dialog */}
      {brandInfo && (
        <SaveContentDialog
          open={saveDialogOpen}
          onOpenChange={setSaveDialogOpen}
          brandInfo={brandInfo}
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

export default Index;
