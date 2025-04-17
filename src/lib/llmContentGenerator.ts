import { BrandInfo, Post, PostPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format, addDays } from "date-fns";

// We'll use a mock generator when no API keys are available
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const HUGGINGFACE_API_KEY = process.env.HUGGINGFACE_API_KEY;
const TOGETHER_API_KEY = process.env.TOGETHER_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

import { createBrandContentPrompt, createViralNigerianContentPrompt, createViralSalesCopyPrompt } from './promptTemplates';

// Create platform-specific prompts based on input parameters
const createPromptForPlatform = (platform: 'facebook' | 'twitter' | 'linkedin', theme: string, brandInfo: BrandInfo, viralContentData?: any): string => {
  // If viral content data is provided, use the appropriate viral content prompt
  if (viralContentData) {
    const { audience, contentGoal, copyStyle, postType, tonePreference, ageRanges, targetDescription, useNigerianStyle } = viralContentData;

    // Map form values to expected prompt parameters
    const mappedGoal = contentGoal === 'get-followers' ? 'Get followers' :
                      contentGoal === 'generate-leads' ? 'Generate leads' :
                      contentGoal === 'book-calls' ? 'Book calls' : 'Sell product';

    const mappedStyle = copyStyle === 'friendly-expert' ? 'Friendly Expert' :
                       copyStyle === 'bold-challenger' ? 'Bold Challenger' : 'Smart Mentor';

    const mappedPostType = postType === 'storytelling' ? 'Storytelling' :
                          postType === 'how-to' ? 'How-To' :
                          postType === 'mistake-post' ? 'Mistake Post' :
                          postType === 'listicle' ? 'Listicle' : 'CTA Promo';

    const mappedTone = tonePreference === 'authoritative' ? 'Authoritative' :
                      tonePreference === 'empathetic' ? 'Empathetic' : 'Witty';

    // Join audience and age ranges for the prompt
    const audienceStr = audience.join(', ');
    const ageRangeStr = ageRanges.join(', ');

    // Use Nigerian content style if selected, otherwise use sales copy style
    if (useNigerianStyle) {
      return createViralNigerianContentPrompt(
        platform,
        audienceStr,
        mappedGoal as any,
        mappedStyle as any,
        mappedPostType as any,
        mappedTone as any,
        ageRangeStr,
        targetDescription
      );
    } else {
      return createViralSalesCopyPrompt(
        platform,
        audienceStr,
        mappedGoal as any,
        mappedStyle as any,
        mappedPostType as any,
        mappedTone as any,
        ageRangeStr,
        targetDescription
      );
    }
  }

  // If no viral content data, use the standard brand content prompt
  return createBrandContentPrompt(platform, theme, brandInfo);
};

