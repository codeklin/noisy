import { describe, it, expect } from 'vitest';
import { 
  createViralNigerianContentPrompt, 
  createViralSalesCopyPrompt, 
  createBrandContentPrompt 
} from './promptTemplates';

describe('promptTemplates', () => {
  describe('createViralNigerianContentPrompt', () => {
    it('should include all required parameters in the prompt', () => {
      const prompt = createViralNigerianContentPrompt(
        'facebook',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'How-To',
        'Empathetic',
        '25-45',
        'Tech-savvy business owners',
        1000,
        'TestBrand'
      );

      // Check that all parameters are included in the prompt
      expect(prompt).toContain('Brand Name: TestBrand');
      expect(prompt).toContain('Audience: Nigerian entrepreneurs');
      expect(prompt).toContain('Goal: Generate leads');
      expect(prompt).toContain('Style: Friendly Expert');
      expect(prompt).toContain('Platform: facebook');
      expect(prompt).toContain('Post Type: How-To');
      expect(prompt).toContain('Tone: Empathetic');
      expect(prompt).toContain('Age Range: 25-45');
      expect(prompt).toContain('Extra Target Description: Tech-savvy business owners');
      expect(prompt).toContain('STRICTLY LIMIT your response to a maximum of 1000 characters');
    });

    it('should include platform-specific instructions', () => {
      // Test for Facebook
      const facebookPrompt = createViralNigerianContentPrompt(
        'facebook',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'How-To',
        'Empathetic',
        '25-45'
      );
      expect(facebookPrompt).toContain('Create a conversational tone that encourages comments');
      
      // Test for Twitter
      const twitterPrompt = createViralNigerianContentPrompt(
        'twitter',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'How-To',
        'Empathetic',
        '25-45'
      );
      expect(twitterPrompt).toContain('Keep it concise but impactful');
      
      // Test for LinkedIn
      const linkedinPrompt = createViralNigerianContentPrompt(
        'linkedin',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'How-To',
        'Empathetic',
        '25-45'
      );
      expect(linkedinPrompt).toContain('Maintain professional tone while being relatable');
    });
  });

  describe('createViralSalesCopyPrompt', () => {
    it('should include all required parameters in the prompt', () => {
      const prompt = createViralSalesCopyPrompt(
        'linkedin',
        'marketers',
        'Book calls',
        'Bold Challenger',
        'Mistake Post',
        'Witty',
        '30-50',
        'Digital marketing professionals',
        1500,
        'MarketingPro'
      );

      // Check that all parameters are included in the prompt
      expect(prompt).toContain('Brand Name: MarketingPro');
      expect(prompt).toContain('Audience: marketers');
      expect(prompt).toContain('Goal: Book calls');
      expect(prompt).toContain('Style: Bold Challenger');
      expect(prompt).toContain('Platform: linkedin');
      expect(prompt).toContain('Post Type: Mistake Post');
      expect(prompt).toContain('Tone: Witty');
      expect(prompt).toContain('Age Range: 30-50');
      expect(prompt).toContain('Extra Target Description: Digital marketing professionals');
      expect(prompt).toContain('STRICTLY LIMIT your response to a maximum of 1500 characters');
    });

    it('should include post type-specific instructions', () => {
      // Test for Storytelling
      const storytellingPrompt = createViralSalesCopyPrompt(
        'facebook',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'Storytelling',
        'Empathetic',
        '25-45'
      );
      expect(storytellingPrompt).toContain('Problem > Story > Result > CTA');
      
      // Test for How-To
      const howToPrompt = createViralSalesCopyPrompt(
        'facebook',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'How-To',
        'Empathetic',
        '25-45'
      );
      expect(howToPrompt).toContain('Problem > Promise > Proof > Process > CTA');
      
      // Test for Mistake Post
      const mistakePrompt = createViralSalesCopyPrompt(
        'facebook',
        'entrepreneurs',
        'Generate leads',
        'Friendly Expert',
        'Mistake Post',
        'Empathetic',
        '25-45'
      );
      expect(mistakePrompt).toContain('3 Mistakes [Target Audience] Makes and How to Fix Them');
    });
  });

  describe('createBrandContentPrompt', () => {
    it('should include brand information in the prompt', () => {
      const brandInfo = {
        brandName: 'TechSolutions',
        businessDescription: 'A tech company that provides software solutions',
        targetAudience: 'Small business owners',
        tone: 'Professional',
        ctaExamples: 'Book a demo, Sign up for free trial'
      };

      const prompt = createBrandContentPrompt('linkedin', 'Innovation', brandInfo, 2000);

      // Check that brand information is included
      expect(prompt).toContain('a brand called "TechSolutions"');
      expect(prompt).toContain('Description: A tech company that provides software solutions');
      expect(prompt).toContain('Target audience: Small business owners');
      expect(prompt).toContain('Tone: Professional');
      expect(prompt).toContain('Call to action examples: Book a demo, Sign up for free trial');
      expect(prompt).toContain('theme: "Innovation"');
      expect(prompt).toContain('STRICTLY LIMIT your response to a maximum of 2000 characters');
    });

    it('should include platform-specific guidelines', () => {
      const brandInfo = {
        brandName: 'TestBrand',
        businessDescription: 'Test description',
        targetAudience: 'Test audience',
        tone: 'Casual'
      };

      // Test for Facebook
      const facebookPrompt = createBrandContentPrompt('facebook', 'Test', brandInfo);
      expect(facebookPrompt).toContain('Create an engaging, conversational post that encourages interaction');
      
      // Test for Twitter
      const twitterPrompt = createBrandContentPrompt('twitter', 'Test', brandInfo);
      expect(twitterPrompt).toContain('Create a concise, impactful post');
      expect(twitterPrompt).toContain('Maximum 280 characters');
      
      // Test for LinkedIn
      const linkedinPrompt = createBrandContentPrompt('linkedin', 'Test', brandInfo);
      expect(linkedinPrompt).toContain('Create a professional, value-driven post');
      expect(linkedinPrompt).toContain('Format with paragraph breaks and bullet points if appropriate');
    });
  });
});
