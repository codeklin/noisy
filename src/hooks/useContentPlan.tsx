
import { useState } from "react";
import { BrandInfo, PostPlan } from "@/types";
import { generateContentPlan } from "@/lib/postGenerator";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";

export const useContentPlan = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const generatePlan = async (brandInfo: BrandInfo): Promise<PostPlan> => {
    setIsGenerating(true);
    
    try {
      // Track event in analytics
      if (user) {
        await supabase.from("analytics").insert({
          user_id: user.id,
          event_type: "generate_content",
          event_data: { brand_info: brandInfo }
        });
      }
      
      // Generate content plan
      const contentPlan = generateContentPlan(brandInfo);
      
      // Return generated plan
      return contentPlan;
    } catch (error) {
      console.error("Error generating content plan:", error);
      toast.error("Failed to generate content plan. Please try again.");
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const savePlan = async (name: string, brandInfo: BrandInfo, posts: PostPlan) => {
    if (!user) {
      toast.error("You must be logged in to save your content plan");
      navigate("/auth");
      return null;
    }
    
    setIsSaving(true);
    
    try {
      const { data, error } = await supabase.from("content_plans").insert({
        user_id: user.id,
        name,
        brand_info: brandInfo,
        posts
      }).select("id").single();
      
      if (error) throw error;
      
      toast.success("Content plan saved successfully!");
      
      // Track event in analytics
      await supabase.from("analytics").insert({
        user_id: user.id,
        event_type: "save_content_plan",
        event_data: { plan_id: data.id, plan_name: name }
      });
      
      return data.id;
    } catch (error: any) {
      console.error("Error saving content plan:", error);
      toast.error(error.message || "Failed to save content plan");
      return null;
    } finally {
      setIsSaving(false);
    }
  };

  const getUserContentPlans = async () => {
    if (!user) return [];
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("content_plans")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error("Error loading content plans:", error);
      toast.error("Failed to load your content plans");
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const getContentPlanById = async (id: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("content_plans")
        .select("*")
        .eq("id", id)
        .single();
      
      if (error) throw error;
      
      // Track event in analytics
      await supabase.from("analytics").insert({
        user_id: user.id,
        event_type: "view_content_plan",
        event_data: { plan_id: id, plan_name: data.name }
      });
      
      return data;
    } catch (error) {
      console.error("Error loading content plan:", error);
      toast.error("Failed to load content plan");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const updateContentPlan = async (id: string, posts: PostPlan) => {
    if (!user) return false;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("content_plans")
        .update({ posts })
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Content plan updated successfully!");
      
      // Track event in analytics
      await supabase.from("analytics").insert({
        user_id: user.id,
        event_type: "update_content_plan",
        event_data: { plan_id: id }
      });
      
      return true;
    } catch (error) {
      console.error("Error updating content plan:", error);
      toast.error("Failed to update content plan");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const deleteContentPlan = async (id: string) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from("content_plans")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      toast.success("Content plan deleted successfully");
      
      // Track event in analytics
      await supabase.from("analytics").insert({
        user_id: user.id,
        event_type: "delete_content_plan",
        event_data: { plan_id: id }
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting content plan:", error);
      toast.error("Failed to delete content plan");
      return false;
    }
  };

  return {
    generatePlan,
    savePlan,
    getUserContentPlans,
    getContentPlanById,
    updateContentPlan,
    deleteContentPlan,
    isGenerating,
    isSaving,
    isLoading
  };
};