// Try to generate content using Google Gemini API (free tier available)
const generateWithGemini = async (prompt: string): Promise<string | null> => {
  if (!GEMINI_API_KEY) {
    console.warn('Gemini API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with Gemini API...');
    // Use the correct API endpoint for Gemini 1.0 Pro
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.0-pro:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 800,
          topP: 0.95
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Gemini API error: ${response.status}`, errorText);
      throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Gemini API response received');

    // Extract the text from the response
    if (data.candidates && data.candidates[0] && data.candidates[0].content &&
        data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
      return data.candidates[0].content.parts[0].text.trim();
    } else if (data.candidates && data.candidates[0] && data.candidates[0].text) {
      // Handle alternative response format
      return data.candidates[0].text.trim();
    }
    console.warn('Unexpected Gemini API response format', data);
    return null;
  } catch (error) {
    console.error('Gemini generation error:', error);
    return null;
  }
};

// Try to generate content using Hugging Face API
const generateWithHuggingFace = async (prompt: string): Promise<string | null> => {
  if (!HUGGINGFACE_API_KEY) {
    console.warn('HuggingFace API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with HuggingFace API...');
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    // Use a smaller model that's available for free
    const response = await fetch('https://api-inference.huggingface.co/models/facebook/opt-350m', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${HUGGINGFACE_API_KEY}`
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          top_p: 0.95,
          repetition_penalty: 1.2,
        }
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`HuggingFace API error: ${response.status}`, errorText);
      throw new Error(`HuggingFace API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('HuggingFace API response received');
    return data.generated_text?.trim() || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('HuggingFace request timed out');
    } else {
      console.error('HuggingFace generation error:', error);
    }
    return null;
  }
};

// Try to generate content using Mistral API (free tier available)
const generateWithMistral = async (prompt: string): Promise<string | null> => {
  if (!MISTRAL_API_KEY) {
    console.warn('Mistral API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with Mistral API...');
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${MISTRAL_API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral-small-latest',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator specializing in social media content. Create engaging, concise content that drives engagement and sales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Mistral API error: ${response.status}`, errorText);
      throw new Error(`Mistral API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Mistral API response received');
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Mistral request timed out');
    } else {
      console.error('Mistral generation error:', error);
    }
    return null;
  }
};

// Try to generate content using DeepSeek API (free tier available)
const generateWithDeepSeek = async (prompt: string): Promise<string | null> => {
  if (!DEEPSEEK_API_KEY) {
    console.warn('DeepSeek API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with DeepSeek API...');
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator specializing in social media content. Create engaging, concise content that drives engagement and sales.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`DeepSeek API error: ${response.status}`, errorText);
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('DeepSeek API response received');
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('DeepSeek request timed out');
    } else {
      console.error('DeepSeek generation error:', error);
    }
    return null;
  }
};

// Try to generate content using Groq API (free tier available)
const generateWithGroq = async (prompt: string): Promise<string | null> => {
  if (!GROQ_API_KEY) {
    console.warn('Groq API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with Groq API...');
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama2-70b-4096',
        messages: [
          {
            role: 'system',
            content: 'You are a professional content creator specializing in social media content. Create engaging, concise content that drives engagement.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Groq API error: ${response.status}`, errorText);
      throw new Error(`Groq API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Groq API response received');
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Groq request timed out');
    } else {
      console.error('Groq generation error:', error);
    }
    return null;
  }
};

// Try to generate content using Together.ai API (free tier available)
const generateWithTogether = async (prompt: string): Promise<string | null> => {
  if (!TOGETHER_API_KEY) {
    console.warn('Together API key is not set');
    return null;
  }

  try {
    console.log('Attempting to generate content with Together API...');
    // Set a timeout for the fetch request to prevent hanging
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.together.xyz/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOGETHER_API_KEY}`
      },
      body: JSON.stringify({
        // Use a smaller model that's available for free
        model: 'togethercomputer/RedPajama-INCITE-Chat-3B-v1',
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.95,
        repetition_penalty: 1.2,
      }),
      signal: controller.signal
    });

    // Clear the timeout
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Together API error: ${response.status}`, errorText);
      throw new Error(`Together API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Together API response received');
    return data.choices?.[0]?.text?.trim() || null;
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.error('Together.ai request timed out');
    } else {
      console.error('Together.ai generation error:', error);
    }
    return null;
  }
};

// Generate mock content for testing without API keys
const generateMockContent = (platform: 'facebook' | 'twitter' | 'linkedin', theme: string, brandInfo: BrandInfo): string => {
  const { brandName, targetAudience, tone } = brandInfo;

  // Platform-specific templates
  const templates = {
    facebook: [
      `🌟 Exciting news from ${brandName}! We've been working on some amazing ${theme} solutions designed specifically for ${targetAudience}.

Our team has been listening to your feedback and we're thrilled to share our latest innovations. What features would you most like to see in our upcoming releases? Drop your thoughts in the comments below! 💭

Remember to check out our website for more details on how we're revolutionizing ${theme} in 2025!`,

      `Hey there! 👋 Did you know that ${brandName} has been helping ${targetAudience} transform their approach to ${theme} since 2023?

We're passionate about creating solutions that actually work for real people with real challenges.

What's your biggest struggle with ${theme} right now? Share below and let's start a conversation about how we can help!`,

      `Monday motivation from the ${brandName} team! 💪

We believe that every ${targetAudience} deserves access to quality ${theme} resources. That's why we've dedicated ourselves to creating the most user-friendly, effective solutions on the market.

What motivates YOU to improve your ${theme} strategy? Let us know in the comments!`
    ],
    twitter: [
      `New ${theme} insights from ${brandName}! We're helping ${targetAudience} achieve better results in 2025. Check out our latest solutions!`,

      `${brandName} tip: The key to successful ${theme} is consistency and quality. Our team is here to help ${targetAudience} excel!`,

      `Just launched: Our updated ${theme} toolkit for ${targetAudience}. Designed with your feedback in mind. What feature are you most excited about?`
    ],
    linkedin: [
      `At ${brandName}, we're committed to transforming how ${targetAudience} approach ${theme} in today's rapidly evolving landscape.

Our research indicates that organizations implementing strategic ${theme} solutions are seeing 37% better outcomes compared to traditional approaches.

We've identified three key factors driving this success:

1. Data-driven decision making
2. Customized implementation strategies
3. Ongoing optimization and support

How is your organization currently measuring the effectiveness of your ${theme} initiatives? We'd love to hear your experiences in the comments below.`,

      `Industry Insight: The Future of ${theme} for ${targetAudience}

At ${brandName}, we've been tracking the evolution of ${theme} methodologies since 2020, and the transformation has been remarkable.

What we're seeing in 2025 is a fundamental shift toward more integrated, holistic approaches that consider the entire ecosystem rather than isolated components.

This perspective has allowed our clients to achieve significantly better outcomes while actually reducing implementation complexity.

What changes have you observed in your ${theme} strategy over the past few years? Has your approach evolved to keep pace with industry developments?`,

      `Professional development in the ${theme} space continues to be a critical factor for ${targetAudience} looking to advance their careers in 2025.

At ${brandName}, we've developed a comprehensive framework to help professionals identify and address skill gaps in this rapidly evolving field.

Our latest research indicates that professionals who engage in structured, continuous learning in ${theme} see 42% faster career advancement compared to those who rely solely on on-the-job experience.

What professional development resources have you found most valuable in your ${theme} journey? Share your recommendations below.`
    ]
  };

  // Select a random template based on platform
  const platformTemplates = templates[platform];
  const randomTemplate = platformTemplates[Math.floor(Math.random() * platformTemplates.length)];

  return randomTemplate;
};

