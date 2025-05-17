import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { parseJsonObject } from "@/types/supabase";

interface Preferences {
  theme?: string;
  defaultPlatforms?: string[];
  emailNotifications?: boolean;
  socialMediaAccounts?: {
    facebook?: { connected: boolean, username?: string },
    twitter?: { connected: boolean, username?: string },
    linkedin?: { connected: boolean, username?: string }
  };
  [key: string]: unknown;
}

export const useUserPreferences = () => {
  const [preferences, setPreferences] = useState<Preferences>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadPreferences();
    } else {
      setPreferences({});
      setIsLoading(false);
    }
  }, [user]);

  // Define createDefaultPreferences before it's used in loadPreferences
  const createDefaultPreferences = async () => {
    if (!user) return;

    const defaultPreferences = {
      theme: "light",
      defaultPlatforms: ["facebook", "twitter", "linkedin"],
      emailNotifications: true,
      socialMediaAccounts: {
        facebook: { connected: false },
        twitter: { connected: false },
        linkedin: { connected: false }
      }
    };

    try {
      const { error } = await supabase.from("user_preferences").insert({
        user_id: user.id,
        preferences: JSON.stringify(defaultPreferences)
      });

      if (error) throw error;

      setPreferences(defaultPreferences);
    } catch (error) {
      console.error("Error creating default preferences:", error);
    }
  };

  const loadPreferences = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("user_preferences")
        .select("preferences")
        .eq("user_id", user.id)
        .single();

      if (error) {
        if (error.code === "PGRST116") {
          // Record not found, create default preferences
          await createDefaultPreferences();
        } else {
          throw error;
        }
      } else {
        const parsedPreferences = parseJsonObject<Preferences>(data.preferences);
        setPreferences(parsedPreferences);
      }
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user, setIsLoading, setPreferences, createDefaultPreferences]);

  const updatePreferences = async (newPreferences: Partial<Preferences>) => {
    if (!user) {
      toast.error("You must be logged in to update preferences");
      return false;
    }

    setIsSaving(true);

    try {
      // Merge new preferences with existing ones
      const updatedPreferences = { ...preferences, ...newPreferences };

      // Check if preferences record exists
      const { data, error: checkError } = await supabase
        .from("user_preferences")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (checkError && checkError.code === "PGRST116") {
        // Record doesn't exist, create it
        const { error } = await supabase.from("user_preferences").insert({
          user_id: user.id,
          preferences: JSON.stringify(updatedPreferences)
        });

        if (error) throw error;
      } else {
        // Record exists, update it
        const { error } = await supabase
          .from("user_preferences")
          .update({ preferences: JSON.stringify(updatedPreferences) })
          .eq("user_id", user.id);

        if (error) throw error;
      }

      setPreferences(updatedPreferences);
      toast.success("Preferences updated successfully");

      // Track analytics event
      await supabase.from("analytics").insert({
        user_id: user.id,
        event_type: "update_preferences",
        event_data: JSON.stringify({ preferences: newPreferences })
      });

      return true;
    } catch (error) {
      console.error("Error updating preferences:", error);
      toast.error("Failed to update preferences");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    preferences,
    updatePreferences,
    isLoading,
    isSaving
  };
};
