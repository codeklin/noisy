import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

// Define the audience types
const audienceTypes = [
  { id: "students", label: "Students" },
  { id: "professionals", label: "Professionals" },
  { id: "entrepreneurs", label: "Entrepreneurs" },
  { id: "marketers", label: "Marketers" },
  { id: "creatives", label: "Creatives" },
  { id: "tech-enthusiasts", label: "Tech Enthusiasts" },
  { id: "business-owners", label: "Business Owners" },
];

// Define the content goals
const contentGoals = [
  { id: "get-followers", label: "Get Followers" },
  { id: "generate-leads", label: "Generate Leads" },
  { id: "book-calls", label: "Book Calls" },
  { id: "sell-product", label: "Sell Product" },
];

// Define the copy styles
const copyStyles = [
  { id: "friendly-expert", label: "Friendly Expert" },
  { id: "bold-challenger", label: "Bold Challenger" },
  { id: "smart-mentor", label: "Smart Mentor" },
];

// Define the post types
const postTypes = [
  { id: "storytelling", label: "Storytelling" },
  { id: "how-to", label: "How-To" },
  { id: "mistake-post", label: "Mistake Post" },
  { id: "listicle", label: "Listicle" },
  { id: "cta-promo", label: "CTA Promo" },
];

// Define the tone preferences
const tonePreferences = [
  { id: "authoritative", label: "Authoritative" },
  { id: "empathetic", label: "Empathetic" },
  { id: "witty", label: "Witty" },
];

// Define the age ranges
const ageRanges = [
  { id: "10-12", label: "10-12 Graders" },
  { id: "university", label: "University Students" },
  { id: "18-25", label: "18-25 Years" },
  { id: "26-35", label: "26-35 Years" },
  { id: "36-45", label: "36-45 Years" },
  { id: "46-plus", label: "46+ Years" },
];

export interface ViralContentFormData {
  audience: string[];
  contentGoal: string;
  copyStyle: string;
  postType: string;
  tonePreference: string;
  ageRanges: string[];
  targetDescription: string;
  useNigerianStyle: boolean;
}

interface ViralContentFormProps {
  onSubmit: (formData: ViralContentFormData) => void;
  isGenerating: boolean;
  useAI: boolean;
  setUseAI: (useAI: boolean) => void;
}

const ViralContentForm = ({ onSubmit, isGenerating, useAI, setUseAI }: ViralContentFormProps) => {
  const [formData, setFormData] = useState<ViralContentFormData>({
    audience: [],
    contentGoal: "generate-leads",
    copyStyle: "friendly-expert",
    postType: "storytelling",
    tonePreference: "empathetic",
    ageRanges: [],
    targetDescription: "",
    useNigerianStyle: false,
  });

  const handleAudienceChange = (audienceId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, audience: [...prev.audience, audienceId] };
      } else {
        return {
          ...prev,
          audience: prev.audience.filter((id) => id !== audienceId),
        };
      }
    });
  };

  const handleAgeRangeChange = (ageRangeId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, ageRanges: [...prev.ageRanges, ageRangeId] };
      } else {
        return {
          ...prev,
          ageRanges: prev.ageRanges.filter((id) => id !== ageRangeId),
        };
      }
    });
  };

  const handleRadioChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleToggleChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, useNigerianStyle: checked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.audience.length === 0) {
      toast.error("Please select at least one target audience");
      return;
    }

    if (formData.ageRanges.length === 0) {
      toast.error("Please select at least one age range");
      return;
    }

    try {
      // Call the onSubmit function with the form data
      onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form. Please try again.");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card className="w-full">
        <CardHeader className="bg-[#6E5DC6]/10 rounded-t-xl">
          <CardTitle className="text-[#6E5DC6]">Viral Content Generator</CardTitle>
          <CardDescription>
            Create high-converting content using proven strategies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Target Audience</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {audienceTypes.map((audience) => (
                  <div key={audience.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`audience-${audience.id}`}
                      checked={formData.audience.includes(audience.id)}
                      onCheckedChange={(checked) =>
                        handleAudienceChange(audience.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`audience-${audience.id}`}
                      className="text-sm font-normal"
                    >
                      {audience.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Content Goal</Label>
              <RadioGroup
                value={formData.contentGoal}
                onValueChange={(value) => handleRadioChange("contentGoal", value)}
                className="grid grid-cols-2 gap-2 sm:grid-cols-4"
              >
                {contentGoals.map((goal) => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={goal.id} id={`goal-${goal.id}`} />
                    <Label htmlFor={`goal-${goal.id}`} className="text-sm font-normal">
                      {goal.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Copy Style</Label>
              <RadioGroup
                value={formData.copyStyle}
                onValueChange={(value) => handleRadioChange("copyStyle", value)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {copyStyles.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={style.id} id={`style-${style.id}`} />
                    <Label htmlFor={`style-${style.id}`} className="text-sm font-normal">
                      {style.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Post Type</Label>
              <RadioGroup
                value={formData.postType}
                onValueChange={(value) => handleRadioChange("postType", value)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {postTypes.map((type) => (
                  <div key={type.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={type.id} id={`type-${type.id}`} />
                    <Label htmlFor={`type-${type.id}`} className="text-sm font-normal">
                      {type.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Tone Preference</Label>
              <RadioGroup
                value={formData.tonePreference}
                onValueChange={(value) => handleRadioChange("tonePreference", value)}
                className="grid grid-cols-1 gap-2 sm:grid-cols-3"
              >
                {tonePreferences.map((tone) => (
                  <div key={tone.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={tone.id} id={`tone-${tone.id}`} />
                    <Label htmlFor={`tone-${tone.id}`} className="text-sm font-normal">
                      {tone.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label>Target Age Range</Label>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {ageRanges.map((ageRange) => (
                  <div key={ageRange.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`age-${ageRange.id}`}
                      checked={formData.ageRanges.includes(ageRange.id)}
                      onCheckedChange={(checked) =>
                        handleAgeRangeChange(ageRange.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`age-${ageRange.id}`}
                      className="text-sm font-normal"
                    >
                      {ageRange.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDescription">Additional Target Description (Optional)</Label>
              <Textarea
                id="targetDescription"
                name="targetDescription"
                placeholder="Describe your target audience in more detail..."
                rows={3}
                value={formData.targetDescription}
                onChange={handleTextChange}
              />
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="nigerian-style"
                checked={formData.useNigerianStyle}
                onCheckedChange={handleToggleChange}
              />
              <Label htmlFor="nigerian-style" className="font-medium">
                Use Nigerian Content Style
              </Label>
              <div className="text-sm text-gray-500 ml-2">
                (Optimized for Nigerian audience with local context)
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-4 border-t">
              <Switch
                id="ai-toggle"
                checked={useAI}
                onCheckedChange={setUseAI}
              />
              <Label htmlFor="ai-toggle" className="font-medium">
                Use AI-powered content generation
              </Label>
              <div className="text-sm text-gray-500 ml-2">
                {useAI ? "(Recommended for unique, tailored content)" : "(Using template-based generation)"}
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-[#6E5DC6]/5 rounded-b-xl">
          <Button type="submit" className="w-full bg-[#6E5DC6] hover:bg-[#5D4DB3]" disabled={isGenerating}>
            {isGenerating ? "Generating Content..." : `Generate ${useAI ? "AI-Powered" : "Template-Based"} Viral Content`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default ViralContentForm;
