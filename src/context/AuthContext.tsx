
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AuthContextType = {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isPaidUser: boolean;
  updateUserPaymentStatus?: (status: boolean) => void;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaidUser, setIsPaidUser] = useState(false);
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

  // Check if user has paid
  useEffect(() => {
    const checkPaymentStatus = async () => {
      if (user) {
        try {
          // In a real app, you would check the database for payment status
          // For now, we'll check localStorage as a simple demonstration
          const paymentStatus = localStorage.getItem(`payment_status_${user.id}`);
          setIsPaidUser(paymentStatus === 'true');
        } catch (error) {
          console.error('Error checking payment status:', error);
        }
      }
    };

    checkPaymentStatus();
  }, [user]);

  const updateUserPaymentStatus = (status: boolean) => {
    if (user) {
      // In a real app, you would update the database
      // For now, we'll use localStorage as a simple demonstration
      localStorage.setItem(`payment_status_${user.id}`, status.toString());
      setIsPaidUser(status);
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
      updateUserPaymentStatus,
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
