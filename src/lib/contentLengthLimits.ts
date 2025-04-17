// Define character limits for different platforms and content lengths
export interface PlatformLimits {
  maxCharacters: number;
  shortForm: number;
  midForm: number;
}

export const platformLimits: Record<string, PlatformLimits> = {
  twitter: {
    maxCharacters: 280, // Standard Twitter character limit
    midForm: 140,       // Half of max
    shortForm: 70,      // Quarter of max
  },
  linkedin: {
    maxCharacters: 1248, // LinkedIn post character limit
    midForm: 624,        // Half of max
    shortForm: 312,      // Quarter of max
  },
  facebook: {
    maxCharacters: 2000, // Optimal Facebook post length (though actual limit is much higher)
    midForm: 1000,       // Half of max
    shortForm: 500,      // Quarter of max
  },
};

// Get the character limit based on platform and content length preference
export const getCharacterLimit = (
  platform: 'facebook' | 'twitter' | 'linkedin',
  contentLength: 'short' | 'mid' | 'full'
): number => {
  const limits = platformLimits[platform];
  
  if (!limits) {
    return 1000; // Default fallback
  }
  
  switch (contentLength) {
    case 'short':
      return limits.shortForm;
    case 'mid':
      return limits.midForm;
    case 'full':
    default:
      return limits.maxCharacters;
  }
};
