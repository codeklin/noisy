
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Facebook, Twitter, Linkedin } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { SocialMediaConnection } from "@/types/socialMedia";

// Helper function to check if a user exists in the database
const checkUserExists = async (email: string) => {
  try {
    // First try to use the RPC function
    const { data: exists, error: rpcError } = await supabase.rpc('check_user_exists', {
      user_email: email
    });

    if (!rpcError && exists === true) {
      console.log('User found via RPC function');
      return true;
    }

    // If RPC fails or returns false, try admin API
    if (rpcError) {
      console.error('Error checking user via RPC:', rpcError);

      // Try admin API
      try {
        const { data, error: adminError } = await supabase.auth.admin.getUserByEmail(email);

        if (!adminError && data.user) {
          console.log('User found via admin API:', data.user);
          return true;
        }
      } catch (adminErr) {
        console.error('Error checking user via admin API:', adminErr);
      }
    }

    // Fallback to checking profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', email);

    if (!profileError && profileData && profileData.length > 0) {
      console.log('User found in profiles table');
      return true;
    }

    // If we get here, user doesn't exist
    return false;
  } catch (error) {
    console.error('Error checking if user exists:', error);
    // If there's an error, assume user might exist to be safe
    return false;
  }
};

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetPasswordMode, setResetPasswordMode] = useState(false);
  const [userExists, setUserExists] = useState<boolean | null>(null);
  const [socialConnections, setSocialConnections] = useState<SocialMediaConnection[]>([
    { platform: "facebook", isConnected: false },
    { platform: "twitter", isConnected: false },
    { platform: "linkedin", isConnected: false }
  ]);

  // Check if user exists when email changes
  useEffect(() => {
    const checkUser = async () => {
      if (email && email.includes('@')) {
        const exists = await checkUserExists(email.trim());
        setUserExists(exists);
      } else {
        setUserExists(null);
      }
    };

    // Debounce the check to avoid too many requests
    const timeoutId = setTimeout(checkUser, 500);
    return () => clearTimeout(timeoutId);
  }, [email]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting to sign up with:", { email });

      // First check if the user already exists
      const userExists = await checkUserExists(email.trim());
      if (userExists) {
        toast.error("This email is already registered. Please log in instead.");
        setLoading(false);
        return;
      }

      // Proceed with signup - IMPORTANT: Set emailConfirmationRedirectTo to ensure verification emails work
      const { error, data } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            social_media: socialConnections
          },
          emailRedirectTo: `${window.location.origin}/auth`,
          captchaToken: undefined // Skip captcha for development
        }
      });

      if (error) {
        console.error("Supabase signup error:", error);
        throw error;
      }

      console.log("Sign up response:", data);

      if (!data?.user) {
        toast.error("Failed to create account. Please try again.");
      } else if (data?.user?.identities?.length === 0) {
        toast.error("This email is already registered. Please log in instead.");
      } else {
        // Create the profile directly in the database
        try {
          // First try direct insert
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email,
              is_admin: data.user.email === '007postit@gmail.com',
              is_subscribed: data.user.email === '007postit@gmail.com',
              has_used_generator_demo: false,
              has_used_viral_generator_demo: false,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (insertError) {
            console.error("Error creating profile via direct insert:", insertError);

            // Fallback to RPC function
            const { error: rpcError } = await supabase.rpc('create_user_profile', {
              user_id: data.user.id,
              user_email: data.user.email,
              is_admin_val: data.user.email === '007postit@gmail.com',
              is_subscribed_val: data.user.email === '007postit@gmail.com'
            });

            if (rpcError) {
              console.error("Error creating profile via RPC:", rpcError);
              throw rpcError;
            }
          }

          // If we get here, profile was created successfully
          console.log('User profile created successfully');

          // For development/testing - resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/auth`
            }
          });

          if (resendError) {
            console.error("Error resending confirmation email:", resendError);
          } else {
            console.log("Confirmation email resent successfully");
          }

          toast.success(
            "Account created! Please check your email for confirmation. " +
            "If you don't see it, check your spam folder."
          );
        } catch (profileErr) {
          console.error("Exception creating profile during signup:", profileErr);
          toast.error("Account created but profile setup failed. You can still log in after verifying your email.");
        }
      }
    } catch (error: any) {
      console.error("Sign up error:", error);

      // Provide more specific error messages
      if (error.message?.includes("duplicate key") || error.message?.includes("already registered")) {
        toast.error("This email is already registered. Please log in instead.");
      } else if (error.message?.includes("rate limit")) {
        toast.error("Too many signup attempts. Please try again later.");
      } else if (error.message?.includes("Database error")) {
        toast.error("Account created but profile setup failed. Please verify your email and then log in.");
      } else {
        toast.error(error.message || "An error occurred during sign up");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Password length validation
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    // Clear any previous error messages
    setUserExists(null);

    try {
      setLoading(true);
      console.log("Attempting to sign in with:", { email });

      // Try to sign in directly
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      // If there's an error, handle it
      if (error) {
        console.error("Supabase auth error:", error);

        // If the error is "Invalid login credentials", check if the user exists in auth but not confirmed
        if (error.message.includes("Invalid login credentials")) {
          // First try to check if user exists via RPC function
          const { data: userExists, error: rpcError } = await supabase.rpc('check_user_exists', {
            user_email: email.trim()
          });

          if (rpcError) {
            console.error('Error checking if user exists via RPC:', rpcError);
          }

          // If RPC confirms user exists or we couldn't check
          if (userExists === true || rpcError) {
            // Try to get user directly
            const { data: { user }, error: getUserError } = await supabase.auth.admin.getUserByEmail(email.trim());

            if (getUserError) {
              console.error('Error getting user by email:', getUserError);
            }

            if (user) {
              // Check if email is confirmed
              if (!user.email_confirmed_at) {
                // Resend confirmation email
                const { error: resendError } = await supabase.auth.resend({
                  type: 'signup',
                  email: email.trim(),
                  options: {
                    emailRedirectTo: `${window.location.origin}/auth`
                  }
                });

                if (resendError) {
                  console.error("Error resending confirmation email:", resendError);
                  toast.error("Please confirm your email before signing in. We couldn't resend the confirmation email.");
                } else {
                  toast.warning("Please confirm your email before signing in. We've resent the confirmation email.");
                }
                return;
              } else {
                // Email is confirmed but login failed - wrong password
                toast.error("Invalid password. Please try again or reset your password.");
                return;
              }
            }
          }

          // If we get here, user doesn't exist in auth system
          // Ask if they want to create a new account
          const wantToCreateAccount = window.confirm(
            "No account found with this email. Would you like to create a new account?"
          );

          if (wantToCreateAccount) {
            // Try to sign up the user
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
              email: email.trim(),
              password,
              options: {
                emailRedirectTo: `${window.location.origin}/auth`,
                captchaToken: undefined // Skip captcha for development
              }
            });

            if (signUpError) {
              console.error("Sign-up error:", signUpError);
              throw signUpError;
            }

            if (signUpData?.user) {
              // Create profile for the new user
              try {
                const { error: profileError } = await supabase
                  .from('profiles')
                  .insert({
                    id: signUpData.user.id,
                    email: signUpData.user.email,
                    is_admin: signUpData.user.email === '007postit@gmail.com',
                    is_subscribed: signUpData.user.email === '007postit@gmail.com',
                    has_used_generator_demo: false,
                    has_used_viral_generator_demo: false,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                  });

                if (profileError) {
                  console.error("Error creating profile during login-signup:", profileError);
                }
              } catch (profileErr) {
                console.error("Exception creating profile during login-signup:", profileErr);
              }

              toast.success("Account created! Please check your email for confirmation.");
              return;
            }
          } else {
            toast.error("Sign in canceled. Please try again with correct credentials.");
            return;
          }
        }

        // Handle other specific error cases
        if (error.message.includes("Email not confirmed")) {
          // Resend confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email.trim(),
            options: {
              emailRedirectTo: `${window.location.origin}/auth`
            }
          });

          if (resendError) {
            console.error("Error resending confirmation email:", resendError);
            toast.error("Please confirm your email before signing in. We couldn't resend the confirmation email.");
          } else {
            toast.warning("Please confirm your email before signing in. We've resent the confirmation email.");
          }
          return;
        }

        throw error;
      }

      // Login successful - check if profile exists and create if not
      if (data?.user) {
        // Check if profile exists
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!profileData && (!profileError || profileError.code === 'PGRST116')) {
          // Profile doesn't exist, create it
          try {
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                is_admin: data.user.email === '007postit@gmail.com',
                is_subscribed: data.user.email === '007postit@gmail.com',
                has_used_generator_demo: false,
                has_used_viral_generator_demo: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });

            if (insertError) {
              console.error("Error creating profile during login:", insertError);
            } else {
              console.log("Profile created during login");
            }
          } catch (insertErr) {
            console.error("Exception creating profile during login:", insertErr);
          }
        }
      }

      console.log("Sign in successful:", data);
      toast.success("Signed in successfully!");
    } catch (error: any) {
      console.error("Sign in error:", error);

      // Provide more helpful error messages
      if (error.message?.includes("Invalid login credentials")) {
        toast.error("Invalid email or password. Please try again or reset your password.");
      } else if (error.message?.includes("rate limit")) {
        toast.error("Too many login attempts. Please try again later.");
      } else if (error.message?.includes("Email not confirmed")) {
        toast.error("Please confirm your email before signing in. Check your inbox and spam folder.");
      } else {
        toast.error(error.message || "An error occurred during sign in");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Email validation
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    try {
      setLoading(true);
      console.log("Attempting to send password reset email to:", email);

      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/auth'
      });

      if (error) {
        console.error("Password reset error:", error);
        throw error;
      }

      toast.success("Password reset link sent to your email");
      setResetPasswordMode(false);
    } catch (error: any) {
      console.error("Password reset error:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setLoading(false);
    }
  };

  const toggleSocialConnection = (platform: 'facebook' | 'twitter' | 'linkedin') => {
    setSocialConnections(prev =>
      prev.map(conn =>
        conn.platform === platform
          ? { ...conn, isConnected: !conn.isConnected }
          : conn
      )
    );
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome to Noisy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              {resetPasswordMode ? (
                <form onSubmit={handleResetPassword} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-reset">Email</Label>
                    <Input
                      id="email-reset"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Sending reset link..." : "Send Reset Link"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full mt-2"
                    onClick={() => setResetPasswordMode(false)}
                  >
                    Back to Login
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-login">Email</Label>
                    <Input
                      id="email-login"
                      type="email"
                      placeholder="your.email@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password-login">Password</Label>
                    <PasswordInput
                      id="password-login"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <div className="text-right">
                      <button
                        type="button"
                        className="text-xs text-blue-600 hover:underline"
                        onClick={() => setResetPasswordMode(true)}
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>
                  {userExists === false && email && (
                    <div className="text-sm text-amber-600 mb-2">
                      No account found with this email. You'll be prompted to create one when you try to sign in.
                    </div>
                  )}
                  {userExists === true && (
                    <div className="text-sm text-green-600 mb-2">
                      Account found! Enter your password to sign in.
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : userExists === false ? "Create Account" : "Sign In"}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="email-register">Email</Label>
                  <Input
                    id="email-register"
                    type="email"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password-register">Password</Label>
                  <PasswordInput
                    id="password-register"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Connect Social Media Accounts</Label>
                  <p className="text-sm text-gray-500 mb-3">Choose platforms to share your content</p>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="facebook"
                        checked={socialConnections.find(c => c.platform === 'facebook')?.isConnected}
                        onCheckedChange={() => toggleSocialConnection('facebook')}
                      />
                      <Label htmlFor="facebook" className="flex items-center">
                        <Facebook className="h-4 w-4 mr-2 text-blue-600" />
                        Facebook
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="twitter"
                        checked={socialConnections.find(c => c.platform === 'twitter')?.isConnected}
                        onCheckedChange={() => toggleSocialConnection('twitter')}
                      />
                      <Label htmlFor="twitter" className="flex items-center">
                        <Twitter className="h-4 w-4 mr-2 text-blue-400" />
                        Twitter
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="linkedin"
                        checked={socialConnections.find(c => c.platform === 'linkedin')?.isConnected}
                        onCheckedChange={() => toggleSocialConnection('linkedin')}
                      />
                      <Label htmlFor="linkedin" className="flex items-center">
                        <Linkedin className="h-4 w-4 mr-2 text-blue-700" />
                        LinkedIn
                      </Label>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="justify-center">
          <p className="text-xs text-center text-gray-500">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
