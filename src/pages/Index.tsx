
import { useState, useEffect } from "react";
import { BrandInfo, PostPlan } from "@/types";
import { generateContentPlan } from "@/lib/postGenerator";
import { exportToPDF, exportToDOCX, saveToLocalStorage, loadFromLocalStorage } from "@/lib/exportHelpers";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandInfoForm from "@/components/BrandInfoForm";
import PlatformTabs from "@/components/PlatformTabs";

const Index = () => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(null);
  const [posts, setPosts] = useState<PostPlan>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [hasSavedData, setHasSavedData] = useState<boolean>(false);

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
        <section className="py-10 px-4 md:py-16">
          <div className="container">
            <div className="max-w-3xl mx-auto mb-10 text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-brand-purple to-brand-blue bg-clip-text text-transparent">
                Social Media Content Planner
              </h1>
              <p className="text-xl text-muted-foreground mb-6">
                Generate a complete 30-day social media content plan for Facebook, Twitter, and LinkedIn.
              </p>
              
              {hasSavedData && !posts.length && (
                <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={handleLoadSavedData}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-primary text-primary-foreground shadow hover:bg-primary/90 h-9 px-4 py-2"
                  >
                    Load Saved Content Plan
                  </button>
                  <button
                    onClick={handleClearSavedData}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring bg-destructive text-destructive-foreground shadow hover:bg-destructive/90 h-9 px-4 py-2"
                  >
                    Clear Saved Data
                  </button>
                </div>
              )}
            </div>
            
            {posts.length > 0 ? (
              <div className="mb-16">
                <PlatformTabs 
                  posts={posts} 
                  onEditPost={handleEditPost} 
                  onExport={handleExport} 
                />
                
                <div className="mt-10 text-center">
                  <button
                    onClick={() => {
                      setPosts([]);
                      setBrandInfo(null);
                    }}
                    className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2"
                  >
                    Generate New Content Plan
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <BrandInfoForm onSubmit={handleFormSubmit} isGenerating={isGenerating} />
              </div>
            )}
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
