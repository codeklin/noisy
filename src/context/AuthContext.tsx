
import { createContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isPaidUser: boolean;
  isSuperUser: boolean;
  isAdmin: boolean;
  hasUsedGeneratorDemo: boolean;
  hasUsedViralGeneratorDemo: boolean;
  updateUserPaymentStatus?: (status: boolean) => void;
  markGeneratorDemoAsUsed: () => void;
  markViralGeneratorDemoAsUsed: () => void;
  signOut: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasUsedGeneratorDemo, setHasUsedGeneratorDemo] = useState(false);
  const [hasUsedViralGeneratorDemo, setHasUsedViralGeneratorDemo] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // First check for existing session
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Get current session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        console.log('Initial session check:', currentSession ? 'Session found' : 'No session');

        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
        }
      } catch (error) {
        console.error('Error checking initial session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession ? 'Session exists' : 'No session');

        // Only update session and user if the event is not INITIAL_SESSION
        // This prevents unnecessary state updates during page loads
        if (event !== 'INITIAL_SESSION') {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }

        if (event === "SIGNED_IN") {
          console.log('User signed in');
          // Only navigate to home if this is a new sign-in, not a page reload
          if (window.location.pathname === '/auth') {
            console.log('Navigating to home after sign-in');
            navigate("/");
          }
        }
        if (event === "SIGNED_OUT") {
          console.log('User signed out');
          // Only navigate to auth if this is an actual sign-out, not a page reload
          if (window.location.pathname !== '/auth') {
            console.log('Navigating to auth after sign-out');
            navigate("/auth");
          }
        }
        if (event === "TOKEN_REFRESHED") {
          console.log('Token refreshed');
        }
        if (event === "USER_UPDATED") {
          console.log('User updated');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Check if user has paid and demo usage status
  useEffect(() => {
    const checkUserStatus = async () => {
      if (!user) return; // Exit early if no user

      try {
        // Check if the user is a super user (007postit@gmail.com)
        const isSuperUserEmail = user.email === '007postit@gmail.com';
        setIsSuperUser(isSuperUserEmail);

        // If super user, they're automatically considered paid and admin
        if (isSuperUserEmail) {
          setIsPaidUser(true);
          setIsAdmin(true);
          setHasUsedGeneratorDemo(false);
          setHasUsedViralGeneratorDemo(false);
        }

        // Check if user profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single to avoid errors

        // Handle profile not found - create a new profile
        if (!profileData && (profileError?.code === 'PGRST116' || !profileError)) {
          console.log('Creating new user profile for:', user.email);

          try {
            // Use RPC function to bypass RLS policies
            const { error: insertError } = await supabase.rpc('create_user_profile', {
              user_id: user.id,
              user_email: user.email,
              is_admin_val: isSuperUserEmail,
              is_subscribed_val: isSuperUserEmail
            });

            if (insertError) {
              console.error('Error creating user profile via RPC:', insertError);

              // Fallback to direct insert with service role if available
              try {
                // Create a new profile for the user
                const { error: directInsertError } = await supabase
                  .from('profiles')
                  .insert({
                    id: user.id,
                    email: user.email,
                    is_admin: isSuperUserEmail, // Super user is automatically admin
                    is_subscribed: isSuperUserEmail, // Super user is automatically subscribed
                    has_used_generator_demo: false,
                    has_used_viral_generator_demo: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (directInsertError) {
                  console.error('Error creating user profile via direct insert:', directInsertError);
                  // Use localStorage as fallback
                  const paymentStatus = localStorage.getItem(`payment_status_${user.id}`);
                  const generatorDemoStatus = localStorage.getItem(`generator_demo_${user.id}`);
                  const viralGeneratorDemoStatus = localStorage.getItem(`viral_generator_demo_${user.id}`);

                  setIsPaidUser(paymentStatus === 'true' || isSuperUserEmail);
                  setHasUsedGeneratorDemo(generatorDemoStatus === 'true' && !isSuperUserEmail);
                  setHasUsedViralGeneratorDemo(viralGeneratorDemoStatus === 'true' && !isSuperUserEmail);
                } else {
                  console.log('User profile created successfully via direct insert');
                  // For a new profile, set default values
                  if (!isSuperUserEmail) {
                    setIsPaidUser(false);
                    setIsAdmin(false);
                    setHasUsedGeneratorDemo(false);
                    setHasUsedViralGeneratorDemo(false);
                  }
                }
              } catch (directInsertErr) {
                console.error('Exception creating profile via direct insert:', directInsertErr);
              }
            } else {
              console.log('User profile created successfully via RPC');
              // For a new profile, set default values
              if (!isSuperUserEmail) {
                setIsPaidUser(false);
                setIsAdmin(false);
                setHasUsedGeneratorDemo(false);
                setHasUsedViralGeneratorDemo(false);
              }
            }
          } catch (insertErr) {
            console.error('Exception creating profile:', insertErr);
          }
        }
        // Handle existing profile
        else if (profileData) {
          // Profile exists, update states
          setIsAdmin(profileData.is_admin || isSuperUserEmail);
          setIsPaidUser(profileData.is_subscribed || isSuperUserEmail);
          setHasUsedGeneratorDemo(profileData.has_used_generator_demo && !isSuperUserEmail);
          setHasUsedViralGeneratorDemo(profileData.has_used_viral_generator_demo && !isSuperUserEmail);
        }
        // Handle other errors
        else if (profileError) {
          console.error('Error fetching user profile:', profileError);
          // Use localStorage as fallback
          const paymentStatus = localStorage.getItem(`payment_status_${user.id}`);
          const generatorDemoStatus = localStorage.getItem(`generator_demo_${user.id}`);
          const viralGeneratorDemoStatus = localStorage.getItem(`viral_generator_demo_${user.id}`);

          setIsPaidUser(paymentStatus === 'true' || isSuperUserEmail);
          setHasUsedGeneratorDemo(generatorDemoStatus === 'true' && !isSuperUserEmail);
          setHasUsedViralGeneratorDemo(viralGeneratorDemoStatus === 'true' && !isSuperUserEmail);
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        // Set safe defaults
        const isSuperUserEmail = user.email === '007postit@gmail.com';
        setIsSuperUser(isSuperUserEmail);
        setIsAdmin(isSuperUserEmail);
        setIsPaidUser(isSuperUserEmail);
      }
    };

    checkUserStatus();
  }, [user]);

  const updateUserPaymentStatus = async (status: boolean) => {
    if (user) {
      try {
        // Update the database
        const { error } = await supabase
          .from('profiles')
          .update({ is_subscribed: status })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating payment status:', error);
          // Fallback to localStorage if database update fails
          localStorage.setItem(`payment_status_${user.id}`, status.toString());
        }

        // Update local state
        setIsPaidUser(status);
      } catch (error) {
        console.error('Error updating payment status:', error);
        // Fallback to localStorage
        localStorage.setItem(`payment_status_${user.id}`, status.toString());
        setIsPaidUser(status);
      }
    }
  };

  const markGeneratorDemoAsUsed = async () => {
    if (user && !isSuperUser) {
      try {
        // Update the database
        const { error } = await supabase
          .from('profiles')
          .update({ has_used_generator_demo: true })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating generator demo status:', error);
          // Fallback to localStorage if database update fails
          localStorage.setItem(`generator_demo_${user.id}`, 'true');
        }

        // Update local state
        setHasUsedGeneratorDemo(true);
      } catch (error) {
        console.error('Error updating generator demo status:', error);
        // Fallback to localStorage
        localStorage.setItem(`generator_demo_${user.id}`, 'true');
        setHasUsedGeneratorDemo(true);
      }
    }
  };

  const markViralGeneratorDemoAsUsed = async () => {
    if (user && !isSuperUser) {
      try {
        // Update the database
        const { error } = await supabase
          .from('profiles')
          .update({ has_used_viral_generator_demo: true })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating viral generator demo status:', error);
          // Fallback to localStorage if database update fails
          localStorage.setItem(`viral_generator_demo_${user.id}`, 'true');
        }

        // Update local state
        setHasUsedViralGeneratorDemo(true);
      } catch (error) {
        console.error('Error updating viral generator demo status:', error);
        // Fallback to localStorage
        localStorage.setItem(`viral_generator_demo_${user.id}`, 'true');
        setHasUsedViralGeneratorDemo(true);
      }
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      isLoading,
      isPaidUser,
      isSuperUser,
      isAdmin,
      hasUsedGeneratorDemo,
      hasUsedViralGeneratorDemo,
      updateUserPaymentStatus,
      markGeneratorDemoAsUsed,
      markViralGeneratorDemoAsUsed,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}


