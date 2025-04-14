
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
import { ArrowDown, Sparkles } from "lucide-react";
import HeroSection from "@/components/HeroSection";

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
        {!posts.length && (
          <HeroSection />
        )}
        
        <section className="py-10 px-4 md:py-16">
          <div className="container max-w-7xl mx-auto">
            {!posts.length && (
              <div className="max-w-3xl mx-auto mb-12 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
                  Plan Your Social Media Content
                </h2>
                <p className="text-lg text-muted-foreground mb-6">
                  Generate a complete 30-day social media content plan for Facebook, Twitter, and LinkedIn.
                </p>
                
                {hasSavedData && (
                  <div className="mb-10 flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleLoadSavedData}
                      className="gap-2 animate-fade-in"
                      variant="default"
                    >
                      <Sparkles className="h-4 w-4" />
                      Load Saved Content Plan
                    </Button>
                    <Button
                      onClick={handleClearSavedData}
                      className="gap-2 animate-fade-in delay-100"
                      variant="destructive"
                    >
                      Clear Saved Data
                    </Button>
                  </div>
                )}
                
                <div className="mt-12 text-center">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="mx-auto animate-bounce-slow"
                    onClick={() => {
                      document.getElementById('brand-form')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                  >
                    Get Started
                    <ArrowDown className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            
            {posts.length > 0 ? (
              <div className="mb-16 animate-fade-in">
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
                    }}
                    variant="outline"
                    className="gap-2"
                  >
                    Generate New Content Plan
                  </Button>
                </div>
              </div>
            ) : (
              <div id="brand-form" className="max-w-3xl mx-auto bg-card rounded-lg border shadow-lg p-6 md:p-8 animate-fade-in">
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
