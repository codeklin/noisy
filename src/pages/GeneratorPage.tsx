import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandInfoForm from "@/components/BrandInfoForm";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { BrandInfo, PostPlan } from "@/types";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { Sparkles, RefreshCw, Save, Lightbulb, ArrowRight, Copy, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useContentPlan } from "@/hooks/useContentPlan";
import { SaveContentDialog } from "@/components/SaveContentDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const GeneratorPage = () => {
  // Load saved state from localStorage if available
  const [brandInfo, setBrandInfo] = useState<BrandInfo | null>(() => {
    const saved = localStorage.getItem('generatorBrandInfo');
    return saved ? JSON.parse(saved) : null;
  });

  const [posts, setPosts] = useState<PostPlan>(() => {
    const saved = localStorage.getItem('generatorPosts');
    return saved ? JSON.parse(saved) : [];
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const { generatePlan, useAI, setUseAI, isGenerating } = useContentPlan();
  const { user, isPaidUser, hasUsedGeneratorDemo, markGeneratorDemoAsUsed } = useAuth();

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (brandInfo) {
      localStorage.setItem('generatorBrandInfo', JSON.stringify(brandInfo));
    }
  }, [brandInfo]);

  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('generatorPosts', JSON.stringify(posts));
    }
  }, [posts]);

  const handleFormSubmit = async (formData: BrandInfo) => {
    if (!user) {
      toast.error("Please login to use the content generator.");
      return;
    }

    if (!isPaidUser && hasUsedGeneratorDemo) {
      toast.error("You've already used your free demo. Please subscribe to continue.");
      return;
    }

    try {
      const contentPlan = await generatePlan(formData);
      setPosts(contentPlan);
      setBrandInfo(formData);

      // Mark demo as used if user is not paid
      if (!isPaidUser && !hasUsedGeneratorDemo) {
        markGeneratorDemoAsUsed();
      }

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

  const handleRegenerateContent = async () => {
    if (!brandInfo) {
      toast.error("No brand information available. Please fill the form first.");
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

        <div className="container max-w-7xl mx-auto px-4 py-10">
          <motion.div
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent mb-2">Content Generator</h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Create a month's worth of engaging, viral social media content in minutes
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF3B45]/10 text-[#FF3B45]">
                <Sparkles className="h-3 w-3 mr-1" />
                Viral Strategies
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0B2D93]/10 text-[#0B2D93]">
                <CheckCircle className="h-3 w-3 mr-1" />
                AI-Powered
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <AlertCircle className="h-3 w-3 mr-1" />
                Premium Feature
              </span>
            </div>
          </motion.div>

          <Tabs defaultValue="generator" className="relative z-10">
            <TabsList className="grid w-full max-w-md grid-cols-3 mx-auto mb-8">
              <TabsTrigger value="generator" className="text-sm">
                Generator
              </TabsTrigger>
              <TabsTrigger value="examples" className="text-sm">
                Examples
              </TabsTrigger>
              <TabsTrigger value="tips" className="text-sm">
                Tips & Tricks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-0">
              {posts.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50 relative z-10"
                >
                  <div className="p-6">
                    <div className="mb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0">
                      <div className="text-xs sm:text-sm text-gray-500">
                        {posts.length} posts generated
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {user && (
                          <Button
                            onClick={() => setSaveDialogOpen(true)}
                            className="gap-1 sm:gap-2 bg-[#FF3B45] hover:bg-opacity-90 text-xs sm:text-sm"
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
                        <Button
                          onClick={() => {
                            localStorage.removeItem('generatorBrandInfo');
                            localStorage.removeItem('generatorPosts');
                            setPosts([]);
                            setBrandInfo(null);
                            toast.success("Content cleared successfully!");
                          }}
                          className="gap-1 sm:gap-2 text-xs sm:text-sm"
                          variant="outline"
                          size="sm"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          Clear
                        </Button>
                      </div>
                    </div>

                    <PlatformTabs
                      posts={posts}
                      onEditPost={handleEditPost}
                      onExport={() => {}}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="max-w-3xl mx-auto relative z-10"
                >
                  <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50">
                    <div className="p-6">
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold text-[#0B2D93] mb-2">How It Works</h3>
                        <ol className="space-y-2 mb-6">
                          <li className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF3B45]/10 flex items-center justify-center text-[#FF3B45] font-semibold">1</div>
                            <p className="text-gray-700">Fill in your brand details and content preferences below</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B2D93]/10 flex items-center justify-center text-[#0B2D93] font-semibold">2</div>
                            <p className="text-gray-700">Our AI will generate platform-specific content using viral strategies</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF3B45]/10 flex items-center justify-center text-[#FF3B45] font-semibold">3</div>
                            <p className="text-gray-700">Review, edit, and export your content plan</p>
                          </li>
                        </ol>
                      </div>

                      <BrandInfoForm
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
                      <span className="bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent font-medium">
                        Pro Tip: Be specific about your brand voice for better results
                      </span>
                    </div>
                  </div>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="examples" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto relative z-10"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#0B2D93] mb-6">Sample Content Templates</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Facebook Example */}
                      <Card className="border border-[#FF3B45]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Facebook Post</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#FF3B45]">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>Engagement-focused template</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>🔥 <strong>JUST REVEALED:</strong> The 3 secrets that transformed our [product/service] and helped our customers achieve [specific result]!</p>
                            <p className="mt-2">We've been working behind the scenes on something special, and I'm excited to finally share it with you...</p>
                            <p className="mt-2">[Brief value proposition]</p>
                            <p className="mt-2">👇 Comment "INFO" below if you want to learn how you can [achieve desired outcome]!</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Twitter Example */}
                      <Card className="border border-[#0B2D93]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Twitter Post</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#0B2D93]">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>Viral thread starter</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>I built a [product/service] that [specific result] in just [timeframe].</p>
                            <p className="mt-2">Here's exactly how I did it:</p>
                            <p className="mt-2">(A thread 🧵)</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* LinkedIn Example */}
                      <Card className="border border-[#FF3B45]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">LinkedIn Post</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#FF3B45]">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>Story-based post</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>I made a mistake that cost our company [amount/resource].</p>
                            <p className="mt-2">Here's what happened:</p>
                            <p className="mt-2">[Brief story with conflict]</p>
                            <p className="mt-2">The lesson?</p>
                            <p className="mt-2">[Key insight that provides value]</p>
                            <p className="mt-2">Now we [positive outcome or change].</p>
                            <p className="mt-2">What's a lesson you learned the hard way?</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Instagram Example */}
                      <Card className="border border-[#0B2D93]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Instagram Caption</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-[#0B2D93]">
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>Carousel introduction</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>✨ [Attention-grabbing statement or question]</p>
                            <p className="mt-2">Did you know that [interesting fact related to your industry]?</p>
                            <p className="mt-2">In this carousel, I'm sharing [number] ways to [achieve desired outcome] without [common pain point].</p>
                            <p className="mt-2">Save this post for when you need to [relevant situation]!</p>
                            <p className="mt-2">👉 Swipe to learn more</p>
                            <p className="mt-2">.
                            .
                            .
                            #[hashtag1] #[hashtag2] #[hashtag3]</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="tips" className="mt-0">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto relative z-10"
              >
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden border border-white/50">
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-[#0B2D93] mb-6">Tips for Creating Viral Content</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Start with a Hook</h4>
                            <p className="text-gray-600 text-sm">The first 3-5 words determine if people will read the rest. Make them count with a bold statement, surprising fact, or provocative question.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Use the AIDA Formula</h4>
                            <p className="text-gray-600 text-sm">Attention, Interest, Desire, Action. Start with an attention-grabber, build interest with details, create desire with benefits, and end with a clear call to action.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Tell Stories</h4>
                            <p className="text-gray-600 text-sm">The human brain is wired for stories. Share personal experiences, customer success stories, or case studies to make your content more engaging and memorable.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Create Curiosity Gaps</h4>
                            <p className="text-gray-600 text-sm">Hint at valuable information without revealing everything. This creates a psychological need for closure that drives engagement.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Use Platform-Specific Formats</h4>
                            <p className="text-gray-600 text-sm">Each platform has its own winning formats. Twitter threads, LinkedIn carousels, Instagram reels, and Facebook stories all perform differently.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Evoke Emotions</h4>
                            <p className="text-gray-600 text-sm">Content that triggers high-arousal emotions like awe, excitement, or even controlled controversy spreads faster than neutral content.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-[#f8f9fa] rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-[#0B2D93] mb-2 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Pro Tip: Content Calendar Strategy
                      </h4>
                      <p className="text-gray-700">For maximum engagement, follow the 3-3-3-1 rule: 3 educational posts, 3 engagement posts, 3 promotional posts, and 1 personal/behind-the-scenes post in your content mix.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
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

export default GeneratorPage;
