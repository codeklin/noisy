import { describe, it, expect } from 'vitest';
import { getCharacterLimit, platformLimits } from './contentLengthLimits';

describe('contentLengthLimits', () => {
  describe('platformLimits', () => {
    it('should define limits for Twitter', () => {
      expect(platformLimits.twitter).toBeDefined();
      expect(platformLimits.twitter.maxCharacters).toBe(280);
      expect(platformLimits.twitter.midForm).toBe(140);
      expect(platformLimits.twitter.shortForm).toBe(70);
    });

    it('should define limits for LinkedIn', () => {
      expect(platformLimits.linkedin).toBeDefined();
      expect(platformLimits.linkedin.maxCharacters).toBe(1248);
      expect(platformLimits.linkedin.midForm).toBe(624);
      expect(platformLimits.linkedin.shortForm).toBe(312);
    });

    it('should define limits for Facebook', () => {
      expect(platformLimits.facebook).toBeDefined();
      expect(platformLimits.facebook.maxCharacters).toBe(2000);
      expect(platformLimits.facebook.midForm).toBe(1000);
      expect(platformLimits.facebook.shortForm).toBe(500);
    });
  });

  describe('getCharacterLimit', () => {
    it('should return the correct limit for Twitter short form', () => {
      expect(getCharacterLimit('twitter', 'short')).toBe(70);
    });

    it('should return the correct limit for LinkedIn mid form', () => {
      expect(getCharacterLimit('linkedin', 'mid')).toBe(624);
    });

    it('should return the correct limit for Facebook full form', () => {
      expect(getCharacterLimit('facebook', 'full')).toBe(2000);
    });

    it('should return a default value for unknown platforms', () => {
      // @ts-ignore - Testing invalid input
      expect(getCharacterLimit('unknown', 'full')).toBe(1000);
    });
  });
});
