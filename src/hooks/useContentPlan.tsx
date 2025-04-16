
import { useState } from "react";
import { BrandInfo, Post, PostPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { generateContentPlan } from "@/lib/postGenerator";
import { generateAIContentPlan } from "@/lib/llmContentGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { parseJsonArray, parseJsonObject } from "@/types/supabase";
import { Json } from "@/integrations/supabase/types";

export const useContentPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  const [useAI, setUseAI] = useState<boolean>(true);

  // Track whether we're using viral content generation
  const [useViralContent, setUseViralContent] = useState<boolean>(false);
  const [viralContentData, setViralContentData] = useState<any>(null);

  const generatePlan = async (brandInfo: BrandInfo, viralData?: any): Promise<PostPlan> => {
    setIsGenerating(true);

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
      if (useAI) {
        console.log('Using AI-powered content generation');
        // Pass viral content data if available
        contentPlan = await generateAIContentPlan(brandInfo, viralData || viralContentData);
      } else {
        console.log('Using template-based content generation');
        contentPlan = await generateContentPlan(brandInfo);
      }

      if (!contentPlan || contentPlan.length === 0) {
        console.error('Content plan generation returned empty results');
        throw new Error('Failed to generate content plan');
      }

      console.log(`Successfully generated ${contentPlan.length} posts`);
      return contentPlan;
    } catch (error) {
      console.error("Error generating content plan:", error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const saveContentPlan = async (name: string, brandInfo: BrandInfo, posts: PostPlan): Promise<string | null> => {
    if (!user) {
      toast.error("You must be logged in to save content plans");
      return null;
    }

    try {
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

      if (error) throw error;

      return data.id;
    } catch (error) {
      console.error("Error saving content plan:", error);
      throw error;
    }
  };

  const getContentPlan = async (id: string): Promise<{ brandInfo: BrandInfo, posts: PostPlan, name: string } | null> => {
    if (!user) {
      toast.error("You must be logged in to view content plans");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("content_plans")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (error) throw error;

      if (!data) return null;

      return {
        brandInfo: parseJsonObject<BrandInfo>(data.brand_info),
        posts: parseJsonArray<Post>(data.posts),
        name: data.name
      };
    } catch (error) {
      console.error("Error getting content plan:", error);
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
      const updateData: any = {};

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
    setViralContentData
  };
};
