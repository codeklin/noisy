
import { useState, useEffect } from "react";
import { BrandInfo, PostPlan } from "@/types";
import { generateContentPlan } from "@/lib/postGenerator";
import { exportToPDF, exportToDOCX, saveToLocalStorage, loadFromLocalStorage } from "@/lib/exportHelpers";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandInfoForm from "@/components/BrandInfoForm";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, LightbulbIcon, FileTextIcon, CheckCircleIcon } from "lucide-react";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [posts, setPosts] = useState<PostPlan>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'ideas' | 'posts' | 'results'>('ideas');

  useEffect(() => {
    // Check if there's saved data in localStorage
    const savedData = loadFromLocalStorage();
    if (savedData.posts && savedData.brandInfo) {
      setHasSavedData(true);
    }
  }, []);

  const handleFormSubmit = (formData: BrandInfo) => {
    setIsGenerating(true);
    
    // Simulate loading time for content generation
    setTimeout(() => {
      try {
        const contentPlan = generateContentPlan(formData);
        setPosts(contentPlan);
        setBrandInfo(formData);
        setActiveTab('posts');
        
        // Save to localStorage
        saveToLocalStorage(contentPlan, formData);
        
        toast.success("Content plan generated successfully!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch (error) {
        console.error("Error generating content plan:", error);
        toast.error("Failed to generate content plan. Please try again.");
      } finally {
        setIsGenerating(false);
      }
    }, 2000);
  };

  const handleEditPost = (postId: string, newContent: string) => {
    const updatedPosts = posts.map(post => 
      post.id === postId ? { ...post, content: newContent } : post
    );
    
    setPosts(updatedPosts);
    saveToLocalStorage(updatedPosts, brandInfo);
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

  const handleLoadSavedData = () => {
    const savedData = loadFromLocalStorage();
    if (savedData.posts && savedData.brandInfo) {
      setPosts(savedData.posts);
      setBrandInfo(savedData.brandInfo);
      setActiveTab('posts');
      toast.success("Loaded saved content plan!");
    }
  };

  const handleClearSavedData = () => {
    localStorage.removeItem('contentPlan');
    localStorage.removeItem('brandInfo');
    setPosts([]);
    setBrandInfo(null);
    setHasSavedData(false);
    toast.success("Saved data cleared successfully!");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1">
        {!posts.length && (
          <HeroSection />
        )}
        
        <section className="py-10 px-4 md:py-16 bg-[#F5F4FF]/30">
          <div className="container max-w-7xl mx-auto">
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              {/* Tab Navigation */}
              <div className="flex border-b">
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                    activeTab === 'ideas' 
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]' 
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => setActiveTab('ideas')}
                >
                  <LightbulbIcon size={18} />
                  Ideas
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                    activeTab === 'posts' 
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]' 
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => posts.length > 0 && setActiveTab('posts')}
                >
                  <FileTextIcon size={18} />
                  Posts
                </button>
                <button
                  className={`flex items-center gap-2 px-6 py-4 text-sm font-medium ${
                    activeTab === 'results' 
                      ? 'border-b-2 border-[#6E5DC6] text-[#6E5DC6]' 
                      : 'text-gray-500 hover:text-[#6E5DC6] transition-colors'
                  }`}
                  onClick={() => posts.length > 0 && setActiveTab('results')}
                >
                  <CheckCircleIcon size={18} />
                  Results
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'ideas' && (
                  <div className="max-w-3xl mx-auto">
                    <h2 className="text-2xl font-bold text-center text-[#6E5DC6] mb-6">
                      Now let's start generating the next post!
                    </h2>
                    
                    {hasSavedData && (
                      <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center">
                        <Button
                          onClick={handleLoadSavedData}
                          className="gap-2 bg-[#6E5DC6] hover:bg-[#5D4DB3]"
                        >
                          <Sparkles className="h-4 w-4" />
                          Load Saved Content Plan
                        </Button>
                        <Button
                          onClick={handleClearSavedData}
                          className="gap-2"
                          variant="destructive"
                        >
                          Clear Saved Data
                        </Button>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      <BrandInfoForm onSubmit={handleFormSubmit} isGenerating={isGenerating} />
                    </div>
                  </div>
                )}
                
                {activeTab === 'posts' && posts.length > 0 && (
                  <div>
                    <PlatformTabs 
                      posts={posts} 
                      onEditPost={handleEditPost} 
                      onExport={handleExport} 
                    />
                    
                    <div className="mt-10 text-center">
                      <Button
                        onClick={() => {
                          setPosts([]);
                          setBrandInfo(null);
                          setActiveTab('ideas');
                        }}
                        variant="outline"
                        className="gap-2"
                      >
                        Generate New Content Plan
                      </Button>
                    </div>
                  </div>
                )}
                
                {activeTab === 'results' && posts.length > 0 && (
                  <div className="text-center">
                    <div className="mb-8">
                      <h2 className="text-2xl font-bold text-[#6E5DC6] mb-4">Content Generation Complete</h2>
                      <p className="text-gray-600">
                        Your content plan is ready! You can now export it or continue editing.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap justify-center gap-4">
                      <Button 
                        onClick={() => handleExport('all')}
                        className="bg-[#6E5DC6] hover:bg-[#5D4DB3]"
                      >
                        Export All Posts
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('posts')}
                        variant="outline"
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
    </div>
  );
};

export default Index;
