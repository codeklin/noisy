import { supabase } from "@/lib/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import { toast } from "sonner";

/**
 * Admin service for managing users, subscriptions, and analytics
 * This service should only be used by admin users
 */

// Define a type for event details
export interface EventDetails {
  [key: string]: unknown;
}

// Helper function to safely serialize details for storage
const safeSerializeDetails = (details: EventDetails | null | undefined): Record<string, unknown> => {
  if (!details) return null;

  try {
    // Try to create a safe copy of the details by removing circular references
    const safeDetails: Record<string, unknown> = {};

    // Only include primitive values and simple objects
    Object.keys(details).forEach(key => {
      const value = details[key];
      const type = typeof value;

      if (value === null || value === undefined) {
        safeDetails[key] = value;
      } else if (type === 'string' || type === 'number' || type === 'boolean') {
        safeDetails[key] = value;
      } else if (type === 'object') {
        // For objects, try to stringify and parse to remove functions and circular refs
        try {
          safeDetails[key] = JSON.parse(JSON.stringify(value));
        } catch (e) {
          // If that fails, store a simple representation
          safeDetails[key] = `[Object: ${Array.isArray(value) ? 'Array' : value.constructor.name}]`;
        }
      } else {
        // For functions or other types, store the type name
        safeDetails[key] = `[${type}]`;
      }
    });

    return safeDetails;
  } catch (e) {
    console.warn('Failed to serialize details for analytics:', e);
    return { error: 'Failed to serialize details' };
  }
};

// Types
export interface AdminUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  is_subscribed: boolean;
  has_used_generator_demo: boolean;
  has_used_viral_generator_demo: boolean;
  is_admin: boolean;
}

export interface SubscriptionStats {
  totalUsers: number;
  paidUsers: number;
  conversionRate: number;
  totalRevenue: number;
  recentSubscriptions: {
    id: string;
    email: string;
    subscribed_at: string;
    amount: number;
  }[];
}

export interface ActivityEvent {
  id: string;
  user_id: string;
  user_email: string;
  event_type: string;
  event_name: string;
  details: EventDetails | null;
  created_at: string;
}

export interface AnalyticsData {
  pageViews: {
    page: string;
    count: number;
  }[];
  contentGeneration: {
    type: string;
    count: number;
    success_rate: number;
  }[];
  userActions: {
    action: string;
    count: number;
  }[];
  errors: {
    type: string;
    count: number;
  }[];
  userGrowth: {
    date: string;
    count: number;
  }[];
}

// Check if user is admin
export const checkAdminStatus = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error) throw error;

    return data?.is_admin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};

// Get all users
export const getUsers = async (): Promise<AdminUser[]> => {
  try {
    // Fetch user profiles from the profiles table with their auth data
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("*, users:auth.users(id, email, created_at, last_sign_in_at)");

    if (profilesError) {
      throw profilesError;
    }

    // Format the user data
    const combinedUsers = profiles.map((profile) => {
      const authUser = profile.users || {};
      return {
        id: profile.id,
        email: authUser.email || "No email",
        created_at: authUser.created_at
          ? new Date(authUser.created_at).toLocaleString()
          : new Date().toLocaleString(),
        last_sign_in_at: authUser.last_sign_in_at
          ? new Date(authUser.last_sign_in_at).toLocaleString()
          : null,
        is_subscribed: profile.is_subscribed || false,
        has_used_generator_demo: profile.has_used_generator_demo || false,
        has_used_viral_generator_demo: profile.has_used_viral_generator_demo || false,
        is_admin: profile.is_admin || false,
      };
    });

    return combinedUsers;
  } catch (error) {
    console.error("Error fetching users:", error);
    toast.error("Failed to fetch users");
    return [];
  }
};

// Update user subscription status
export const updateUserSubscription = async (userId: string, isSubscribed: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_subscribed: isSubscribed })
      .eq("id", userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    toast.error("Failed to update user subscription");
    return false;
  }
};

// Update user admin status
export const updateUserAdminStatus = async (userId: string, isAdmin: boolean): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({ is_admin: isAdmin })
      .eq("id", userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error("Error updating admin status:", error);
    toast.error("Failed to update admin status");
    return false;
  }
};

