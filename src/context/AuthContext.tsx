
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setIsLoading(false);

        if (event === "SIGNED_IN") {
          navigate("/");
        }
        if (event === "SIGNED_OUT") {
          navigate("/auth");
        }
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  // Check if user has paid and demo usage status
  useEffect(() => {
    const checkUserStatus = async () => {
      if (user) {
        try {
          // Check if the user is a super user (007postit@gmail.com)
          const isSuperUserEmail = user.email === '007postit@gmail.com';
          setIsSuperUser(isSuperUserEmail);

          // Check if user profile exists and create if it doesn't
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') { // Record not found error
              console.log('Creating new user profile for:', user.email);

              // Create a new profile for the user
              const { error: insertError } = await supabase
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

              if (insertError) {
                console.error('Error creating user profile:', insertError);
              } else {
                console.log('User profile created successfully');
              }
            } else {
              console.error('Error fetching user profile:', profileError);
            }
          } else {
            // Profile exists, update admin status
            setIsAdmin(profileData?.is_admin || isSuperUserEmail);

            // Update profile data from database if available
            if (profileData) {
              setHasUsedGeneratorDemo(profileData.has_used_generator_demo || false);
              setHasUsedViralGeneratorDemo(profileData.has_used_viral_generator_demo || false);
              setIsPaidUser(profileData.is_subscribed || false);
            }
          }

          // If super user, they're automatically considered paid and haven't used demos
          if (isSuperUserEmail) {
            setIsPaidUser(true);
            setHasUsedGeneratorDemo(false);
            setHasUsedViralGeneratorDemo(false);
            return;
          }

          // For regular users, check localStorage as fallback
          const paymentStatus = localStorage.getItem(`payment_status_${user.id}`);
          const generatorDemoStatus = localStorage.getItem(`generator_demo_${user.id}`);
          const viralGeneratorDemoStatus = localStorage.getItem(`viral_generator_demo_${user.id}`);

          // Only use localStorage if we don't have profile data
          if (!profileData) {
            setIsPaidUser(paymentStatus === 'true');
            setHasUsedGeneratorDemo(generatorDemoStatus === 'true');
            setHasUsedViralGeneratorDemo(viralGeneratorDemoStatus === 'true');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
        }
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
