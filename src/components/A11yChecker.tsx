import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface A11yIssue {
  type: string;
  element: string;
  message: string;
}

/**
 * A component that checks for common accessibility issues in development mode
 * This component doesn't render anything visible
 */
const A11yChecker = () => {
  const [issues, setIssues] = useState<A11yIssue[]>([]);

  useEffect(() => {
    // Only run in development
    if (process.env.NODE_ENV !== 'development') return;

    const checkAccessibility = () => {
      const newIssues: A11yIssue[] = [];
      
      // Check for images without alt text
      document.querySelectorAll('img').forEach((img, index) => {
        if (!img.hasAttribute('alt')) {
          newIssues.push({
            type: 'image-alt',
            element: `img-${index}`,
            message: `Image missing alt text: ${img.src.split('/').pop() || 'unknown'}`
          });
        }
      });
      
      // Check for buttons without accessible names
      document.querySelectorAll('button').forEach((button, index) => {
        if (!button.textContent?.trim() && !button.getAttribute('aria-label')) {
          newIssues.push({
            type: 'button-name',
            element: `button-${index}`,
            message: 'Button missing accessible name (text content or aria-label)'
          });
        }
      });
      
      // Check for proper heading hierarchy
      const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
      for (let i = 0; i < headings.length - 1; i++) {
        const current = parseInt(headings[i].tagName[1]);
        const next = parseInt(headings[i + 1].tagName[1]);
        if (next > current + 1) {
          newIssues.push({
            type: 'heading-order',
            element: `heading-${i}`,
            message: `Heading level jumped from h${current} to h${next}`
          });
        }
      }
      
      // Check for links with generic text
      document.querySelectorAll('a').forEach((link, index) => {
        const text = link.textContent?.trim().toLowerCase() || '';
        if (['click here', 'read more', 'learn more', 'more', 'link'].includes(text)) {
          newIssues.push({
            type: 'generic-link',
            element: `link-${index}`,
            message: `Link has generic text: "${text}"`
          });
        }
      });
      
      // Check for color contrast (simplified check)
      document.querySelectorAll('*').forEach((element, index) => {
        const style = window.getComputedStyle(element);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Skip elements with transparent background
        if (bgColor === 'rgba(0, 0, 0, 0)' || bgColor === 'transparent') {
          return;
        }
        
        // Very simplified contrast check - just looking for potential red flags
        if (color === bgColor) {
          newIssues.push({
            type: 'color-contrast',
            element: `element-${index}`,
            message: 'Element has same foreground and background color'
          });
        }
      });
      
      setIssues(newIssues);
    };
    
    // Run the check after the component tree is rendered
    const timeoutId = setTimeout(checkAccessibility, 2000);
    
    // Re-run on route changes
    const observer = new MutationObserver(() => {
      clearTimeout(timeoutId);
      setTimeout(checkAccessibility, 2000);
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);
  
  useEffect(() => {
    if (issues.length > 0) {
      toast({
        title: 'Accessibility Issues Detected',
        description: `${issues.length} issues found. Check the console for details.`,
        duration: 10000,
        icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      });
      
      console.group('Accessibility Issues');
      issues.forEach(issue => {
        console.warn(`[${issue.type}] ${issue.message}`);
      });
      console.groupEnd();
    }
  }, [issues]);
  
  // This component doesn't render anything
  return null;
};

export default A11yChecker;
