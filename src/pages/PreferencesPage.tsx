
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { LoaderCircle, Save } from "lucide-react";
import { useForm } from "react-hook-form";

export default function PreferencesPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { preferences, updatePreferences, isLoading, isSaving } = useUserPreferences();
  const navigate = useNavigate();
  
  const form = useForm({
    defaultValues: {
      defaultPlatforms: ["facebook", "twitter", "linkedin"],
      emailNotifications: true,
      theme: "light"
    }
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!isLoading && preferences) {
      form.reset({
        defaultPlatforms: preferences.defaultPlatforms || ["facebook", "twitter", "linkedin"],
        emailNotifications: preferences.emailNotifications !== undefined ? preferences.emailNotifications : true,
        theme: preferences.theme || "light"
      });
    }
  }, [preferences, isLoading, form]);

  const onSubmit = async (values: any) => {
    await updatePreferences(values);
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 bg-[#F5F4FF]/30 py-10 flex items-center justify-center">
          <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const platforms = [
    { id: "facebook", label: "Facebook" },
    { id: "twitter", label: "Twitter" },
    { id: "linkedin", label: "LinkedIn" }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 bg-[#F5F4FF]/30 py-10">
        <div className="container max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-[#6E5DC6] mb-6">Your Preferences</h1>
          
          <Card>
            <CardHeader>
              <CardTitle>Content Generation Settings</CardTitle>
              <CardDescription>
                Configure your default settings for content generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="defaultPlatforms"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel>Default Platforms</FormLabel>
                          <FormDescription>
                            Select the platforms you want to include by default when generating content
                          </FormDescription>
                        </div>
                        <div className="grid gap-4">
                          {platforms.map((platform) => (
                            <FormField
                              key={platform.id}
                              control={form.control}
                              name="defaultPlatforms"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={platform.id}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(platform.id)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, platform.id])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value: string) => value !== platform.id
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {platform.label}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="emailNotifications"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Email Notifications
                          </FormLabel>
                          <FormDescription>
                            Receive email updates about your content plans
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSaving} className="w-full">
                    {isSaving ? (
                      <>
                        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Preferences
                      </>
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