// Get subscription statistics
export const getSubscriptionStats = async (timeframe: string = "all"): Promise<SubscriptionStats> => {
  try {
    // Fetch total users count
    const { count: totalUsers, error: usersError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (usersError) throw usersError;

    // Fetch paid users count
    const { count: paidUsers, error: paidError } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("is_subscribed", true);

    if (paidError) throw paidError;

    // Fetch payments data
    let query = supabase
      .from("payments")
      .select("id, user_id, amount, created_at, profiles(email)")
      .order("created_at", { ascending: false });

    // Apply timeframe filter
    if (timeframe !== "all") {
      const now = new Date();
      const startDate = new Date();

      if (timeframe === "day") {
        startDate.setDate(now.getDate() - 1);
      } else if (timeframe === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "month") {
        startDate.setMonth(now.getMonth() - 1);
      }

      query = query.gte("created_at", startDate.toISOString());
    }

    const { data: payments, error: paymentsError } = await query.limit(10);

    if (paymentsError) throw paymentsError;

    // Calculate total revenue
    const { data: allPayments, error: allPaymentsError } = await supabase
      .from("payments")
      .select("amount");

    if (allPaymentsError) throw allPaymentsError;

    const totalRevenue = allPayments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

    // Format recent subscriptions
    const recentSubscriptions = payments.map((payment) => ({
      id: payment.id,
      email: payment.profiles?.email || "Unknown",
      subscribed_at: new Date(payment.created_at).toLocaleString(),
      amount: payment.amount || 0,
    }));

    // Calculate conversion rate
    const conversionRate = totalUsers ? (paidUsers / totalUsers) * 100 : 0;

    return {
      totalUsers: totalUsers || 0,
      paidUsers: paidUsers || 0,
      conversionRate,
      totalRevenue,
      recentSubscriptions,
    };
  } catch (error) {
    console.error("Error fetching subscription stats:", error);
    toast.error("Failed to fetch subscription statistics");
    return {
      totalUsers: 0,
      paidUsers: 0,
      conversionRate: 0,
      totalRevenue: 0,
      recentSubscriptions: [],
    };
  }
};

// Get activity logs
export const getActivityLogs = async (
  timeframe: string = "all",
  eventType: string = "all"
): Promise<ActivityEvent[]> => {
  try {
    // Build the query
    let query = supabase
      .from("activity_logs")
      .select("*, profiles(email)")
      .order("created_at", { ascending: false });

    // Apply timeframe filter
    if (timeframe !== "all") {
      const now = new Date();
      const startDate = new Date();

      if (timeframe === "day") {
        startDate.setDate(now.getDate() - 1);
      } else if (timeframe === "week") {
        startDate.setDate(now.getDate() - 7);
      } else if (timeframe === "month") {
        startDate.setMonth(now.getMonth() - 1);
      }

      query = query.gte("created_at", startDate.toISOString());
    }

    // Apply event type filter if not "all"
    if (eventType !== "all") {
      query = query.eq("event_type", eventType);
    }

    const { data, error } = await query.limit(100);

    if (error) throw error;

    // Format the activities
    const formattedActivities = data.map((activity) => ({
      id: activity.id,
      user_id: activity.user_id,
      user_email: activity.profiles?.email || "Unknown",
      event_type: activity.event_type,
      event_name: activity.event_name,
      details: activity.details,
      created_at: new Date(activity.created_at).toLocaleString(),
    }));

    return formattedActivities;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    toast.error("Failed to fetch activity logs");
    return [];
  }
};

// Get analytics data
export const getAnalyticsData = async (timeframe: string = "month"): Promise<AnalyticsData> => {
  try {
    // Define the time range based on the selected timeframe
    const now = new Date();
    const startDate = new Date();

    if (timeframe === "day") {
      startDate.setDate(now.getDate() - 1);
    } else if (timeframe === "week") {
      startDate.setDate(now.getDate() - 7);
    } else if (timeframe === "month") {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      // For "all", go back 6 months by default for charts
      startDate.setMonth(now.getMonth() - 6);
    }

    const startDateStr = startDate.toISOString();

    // Fetch page views
    const { data: pageViewsData, error: pageViewsError } = await supabase
      .from("analytics_events")
      .select("event_name, count")
      .eq("event_type", "page_view")
      .gte("created_at", startDateStr)
      .order("count", { ascending: false })
      .limit(10);

    if (pageViewsError) throw pageViewsError;

    // Fetch content generation stats
    const { data: contentGenData, error: contentGenError } = await supabase
      .from("analytics_events")
      .select("event_name, details, success_count, total_count")
      .eq("event_type", "content_generation")
      .gte("created_at", startDateStr)
      .order("total_count", { ascending: false })
      .limit(5);

    if (contentGenError) throw contentGenError;

    // Fetch user actions
    const { data: userActionsData, error: userActionsError } = await supabase
      .from("analytics_events")
      .select("event_name, count")
      .eq("event_type", "user_action")
      .gte("created_at", startDateStr)
      .order("count", { ascending: false })
      .limit(10);

    if (userActionsError) throw userActionsError;

    // Fetch errors
    const { data: errorsData, error: errorsError } = await supabase
      .from("analytics_events")
      .select("event_name, count")
      .eq("event_type", "error")
      .gte("created_at", startDateStr)
      .order("count", { ascending: false })
      .limit(10);

    if (errorsError) throw errorsError;

    // Fetch user growth over time
    const { data: userGrowthData, error: userGrowthError } = await supabase
      .from("user_growth")
      .select("date, count")
      .gte("date", startDate.toISOString().split('T')[0])
      .order("date", { ascending: true });

    if (userGrowthError) throw userGrowthError;

    // Format the data
    const pageViews = pageViewsData.map((item) => ({
      page: item.event_name,
      count: item.count,
    }));

    const contentGeneration = contentGenData.map((item) => ({
      type: item.event_name,
      count: item.total_count || 0,
      success_rate: item.total_count ? (item.success_count / item.total_count) * 100 : 0,
    }));

    const userActions = userActionsData.map((item) => ({
      action: item.event_name,
      count: item.count,
    }));

    const errors = errorsData.map((item) => ({
      type: item.event_name,
      count: item.count,
    }));

    const userGrowth = userGrowthData.map((item) => ({
      date: new Date(item.date).toLocaleDateString(),
      count: item.count,
    }));

    return {
      pageViews,
      contentGeneration,
      userActions,
      errors,
      userGrowth,
    };
  } catch (error) {
    console.error("Error fetching analytics:", error);
    toast.error("Failed to fetch analytics data");
    return {
      pageViews: [],
      contentGeneration: [],
      userActions: [],
      errors: [],
      userGrowth: [],
    };
  }
};

// Log an activity
export const logActivity = async (
  userId: string,
  eventType: string,
  eventName: string,
  details: EventDetails | null = null
): Promise<boolean> => {
  try {
    // Safely serialize the details
    const safeDetails = safeSerializeDetails(details);

    // Check if the activity_logs table exists before trying to use it
    const { error: tableCheckError } = await supabase
      .from('activity_logs')
      .select('id')
      .limit(1);

    // If the table doesn't exist, log to console in development and return
    if (tableCheckError) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('Activity logs table not available:', tableCheckError.message);
        console.log('Would log activity:', { userId, eventType, eventName });
      }
      return true; // Return true to avoid disrupting the app flow
    }

    // Insert directly into activity_logs table
    const { error } = await supabase
      .from("activity_logs")
      .insert({
        user_id: userId,
        event_type: eventType,
        event_name: eventName,
        details: safeDetails,
      });

    if (error) {
      console.warn('Error inserting activity log:', error.message);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error logging activity:", error);
    return false;
  }
};



