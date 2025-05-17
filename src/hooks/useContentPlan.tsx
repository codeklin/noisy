
import { useState, useRef } from "react";
import { BrandInfo, Post, PostPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { generateContentPlan } from "@/lib/postGenerator";
import { generateAIContentPlan } from "@/lib/llmContentGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { parseJsonArray, parseJsonObject } from "@/types/supabase";
import { Json } from "@/integrations/supabase/types";

// Define the ViralContentData type
export interface ViralContentData {
  audience: string[];
  contentGoal: 'get-followers' | 'generate-leads' | 'book-calls' | 'sell-product';
  copyStyle: 'friendly-expert' | 'bold-challenger' | 'smart-mentor';
  postType: 'storytelling' | 'how-to' | 'mistake-post' | 'listicle' | 'cta-promo';
  tonePreference: 'authoritative' | 'empathetic' | 'witty';
  ageRanges: string[];
  targetDescription: string;
  useNigerianStyle: boolean;
  brandName: string;
}

// Generate a mock content plan when AI generation fails
const generateMockContentPlan = (brandInfo: BrandInfo, viralData?: ViralContentData): PostPlan => {
  console.log('Generating mock content plan as fallback');

  const platforms = ['facebook', 'twitter', 'linkedin'];
  const mockPlan: PostPlan = [];

  // Generate 2 posts for each platform
  platforms.forEach(platform => {
    for (let i = 0; i < 2; i++) {
      mockPlan.push(generateMockPost(platform, brandInfo, viralData));
    }
  });

  return mockPlan;
};

// Generate a single mock post
const generateMockPost = (platform: string, brandInfo: BrandInfo, viralData?: ViralContentData): Post => {
  const brandName = brandInfo.brandName || 'Your Brand';
  const isNigerian = viralData?.useNigerianStyle || false;

  // Generate content based on platform and viral data
  let content = '';
  let hashtags: string[] = [];

  if (platform === 'facebook') {
    content = generateMockFacebookPost(brandName, isNigerian);
    hashtags = ['marketing', 'business', 'success'];
  } else if (platform === 'twitter') {
    content = generateMockTwitterPost(brandName, isNigerian);
    hashtags = ['tips', 'growth', 'strategy'];
  } else if (platform === 'linkedin') {
    content = generateMockLinkedInPost(brandName, isNigerian);
    hashtags = ['professional', 'career', 'networking'];
  }

  return {
    id: uuidv4(),
    platform,
    content,
    hashtags,
    date: new Date().toISOString(),
    theme: viralData?.postType || 'general'
  };
};

// Generate mock Facebook post
const generateMockFacebookPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `Have you been struggling to grow your business in this economy? You're not alone.

At ${brandName}, we've helped hundreds of Nigerian businesses increase their revenue by 30% in just 3 months.

What's the secret? It's not just about working harder - it's about working smarter with the right strategies.

Want to know how we can help your business thrive even in these challenging times? Drop a comment below or send us a message to learn more about our proven system.`;
  } else {
    return `Did you know that 87% of businesses fail within the first 5 years?

At ${brandName}, we're on a mission to change that statistic. We've developed a proven system that has helped our clients increase their revenue by an average of 35% in their first year working with us.

The difference? Strategic planning and execution that's tailored to your specific business needs.

Ready to be part of the successful 13%? Let's talk about how we can help you achieve sustainable growth.`;
  }
};

// Generate mock Twitter post
const generateMockTwitterPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `Stop wasting money on marketing that doesn't work! At ${brandName}, we've helped businesses like yours double their ROI in 90 days. Want to know how?`;
  } else {
    return `The #1 mistake most businesses make is focusing on vanity metrics instead of revenue-generating activities. At ${brandName}, we focus on what actually drives growth.`;
  }
};

