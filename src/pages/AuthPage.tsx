
import Auth from "@/components/Auth";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verifying, setVerifying] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState<string | null>(null);

  // Handle email verification
  useEffect(() => {
    const handleEmailVerification = async () => {
      // Check if this is a verification callback
      const hashParams = new URLSearchParams(location.hash.substring(1));
      const type = hashParams.get('type');
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');

      if ((type === 'signup' || type === 'recovery') && (accessToken || refreshToken)) {
        setVerifying(true);
        try {
          // Process the verification
          if (accessToken) {
            // Set the access token in the session - this should automatically log the user in
            const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });

            console.log('Session set with token, session data:', sessionData);

            if (sessionError) {
              console.error('Error setting session:', sessionError);
              setVerificationMessage('Error verifying email. Please try signing in manually.');
              toast.error('Error verifying email. Please try signing in.');
            } else {
              // Get the user
              const { data: { user }, error: userError } = await supabase.auth.getUser(accessToken);

              if (userError || !user) {
                console.error('Error getting user:', userError);
                setVerificationMessage('Error verifying email. Please try signing in manually.');
                toast.error('Error verifying email. Please try signing in.');
              } else {
                // Check if profile exists and create if not
                const { data: profileData, error: profileError } = await supabase
                  .from('profiles')
                  .select('*')
                  .eq('id', user.id)
                  .maybeSingle();

                if (!profileData && (!profileError || profileError.code === 'PGRST116')) {
                  // Profile doesn't exist, create it
                  try {
                    const { error: insertError } = await supabase
                      .from('profiles')
                      .insert({
                        id: user.id,
                        email: user.email,
                        is_admin: user.email === '007postit@gmail.com',
                        is_subscribed: user.email === '007postit@gmail.com',
                        has_used_generator_demo: false,
                        has_used_viral_generator_demo: false,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                      });

                    if (insertError) {
                      console.error('Error creating profile during verification:', insertError);
                    } else {
                      console.log('Profile created during verification');
                    }
                  } catch (insertErr) {
                    console.error('Exception creating profile during verification:', insertErr);
                  }
                }

                // Success message
                if (type === 'recovery') {
                  setVerificationMessage('Password reset successful! You are now signed in.');
                  toast.success('Password reset successful! You are now signed in.');
                } else {
                  setVerificationMessage('Email verified successfully! You are now signed in.');
                  toast.success('Email verified successfully! You are now signed in.');
                }

                // Force a session refresh to ensure the user is logged in
                try {
                  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
                  if (refreshError) {
                    console.error('Error refreshing session:', refreshError);
                  } else {
                    console.log('Session refreshed successfully:', refreshData.session ? 'Session exists' : 'No session');
                  }
                } catch (refreshErr) {
                  console.error('Exception refreshing session:', refreshErr);
                }

                // Redirect after a short delay
                setTimeout(() => {
                  navigate('/');
                }, 1500);
              }
            }
          }
        } catch (error) {
          console.error('Error during verification:', error);
          setVerificationMessage('Error during verification. Please try signing in manually.');
          toast.error('Error during verification. Please try signing in.');
        } finally {
          setVerifying(false);
        }
      }
    };

    handleEmailVerification();
  }, [location.hash, navigate]);

  // Redirect if already logged in
  useEffect(() => {
    // Only redirect if user is logged in, not loading, not verifying, and no verification message is showing
    if (user && !isLoading && !verifying && !verificationMessage) {
      console.log('User already logged in, redirecting to home');
      navigate("/");
    }
  }, [user, isLoading, navigate, verifying, verificationMessage]);

  // Show verification UI if verifying
  if (verifying) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 py-10 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verifying your email...</h2>
            <p className="text-gray-600">Please wait while we complete the verification process.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show verification message if available
  if (verificationMessage) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 py-10 flex items-center justify-center">
          <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">{verificationMessage}</h2>
            <p className="text-gray-600 mb-6">You'll be redirected to the homepage shortly.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show normal auth UI
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <Auth />
        </div>
      </main>
      <Footer />
    </div>
  );
}
