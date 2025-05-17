import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface A11yIssue {
  type: string;
  element: string;
  message: string;
  context?: string;
  stack?: string;
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

  // Keep track of already reported issues to avoid duplicates
  const [reportedIssueIds, setReportedIssueIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Skip if there are no issues to report
    if (issues.length === 0) return;

    // Create a function to generate a unique ID for each issue
    const getIssueId = (issue: A11yIssue) => `${issue.type}-${issue.message}-${issue.context || ''}`;

    // Filter out already reported issues
    const newIssues = issues.filter(issue => !reportedIssueIds.has(getIssueId(issue)));

    // If there are no new issues, we're done
    if (newIssues.length === 0) return;

    // Update the set of reported issues
    const newIssueIds = new Set(reportedIssueIds);
    newIssues.forEach(issue => {
      newIssueIds.add(getIssueId(issue));
    });
    setReportedIssueIds(newIssueIds);

    // Only show toast for new issues
    toast.warning(
      `${newIssues.length} new accessibility issues found. Check the console for details.`,
      {
        duration: 10000,
      }
    );

    // Log detailed information to the console
    console.group('Accessibility Issues');
    newIssues.forEach(issue => {
      // Extract HTML from context to help identify the element
      let elementHtml = '';
      if (issue.context) {
        const contextMatch = issue.context.match(/<[^>]+>/g);
        if (contextMatch) {
          elementHtml = contextMatch[0];
        }
      }

      console.warn(`[${issue.type}] ${issue.message}`);
      console.warn(`Element HTML: ${elementHtml || 'Not available'}`);

      // Log the component stack to help identify the component with the issue
      if (issue.stack) {
        console.warn('Component Stack:', issue.stack);
      }
      console.warn('---');
    });
    console.groupEnd();

    // Log a helpful message about how to fix common issues
    console.info('Common accessibility fixes:\n' +
      '- button-name: Add text content, aria-label, or aria-labelledby to buttons\n' +
      '- image-alt: Add alt text to images\n' +
      '- link-name: Add text content, aria-label, or aria-labelledby to links\n' +
      '- form-field-multiple-labels: Ensure form fields have only one label');
  }, [issues, reportedIssueIds, toast]);

  // This component doesn't render anything
  return null;
};

export default A11yChecker;