// Log an analytics event
export const logAnalyticsEvent = async (
  eventType: string,
  eventName: string,
  details: EventDetails | null = null,
  success: boolean | null = null
): Promise<boolean> => {
  try {
    // In development mode, just log to console and return success
    if (process.env.NODE_ENV === 'development') {
      console.log('Analytics event:', { eventType, eventName, success });
      return true;
    }

    // Safely serialize the details
    const safeDetails = safeSerializeDetails(details);

    // Check if the analytics_events table exists before trying to use it
    const { error: tableCheckError } = await supabase
      .from('analytics_events')
      .select('id')
      .limit(1);

    // If the table doesn't exist, log to console and return
    if (tableCheckError) {
      console.warn('Analytics events table not available:', tableCheckError.message);
      return true; // Return true to avoid disrupting the app flow
    }

    // Check if event already exists for today
    const today = new Date().toISOString().split('T')[0];

    // Use a simpler query to avoid column issues
    const { data: existingEvent, error: queryError } = await supabase
      .from("analytics_events")
      .select("id, count")
      .eq("event_type", eventType)
      .eq("event_name", eventName)
      .gte("created_at", `${today}T00:00:00`)
      .lte("created_at", `${today}T23:59:59`)
      .maybeSingle();

    if (queryError) {
      // If the table doesn't exist or there's a column mismatch, just log it and return
      // This prevents errors from breaking the app functionality
      console.warn('Error querying analytics events:', queryError.message);
      return false;
    }

    if (existingEvent) {
      // Update existing event with minimal fields
      const { error } = await supabase
        .from("analytics_events")
        .update({
          count: (existingEvent.count || 0) + 1,
          // Only include these fields if they exist in the table
          ...(success === true ? { success_count: 1 } : {}),
          details: safeDetails,
        })
        .eq("id", existingEvent.id);

      if (error) {
        // If there's a column mismatch, just log it and return
        console.warn('Error updating analytics event:', error.message);
        // Still return true to avoid disrupting the app flow
        return true;
      }
    } else {
      // Insert new event with minimal required fields
      const { error } = await supabase
        .from("analytics_events")
        .insert({
          event_type: eventType,
          event_name: eventName,
          count: 1,
          // Only include these fields if they're needed
          ...(success === true ? { success_count: 1 } : {}),
          details: safeDetails,
        });

      if (error) {
        // If there's a column mismatch, just log it and return
        console.warn('Error inserting analytics event:', error.message);
        // Still return true to avoid disrupting the app flow
        return true;
      }
    }

    return true;
  } catch (error) {
    console.error("Error logging analytics event:", error);
    return false;
  }
};
