
import { BrandInfo, Post, PostPlan } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { format, addDays } from "date-fns";

// Helper function to generate content themes for each day
const getContentThemeForDay = (day: number, contentThemes: string[]) => {
  // Rotate through themes based on day
  return contentThemes[day % contentThemes.length];
};

// Generate random hashtags based on themes and brand
const generateHashtags = (theme: string, brandInfo: BrandInfo, platform: string): string[] => {
  const { brandName, contentThemes, tone } = brandInfo;
  const baseHashtags = [
    brandName.toLowerCase().replace(/\s+/g, ''),
    theme.replace(/[-\s]+/g, ''),
    tone
  ];
  
  // Platform-specific hashtags
  let platformTags: string[] = [];
  
  // Add more variety based on platform
  switch (platform) {
    case 'facebook':
      platformTags = ['socialmedia', 'facebook', 'community'];
      break;
    case 'twitter':
      platformTags = ['twitter', theme.replace(/[-\s]+/g, '')];
      break;
    case 'linkedin':
      platformTags = ['professional', 'business', 'networking'];
      break;
    default:
      platformTags = [];
  }
  
  // Combine and filter
  const allTags = [...baseHashtags, ...platformTags];
  
  // Take a random subset of 3-5 hashtags
  const numTags = Math.floor(Math.random() * 3) + 3; // 3 to 5 hashtags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

// Sample content templates for each platform
const contentTemplates = {
  facebook: {
    'motivation': [
      "Looking for some Monday motivation? 🌟 {{brandName}} believes that {{motivationalQuote}}. How do you stay motivated at the start of your week?",
      "Today we're feeling inspired! 💪 At {{brandName}}, we know that {{motivationalQuote}}. Share your own inspiration in the comments!",
      "Need a mid-week boost? 🚀 Remember: {{motivationalQuote}}. This principle guides everything we do at {{brandName}}."
    ],
    'product-highlights': [
      "Have you discovered our {{productFeature}} yet? It's designed to help {{targetAudience}} achieve {{benefit}}. Learn more on our website! 👉 #{{brandHashtag}}",
      "What makes {{brandName}} different? Our commitment to {{uniqueSellingPoint}}. That's why our {{productFeature}} stands out in the industry.",
      "Did you know? Our {{productFeature}} has helped customers increase their {{benefit}} by up to 40%! Discover how {{brandName}} can transform your experience."
    ],
    'behind-the-scenes': [
      "Ever wonder what happens behind the scenes at {{brandName}}? Today we're giving you a peek into our {{behindTheScenesActivity}}! 📸",
      "Meet the team that makes {{brandName}} possible! Today we're highlighting our {{teamMember}} who ensures {{teamContribution}}.",
      "From concept to completion: here's how we develop our {{productDevelopmentStage}} to ensure the best experience for our {{targetAudience}}."
    ],
    'tips': [
      "Pro tip from {{brandName}}: Want to improve your {{skillArea}}? Try {{actionableTip}}. This simple change can make a big difference!",
      "Here's a quick tip to enhance your {{skillArea}} today: {{actionableTip}}. Our {{targetAudience}} have found this particularly helpful!",
      "Did you know this {{skillArea}} hack? {{actionableTip}}. Share your own tips in the comments!"
    ],
    'quotes': [
      "\"{{inspirationalQuote}}\" - This quote reminds us at {{brandName}} why we're passionate about helping {{targetAudience}}.",
      "Words to live by: \"{{inspirationalQuote}}\" How does this resonate with you?",
      "Our founder's favorite quote: \"{{inspirationalQuote}}\" This philosophy guides everything we do at {{brandName}}."
    ],
    'industry-news': [
      "Breaking news in the {{industry}} industry! {{newsItem}} - Here's what this means for {{targetAudience}} and how {{brandName}} is responding.",
      "Have you heard? {{newsItem}}. This development could transform how {{targetAudience}} approach {{industryActivity}}.",
      "Industry update: {{newsItem}}. At {{brandName}}, we're already adapting our {{productFeature}} to align with these changes."
    ],
    'case-studies': [
      "Success story alert! 🌟 See how {{customerName}} used {{brandName}} to {{customerAchievement}}. The results? {{impressiveStats}}!",
      "Case study: How {{customerName}} overcame {{customerChallenge}} with {{brandName}}. Read the full story on our website!",
      "From challenge to triumph: {{customerName}} faced {{customerChallenge}} until they discovered our {{productFeature}}. Now they're {{customerAchievement}}!"
    ],
    'testimonials': [
      "\"{{brandName}} completely transformed how we {{customerActivity}}. We've seen {{positiveResult}} since implementing their solution.\" - {{customerName}}",
      "Don't just take our word for it! Here's what {{customerName}} had to say: \"{{testimonialQuote}}\" #CustomerLove",
      "We're blushing! 😊 \"{{testimonialQuote}}\" - {{customerName}}, who used {{brandName}} to {{customerAchievement}}."
    ]
  },
  twitter: {
    'motivation': [
      "Monday motivation: {{shortMotivationalQuote}} #MondayMotivation #{{brandHashtag}}",
      "Feeling inspired today! {{shortMotivationalQuote}} What drives you? #Inspiration",
      "Remember: {{shortMotivationalQuote}} - This is what powers our work at {{brandName}} 💪"
    ],
    'product-highlights': [
      "Discover how our {{productFeature}} helps {{targetAudience}} achieve {{benefit}} faster! Learn more: #{{brandHashtag}}",
      "What makes {{brandName}} unique? Our {{uniqueSellingPoint}}. See the difference: #Innovation",
      "New feature alert! 🚨 Introducing {{productFeature}} - designed to {{benefit}} for our users. #ProductLaunch"
    ],
    'behind-the-scenes': [
      "Behind the scenes at {{brandName}} today: {{behindTheScenesActivity}}! #BehindTheScenes #{{brandHashtag}}",
      "Meet {{teamMember}}, the genius behind our {{teamContribution}}! #TeamSpotlight",
      "This is how we {{productDevelopmentStage}} at {{brandName}}. Quality at every step! #ProcessMatters"
    ],
    'tips': [
      "Quick tip: {{shortActionableTip}} #{{skillArea}}Tips #DidYouKnow",
      "Pro hack for {{targetAudience}}: {{shortActionableTip}} Try it today! #QuickTip",
      "Upgrade your {{skillArea}} with this tip: {{shortActionableTip}} #Productivity"
    ],
    'quotes': [
      "\"{{shortInspirationalQuote}}\" Words we live by at {{brandName}}. #QuoteOfTheDay #Inspiration",
      "Today's thought: \"{{shortInspirationalQuote}}\" How does this resonate with you? #Wisdom",
      "\"{{shortInspirationalQuote}}\" - The philosophy driving innovation at {{brandName}}. #BusinessWisdom"
    ],
    'industry-news': [
      "Breaking: {{shortNewsItem}} What this means for {{targetAudience}}: #IndustryNews #{{industry}}",
      "Have you heard? {{shortNewsItem}} Our take: #TrendWatch #{{industry}}",
      "Industry update: {{shortNewsItem}} How will this affect your {{industryActivity}}? #{{industry}}News"
    ],
    'case-studies': [
      "Success story: {{customerName}} achieved {{customerAchievement}} with {{brandName}}! Full case study: #SuccessStory",
      "How {{customerName}} overcame {{customerChallenge}} using our {{productFeature}}. Results: {{shortImpressiveStats}} #CaseStudy",
      "From problem to solution: See how we helped {{customerName}} achieve {{customerAchievement}}. #CustomerSuccess"
    ],
    'testimonials': [
      "\"{{shortTestimonialQuote}}\" - {{customerName}}, {{customerRole}} #CustomerLove #Testimonial",
      "Our customers speak: \"{{shortTestimonialQuote}}\" - {{customerName}} #Feedback #{{brandHashtag}}",
      "We're honored! \"{{shortTestimonialQuote}}\" says {{customerName}} about their experience with {{brandName}}. #CustomerFeedback"
    ]
  },
  linkedin: {
    'motivation': [
      "Professional development insight: {{professionalMotivationalQuote}}\n\nAt {{brandName}}, we apply this principle to help {{targetAudience}} achieve their goals through {{productFeature}}.\n\nWhat professional mantras guide your work?",
      "Leadership perspective: {{professionalMotivationalQuote}}\n\nThis philosophy has guided {{brandName}}'s approach to {{industryActivity}} for our clients. We've found that embracing this mindset has resulted in {{positiveResult}}.",
      "Success principle worth sharing: {{professionalMotivationalQuote}}\n\nThis idea has transformed how our team at {{brandName}} approaches challenges and delivers value to {{targetAudience}}."
    ],
    'product-highlights': [
      "Innovation spotlight: {{brandName}}'s {{productFeature}}\n\nDesigned specifically for {{targetAudience}}, this solution addresses the challenge of {{customerChallenge}} by providing {{benefit}}.\n\nThe result? Our clients have reported {{positiveResult}}.\n\nLearn more about how we're transforming {{industryActivity}} through thoughtful design and implementation.",
      "Product insight: How {{brandName}} is revolutionizing {{industryActivity}}\n\nOur {{productFeature}} was developed after extensive research with {{targetAudience}} to address {{customerChallenge}}.\n\nKey advantages include:\n- {{benefit}}\n- {{secondBenefit}}\n- {{thirdBenefit}}\n\nInterested in learning more? Let's connect.",
      "Solving industry challenges: The story behind {{brandName}}'s {{productFeature}}\n\nWhen we identified that {{targetAudience}} were struggling with {{customerChallenge}}, we developed a solution that would {{benefit}}.\n\nThe impact? {{positiveResult}} for organizations implementing our approach."
    ],
    'behind-the-scenes': [
      "Building excellence: Behind the scenes at {{brandName}}\n\nToday we're sharing insights into our {{behindTheScenesActivity}} process. This critical function ensures we deliver consistent quality to {{targetAudience}}.\n\nOur team, led by {{teamMember}}, has refined this approach over {{timeFrame}}, resulting in {{positiveResult}}.\n\nWhat behind-the-scenes processes are you most proud of in your organization?",
      "Team spotlight: Meet the experts behind {{brandName}}'s success\n\nToday we're highlighting our {{teamMember}}, whose expertise in {{skillArea}} has been instrumental in developing our {{productFeature}}.\n\n\"{{teamQuote}}\" says {{teamMember}}.\n\nGreat organizations are built by great people committed to excellence.",
      "Innovation journey: From concept to implementation at {{brandName}}\n\nOur {{productDevelopmentStage}} involves collaborative work between our {{teamDepartment}} teams to ensure we're creating solutions that truly serve {{targetAudience}}.\n\nThis commitment to thorough development has led to {{positiveResult}} for our clients."
    ],
    'tips': [
      "Professional development: 3 strategies to enhance your {{skillArea}}\n\n1. {{actionableTip}}\n2. {{secondActionableTip}}\n3. {{thirdActionableTip}}\n\nAt {{brandName}}, we've implemented these approaches with our {{targetAudience}} clients, resulting in {{positiveResult}}.\n\nWhat strategies have you found effective in developing this crucial skill?",
      "Industry insight: Optimizing your {{industryActivity}}\n\nBased on our work with {{targetAudience}}, we've identified that {{actionableTip}} can significantly improve outcomes.\n\nThe data shows organizations implementing this approach have experienced {{positiveResult}}.\n\nAt {{brandName}}, we help implement this strategy through our {{productFeature}}.",
      "Leadership perspective: Elevating your {{skillArea}}\n\nOne often overlooked approach we recommend to {{targetAudience}} is to {{actionableTip}}.\n\nThis simple yet effective strategy has helped our clients achieve {{positiveResult}}.\n\nHow are you currently approaching this challenge in your organization?"
    ],
    'quotes': [
      "\"{{professionalInspirationalQuote}}\"\n\nThis principle resonates deeply with our mission at {{brandName}}. We've applied this thinking to how we develop {{productFeature}} for {{targetAudience}}.\n\nThe result has been {{positiveResult}} for organizations we work with.\n\nWhat professional philosophies guide your organization's approach?",
      "Leadership reflection: \"{{professionalInspirationalQuote}}\"\n\nThis perspective has shaped {{brandName}}'s approach to {{industryActivity}} and how we serve {{targetAudience}}.\n\nBy embracing this principle, we've been able to {{positiveResult}} for our clients when implementing our {{productFeature}}.",
      "Professional wisdom worth sharing: \"{{professionalInspirationalQuote}}\"\n\nAt {{brandName}}, we've found this approach particularly valuable when helping {{targetAudience}} overcome {{customerChallenge}}.\n\nHas this philosophy influenced your professional journey?"
    ],
    'industry-news': [
      "Industry analysis: {{newsItem}}\n\nWhat this means for {{targetAudience}}:\n- {{firstImplication}}\n- {{secondImplication}}\n- {{thirdImplication}}\n\nAt {{brandName}}, we're responding by enhancing our {{productFeature}} to help organizations navigate this change.\n\nHow is your organization adapting to this development?",
      "Market insight: Understanding the impact of {{newsItem}}\n\nThis development represents a significant shift in {{industryActivity}} that will affect how {{targetAudience}} approach {{customerChallenge}}.\n\nOur team at {{brandName}} has analyzed the implications and is prepared to help organizations respond effectively through our {{productFeature}}.",
      "Strategic perspective: {{newsItem}}\n\nThis change in the {{industry}} landscape presents both challenges and opportunities for {{targetAudience}}.\n\nKey considerations include:\n1. {{firstConsideration}}\n2. {{secondConsideration}}\n3. {{thirdConsideration}}\n\n{{brandName}} is positioned to support organizations navigating this shift."
    ],
    'case-studies': [
      "Success story: How {{customerName}} transformed their {{industryActivity}}\n\nChallenge: {{customerChallenge}}\n\nSolution: Implementing {{brandName}}'s {{productFeature}} to {{benefit}}.\n\nResults: {{impressiveStats}}\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}} at {{customerName}}.\n\nLearn how we can help your organization achieve similar outcomes.",
      "Case study: {{customerName}} achieves {{customerAchievement}} with {{brandName}}\n\nFacing the challenge of {{customerChallenge}}, {{customerName}} partnered with {{brandName}} to implement a solution that would {{benefit}}.\n\nThe impact was significant: {{impressiveStats}}\n\nDiscover how our approach can be tailored to your organization's needs.",
      "Transformation journey: {{customerName}}'s path to {{customerAchievement}}\n\nBefore working with {{brandName}}, {{customerName}} struggled with {{customerChallenge}} that limited their ability to {{industryActivity}} effectively.\n\nBy implementing our {{productFeature}}, they were able to {{benefit}}, resulting in {{impressiveStats}}.\n\nKey to their success was {{successFactor}}."
    ],
    'testimonials': [
      "Client perspective: {{customerName}}'s experience with {{brandName}}\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}}\n\nWe're honored to partner with forward-thinking organizations like {{customerName}} to help them achieve {{customerAchievement}}.\n\nLearn more about how we support {{targetAudience}} in overcoming {{customerChallenge}}.",
      "Partnership spotlight: {{brandName}} and {{customerName}}\n\nWe're proud to share this feedback from our valued client:\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}} at {{customerName}}.\n\nCollaboration is at the heart of how we help {{targetAudience}} achieve {{customerAchievement}} through our {{productFeature}}.",
      "Client success: {{customerName}}'s transformation with {{brandName}}\n\n\"{{testimonialQuote}}\"\n\nThis feedback from {{customerContact}} at {{customerName}} reflects our commitment to helping {{targetAudience}} overcome {{customerChallenge}}.\n\nTheir team has achieved {{customerAchievement}} since implementing our {{productFeature}}."
    ]
  }
};

// Sample placeholders data
const placeholders = {
  motivationalQuote: [
    "every challenge is an opportunity for growth",
    "consistency is more important than perfection",
    "small steps lead to big results",
    "your mindset determines your success",
    "progress happens outside your comfort zone"
  ],
  shortMotivationalQuote: [
    "Dream big, act now",
    "Progress over perfection",
    "Consistency beats intensity",
    "Your mindset shapes your reality",
    "Small steps, big impact"
  ],
  professionalMotivationalQuote: [
    "sustainable growth comes from balancing innovation with proven methodologies",
    "effective leadership is about empowering others to exceed their perceived limitations",
    "the most successful organizations prioritize long-term value creation over short-term gains",
    "professional development is an ongoing journey, not a destination",
    "strategic patience combined with consistent execution is the foundation of lasting success"
  ],
  inspirationalQuote: [
    "The only limit to our realization of tomorrow will be our doubts of today",
    "Don't watch the clock; do what it does. Keep going",
    "The future belongs to those who believe in the beauty of their dreams",
    "Success is not final, failure is not fatal: It is the courage to continue that counts",
    "The best way to predict the future is to create it"
  ],
  shortInspirationalQuote: [
    "Create your future",
    "Courage over comfort",
    "Dream, plan, execute",
    "Persistence beats resistance",
    "Growth requires challenge"
  ],
  professionalInspirationalQuote: [
    "The most effective leaders are those who create environments where others can succeed",
    "Innovation happens at the intersection of preparation and opportunity",
    "True professional growth comes from embracing challenges that stretch your capabilities",
    "Success in business is ultimately about creating sustainable value for all stakeholders",
    "The quality of your strategic decisions is directly proportional to the diversity of perspectives considered"
  ],
  productFeature: [
    "automated workflow solution",
    "integrated analytics dashboard",
    "customizable reporting system",
    "collaborative planning tool",
    "AI-powered recommendation engine"
  ],
  uniqueSellingPoint: [
    "human-centered design approach",
    "enterprise-grade security with user-friendly interfaces",
    "seamless integration with existing systems",
    "data-driven insights delivered in real-time",
    "scalable architecture that grows with your needs"
  ],
  benefit: [
    "save up to 15 hours per week on administrative tasks",
    "gain deeper insights into customer behavior",
    "increase team productivity by up to 30%",
    "reduce operational costs while improving outcomes",
    "make more informed decisions with comprehensive data"
  ],
  behindTheScenesActivity: [
    "product development process",
    "customer success strategy meetings",
    "quality assurance protocols",
    "team brainstorming sessions",
    "research and development lab"
  ],
  teamMember: [
    "design team",
    "customer success managers",
    "engineering department",
    "research specialists",
    "quality assurance experts"
  ],
  teamContribution: [
    "our user experience is intuitive and accessible",
    "our clients achieve their goals consistently",
    "our platform remains secure and reliable",
    "we stay ahead of industry trends",
    "our solutions meet the highest standards"
  ],
  productDevelopmentStage: [
    "user research and needs analysis",
    "prototype development and testing",
    "quality assurance and security validation",
    "ongoing feature enhancement",
    "customer feedback integration"
  ],
  skillArea: [
    "productivity",
    "communication",
    "project management",
    "strategic planning",
    "team collaboration"
  ],
  actionableTip: [
    "start your day by completing one important task before checking emails",
    "use the 2-minute rule: if it takes less than 2 minutes, do it immediately",
    "implement a weekly review to align your daily activities with long-term goals",
    "utilize the Eisenhower Matrix to prioritize tasks based on importance and urgency",
    "establish clear communication protocols for different types of information"
  ],
  shortActionableTip: [
    "Try time-blocking your calendar",
    "Use the 5-minute focus technique",
    "Schedule dedicated deep work time",
    "Limit meetings to 25 minutes",
    "Document decisions immediately"
  ],
  customerName: [
    "Acme Corporation",
    "Global Innovations Inc.",
    "Peak Performance Solutions",
    "Frontier Technologies",
    "Elevate Enterprises"
  ],
  customerChallenge: [
    "inefficient workflows that limited productivity",
    "data silos preventing comprehensive analysis",
    "scaling operations while maintaining quality",
    "inconsistent customer experiences across channels",
    "high operational costs with diminishing returns"
  ],
  customerAchievement: [
    "streamline their operational processes",
    "implement data-driven decision making",
    "scale their business while improving quality",
    "create consistent customer experiences",
    "reduce costs while enhancing performance"
  ],
  impressiveStats: [
    "37% increase in productivity and 28% reduction in operational costs",
    "45% faster time-to-market and 52% improvement in customer satisfaction",
    "3x ROI within the first year and 40% reduction in administrative overhead",
    "60% increase in team collaboration and 25% boost in innovation metrics",
    "50% reduction in workflow bottlenecks and 35% improvement in process efficiency"
  ],
  shortImpressiveStats: [
    "37% higher productivity",
    "45% faster delivery",
    "3x ROI in first year",
    "60% better collaboration",
    "50% fewer bottlenecks"
  ],
  testimonialQuote: [
    "Working with this team has transformed how we approach our business challenges. The results have exceeded our expectations.",
    "Their solution was exactly what we needed to take our operations to the next level. The implementation was smooth and the support has been exceptional.",
    "We've tried several solutions in the past, but nothing has delivered results like this. It's been a game-changer for our organization.",
    "The expertise and dedication of their team made all the difference. They didn't just provide a product – they delivered a complete solution.",
    "The ROI we've seen from implementing their solution has been remarkable. It's rare to find a partner that truly understands your business needs."
  ],
  shortTestimonialQuote: [
    "Game-changing solution for our team",
    "Best investment we made this year",
    "Exceptional support and results",
    "Transformed our approach completely",
    "Finally found what we've been looking for"
  ],
  customerContact: [
    "Sarah Johnson",
    "Michael Zhang",
    "Elena Rodriguez",
    "David Patel",
    "Rebecca Williams"
  ],
  customerRole: [
    "Director of Operations",
    "Chief Technology Officer",
    "VP of Customer Success",
    "Head of Digital Transformation",
    "Senior Marketing Manager"
  ],
  newsItem: [
    "recent regulatory changes are reshaping how businesses approach data privacy and security",
    "emerging technologies like AI and blockchain are creating new opportunities for operational efficiency",
    "shifting consumer preferences are driving a fundamental change in how products are developed and marketed",
    "industry consolidation is creating both challenges and opportunities for mid-sized organizations",
    "global supply chain transformations are requiring businesses to rethink their operational strategies"
  ],
  shortNewsItem: [
    "New regulations reshape data privacy",
    "AI adoption accelerating in our sector",
    "Consumer behavior shift impacts strategy",
    "Industry consolidation creating opportunity",
    "Supply chain innovation driving change"
  ],
  industry: [
    "technology",
    "healthcare",
    "financial services",
    "manufacturing",
    "retail"
  ],
  industryActivity: [
    "digital transformation initiatives",
    "customer experience management",
    "operational efficiency improvements",
    "strategic planning processes",
    "innovation development pipelines"
  ],
  firstImplication: [
    "increased need for compliance solutions",
    "opportunities for early adopters to gain competitive advantage",
    "necessity to realign customer acquisition strategies",
    "potential for strategic partnerships with complementary services",
    "requirements for enhanced data security measures"
  ],
  secondImplication: [
    "changing skill requirements for teams",
    "need for more agile operational processes",
    "increased importance of customer feedback loops",
    "shift in investment priorities",
    "greater emphasis on cross-functional collaboration"
  ],
  thirdImplication: [
    "long-term planning implications for infrastructure",
    "potential impacts on pricing and business models",
    "opportunities for innovation in service delivery",
    "changing competitive landscape",
    "new metrics needed to measure success"
  ],
  firstConsideration: [
    "timing of implementation will impact competitive positioning",
    "resource allocation between maintaining current operations and adapting to change",
    "internal skills development versus external partnership strategies",
    "balancing short-term adjustments with long-term strategic alignment",
    "communication approaches for internal teams and external stakeholders"
  ],
  secondConsideration: [
    "technology infrastructure readiness for adaptation",
    "customer communication strategies during transition",
    "compliance implications and regulatory preparation",
    "financial impacts and ROI timeline projections",
    "risk mitigation approaches during implementation"
  ],
  thirdConsideration: [
    "measuring success with appropriate metrics and KPIs",
    "capturing opportunities for innovation during transition",
    "maintaining operational excellence while implementing change",
    "leveraging change as a catalyst for organizational improvement",
    "building adaptability into future strategic planning"
  ],
  successFactor: [
    "their commitment to comprehensive change management",
    "strong leadership alignment around strategic priorities",
    "investment in team training and skill development",
    "willingness to iterate based on early implementation feedback",
    "cross-functional collaboration throughout the process"
  ],
  positiveResult: [
    "measurable improvements in key performance indicators",
    "enhanced ability to adapt to market changes",
    "stronger competitive positioning in their industry",
    "more effective utilization of resources and capabilities",
    "increased employee engagement and satisfaction"
  ],
  teamDepartment: [
    "product, engineering, and design",
    "strategy, operations, and customer success",
    "research, development, and quality assurance",
    "marketing, sales, and customer experience",
    "data science, analytics, and insights"
  ],
  timeFrame: [
    "the past three years",
    "multiple product development cycles",
    "extensive collaboration with beta clients",
    "rigorous testing and refinement phases",
    "continuous improvement iterations"
  ],
  secondBenefit: [
    "enhanced visibility into performance metrics",
    "improved collaboration across departments",
    "greater agility in responding to market changes",
    "reduced compliance risk through automated safeguards",
    "more accurate forecasting and planning capabilities"
  ],
  thirdBenefit: [
    "streamlined approval workflows",
    "comprehensive audit trails for all activities",
    "intelligent recommendations based on historical data",
    "seamless integration with existing tech stacks",
    "customizable dashboards for different stakeholder needs"
  ],
  secondActionableTip: [
    "implement a structured knowledge management system",
    "establish clear decision-making frameworks for different scenarios",
    "create standardized templates for recurring processes",
    "define clear handoff procedures between teams",
    "use retrospectives to continuously improve workflows"
  ],
  thirdActionableTip: [
    "align individual objectives with organizational priorities",
    "establish regular strategic review sessions",
    "create feedback loops for continuous improvement",
    "implement visualization tools for complex data",
    "develop cross-functional skills in key team members"
  ],
  teamQuote: [
    "we focus on solving real problems, not just implementing features",
    "our success comes from deeply understanding the challenges our users face",
    "innovation happens when we combine technical excellence with human empathy",
    "we're constantly balancing immediate needs with long-term strategic direction",
    "the best solutions emerge from collaboration between diverse perspectives"
  ],
};

// Function to replace placeholders in templates
const replacePlaceholders = (template: string, brandInfo: BrandInfo, theme: string) => {
  let result = template;
  
  // Replace brand-specific information
  result = result.replace(/\{\{brandName\}\}/g, brandInfo.brandName);
  result = result.replace(/\{\{brandHashtag\}\}/g, brandInfo.brandName.toLowerCase().replace(/\s+/g, ''));
  result = result.replace(/\{\{targetAudience\}\}/g, brandInfo.targetAudience);
  
  // Replace random placeholders with sample content
  Object.keys(placeholders).forEach(key => {
    const placeholderArray = placeholders[key as keyof typeof placeholders];
    const randomIndex = Math.floor(Math.random() * placeholderArray.length);
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, placeholderArray[randomIndex]);
  });
  
  return result;
};

