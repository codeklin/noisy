
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
  
  // Add trending hashtags based on the current year
  const trendingTags = [
    'trending2025',
    'innovation',
    'digitalmarketing',
    'sustainability',
    'artificialintelligence',
    'remotework',
    'customerexperience'
  ];
  
  // Combine and filter
  const allTags = [...baseHashtags, ...platformTags, ...trendingTags];
  
  // Take a random subset of 3-5 hashtags
  const numTags = Math.floor(Math.random() * 3) + 3; // 3 to 5 hashtags
  const shuffled = allTags.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, numTags);
};

// Updated content templates for 2025 with current trends and topics
const contentTemplates = {
  facebook: {
    'motivation': [
      "Monday motivation for 2025! 🌟 At {{brandName}}, we believe that {{motivationalQuote}}. How are you staying motivated in this fast-paced world? #MondayMotivation",
      "Feeling inspired by the latest innovations in our industry! 💪 At {{brandName}}, we embrace that {{motivationalQuote}}. What's inspiring you today? Share below! #Innovation2025",
      "Need a mid-week boost? 🚀 Remember: {{motivationalQuote}}. This principle has guided everything we do at {{brandName}} throughout 2025's challenges and opportunities."
    ],
    'product-highlights': [
      "Have you explored our latest {{productFeature}} enhanced with AI capabilities? Designed specifically for {{targetAudience}} to achieve {{benefit}} faster than ever! Learn more on our website! 👉 #{{brandHashtag}} #Tech2025",
      "What makes {{brandName}} stand out in 2025? Our commitment to {{uniqueSellingPoint}} with sustainable practices. That's why our newest {{productFeature}} is making waves in the industry.",
      "Just launched! Our {{productFeature}} now incorporates the latest virtual reality innovations to help customers increase their {{benefit}} by up to 65%! Discover how {{brandName}} can transform your experience in today's digital landscape."
    ],
    'behind-the-scenes': [
      "Ever wonder what happens behind the scenes at {{brandName}} in 2025? Today we're giving you a peek into our {{behindTheScenesActivity}} with our remote and in-office teams collaborating seamlessly! 📸 #HybridWorkplace",
      "Meet the diverse team making {{brandName}} possible! Today we're highlighting our {{teamMember}} who ensures {{teamContribution}} while embracing the latest workflow automation tools.",
      "From concept to completion: here's how we develop our {{productDevelopmentStage}} using AI-assisted design to ensure the best experience for our {{targetAudience}} in today's fast-evolving market."
    ],
    'tips': [
      "2025 Pro tip from {{brandName}}: Want to improve your {{skillArea}} in today's digital landscape? Try {{actionableTip}}. This data-driven approach can make a significant difference!",
      "Here's a quick tip to enhance your {{skillArea}} this quarter: {{actionableTip}}. Our {{targetAudience}} have reported 40% better results with this method! #ProductivityHack",
      "Latest {{skillArea}} hack for 2025: {{actionableTip}}. This approach accounts for the recent changes in digital privacy regulations. Share your own tips in the comments!"
    ],
    'quotes': [
      "\"{{inspirationalQuote}}\" - This quote reflects our vision at {{brandName}} as we help {{targetAudience}} navigate the rapidly evolving marketplace of 2025.",
      "Words to guide us in 2025: \"{{inspirationalQuote}}\" How does this resonate with your business strategy this year? #BusinessWisdom",
      "Our founder's favorite quote for the current business climate: \"{{inspirationalQuote}}\" This philosophy guides our approach to sustainability and digital transformation at {{brandName}}."
    ],
    'industry-news': [
      "Breaking news in the {{industry}} industry! {{newsItem}} - Here's what this means for {{targetAudience}} and how {{brandName}} is adapting our offerings to help you stay ahead.",
      "Have you heard about the latest developments? {{newsItem}}. This shift could transform how {{targetAudience}} approach {{industryActivity}} in the coming months.",
      "Industry update for Q2 2025: {{newsItem}}. At {{brandName}}, we've already enhanced our {{productFeature}} to align with these changes and support your business goals."
    ],
    'case-studies': [
      "Success story alert! 🌟 See how {{customerName}} leveraged {{brandName}}'s new AI-powered solutions to {{customerAchievement}} despite market volatility. The results? {{impressiveStats}}!",
      "2025 Case study: How {{customerName}} overcame {{customerChallenge}} with {{brandName}}'s sustainable business solutions. Read the full story on our website!",
      "From challenge to triumph in today's economy: {{customerName}} faced {{customerChallenge}} until they implemented our cloud-based {{productFeature}}. Now they're {{customerAchievement}} while reducing their carbon footprint!"
    ],
    'testimonials': [
      "\"{{brandName}}'s updated platform completely transformed how we {{customerActivity}} in this hybrid work environment. We've seen {{positiveResult}} since implementing their 2025 solution suite.\" - {{customerName}}",
      "Fresh feedback from our clients! Here's what {{customerName}} said about our latest offerings: \"{{testimonialQuote}}\" #CustomerLove #DigitalTransformation",
      "We're honored by this recent review! 😊 \"{{testimonialQuote}}\" - {{customerName}}, who used {{brandName}} to {{customerAchievement}} while adapting to the changing market conditions of 2025."
    ]
  },
  twitter: {
    'motivation': [
      "Monday motivation for 2025: {{shortMotivationalQuote}} How are you innovating this week? #MondayMotivation #{{brandHashtag}} #Future",
      "Finding inspiration in today's digital landscape! {{shortMotivationalQuote}} What drives your innovation journey? #Inspiration #Tech2025",
      "Our 2025 mantra: {{shortMotivationalQuote}} - This powers our sustainable approach at {{brandName}} 💪 #BusinessGrowth #GreenTech"
    ],
    'product-highlights': [
      "Just launched! Our AI-enhanced {{productFeature}} helps {{targetAudience}} achieve {{benefit}} 3x faster! Details in bio. #Innovation #{{brandHashtag}} #2025Tech",
      "What makes {{brandName}} unique in 2025? Our carbon-neutral {{uniqueSellingPoint}}. Experience the difference: #SustainableBusiness",
      "New feature alert! 🚨 Introducing our VR-compatible {{productFeature}} - designed to {{benefit}} for users in today's hybrid environments. #ProductLaunch #FutureOfWork"
    ],
    'behind-the-scenes': [
      "Behind the scenes at {{brandName}} today: {{behindTheScenesActivity}} with our global team collaborating across time zones! #RemoteWork #BehindTheScenes #{{brandHashtag}}",
      "Meet {{teamMember}}, the innovator behind our AI-driven {{teamContribution}}! #TeamSpotlight #WomenInTech #Diversity2025",
      "This is how we {{productDevelopmentStage}} using carbon-neutral processes at {{brandName}}. Sustainability at every step! #GreenBusiness #ProcessMatters"
    ],
    'tips': [
      "2025 Quick tip: {{shortActionableTip}} based on the latest digital privacy regulations #{{skillArea}}Tips #DataProtection",
      "Pro hack for {{targetAudience}} in Q2 2025: {{shortActionableTip}} Try it with your distributed team today! #RemoteWork #QuickTip",
      "Upgrade your {{skillArea}} with this trend-forward tip: {{shortActionableTip}} #Productivity #DigitalTransformation"
    ],
    'quotes': [
      "\"{{shortInspirationalQuote}}\" Words guiding our sustainable business practices at {{brandName}} in 2025. #QuoteOfTheDay #GreenBusinesses",
      "Today's thought for digital leaders: \"{{shortInspirationalQuote}}\" How does this align with your 2025 strategy? #LeadershipWisdom",
      "\"{{shortInspirationalQuote}}\" - The philosophy driving AI-powered innovation at {{brandName}}. #BusinessWisdom #FutureTech"
    ],
    'industry-news': [
      "Breaking: {{shortNewsItem}} What this means for {{targetAudience}} in 2025: #IndustryNews #{{industry}} #FutureTrends",
      "Just announced! {{shortNewsItem}} Our take: This will reshape digital strategies for Q3 2025 #TrendWatch #{{industry}}",
      "Industry update: {{shortNewsItem}} How will this affect your sustainable {{industryActivity}}? #{{industry}}News #GreenBusiness"
    ],
    'case-studies': [
      "2025 Success story: {{customerName}} achieved {{customerAchievement}} with our AI-powered solutions! Full case study: #SuccessStory #DigitalTransformation",
      "How {{customerName}} overcame the latest {{customerChallenge}} using our climate-friendly {{productFeature}}. Results: {{shortImpressiveStats}} #CaseStudy #Sustainability",
      "From challenge to solution: See how we helped {{customerName}} achieve {{customerAchievement}} in today's volatile market. #CustomerSuccess #BusinessResilience"
    ],
    'testimonials': [
      "\"{{shortTestimonialQuote}}\" - {{customerName}}, {{customerRole}} on implementing our 2025 solutions #CustomerLove #Testimonial",
      "Recent feedback on our latest platform: \"{{shortTestimonialQuote}}\" - {{customerName}} #Feedback #{{brandHashtag}} #Innovation",
      "We're honored by this new review! \"{{shortTestimonialQuote}}\" says {{customerName}} about their experience with {{brandName}}'s AI capabilities. #CustomerFeedback"
    ]
  },
  linkedin: {
    'motivation': [
      "Professional development insight for 2025: {{professionalMotivationalQuote}}\n\nAt {{brandName}}, we apply this principle to help {{targetAudience}} achieve their goals through our AI-enhanced {{productFeature}}.\n\nWhat professional mantras are guiding your organization this year? #ProfessionalDevelopment #2025Strategy",
      "Leadership perspective for Q2 2025: {{professionalMotivationalQuote}}\n\nThis philosophy has guided {{brandName}}'s approach to sustainable {{industryActivity}} for our clients. We've found that embracing this mindset has resulted in {{positiveResult}} even during market volatility.",
      "Success principle worth sharing as we navigate 2025's business landscape: {{professionalMotivationalQuote}}\n\nThis idea has transformed how our team at {{brandName}} approaches digital transformation challenges and delivers value to {{targetAudience}} in the age of AI."
    ],
    'product-highlights': [
      "Innovation spotlight: {{brandName}}'s AI-powered {{productFeature}} for 2025\n\nDesigned specifically for {{targetAudience}} in today's hybrid work environment, this solution addresses the challenge of {{customerChallenge}} by providing {{benefit}}.\n\nThe result? Our clients have reported {{positiveResult}} while reducing their carbon footprint by 30%.\n\nLearn more about how we're transforming {{industryActivity}} through sustainable design and implementation. #SustainableTech #Innovation2025",
      "Product insight: How {{brandName}} is revolutionizing {{industryActivity}} in 2025\n\nOur carbon-neutral {{productFeature}} was developed after extensive research with {{targetAudience}} to address evolving {{customerChallenge}}.\n\nKey advantages include:\n- {{benefit}}\n- {{secondBenefit}}\n- {{thirdBenefit}}\n\nInterested in how this aligns with the latest ESG requirements? Let's connect. #SustainableBusiness #DigitalTransformation",
      "Solving 2025's industry challenges: The story behind {{brandName}}'s AI-enhanced {{productFeature}}\n\nWhen we identified that {{targetAudience}} were struggling with {{customerChallenge}} in today's volatile market, we developed a solution that would {{benefit}}.\n\nThe impact? {{positiveResult}} for organizations implementing our approach while preparing for the upcoming regulatory changes. #Innovation #FutureOfWork"
    ],
    'behind-the-scenes': [
      "Building excellence in 2025: Behind the scenes at {{brandName}}\n\nToday we're sharing insights into our {{behindTheScenesActivity}} process in our distributed teams model. This critical function ensures we deliver consistent quality to {{targetAudience}} regardless of geography.\n\nOur diverse team, led by {{teamMember}}, has refined this approach over {{timeFrame}}, resulting in {{positiveResult}}.\n\nWhat behind-the-scenes processes are you most proud of in your organization's hybrid work model? #RemoteWork #DistributedTeams",
      "Team spotlight: Meet the experts behind {{brandName}}'s 2025 success\n\nToday we're highlighting our {{teamMember}}, whose expertise in AI-powered {{skillArea}} has been instrumental in developing our carbon-neutral {{productFeature}}.\n\n\"{{teamQuote}}\" says {{teamMember}}.\n\nGreat organizations are built by diverse teams committed to innovation and sustainability. #TeamSpotlight #DiversityInTech",
      "Innovation journey: From concept to implementation at {{brandName}} in 2025\n\nOur {{productDevelopmentStage}} involves collaborative work between our global {{teamDepartment}} teams using the latest virtual collaboration tools to ensure we're creating solutions that truly serve {{targetAudience}}.\n\nThis commitment to sustainable development has led to {{positiveResult}} for our clients while reducing our collective carbon footprint. #SustainableInnovation #GlobalTeams"
    ],
    'tips': [
      "Professional development for 2025: 3 strategies to enhance your {{skillArea}} in the age of AI\n\n1. {{actionableTip}}\n2. {{secondActionableTip}}\n3. {{thirdActionableTip}}\n\nAt {{brandName}}, we've implemented these approaches with our {{targetAudience}} clients, resulting in {{positiveResult}} even amid today's rapid technological changes.\n\nWhat strategies have you found effective in developing this crucial skill in your distributed teams? #ProfessionalDevelopment #AI2025",
      "Industry insight: Optimizing your {{industryActivity}} for 2025's challenges\n\nBased on our work with {{targetAudience}}, we've identified that {{actionableTip}} can significantly improve outcomes in today's privacy-focused digital landscape.\n\nThe data shows organizations implementing this approach have experienced {{positiveResult}} while maintaining compliance with the latest regulations.\n\nAt {{brandName}}, we help implement this strategy through our climate-friendly {{productFeature}}. #DataPrivacy #Compliance2025",
      "Leadership perspective: Elevating your {{skillArea}} in Q2 2025\n\nOne often overlooked approach we recommend to {{targetAudience}} navigating today's market volatility is to {{actionableTip}}.\n\nThis sustainable yet effective strategy has helped our clients achieve {{positiveResult}} while preparing for upcoming regulatory changes.\n\nHow is your organization currently approaching this challenge? #LeadershipInsights #MarketAdaptation"
    ],
    'quotes': [
      "\"{{professionalInspirationalQuote}}\"\n\nThis principle resonates deeply with our mission at {{brandName}} as we navigate 2025's business landscape. We've applied this thinking to how we develop sustainable {{productFeature}} for {{targetAudience}}.\n\nThe result has been {{positiveResult}} for organizations adapting to market volatility.\n\nWhat professional philosophies guide your organization's approach to sustainability and innovation? #BusinessPhilosophy #Sustainability",
      "Leadership reflection for Q2 2025: \"{{professionalInspirationalQuote}}\"\n\nThis perspective has shaped {{brandName}}'s approach to carbon-neutral {{industryActivity}} and how we serve {{targetAudience}} in today's evolving regulatory environment.\n\nBy embracing this principle, we've been able to {{positiveResult}} for our clients when implementing our AI-enhanced {{productFeature}}. #LeadershipInsights #SustainableBusiness",
      "Professional wisdom worth sharing as we navigate 2025's challenges: \"{{professionalInspirationalQuote}}\"\n\nAt {{brandName}}, we've found this approach particularly valuable when helping {{targetAudience}} overcome {{customerChallenge}} in today's privacy-focused marketplace.\n\nHas this philosophy influenced your organization's approach to digital transformation? #BusinessWisdom #DigitalEthics"
    ],
    'industry-news': [
      "Industry analysis: {{newsItem}}\n\nWhat this means for {{targetAudience}} in Q2 2025:\n- {{firstImplication}}\n- {{secondImplication}}\n- {{thirdImplication}}\n\nAt {{brandName}}, we're responding by enhancing our sustainable {{productFeature}} to help organizations navigate this change while meeting ESG requirements.\n\nHow is your organization adapting to this development? #IndustryAnalysis #ESG2025",
      "Market insight: Understanding the impact of {{newsItem}} in today's economy\n\nThis development represents a significant shift in {{industryActivity}} that will affect how {{targetAudience}} approach {{customerChallenge}} amid increasing regulatory scrutiny.\n\nOur team at {{brandName}} has analyzed the implications for both business performance and sustainability metrics and is prepared to help organizations respond effectively through our carbon-neutral {{productFeature}}. #MarketInsight #SustainableTransformation",
      "Strategic perspective for Q2 2025: {{newsItem}}\n\nThis change in the {{industry}} landscape presents both challenges and opportunities for {{targetAudience}} navigating today's volatile market.\n\nKey considerations include:\n1. {{firstConsideration}}\n2. {{secondConsideration}}\n3. {{thirdConsideration}}\n\n{{brandName}} is positioned to support organizations navigating this shift while maintaining their sustainability commitments. #StrategicPlanning #MarketAdaptation"
    ],
    'case-studies': [
      "2025 Success story: How {{customerName}} transformed their {{industryActivity}} amid market volatility\n\nChallenge: {{customerChallenge}} exacerbated by recent regulatory changes\n\nSolution: Implementing {{brandName}}'s AI-powered, carbon-neutral {{productFeature}} to {{benefit}}.\n\nResults: {{impressiveStats}} while reducing their environmental impact by 35%\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}} at {{customerName}}.\n\nLearn how we can help your organization achieve similar outcomes in today's challenging business environment. #CaseStudy #SustainableBusiness",
      "Q2 2025 Case study: {{customerName}} achieves {{customerAchievement}} with {{brandName}} while meeting new ESG requirements\n\nFacing the dual challenge of {{customerChallenge}} and increasingly stringent sustainability metrics, {{customerName}} partnered with {{brandName}} to implement a carbon-neutral solution that would {{benefit}}.\n\nThe impact was significant: {{impressiveStats}} and a 40% reduction in their carbon footprint\n\nDiscover how our approach can be tailored to your organization's needs in today's regulatory landscape. #ESG #BusinessPerformance",
      "Transformation journey: {{customerName}}'s path to {{customerAchievement}} in 2025's challenging market\n\nBefore working with {{brandName}}, {{customerName}} struggled with {{customerChallenge}} that limited their ability to {{industryActivity}} effectively while meeting new regulatory requirements.\n\nBy implementing our AI-enhanced, sustainable {{productFeature}}, they were able to {{benefit}}, resulting in {{impressiveStats}} and full compliance with the latest ESG standards.\n\nKey to their success was {{successFactor}} paired with sustainable business practices. #BusinessTransformation #ESGCompliance"
    ],
    'testimonials': [
      "Client perspective: {{customerName}}'s experience with {{brandName}}'s 2025 sustainable solutions\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}}\n\nWe're honored to partner with forward-thinking organizations like {{customerName}} to help them achieve {{customerAchievement}} while navigating today's complex regulatory environment.\n\nLearn more about how we support {{targetAudience}} in overcoming {{customerChallenge}} with climate-friendly technology solutions. #ClientTestimonial #SustainableTech",
      "Partnership spotlight: {{brandName}} and {{customerName}} in Q2 2025\n\nWe're proud to share this feedback from our valued client:\n\n\"{{testimonialQuote}}\" - {{customerContact}}, {{customerRole}} at {{customerName}}.\n\nCollaboration is at the heart of how we help {{targetAudience}} achieve {{customerAchievement}} through our carbon-neutral {{productFeature}} while adapting to market volatility. #Partnership #SustainableBusiness",
      "Client success amid 2025's challenges: {{customerName}}'s transformation with {{brandName}}\n\n\"{{testimonialQuote}}\"\n\nThis feedback from {{customerContact}} at {{customerName}} reflects our commitment to helping {{targetAudience}} overcome {{customerChallenge}} while meeting increasingly stringent ESG requirements.\n\nTheir team has achieved {{customerAchievement}} since implementing our AI-powered, sustainable {{productFeature}}. #ClientSuccess #ESGCompliance"
    ]
  }
};

