// Prompt templates for different content generation scenarios

/**
 * Creates a platform-specific prompt for viral Nigerian content
 */
export const createViralNigerianContentPrompt = (
  platform: 'facebook' | 'twitter' | 'linkedin',
  audience: string,
  goal: 'Get followers' | 'Generate leads' | 'Book calls' | 'Sell product',
  style: 'Friendly Expert' | 'Bold Challenger' | 'Smart Mentor',
  postType: 'Storytelling' | 'How-To' | 'Mistake Post' | 'Listicle' | 'CTA Promo',
  tone: 'Authoritative' | 'Empathetic' | 'Witty',
  ageRange: string,
  extraDescription: string = ''
): string => {
  return `
You are a viral social media strategist specializing in Nigerian content. Given the following inputs:
- Audience: Nigerian ${audience}
- Goal: ${goal}
- Style: ${style}
- Platform: ${platform}
- Post Type: ${postType}
- Tone: ${tone}
- Age Range: ${ageRange}
- Extra Target Description: ${extraDescription}

Generate a scroll-stopping post (text only, no emojis), written in ${style} tone with a ${tone} approach. 

IMPORTANT GUIDELINES:
1. HOOK: Start with a powerful hook using one of these techniques:
   - Bold or controversial opinion
   - Empathy-driven question that resonates with the audience
   - Contrast between common belief and reality
   - Shocking statistic or claim

2. BODY: Follow with ${postType === 'Storytelling' ? 'a compelling personal story or anecdote' : 
         postType === 'How-To' ? 'clear, actionable steps that provide immediate value' :
         postType === 'Mistake Post' ? 'common mistakes the audience makes and how to fix them' :
         postType === 'Listicle' ? 'a numbered list of valuable insights or tips' :
         'a compelling promotion that focuses on benefits not features'}

3. CULTURAL RELEVANCE: 
   - Include Nigerian context, local references, or culturally relevant examples
   - Use appropriate tone that resonates with ${ageRange} Nigerian ${audience}
   ${platform === 'twitter' ? '- Keep it concise but impactful' : ''}
   ${platform === 'linkedin' ? '- Maintain professional tone while being relatable' : ''}
   ${platform === 'facebook' ? '- Create a conversational tone that encourages comments' : ''}

4. SOCIAL PROOF: Include subtle references to results or transformations

5. CTA: End with a subtle but clear call-to-action aligned with the goal to ${goal}

FORMAT FOR ${platform.toUpperCase()}:
${platform === 'linkedin' ? '- Use paragraph breaks for readability\n- Consider using bullet points or numbered lists where appropriate\n- Professional but conversational tone' : ''}
${platform === 'twitter' ? '- Concise and punchy\n- If suggesting a thread, indicate with (1/🧵)\n- Leave room for hashtags to be added separately' : ''}
${platform === 'facebook' ? '- Use paragraph breaks for readability\n- Conversational and engaging\n- End with a question to encourage comments' : ''}

Write like top Nigerian creators such as Fisayo Fosudo or Matt Lakajev. Focus on creating content that would make someone stop scrolling.
`;
};

/**
 * Creates a platform-specific prompt for viral sales copy
 */
