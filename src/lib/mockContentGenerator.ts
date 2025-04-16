import { v4 as uuidv4 } from 'uuid';
import { BrandInfo, Post, PostPlan } from '@/types';

// Generate a mock content plan when AI generation fails
export const generateMockContentPlan = (brandInfo: BrandInfo, viralData?: any): PostPlan => {
  console.log('Generating mock content plan as fallback');
  
  const platforms = ['facebook', 'twitter', 'linkedin'];
  const mockPlan: PostPlan = [];
  
  // Generate 2 posts for each platform
  platforms.forEach(platform => {
    for (let i = 0; i < 2; i++) {
      mockPlan.push(generateMockPost(platform, brandInfo, viralData));
    }
  });
  
  return mockPlan;
};

// Generate a single mock post
const generateMockPost = (platform: string, brandInfo: BrandInfo, viralData?: any): Post => {
  const brandName = brandInfo.brandName || 'Your Brand';
  const isNigerian = viralData?.useNigerianStyle || false;
  
  // Generate content based on platform and viral data
  let content = '';
  let hashtags: string[] = [];
  
  if (platform === 'facebook') {
    content = generateMockFacebookPost(brandName, isNigerian);
    hashtags = ['marketing', 'business', 'success'];
  } else if (platform === 'twitter') {
    content = generateMockTwitterPost(brandName, isNigerian);
    hashtags = ['tips', 'growth', 'strategy'];
  } else if (platform === 'linkedin') {
    content = generateMockLinkedInPost(brandName, isNigerian);
    hashtags = ['professional', 'career', 'networking'];
  }
  
  return {
    id: uuidv4(),
    platform,
    content,
    hashtags,
    date: new Date().toISOString(),
    theme: viralData?.postType || 'general'
  };
};

// Generate mock Facebook post
const generateMockFacebookPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `Have you been struggling to grow your business in this economy? You're not alone.

At ${brandName}, we've helped hundreds of Nigerian businesses increase their revenue by 30% in just 3 months.

What's the secret? It's not just about working harder - it's about working smarter with the right strategies.

Want to know how we can help your business thrive even in these challenging times? Drop a comment below or send us a message to learn more about our proven system.`;
  } else {
    return `Did you know that 87% of businesses fail within the first 5 years?

At ${brandName}, we're on a mission to change that statistic. We've developed a proven system that has helped our clients increase their revenue by an average of 35% in their first year working with us.

The difference? Strategic planning and execution that's tailored to your specific business needs.

Ready to be part of the successful 13%? Let's talk about how we can help you achieve sustainable growth.`;
  }
};

// Generate mock Twitter post
const generateMockTwitterPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `Stop wasting money on marketing that doesn't work! At ${brandName}, we've helped businesses like yours double their ROI in 90 days. Want to know how?`;
  } else {
    return `The #1 mistake most businesses make is focusing on vanity metrics instead of revenue-generating activities. At ${brandName}, we focus on what actually drives growth.`;
  }
};

// Generate mock LinkedIn post
const generateMockLinkedInPost = (brandName: string, isNigerian: boolean): string => {
  if (isNigerian) {
    return `I recently worked with a client who was struggling to make sales despite having an excellent product.

The problem? Their messaging wasn't connecting with their target audience.

After implementing our proprietary framework at ${brandName}, they saw a 45% increase in conversions within just 30 days.

Here's what we did differently:

1. We identified the actual pain points of their customers (not what they assumed)
2. We restructured their messaging to address these specific challenges
3. We implemented a follow-up system that nurtures leads effectively

The result? Not just more sales, but higher quality clients who stay longer and spend more.

If you're struggling to convert your audience into paying customers, the problem might not be your product - it might be your messaging.

Would you like to learn more about how we can help your business achieve similar results?`;
  } else {
    return `Three years ago, I was where many of you are now - working 80+ hour weeks and still not seeing the growth I wanted in my business.

Then I discovered a framework that changed everything. It helped me:
• Cut my working hours in half
• Double my revenue
• Build a team that can operate without my constant involvement

Today at ${brandName}, we help entrepreneurs implement this same framework in their businesses.

The key insight? Most business owners focus on tactics when they should be focusing on systems.

Want to learn how to build systems that scale your business while giving you back your time? Let me know in the comments and I'll share our free resource guide.`;
  }
};
