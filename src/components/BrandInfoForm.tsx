
import { useState } from "react";
import { BrandInfo } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

const defaultThemes = [
  { id: "motivation", label: "Motivation" },
  { id: "product-highlights", label: "Product Highlights" },
  { id: "behind-the-scenes", label: "Behind the Scenes" },
  { id: "tips", label: "Tips & How-tos" },
  { id: "quotes", label: "Quotes" },
  { id: "industry-news", label: "Industry News" },
  { id: "case-studies", label: "Case Studies" },
  { id: "testimonials", label: "Testimonials" },
];

const defaultTones = [
  { id: "professional", label: "Professional" },
  { id: "casual", label: "Casual" },
  { id: "witty", label: "Witty" },
  { id: "inspirational", label: "Inspirational" },
  { id: "educational", label: "Educational" },
  { id: "conversational", label: "Conversational" },
];

interface BrandInfoFormProps {
  onSubmit: (brandInfo: BrandInfo) => void;
  isGenerating: boolean;
  useAI: boolean;
  setUseAI: (useAI: boolean) => void;
}

const BrandInfoForm = ({ onSubmit, isGenerating, useAI, setUseAI }: BrandInfoFormProps) => {
  const [brandInfo, setBrandInfo] = useState<BrandInfo>({
    brandName: "",
    businessDescription: "",
    targetAudience: "",
    contentThemes: [],
    tone: "professional",
    specialDays: "",
    ctaExamples: "",
  });

  // No mock content toggle anymore

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBrandInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleThemeChange = (themeId: string, checked: boolean) => {
    setBrandInfo((prev) => {
      if (checked) {
        return { ...prev, contentThemes: [...prev.contentThemes, themeId] };
      } else {
        return {
          ...prev,
          contentThemes: prev.contentThemes.filter((t) => t !== themeId),
        };
      }
    });
  };

  const handleToneChange = (toneId: string) => {
    setBrandInfo((prev) => ({ ...prev, tone: toneId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!brandInfo.brandName.trim()) {
      toast.error("Please enter your brand name");
      return;
    }

    if (!brandInfo.businessDescription.trim()) {
      toast.error("Please enter a business description");
      return;
    }

    if (!brandInfo.targetAudience.trim()) {
      toast.error("Please describe your target audience");
      return;
    }

    if (brandInfo.contentThemes.length === 0) {
      toast.error("Please select at least one content theme");
      return;
    }

    onSubmit(brandInfo);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full max-w-[95vw] mx-auto overflow-hidden">
        <CardHeader className="space-y-1">
          <CardTitle className="text-lg sm:text-xl">Brand Information</CardTitle>
          <CardDescription className="text-xs sm:text-sm">
            Tell us about your brand to help generate personalized content
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="brandName" className="text-sm sm:text-base">Brand Name *</Label>
                <Input
                  id="brandName"
                  name="brandName"
                  placeholder="e.g., Acme Inc."
                  value={brandInfo.brandName}
                  onChange={handleInputChange}
                  className="text-sm"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience" className="text-sm sm:text-base">Target Audience *</Label>
                <Input
                  id="targetAudience"
                  name="targetAudience"
                  placeholder="e.g., Small business owners, 25-45"
                  value={brandInfo.targetAudience}
                  onChange={handleInputChange}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessDescription" className="text-sm sm:text-base">Business/Project Description *</Label>
              <Textarea
                id="businessDescription"
                name="businessDescription"
                placeholder="Describe what your business or project does"
                rows={3}
                value={brandInfo.businessDescription}
                onChange={handleInputChange}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Content Themes *</Label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {defaultThemes.map((theme) => (
                  <div key={theme.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`theme-${theme.id}`}
                      checked={brandInfo.contentThemes.includes(theme.id)}
                      onCheckedChange={(checked) =>
                        handleThemeChange(theme.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`theme-${theme.id}`}
                      className="text-xs sm:text-sm font-normal"
                    >
                      {theme.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm sm:text-base">Preferred Tone *</Label>
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 sm:grid-cols-3">
                {defaultTones.map((tone) => (
                  <div key={tone.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tone-${tone.id}`}
                      checked={brandInfo.tone === tone.id}
                      onCheckedChange={() => handleToneChange(tone.id)}
                    />
                    <Label
                      htmlFor={`tone-${tone.id}`}
                      className="text-xs sm:text-sm font-normal"
                    >
                      {tone.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialDays" className="text-sm sm:text-base">Special Days or Promotions (Optional)</Label>
              <Textarea
                id="specialDays"
                name="specialDays"
                placeholder="e.g., Product launch on May 15, Black Friday sale"
                rows={2}
                value={brandInfo.specialDays}
                onChange={handleInputChange}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ctaExamples" className="text-sm sm:text-base">Call-to-Action Examples (Optional)</Label>
              <Textarea
                id="ctaExamples"
                name="ctaExamples"
                placeholder="e.g., Visit our website, Book a free consultation"
                rows={2}
                value={brandInfo.ctaExamples}
                onChange={handleInputChange}
                className="text-sm"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center pt-4 border-t space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="ai-toggle"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label htmlFor="ai-toggle" className="font-medium text-sm sm:text-base">
                  Use AI-powered content generation
                </Label>
              </div>
              <div className="text-xs sm:text-sm text-gray-500 sm:ml-2">
                {useAI ? "(Recommended for unique, tailored content)" : "(Using template-based generation)"}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center pt-4 border-t space-y-2 sm:space-y-0 sm:space-x-2 bg-blue-50 p-3 rounded-md">
              <div className="flex items-center space-x-2">
                <div className="text-xs sm:text-sm text-gray-700">
                  <span className="font-medium">Using DeepSeek & Groq APIs</span> - Generating high-quality content with advanced AI models
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row">
          <Button type="submit" className="w-full text-sm sm:text-base" disabled={isGenerating}>
            {isGenerating ? "Generating Plan..." : `Generate ${useAI ? "AI" : "Template"} Content Plan`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default BrandInfoForm;
