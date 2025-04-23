/**
 * Accessibility utilities for the application
 */

/**
 * Ensures that an element has an accessible name
 * @param props The props object
 * @param defaultLabel The default label to use if no accessible name is provided
 * @returns The props object with an aria-label if needed
 */
export function ensureAccessibleName(
  props: Record<string, any>,
  defaultLabel: string
): Record<string, any> {
  // If the element already has an accessible name, return the props as is
  if (
    props['aria-label'] ||
    props['aria-labelledby'] ||
    (typeof props.children === 'string' && props.children.trim() !== '')
  ) {
    return props;
  }

  // Otherwise, add an aria-label
  return {
    ...props,
    'aria-label': defaultLabel,
  };
}

/**
 * Marks an element as decorative (not important for screen readers)
 * @param props The props object
 * @returns The props object with aria-hidden="true"
 */
export function markAsDecorative(props: Record<string, any>): Record<string, any> {
  return {
    ...props,
    'aria-hidden': 'true',
  };
}

/**
 * Adds keyboard navigation support to a clickable element
 * @param props The props object
 * @returns The props object with keyboard event handlers
 */
export function addKeyboardSupport(props: Record<string, any>): Record<string, any> {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Handle original onKeyDown if it exists
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }

    // Add Enter and Space key support for clickable elements
    if ((e.key === 'Enter' || e.key === ' ') && props.onClick) {
      e.preventDefault();
      props.onClick(e);
    }
  };

  return {
    ...props,
    onKeyDown: handleKeyDown,
    tabIndex: props.tabIndex || 0,
    role: props.role || 'button',
  };
}

/**
 * Creates a unique ID for form elements
 * @param prefix The prefix for the ID
 * @returns A unique ID
 */
export function createUniqueId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 9)}`;
}