// Main function to generate content with LLM or fallback to mock
const generateContentWithLLM = async (
  platform: 'facebook' | 'twitter' | 'linkedin',
  theme: string,
  brandInfo: BrandInfo,
  viralContentData?: any
): Promise<string> => {
  // Create the appropriate prompt based on whether viral content data is provided
  const prompt = createPromptForPlatform(platform, theme, brandInfo, viralContentData);
  console.log(`Generating content for ${platform} with theme: ${theme}`);

  // Track which API we're using for better error handling
  let apiUsed = '';

  try {
    let content = null;

    // Always use APIs, never fall back to mock content
    try {
      // Try Mistral API first
      console.log('Attempting to generate content with Mistral...');
      apiUsed = 'mistral';
      content = await generateWithMistral(prompt);

      // If Mistral fails, try DeepSeek API
      if (!content) {
        console.log('Mistral failed, trying DeepSeek...');
        apiUsed = 'deepseek';
        content = await generateWithDeepSeek(prompt);
      }

      // If DeepSeek fails, try Groq API
      if (!content) {
        console.log('DeepSeek failed, trying Groq...');
        apiUsed = 'groq';
        content = await generateWithGroq(prompt);
      }

      // If Groq fails for any reason, try HuggingFace as backup
      if (!content) {
        console.log('Groq failed, trying HuggingFace...');
        apiUsed = 'huggingface';
        content = await generateWithHuggingFace(prompt);
      }
    } catch (apiError) {
      console.error('API error caught:', apiError);

      // Show a toast notification about the error
      try {
        import('sonner').then(({ toast }) => {
          toast.error("API error. Please try again later.");
        }).catch(() => {});
      } catch (e) {}

      // Rethrow the error to be handled by the caller
      throw new Error('Failed to generate content with APIs');
    }

    if (content) {
      console.log(`Successfully generated content with ${apiUsed}`);
    } else {
      // If we still don't have content, throw an error
      throw new Error('Failed to generate content with all available APIs');
    }

    // Clean up the response
    content = content.trim();

    // Remove any hashtags that might have been generated
    content = content.replace(/#\w+/g, '').trim();

    // Remove emojis
    content = content.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '').trim();

    // Remove explanatory headings like HOOK, BODY, etc.
    content = content.replace(/^(HOOK|BODY|SOCIAL PROOF|CTA|CALL TO ACTION|INTRODUCTION|CONCLUSION):\s*/gim, '');
    content = content.replace(/\n(HOOK|BODY|SOCIAL PROOF|CTA|CALL TO ACTION|INTRODUCTION|CONCLUSION):\s*/gim, '\n');

    return content;
  } catch (error) {
    console.error("Error generating content with LLM:", error);
    // Fallback to mock content if everything fails
    console.log('Error caught, using mock content as fallback');
    return generateMockContent(platform, theme, brandInfo);
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
  brandInfo: BrandInfo,
  viralContentData?: any
): Promise<Post> => {
  // Generate content using LLM with optional viral content data
  const content = await generateContentWithLLM(platform, theme, brandInfo, viralContentData);

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
export const generateAIContentPlan = async (brandInfo: BrandInfo, viralContentData?: any): Promise<PostPlan> => {
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
      const post = await generateAIPost(dateString, platform, theme, brandInfo, viralContentData);
      posts.push(post);
    }
  }

  return posts;
};
