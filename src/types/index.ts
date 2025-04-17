
export interface BrandInfo {
  brandName: string;
  businessDescription: string;
  targetAudience: string;
  contentThemes: string[];
  tone: string;
  specialDays: string;
  ctaExamples: string;
  contentLength?: 'short' | 'mid' | 'full';
}

export interface Post {
  id: string;
  date: string;
  platform: 'facebook' | 'twitter' | 'linkedin';
  content: string;
  hashtags: string[];
}

export type PostPlan = Post[];