// Generate mock LinkedIn post
const generateMockLinkedInPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `I recently worked with a client who was struggling to make sales despite having an excellent product.

The problem? Their messaging wasn't connecting with their target audience.

After implementing our proprietary framework at ${brandName}, they saw a 45% increase in conversions within just 30 days.

Here's what we did differently:

1. We identified the actual pain points of their customers (not what they assumed)
2. We restructured their messaging to address these specific challenges
3. We implemented a follow-up system that nurtures leads effectively

The result? Not just more sales, but higher quality clients who stay longer and spend more.

If you're struggling to convert your audience into paying customers, the problem might not be your product - it might be your messaging.

Would you like to learn more about how we can help your business achieve similar results?`;
  } else {
    return `Three years ago, I was where many of you are now - working 80+ hour weeks and still not seeing the growth I wanted in my business.

Then I discovered a framework that changed everything. It helped me:
• Cut my working hours in half
• Double my revenue
• Build a team that can operate without my constant involvement

Today at ${brandName}, we help entrepreneurs implement this same framework in their businesses.

The key insight? Most business owners focus on tactics when they should be focusing on systems.

Want to learn how to build systems that scale your business while giving you back your time? Let me know in the comments and I'll share our free resource guide.`;
  }
};

export const useContentPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // Reference to track if generation should be cancelled
  const cancelGenerationRef = useRef(false);

  const [useAI, setUseAI] = useState<boolean>(true);

  // Track whether we're using viral content generation
  const [useViralContent, setUseViralContent] = useState<boolean>(false);
  const [viralContentData, setViralContentData] = useState<ViralContentData | null>(null);

  // Store form data for regeneration after window switching
  const [lastBrandInfo, setLastBrandInfo] = useState<BrandInfo | null>(null);
  const [lastViralData, setLastViralData] = useState<ViralContentData | null>(null);

  // Function to cancel ongoing generation
  const cancelGeneration = () => {
    if (isGenerating) {
      cancelGenerationRef.current = true;
      toast.info("Cancelling content generation...");
    }
  };

  const generatePlan = async (brandInfo: BrandInfo, viralData?: ViralContentData): Promise<PostPlan> => {
    // Reset cancellation flag
    cancelGenerationRef.current = false;
    setIsGenerating(true);

    // Save the form data for potential regeneration
    setLastBrandInfo(brandInfo);
    if (viralData) setLastViralData(viralData);

    try {
      // If viral data is provided, update the state
      if (viralData) {
        console.log('Viral content data provided:', viralData);
        setViralContentData(viralData);
        setUseViralContent(true);
      }

      // Track analytics event if user is logged in
      if (user) {
        try {
          await supabase.from("analytics").insert({
            user_id: user.id,
            event_type: "generate_content_plan",
            event_data: {
              brandInfo: JSON.stringify(brandInfo),
              useAI,
              useViralContent: !!viralData,
              viralContentType: viralData?.useNigerianStyle ? 'nigerian' : 'standard'
            }
          });
          console.log('Analytics event tracked successfully');
        } catch (analyticsError) {
          console.error('Failed to track analytics event:', analyticsError);
          // Continue with content generation even if analytics fails
        }
      }

      console.log('Generating content plan with:', {
        useAI,
        useViralContent: !!viralData,
        nigerianStyle: viralData?.useNigerianStyle
      });

      // Generate the content plan using either AI or template-based approach
      let contentPlan: PostPlan;

      // Force useAI to true for viral content generation
      const shouldUseAI = viralData ? true : useAI;

      // Check if generation was cancelled
      if (cancelGenerationRef.current) {
        console.log('Content generation cancelled by user');
        throw new Error('Content generation cancelled');
      }

      if (shouldUseAI) {
        console.log('Using AI-powered content generation');
        // Pass viral content data if available
        contentPlan = await generateAIContentPlan(brandInfo, viralData || viralContentData);
      } else {
        console.log('Using template-based content generation');
        contentPlan = await generateContentPlan(brandInfo);
      }

      // Check again if generation was cancelled
      if (cancelGenerationRef.current) {
        console.log('Content generation cancelled by user after API call');
        throw new Error('Content generation cancelled');
      }

      if (!contentPlan || contentPlan.length === 0) {
        console.error('Content plan generation returned empty results');
        throw new Error('Failed to generate content plan with APIs');
      }

      console.log(`Successfully generated ${contentPlan.length} posts`);
      return contentPlan;
    } catch (error) {
      console.error("Error generating content plan:", error);

      // If generation was cancelled, return empty array
      if (cancelGenerationRef.current || (error instanceof Error && error.message === 'Content generation cancelled')) {
        cancelGenerationRef.current = false;
        return [];
      }

      // Show error toast
      toast.error("Failed to generate content. Please try again later.");

      // Return empty array instead of mock content
      return [];
    } finally {
      setIsGenerating(false);
      cancelGenerationRef.current = false;
    }
  };

  const saveContentPlan = async (name: string, brandInfo: BrandInfo, posts: PostPlan): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to save content plans");
      return null;
    }

    try {
      console.log("Saving content plan with user ID:", user.id);

      const { data, error } = await supabase
        .from("content_plans")
        .insert({
          user_id: user.id,
          name,
          brand_info: JSON.stringify(brandInfo),
          posts: JSON.stringify(posts)
        })
        .select("id")
        .single();

      if (error) {
        console.error("Supabase error saving content plan:", error);
        toast.error(`Failed to save content plan: ${error.message}`);
        throw error;
      }

      console.log("Content plan saved successfully with ID:", data.id);
      return data.id;
    } catch (error) {
      console.error("Error saving content plan:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error saving content plan: ${errorMessage}`);
      return null;
    }
  };

  const getContentPlan = async (id: string): Promise<{ brandInfo: BrandInfo, posts: PostPlan, name: string } | null> => {
    if (!user) {
      toast.error("You must be logged in to view content plans");
      return null;
    }

    try {
      console.log(`Fetching content plan with ID: ${id} for user: ${user.id}`);

      const { data, error } = await supabase
        .from("content_plans")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) {
        console.error("Supabase error getting content plan:", error);
        toast.error(`Failed to load content plan: ${error.message}`);
        throw error;
      }

      if (!data) {
        console.log("No content plan found with ID:", id);
        return null;
      }

      console.log("Content plan retrieved successfully:", data.name);
      console.log("Raw content plan data:", data);

      try {
        // Check if brand_info exists and is valid
        if (!data.brand_info) {
          console.error("Content plan has no brand_info field");
          toast.error("Content plan data is corrupted (missing brand info)");
          return null;
        }

        // Check if posts exists and is valid
        if (!data.posts) {
          console.error("Content plan has no posts field");
          toast.error("Content plan data is corrupted (missing posts)");
          return null;
        }

        const brandInfo = parseJsonObject<BrandInfo>(data.brand_info);
        const posts = parseJsonArray<Post>(data.posts);

        // Validate that we have at least some posts
        if (!Array.isArray(posts) || posts.length === 0) {
          console.error("Content plan has no valid posts");
          toast.error("Content plan contains no valid posts");
          return null;
        }

        // Log the parsed data for debugging
        console.log("Parsed brand info:", brandInfo);
        console.log("Parsed posts:", posts);

        return {
          brandInfo,
          posts,
          name: data.name
        };
      } catch (parseError) {
        console.error("Error parsing content plan data:", parseError);
        toast.error("Error parsing content plan data. The saved content may be corrupted.");
        return null;
      }
    } catch (error) {
      console.error("Error getting content plan:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Error loading content plan: ${errorMessage}`);
      return null;
    }
  };

  const updateContentPlan = async (
    id: string,
    updates: {
      name?: string,
      brandInfo?: BrandInfo,
      posts?: PostPlan
    }
  ): Promise<boolean> => {
    if (!user) {
      toast.error("You must be logged in to update content plans");
      return false;
    }

    try {
      const updateData: Record<string, string> = {};

      if (updates.name) updateData.name = updates.name;
      if (updates.brandInfo) updateData.brand_info = JSON.stringify(updates.brandInfo);
      if (updates.posts) updateData.posts = JSON.stringify(updates.posts);

      const { error } = await supabase
        .from("content_plans")
        .update(updateData)
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error("Error updating content plan:", error);
      return false;
    }
  };

  // Function to regenerate content using saved form data
  const regenerateFromSavedData = async (): Promise<PostPlan | null> => {
    if (lastBrandInfo) {
      return await generatePlan(lastBrandInfo, lastViralData);
    }
    return null;
  };

  return {
    generatePlan,
    saveContentPlan,
    getContentPlan,
    updateContentPlan,
    isGenerating,
    useAI,
    setUseAI,
    useViralContent,
    setUseViralContent,
    viralContentData,
    setViralContentData,
    cancelGeneration,
    regenerateFromSavedData,
    lastBrandInfo,
    lastViralData
  };
};
