# Accessibility Guidelines for Noisy

This document outlines the accessibility standards and best practices for the Noisy application.

## Core Principles

1. **Perceivable**: Information and user interface components must be presentable to users in ways they can perceive.
2. **Operable**: User interface components and navigation must be operable.
3. **Understandable**: Information and the operation of the user interface must be understandable.
4. **Robust**: Content must be robust enough to be interpreted by a wide variety of user agents, including assistive technologies.

## Implementation Guidelines

### Buttons and Interactive Elements

- All buttons must have an accessible name (text content or `aria-label`)
- Icon-only buttons must have an `aria-label` attribute
- Use `aria-pressed` for toggle buttons
- Ensure all interactive elements are keyboard accessible

```jsx
// Good example
<Button aria-label="Close dialog">
  <X className="h-4 w-4" aria-hidden="true" />
</Button>

// Bad example
<Button>
  <X className="h-4 w-4" />
</Button>
```

### Images

- All images must have appropriate `alt` text
- Decorative images should have `alt=""` or `aria-hidden="true"`
- Complex images should have detailed descriptions

```jsx
// Good example
<img src="/hero-image.jpeg" alt="Social media content creator using Noisy to generate viral content" />

// Bad example
<img src="/hero-image.jpeg" alt="Image" />
```

### Forms

- All form fields must have associated labels
- Error messages should be linked to their respective fields
- Use `aria-describedby` for additional field descriptions
- Group related fields with `fieldset` and `legend`

```jsx
// Good example
<FormItem>
  <FormLabel htmlFor="email">Email</FormLabel>
  <FormControl>
    <Input id="email" type="email" aria-describedby="email-description" />
  </FormControl>
  <FormDescription id="email-description">
    We'll never share your email with anyone else.
  </FormDescription>
  <FormMessage />
</FormItem>

// Bad example
<div>
  <input type="email" placeholder="Enter email" />
</div>
```

### Dialogs and Modals

- Use appropriate ARIA roles (`role="dialog"`, `role="alertdialog"`)
- Ensure focus is trapped within the dialog when open
- Return focus to the triggering element when closed
- Provide a visible close button

```jsx
// Good example
<Dialog>
  <DialogTrigger asChild>
    <Button aria-label="Open settings">Settings</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Settings</DialogTitle>
      <DialogDescription>
        Adjust your application settings here.
      </DialogDescription>
    </DialogHeader>
    <DialogClose aria-label="Close dialog" />
  </DialogContent>
</Dialog>
```

### Color and Contrast

- Ensure sufficient color contrast (4.5:1 for normal text, 3:1 for large text)
- Don't rely on color alone to convey information
- Provide visual focus indicators for keyboard navigation

### Headings and Structure

- Use semantic HTML elements (`<header>`, `<main>`, `<nav>`, `<footer>`, etc.)
- Maintain proper heading hierarchy (h1 -> h2 -> h3, etc.)
- Use landmarks to help screen reader users navigate

## Testing

- Use the built-in A11yChecker component during development
- Test with keyboard navigation
- Test with screen readers (NVDA, VoiceOver, JAWS)
- Use automated tools like axe-core or Lighthouse

## Utility Functions

We've added accessibility utility functions in `src/lib/a11y.ts`:

```jsx
// Ensure an element has an accessible name
import { ensureAccessibleName } from '@/lib/a11y';

<Button {...ensureAccessibleName(props, "Default label")}>
  <Icon />
</Button>

// Mark elements as decorative
import { markAsDecorative } from '@/lib/a11y';

<Icon {...markAsDecorative(props)} />

// Add keyboard support to clickable elements
import { addKeyboardSupport } from '@/lib/a11y';

<div {...addKeyboardSupport(props)} onClick={handleClick}>
  Click me
</div>
```

## Resources

- [Web Content Accessibility Guidelines (WCAG)](https://www.w3.org/WAI/standards-guidelines/wcag/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
