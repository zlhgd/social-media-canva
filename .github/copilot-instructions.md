# Copilot Instructions for Social Media Canva

## Project Overview
This is a Next.js application for creating social media visuals optimized for Instagram, Facebook, and LinkedIn.

## Code Guidelines

### General Principles
- Write modular, readable, and maintainable code
- Use TypeScript strictly with proper typing
- Follow React best practices and hooks patterns
- Keep components focused on single responsibilities
- Use meaningful variable and function names
- Keep every components in its own file (a component should never have more than 200 lines)
- Use short syntax: arrow functions, direct return, etc.

### File Organization
- `/src/app` - Next.js app router pages
- `/src/components` - React components
- `/src/lib` - Utility functions and hooks
- `/src/types` - TypeScript type definitions

### State Management
- Use localStorage for persistence via `useLocalStorage` hook
- Keep application state centralized when possible
- Use React Context for shared state if needed

### Canvas Operations
- Use `canvas-utils.ts` for all canvas drawing utilities
- Keep canvas rendering functions pure and testable
- Support scaling for preview vs full resolution export

### UI/UX Guidelines
- Keep the interface clean and maximize useful space
- Use modals/dialogs for secondary configurations
- Provide visual feedback for all interactions
- Support both mouse and touch interactions
- Each component should have stories in Storybook, with each prop demoed
- Use as less as possible hardcoded style, prefer MUI theme variables. hex colors are forbidden
- Components shouldn't have more than 250 lines, else split them

### Performance
- Use `useCallback` and `useMemo` appropriately
- Avoid unnecessary re-renders
- Keep canvas operations efficient
- Use requestAnimationFrame for smooth animations

### Before Committing
- Verify all files in the repository are useful
- Remove unused imports and dead code
- Ensure TypeScript compiles without errors
- Test all interactive features

## Component Structure
Each component should:
1. Have clear props interface defined
2. Handle loading and error states
3. Be responsive across screen sizes
4. Follow accessibility guidelines