// Main function to generate a 30-day content plan
const generateContentPlan = (brandInfo: BrandInfo): PostPlan => {
  const posts: Post[] = [];
  const startDate = new Date(); // Today
  const platforms = ['facebook', 'twitter', 'linkedin'] as const;
  
  // Generate posts for 30 days across all platforms
  for (let day = 0; day < 30; day++) {
    const currentDate = addDays(startDate, day);
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const theme = getContentThemeForDay(day, brandInfo.contentThemes);
    
    // Generate posts for each platform
    platforms.forEach(platform => {
      // Get templates for this theme and platform
      const templates = contentTemplates[platform][theme as keyof typeof contentTemplates[typeof platform]];
      
      if (templates && templates.length > 0) {
        // Pick a random template
        const templateIndex = Math.floor(Math.random() * templates.length);
        const template = templates[templateIndex];
        
        // Replace placeholders with actual content
        const content = replacePlaceholders(template, brandInfo, theme);
        
        // Generate hashtags
        const hashtags = generateHashtags(theme, brandInfo, platform);
        
        // Create post
        const post: Post = {
          id: uuidv4(),
          date: dateStr,
          platform,
          content,
          hashtags
        };
        
        posts.push(post);
      }
    });
  }
  
  return posts;
};

export { generateContentPlan };