// Updated placeholders data for 2025 with current trends and topics
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
  customerActivity: [
    "manage client relationships",
    "analyze market trends",
    "streamline operations",
    "train team members",
    "engage with customers"
  ]
};

// Generate a single post based on template and placeholder data
export const generatePost = (date: string, platform: 'facebook' | 'twitter' | 'linkedin', theme: string, brandInfo: BrandInfo): Post => {
  const templates = contentTemplates[platform][theme as keyof (typeof contentTemplates['facebook' | 'twitter' | 'linkedin'])];
  
  if (!templates || templates.length === 0) {
    return {
      id: uuidv4(),
      date,
      platform,
      content: `No templates available for ${platform} and ${theme}`,
      hashtags: [],
    };
  }
  
  // Choose a random template
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  // Replace all placeholders in the template
  let content = template.replace(/{{brandName}}/g, brandInfo.brandName);
  
  // Create a brandHashtag from the brand name
  const brandHashtag = brandInfo.brandName.toLowerCase().replace(/\s+/g, '');
  content = content.replace(/{{brandHashtag}}/g, brandHashtag);
  
  // Replace other placeholders
  Object.keys(placeholders).forEach(placeholder => {
    const values = placeholders[placeholder as keyof typeof placeholders];
    if (values && values.length > 0) {
      const randomValue = values[Math.floor(Math.random() * values.length)];
      const regex = new RegExp(`{{${placeholder}}}`, 'g');
      content = content.replace(regex, randomValue);
    }
  });
  
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

// Generate a full content plan
export const generateContentPlan = (brandInfo: BrandInfo): PostPlan => {
  const startDate = new Date();
  const numDays = 14; // Generate 2 weeks worth of content
  const platforms: ('facebook' | 'twitter' | 'linkedin')[] = ['facebook', 'twitter', 'linkedin'];
  const posts: Post[] = [];
  
  for (let i = 0; i < numDays; i++) {
    const currentDate = addDays(startDate, i);
    const dateString = format(currentDate, 'MMM dd, yyyy');
    
    // Get theme for this day
    const theme = getContentThemeForDay(i, brandInfo.contentThemes);
    
    // Generate one post per platform for this day
    platforms.forEach(platform => {
      const post = generatePost(dateString, platform, theme, brandInfo);
      posts.push(post);
    });
  }
  
  return posts;
};
