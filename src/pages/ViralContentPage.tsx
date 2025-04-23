import { useState, useEffect } from "react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViralContentForm, { ViralContentFormData } from "@/components/ViralContentForm";
import PlatformTabs from "@/components/PlatformTabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles, RefreshCw, Save, Lightbulb, ArrowRight, Copy, CheckCircle, AlertCircle, Zap, Flame, TrendingUp, Share2, Trash2, XCircle } from "lucide-react";
import { useContentPlan } from "@/hooks/useContentPlan";
import { useAuth } from "@/context/AuthContext";
import { useAnalytics } from "@/context/AnalyticsContext";
import { SaveContentDialog } from "@/components/SaveContentDialog";
import { PostPlan } from "@/types";
import { exportToPDF, exportToDOCX } from "@/lib/exportHelpers";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const ViralContentPage = () => {
  const analytics = useAnalytics();

  // Load saved state from localStorage if available
  const [posts, setPosts] = useState<PostPlan>(() => {
    const saved = localStorage.getItem('viralGeneratorPosts');
    return saved ? JSON.parse(saved) : [];
  });

  // Store the form data for regeneration
  const [lastFormData, setLastFormData] = useState<ViralContentFormData | null>(() => {
    const saved = localStorage.getItem('viralGeneratorFormData');
    return saved ? JSON.parse(saved) : null;
  });
  const [saveDialogOpen, setSaveDialogOpen] = useState<boolean>(false);
  const { generatePlan, useAI, setUseAI, isGenerating, cancelGeneration, regenerateFromSavedData } = useContentPlan();
  const { user, isPaidUser, hasUsedViralGeneratorDemo, markViralGeneratorDemoAsUsed } = useAuth();

  const handleFormSubmit = async (formData: ViralContentFormData) => {
    // Track form submission start
    const startTime = Date.now();

    // Save the form data for potential regeneration
    setLastFormData(formData);
    if (!user) {
      toast.error("Please login to use the viral content generator.");
      analytics.trackError('auth_required', 'User not logged in for viral content generation');
      return;
    }

    if (!isPaidUser && hasUsedViralGeneratorDemo) {
      toast.error("You've already used your free demo. Please subscribe to continue.");
      analytics.trackError('subscription_required', 'Free demo already used');
      return;
    }

    try {
      // Create a minimal brand info object for the generator
      const brandInfo = {
        brandName: formData.brandName, // No fallback - we validate this in the form
        businessDescription: formData.targetDescription || "A business targeting " + formData.audience.join(", "),
        targetAudience: formData.audience.join(", "),
        contentThemes: [formData.postType],
        tone: formData.tonePreference,
        specialDays: "",
        ctaExamples: "",
        contentLength: formData.contentLength
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

        // Mark demo as used if user is not paid
        if (!isPaidUser && !hasUsedViralGeneratorDemo) {
          markViralGeneratorDemoAsUsed();

          // Track free demo usage
          analytics.trackUserAction('click', 'Used Free Viral Content Demo');
        }

        // Track successful content generation
        analytics.trackContentGeneration(
          'viral_plan',
          formData.postType,
          true,
          Date.now() - startTime,
          {
            audience: formData.audience,
            contentGoal: formData.contentGoal,
            copyStyle: formData.copyStyle,
            tonePreference: formData.tonePreference,
            useNigerianStyle: formData.useNigerianStyle,
            useAI: useAI,
            contentLength: formData.contentLength,
            postCount: contentPlan.length
          }
        );

        toast.success("Viral content plan generated successfully!");
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        console.error("Content plan is empty or invalid", contentPlan);

        // Track empty content plan error
        analytics.trackError('content_generation', 'Empty or invalid content plan', {
          useAI: useAI,
          brandName: formData.brandName
        });

        throw new Error("No content was generated");
      }
    } catch (error) {
      console.error("Error generating viral content plan:", error);
      toast.dismiss(); // Dismiss any loading toast
      toast.error("Failed to generate content plan. Please try again.");

      // Track error
      analytics.trackError('content_generation', 'Failed to generate viral content plan', {
        error: error instanceof Error ? error.message : String(error),
        useAI: useAI,
        brandName: formData.brandName,
        duration: Date.now() - startTime
      });
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

      // Track export action
      analytics.trackUserAction('download', `Exported ${platform} content plan`, {
        platform,
        format: 'docx',
        postCount: posts.filter(p => platform === 'all' || p.platform === platform).length
      });
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export content plan. Please try again.");

      // Track export error
      analytics.trackError('export', 'Failed to export content plan', {
        platform,
        format: 'docx',
        error: error instanceof Error ? error.message : String(error)
      });
    }
  };

  const handleRegenerateContent = async () => {
    if (lastFormData) {
      // If we have saved form data, use it to regenerate content
      await handleFormSubmit(lastFormData);
    } else {
      toast.error("Please fill the form again to regenerate content.");
    }
  };

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem('viralGeneratorPosts', JSON.stringify(posts));
    }
  }, [posts]);

  useEffect(() => {
    if (lastFormData) {
      localStorage.setItem('viralGeneratorFormData', JSON.stringify(lastFormData));
    }
  }, [lastFormData]);

  // Handle window focus/blur events to ensure state persistence
  useEffect(() => {
    // Save state when window loses focus
    const handleBlur = () => {
      console.log('Window lost focus, saving viral generator state...');
      if (posts.length > 0) {
        localStorage.setItem('viralGeneratorPosts', JSON.stringify(posts));
      }
      if (lastFormData) {
        localStorage.setItem('viralGeneratorFormData', JSON.stringify(lastFormData));
      }
    };

    // Restore state when window regains focus
    const handleFocus = async () => {
      console.log('Window regained focus, checking for viral generator state...');
      const savedPosts = localStorage.getItem('viralGeneratorPosts');
      const savedFormData = localStorage.getItem('viralGeneratorFormData');

      // If we're in the middle of generating content, try to recover
      if (isGenerating) {
        console.log('Viral content generation was interrupted, attempting to recover...');
        const newPosts = await regenerateFromSavedData();
        if (newPosts && newPosts.length > 0) {
          setPosts(newPosts);
          toast.success("Content generation recovered successfully!");
        }
        return;
      }

      if (savedPosts && posts.length === 0) {
        setPosts(JSON.parse(savedPosts));
      }

      if (savedFormData && !lastFormData) {
        setLastFormData(JSON.parse(savedFormData));
      }
    };

    // Add event listeners
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, [posts, lastFormData, isGenerating, regenerateFromSavedData]);

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
          <motion.div
            className="text-center mb-8 relative z-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent mb-2">Viral Content Generator</h1>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              Create high-converting, viral content for social media using proven strategies from top creators
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#FF3B45]/10 text-[#FF3B45]">
                <Flame className="h-3 w-3 mr-1" />
                Viral Strategies
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-[#0B2D93]/10 text-[#0B2D93]">
                <TrendingUp className="h-3 w-3 mr-1" />
                High Conversion
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <Share2 className="h-3 w-3 mr-1" />
                Shareable Content
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
              {posts && posts.length > 0 ? (
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
                          Generate New
                        </Button>
                        <Button
                          onClick={() => {
                            localStorage.removeItem('viralGeneratorFormData');
                            localStorage.removeItem('viralGeneratorPosts');
                            setPosts([]);
                            setLastFormData(null);
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
                      onExport={handleExport}
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
                            <p className="text-gray-700">Select your content type and target audience</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0B2D93]/10 flex items-center justify-center text-[#0B2D93] font-semibold">2</div>
                            <p className="text-gray-700">Our AI will generate viral content using proven formulas</p>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#FF3B45]/10 flex items-center justify-center text-[#FF3B45] font-semibold">3</div>
                            <p className="text-gray-700">Review, customize, and export your viral content</p>
                          </li>
                        </ol>
                      </div>

                      <ViralContentForm
                        onSubmit={handleFormSubmit}
                        isGenerating={isGenerating}
                        useAI={useAI}
                        setUseAI={setUseAI}
                      />

                      {isGenerating && (
                        <div className="mt-4 flex justify-center">
                          <Button
                            onClick={cancelGeneration}
                            variant="destructive"
                            className="gap-2"
                          >
                            <XCircle className="h-4 w-4" />
                            Cancel Generation
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-8 text-center relative z-10">
                    <div className="inline-flex items-center bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-white/50">
                      <Sparkles className="h-5 w-5 mr-2 text-[#FF3B45]" />
                      <span className="bg-gradient-to-r from-[#FF3B45] to-[#0B2D93] bg-clip-text text-transparent font-medium">
                        Pro Tip: Be specific about your audience for better results
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
                    <h3 className="text-xl font-bold text-[#0B2D93] mb-6">Viral Content Templates</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Facebook Viral Post */}
                      <Card className="border border-[#FF3B45]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Facebook Viral Post</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-[#FF3B45]"
                                    aria-label="Copy Facebook template"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        "Unpopular opinion: [controversial statement about your industry]\n\n" +
                                        "Most people think [common belief], but here's the truth...\n\n" +
                                        "[3 bullet points of contrarian wisdom]\n\n" +
                                        "I've helped [number] clients achieve [result] by ignoring conventional wisdom.\n\n" +
                                        "Agree or disagree? Drop your thoughts below 👇"
                                      );
                                      toast.success("Facebook template copied to clipboard", {
                                        closeButton: true,
                                        duration: 3000
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>Controversial opinion format</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>Unpopular opinion: [controversial statement about your industry]</p>
                            <p className="mt-2">Most people think [common belief], but here's the truth...</p>
                            <p className="mt-2">[3 bullet points of contrarian wisdom]</p>
                            <p className="mt-2">I've helped [number] clients achieve [result] by ignoring conventional wisdom.</p>
                            <p className="mt-2">Agree or disagree? Drop your thoughts below 👇</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Twitter Viral Thread */}
                      <Card className="border border-[#0B2D93]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Twitter Viral Thread</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-[#0B2D93]"
                                    aria-label="Copy Twitter template"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        "I analyzed [large number] of [content type] to find what actually works in [year].\n\n" +
                                        "Here are the [number] patterns that drive engagement:\n\n" +
                                        "(A thread 🧵)"
                                      );
                                      toast.success("Twitter template copied to clipboard", {
                                        closeButton: true,
                                        duration: 3000
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>The "I analyzed X" format</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>I analyzed [large number] of [content type] to find what actually works in [year].</p>
                            <p className="mt-2">Here are the [number] patterns that drive engagement:</p>
                            <p className="mt-2">(A thread 🧵)</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* LinkedIn Carousel */}
                      <Card className="border border-[#FF3B45]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">LinkedIn Carousel</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-[#FF3B45]"
                                    aria-label="Copy LinkedIn template"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        "I've reviewed [number]+ [type of content/businesses] in the past [timeframe].\n\n" +
                                        "These are the [number] biggest mistakes I see people make:\n\n" +
                                        "[Hint at most surprising mistake]\n\n" +
                                        "Swipe to see all [number] mistakes (and how to fix them) 👉\n\n" +
                                        "[Include relevant hashtags]"
                                      );
                                      toast.success("LinkedIn template copied to clipboard", {
                                        closeButton: true,
                                        duration: 3000
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>The "X mistakes" format</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p>I've reviewed [number]+ [type of content/businesses] in the past [timeframe].</p>
                            <p className="mt-2">These are the [number] biggest mistakes I see people make:</p>
                            <p className="mt-2">[Hint at most surprising mistake]</p>
                            <p className="mt-2">Swipe to see all [number] mistakes (and how to fix them) 👉</p>
                            <p className="mt-2">[Include relevant hashtags]</p>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Instagram Reel Script */}
                      <Card className="border border-[#0B2D93]/20 shadow-sm hover:shadow-md transition-all duration-300">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-center">
                            <CardTitle className="text-base font-medium">Instagram Reel Script</CardTitle>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-gray-500 hover:text-[#0B2D93]"
                                    aria-label="Copy Instagram template"
                                    onClick={() => {
                                      navigator.clipboard.writeText(
                                        "HOOK: POV: You've been doing [common activity] wrong your entire life\n\n" +
                                        "SCRIPT:\n\n" +
                                        "Did you know that [surprising fact]?\n\n" +
                                        "Most people make these 3 mistakes:\n\n" +
                                        "[List 3 quick mistakes with visual demonstrations]\n\n" +
                                        "Here's what to do instead: [quick solution]\n\n" +
                                        "CAPTION: Tag someone who needs to see this! 👀 #[relevant hashtags]"
                                      );
                                      toast.success("Instagram template copied to clipboard", {
                                        closeButton: true,
                                        duration: 3000
                                      });
                                    }}
                                  >
                                    <Copy className="h-4 w-4" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Copy template</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </div>
                          <CardDescription>The "POV" format</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-700">
                            <p><strong>HOOK:</strong> POV: You've been doing [common activity] wrong your entire life</p>
                            <p className="mt-2"><strong>SCRIPT:</strong></p>
                            <p className="mt-2">Did you know that [surprising fact]?</p>
                            <p className="mt-2">Most people make these 3 mistakes:</p>
                            <p className="mt-2">[List 3 quick mistakes with visual demonstrations]</p>
                            <p className="mt-2">Here's what to do instead: [quick solution]</p>
                            <p className="mt-2"><strong>CAPTION:</strong> Tag someone who needs to see this! 👀 #[relevant hashtags]</p>
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
                    <h3 className="text-xl font-bold text-[#0B2D93] mb-6">Viral Content Strategies</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Controversy Technique</h4>
                            <p className="text-gray-600 text-sm">Challenge a widely-held belief in your industry. This creates immediate engagement as people rush to agree or disagree with your position.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Knowledge Gap</h4>
                            <p className="text-gray-600 text-sm">Hint at valuable information without revealing everything upfront. "I discovered the 3 reasons why most businesses fail at X..." creates curiosity that drives engagement.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Contrarian Approach</h4>
                            <p className="text-gray-600 text-sm">Take a stance against conventional wisdom. "Everyone says you need X, but here's why that's completely wrong..." stands out in a crowded feed.</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Data-Backed Claim</h4>
                            <p className="text-gray-600 text-sm">Start with "I analyzed 100+ successful [content type]" to establish authority. People trust and share content backed by data and research.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#FF3B45]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#FF3B45]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Mistake Highlighter</h4>
                            <p className="text-gray-600 text-sm">Point out common mistakes in your industry. "The 5 reasons your [activity] isn't working" appeals to people's desire to avoid errors.</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-full bg-[#0B2D93]/10 flex-shrink-0">
                            <Lightbulb className="h-5 w-5 text-[#0B2D93]" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">The Transformation Story</h4>
                            <p className="text-gray-600 text-sm">Share a dramatic before-and-after story. "How I went from [negative situation] to [positive outcome] in [timeframe]" creates hope and inspiration.</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-[#f8f9fa] rounded-lg border border-gray-100">
                      <h4 className="font-semibold text-[#0B2D93] mb-2 flex items-center gap-2">
                        <ArrowRight className="h-4 w-4" />
                        Platform-Specific Viral Triggers
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-full bg-blue-100 text-blue-600 flex-shrink-0">
                            <span className="text-xs font-bold">FB</span>
                          </div>
                          <p className="text-gray-700 text-sm">Emotional stories, controversial opinions, and relatable content that encourages comments.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-full bg-sky-100 text-sky-600 flex-shrink-0">
                            <span className="text-xs font-bold">TW</span>
                          </div>
                          <p className="text-gray-700 text-sm">Threads with actionable insights, contrarian takes, and data-backed claims.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-full bg-blue-800 text-white flex-shrink-0">
                            <span className="text-xs font-bold">LI</span>
                          </div>
                          <p className="text-gray-700 text-sm">Professional transformation stories, carousels with actionable tips, and industry insights.</p>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className="p-1.5 rounded-full bg-pink-100 text-pink-600 flex-shrink-0">
                            <span className="text-xs font-bold">IG</span>
                          </div>
                          <p className="text-gray-700 text-sm">Visual how-tos, behind-the-scenes content, and quick tips in carousel format.</p>
                        </div>
                      </div>
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
              toast.success("Content plan saved successfully!", {
                closeButton: true,
                duration: 5000
              });
            }
          }}
        />
      )}
    </div>
  );
};

export default ViralContentPage;