export const createViralSalesCopyPrompt = (
  platform: 'facebook' | 'twitter' | 'linkedin',
  audience: string,
  goal: 'Get followers' | 'Generate leads' | 'Book calls' | 'Sell product',
  style: 'Friendly Expert' | 'Bold Challenger' | 'Smart Mentor',
  postType: 'Storytelling' | 'How-To' | 'Mistake Post' | 'Listicle' | 'CTA Promo',
  tone: 'Authoritative' | 'Empathetic' | 'Witty',
  ageRange: string,
  extraDescription: string = ''
): string => {
  // Template inspired by top creators like Tim Keen, Matt Gray, Charlie Hills, etc.
  return `
You are a viral sales copy expert who studies strategies of top creators like Tim Keen, Matt Gray, Charlie Hills, and Audrey Chia. Given the following inputs:
- Audience: ${audience}
- Goal: ${goal}
- Style: ${style}
- Platform: ${platform}
- Post Type: ${postType}
- Tone: ${tone}
- Age Range: ${ageRange}
- Extra Target Description: ${extraDescription}

Generate a high-converting ${platform} post (text only, no emojis) that will help ${goal.toLowerCase()}.

PLATFORM-SPECIFIC STRATEGY:
${platform === 'linkedin' ? 
'- Clear, compelling hook within first 2 lines\n- Relatable story that evokes emotion\n- Use whitespace for readability\n- Provide real value (frameworks, templates, insights)\n- End with engaging question or strong CTA' : ''}
${platform === 'twitter' ? 
'- Strong hook in first line (stat, bold opinion, or surprising claim)\n- Format as a potential thread starter\n- Leverage data, unique insights, or controversial takes\n- Make it shareable\n- Keep it concise but impactful' : ''}
${platform === 'facebook' ? 
'- Start with attention-grabbing hook\n- Use storytelling to create emotional connection\n- Format for easy mobile reading\n- Include subtle social proof\n- End with engagement prompt' : ''}

POST STRUCTURE:
1. HOOK: ${
  postType === 'Storytelling' ? 'Begin with an intriguing story opener that creates curiosity' :
  postType === 'How-To' ? 'Start with the end result your how-to will deliver' :
  postType === 'Mistake Post' ? 'Lead with a common mistake that costs your audience' :
  postType === 'Listicle' ? 'Open with why your list matters to the reader' :
  'Start with the biggest benefit your offer provides'
}

2. BODY: Follow the "${
  postType === 'Storytelling' ? 'Problem > Story > Result > CTA' :
  postType === 'How-To' ? 'Problem > Promise > Proof > Process > CTA' :
  postType === 'Mistake Post' ? '3 Mistakes [Target Audience] Makes and How to Fix Them' :
  postType === 'Listicle' ? 'Why This Matters > Valuable List > Application > CTA' :
  'Problem > Solution > Proof > Offer > CTA'
}" template

3. CTA: Use a ${goal === 'Get followers' ? 'follow-focused' : 
         goal === 'Generate leads' ? 'lead generation' : 
         goal === 'Book calls' ? 'call booking' : 
         'purchase-oriented'} call-to-action that is subtle yet effective

Write in a ${tone} tone that matches the ${style} style. Make it feel authentic and valuable, not salesy.
`;
};

/**
 * Creates a general content prompt based on brand info
 */
export const createBrandContentPrompt = (
  platform: 'facebook' | 'twitter' | 'linkedin',
  theme: string,
  brandInfo: any
): string => {
  return `
Create a social media post for ${platform.toUpperCase()} with the theme "${theme}" for a brand called "${brandInfo.brandName}".

BRAND INFORMATION:
- Description: ${brandInfo.businessDescription}
- Target audience: ${brandInfo.targetAudience}
- Tone: ${brandInfo.tone}
- Call to action examples: ${brandInfo.ctaExamples || "Visit our website, Learn more, Contact us"}

PLATFORM-SPECIFIC GUIDELINES:
${platform === 'facebook' ? 
'- Create an engaging, conversational post that encourages interaction\n- Length: 100-250 words\n- Include a question or call-to-action to encourage comments\n- Use appropriate formatting for readability\n- Make it personal and relatable to the target audience' : ''}
${platform === 'twitter' ? 
'- Create a concise, impactful post\n- Maximum 280 characters\n- Be direct and attention-grabbing\n- Use a conversational tone\n- Include a clear call-to-action if appropriate' : ''}
${platform === 'linkedin' ? 
'- Create a professional, value-driven post\n- Length: 150-300 words\n- Include industry insights or professional advice\n- Format with paragraph breaks and bullet points if appropriate\n- Maintain a professional tone while being conversational\n- Focus on providing value and establishing expertise\n- Include a thoughtful question or call-to-action at the end' : ''}

IMPORTANT:
- DO NOT include hashtags in the content as they will be added separately
- Create ONLY the post content, no title or other metadata
- Make sure the content is unique and specifically tailored to this brand
- Ensure the content reflects the specified theme: "${theme}"
- Match the brand's tone: "${brandInfo.tone}"

POST CONTENT:
`;
};
