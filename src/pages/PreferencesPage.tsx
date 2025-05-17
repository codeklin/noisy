
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useUserPreferences } from "@/hooks/useUserPreferences.ts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Facebook, Linkedin, Loader2, Twitter } from "lucide-react";
import { parseJsonObject } from "@/types/supabase";
import { SocialMediaConnection } from "@/types/socialMedia";
import PWAStatus from "@/components/PWAStatus";

export default function PreferencesPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { preferences, updatePreferences, isLoading, isSaving } = useUserPreferences();
  const [socialConnections, setSocialConnections] = useState<SocialMediaConnection[]>(
    user?.user_metadata?.social_media
      ? parseJsonObject<SocialMediaConnection[]>(user?.user_metadata?.social_media)
      : []
  );

  const updateSocialAccount = async (platform: 'facebook' | 'twitter' | 'linkedin', isConnected: boolean) => {
    try {
      // Update the social media connections state
      const updatedConnections = socialConnections.map(conn =>
        conn.platform === platform ? { ...conn, isConnected } : conn
      );

      setSocialConnections(updatedConnections);

      // In a real app, this would connect to the actual social media platform
      // Here we're just updating the user metadata

      toast.success(`${isConnected ? 'Connected to' : 'Disconnected from'} ${platform}`);

      // Update preferences to store this connection info
      await updatePreferences({
        socialMediaAccounts: {
          ...preferences.socialMediaAccounts,
          [platform]: { connected: isConnected }
        }
      });

    } catch (error) {
      console.error(`Error ${isConnected ? 'connecting to' : 'disconnecting from'} ${platform}:`, error);
      toast.error(`Failed to ${isConnected ? 'connect to' : 'disconnect from'} ${platform}`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#6E5DC6]" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#6E5DC6] mb-6">Your Preferences</h1>

          <Tabs defaultValue="general" className="space-y-6">
            <TabsList>
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="social">Social Media</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
              <TabsTrigger value="app">App Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences and settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Dark Mode</Label>
                      <p className="text-sm text-gray-500">
                        Switch between dark and light mode
                      </p>
                    </div>
                    <Switch
                      checked={preferences.theme === "dark"}
                      onCheckedChange={(checked) => {
                        updatePreferences({ theme: checked ? "dark" : "light" });
                      }}
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Default Platforms</Label>
                      <p className="text-sm text-gray-500">
                        Platforms to include by default when generating content
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      {/* Default platform toggles would go here */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="social" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Social Media Accounts</CardTitle>
                  <CardDescription>
                    Connect your social media accounts to enable direct sharing of content.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Facebook className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-sm text-gray-500">
                            {socialConnections.find(c => c.platform === "facebook")?.isConnected
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={socialConnections.find(c => c.platform === "facebook")?.isConnected ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          const isCurrentlyConnected = !!socialConnections.find(c => c.platform === "facebook")?.isConnected;
                          updateSocialAccount("facebook", !isCurrentlyConnected);
                        }}
                      >
                        {socialConnections.find(c => c.platform === "facebook")?.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Twitter className="h-6 w-6 text-blue-400" />
                        <div>
                          <p className="font-medium">Twitter</p>
                          <p className="text-sm text-gray-500">
                            {socialConnections.find(c => c.platform === "twitter")?.isConnected
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={socialConnections.find(c => c.platform === "twitter")?.isConnected ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          const isCurrentlyConnected = !!socialConnections.find(c => c.platform === "twitter")?.isConnected;
                          updateSocialAccount("twitter", !isCurrentlyConnected);
                        }}
                      >
                        {socialConnections.find(c => c.platform === "twitter")?.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Linkedin className="h-6 w-6 text-blue-700" />
                        <div>
                          <p className="font-medium">LinkedIn</p>
                          <p className="text-sm text-gray-500">
                            {socialConnections.find(c => c.platform === "linkedin")?.isConnected
                              ? "Connected"
                              : "Not connected"}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant={socialConnections.find(c => c.platform === "linkedin")?.isConnected ? "destructive" : "default"}
                        size="sm"
                        onClick={() => {
                          const isCurrentlyConnected = !!socialConnections.find(c => c.platform === "linkedin")?.isConnected;
                          updateSocialAccount("linkedin", !isCurrentlyConnected);
                        }}
                      >
                        {socialConnections.find(c => c.platform === "linkedin")?.isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Settings</CardTitle>
                  <CardDescription>
                    Control when and how you get notified.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive updates and alerts via email
                      </p>
                    </div>
                    <Switch
                      checked={!!preferences.emailNotifications}
                      onCheckedChange={(checked) => {
                        updatePreferences({ emailNotifications: checked });
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="app" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>App Settings</CardTitle>
                  <CardDescription>
                    Manage app installation and offline capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Offline Mode</Label>
                      <p className="text-sm text-gray-500">
                        Enable offline access to your content
                      </p>
                    </div>
                    <Switch
                      checked={!!preferences.offlineMode}
                      onCheckedChange={(checked) => {
                        updatePreferences({ offlineMode: checked });
                        if (checked) {
                          toast.success("Offline mode enabled. Your content will be available offline.");
                        } else {
                          toast.info("Offline mode disabled.");
                        }
                      }}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <Label>App Status</Label>
                    <PWAStatus />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
}
