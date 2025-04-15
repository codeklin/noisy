import { HfInference } from '@huggingface/inference';
import { BrandInfo, Post, PostPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format, addDays } from "date-fns";

// Initialize the Hugging Face Inference client
// You can use a free API token from Hugging Face
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'hf_dummy_key_for_testing');

// Helper function to generate content for a specific platform and theme
const generateContentWithLLM = async (
  platform: 'facebook' | 'twitter' | 'linkedin',
  theme: string,
  brandInfo: BrandInfo
): Promise<string> => {
  // Create a prompt for the LLM based on the brand info and content requirements
  const prompt = `
Generate a social media post for ${platform} with the theme "${theme}" for a brand called "${brandInfo.brandName}".

Brand information:
- Description: ${brandInfo.businessDescription}
- Target audience: ${brandInfo.targetAudience}
- Tone: ${brandInfo.tone}
- Call to action examples: ${brandInfo.ctaExamples || "Visit our website, Learn more, Contact us"}

The post should be engaging, relevant to the platform (${platform}), and include appropriate formatting.
For Twitter, keep it concise (under 280 characters).
For LinkedIn, make it professional and industry-relevant.
For Facebook, make it conversational and engaging.

Do not include hashtags in the content as they will be added separately.
`;

  try {
    // Use a text generation model from Hugging Face
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      }
    });

    // Clean up the response
    let content = response.generated_text.trim();
    
    // Remove any hashtags that might have been generated
    content = content.replace(/#\w+/g, '').trim();
    
    return content;
  } catch (error) {
    console.error("Error generating content with LLM:", error);
    // Fallback to a simple template if the LLM fails
    return `Check out ${brandInfo.brandName} for the best ${theme} solutions for ${brandInfo.targetAudience}!`;
  }
};

// Generate hashtags based on brand info and theme
const generateHashtags = (theme: string, brandInfo: BrandInfo, platform: string): string[] => {
  // Create a base set of hashtags
  const baseHashtags = [
    brandInfo.brandName.toLowerCase().replace(/\s+/g, ''),
    theme.replace(/[-\\s]+/g, ''),
    brandInfo.tone.toLowerCase().replace(/\s+/g, '')
  ];
  
  // Add platform-specific hashtags
  const platformTags: string[] = [];
  switch (platform) {
    case 'facebook':
      platformTags.push('socialmedia', 'community');
      break;
    case 'twitter':
      platformTags.push('twitter');
      break;
    case 'linkedin':
      platformTags.push('professional', 'business');
      break;
  }
  
  // Add trending hashtags
  const trendingTags = [
    'trending2025',
    'innovation',
    'digitalmarketing',
    'artificialintelligence'
  ];
  
  // Combine all hashtags and take a subset
  const allTags = [...baseHashtags, ...platformTags, ...trendingTags];
  const numTags = Math.floor(Math.random() * 3) + 3; // 3 to 5 hashtags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

// Generate a single post using LLM
export const generateAIPost = async (
  date: string,
  platform: 'facebook' | 'twitter' | 'linkedin',
  theme: string,
  brandInfo: BrandInfo
): Promise<Post> => {
  // Generate content using LLM
  const content = await generateContentWithLLM(platform, theme, brandInfo);
  
  // Generate hashtags
  const hashtags = generateHashtags(theme, brandInfo, platform);
  
  return {
    id: uuidv4(),
    date,
    platform,
    content,
    hashtags,
  };
};

// Generate a full content plan using LLM
export const generateAIContentPlan = async (brandInfo: BrandInfo): Promise<PostPlan> => {
  const startDate = new Date();
  const numDays = 14; // Generate 2 weeks worth of content
  const platforms: ('facebook' | 'twitter' | 'linkedin')[] = ['facebook', 'twitter', 'linkedin'];
  const posts: Post[] = [];
  
  // Helper function to get content theme for each day
  const getContentThemeForDay = (day: number, contentThemes: string[]) => {
    return contentThemes[day % contentThemes.length];
  };
  
  // Generate posts for each day and platform
  for (let i = 0; i < numDays; i++) {
    const currentDate = addDays(startDate, i);
    const dateString = format(currentDate, 'MMM dd, yyyy');
    
    // Get theme for this day
    const theme = getContentThemeForDay(i, brandInfo.contentThemes);
    
    // Generate one post per platform for this day
    for (const platform of platforms) {
      const post = await generateAIPost(dateString, platform, theme, brandInfo);
      posts.push(post);
    }
  }
  
  return posts;
};
