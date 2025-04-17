
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

          // If super user, they're automatically considered paid and haven't used demos
          if (isSuperUserEmail) {
            setIsPaidUser(true);
            setHasUsedGeneratorDemo(false);
            setHasUsedViralGeneratorDemo(false);
            return;
          }

          // For regular users, check localStorage as before
          const paymentStatus = localStorage.getItem(`payment_status_${user.id}`);
          const generatorDemoStatus = localStorage.getItem(`generator_demo_${user.id}`);
          const viralGeneratorDemoStatus = localStorage.getItem(`viral_generator_demo_${user.id}`);

          setIsPaidUser(paymentStatus === 'true');
          setHasUsedGeneratorDemo(generatorDemoStatus === 'true');
          setHasUsedViralGeneratorDemo(viralGeneratorDemoStatus === 'true');
        } catch (error) {
          console.error('Error checking user status:', error);
        }
      }
    };

    checkUserStatus();
  }, [user]);

  const updateUserPaymentStatus = (status: boolean) => {
    if (user) {
      // In a real app, you would update the database
      // For now, we'll use localStorage as a simple demonstration
      localStorage.setItem(`payment_status_${user.id}`, status.toString());
      setIsPaidUser(status);
    }
  };

  const markGeneratorDemoAsUsed = () => {
    if (user && !isSuperUser) {
      localStorage.setItem(`generator_demo_${user.id}`, 'true');
      setHasUsedGeneratorDemo(true);
    }
  };

  const markViralGeneratorDemoAsUsed = () => {
    if (user && !isSuperUser) {
      localStorage.setItem(`viral_generator_demo_${user.id}`, 'true');
      setHasUsedViralGeneratorDemo(true);
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
