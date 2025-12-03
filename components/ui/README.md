# Axon Overclocking Design System

## Overview

This is a comprehensive glassmorphism design system for the Axon Overclocking brain training application. All components are built with Next.js 15 App Router, TypeScript, and Tailwind CSS.

## Design Philosophy

### Glassmorphism Aesthetic

- **Semi-transparent backgrounds**: `bg-white/10` to `bg-white/20`
- **Backdrop blur**: `backdrop-blur-md` or `backdrop-blur-lg`
- **Borders**: `border border-white/20` for subtle definition
- **Shadows**: `shadow-xl` or `shadow-2xl` for depth
- **Rounded corners**: `rounded-xl` or `rounded-2xl`

### Color Palette

```typescript
// Primary Brand Colors
Purple: #667eea (var(--primary-purple))
Indigo: #764ba2 (var(--primary-indigo))

// Semantic Colors
Success/Correct: #10b981 (green-500)
Error/Incorrect: #ef4444 (red-500)
Warning/Missed: #f59e0b (yellow-500)
Info: #3b82f6 (blue-500)

// Text Colors
On Glass: #ffffff (white)
Primary: #1f2937 (gray-900)
Secondary: #6b7280 (gray-500)
```

### Typography

- **Font Family**: System fonts (Apple System, Segoe UI, Roboto)
- **Headings**: `font-bold` with sizes `text-xl` to `text-4xl`
- **Body**: `font-normal text-base`
- **Small Text**: `text-sm` or `text-xs`

### Spacing System

- **Extra Small**: `gap-1`, `p-1` (4px)
- **Small**: `gap-2`, `p-2` (8px)
- **Medium**: `gap-4`, `p-4` (16px)
- **Large**: `gap-6`, `p-6` (24px)
- **Extra Large**: `gap-8`, `p-8` (32px)

### Responsive Breakpoints

```css
sm: 640px   /* Tablet portrait */
md: 768px   /* Tablet landscape */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large desktop */
```

---

## Component Library

### Card

Glass-morphism card with semi-transparent background and backdrop blur.

**Props:**

- `children: ReactNode` - Card content
- `className?: string` - Additional CSS classes
- `blur?: 'sm' | 'md' | 'lg'` - Blur intensity (default: 'md')
- `hover?: boolean` - Enable hover animation (default: true)
- `onClick?: () => void` - Optional click handler

**Usage:**

```tsx
import { Card } from '@/components/ui';

<Card blur="md" hover={true}>
  <h2 className="text-xl font-bold mb-2">Card Title</h2>
  <p className="text-white/80">Card content goes here</p>
</Card>
```

**Styling:**

- Base: `backdrop-blur-md bg-white/10 border border-white/20`
- Hover: `hover:bg-white/15 hover:scale-[1.02]`
- Rounded: `rounded-2xl`
- Shadow: `shadow-xl`

---

### Button

Multi-variant button component with hover and disabled states.

**Props:**

- `children: ReactNode` - Button text/content
- `variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost'` - Style variant (default: 'primary')
- `size?: 'sm' | 'md' | 'lg'` - Button size (default: 'md')
- `disabled?: boolean` - Disable button (default: false)
- `type?: 'button' | 'submit' | 'reset'` - Button type (default: 'button')
- `className?: string` - Additional CSS classes
- `onClick?: () => void` - Click handler

**Usage:**

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Start Training
</Button>

<Button variant="success" size="lg">
  Submit Answer
</Button>

<Button variant="secondary" disabled>
  Loading...
</Button>
```

**Variants:**

- **Primary**: Purple gradient background (`from-purple-500 to-indigo-600`)
- **Secondary**: Glass effect with border
- **Success**: Green background for correct answers
- **Danger**: Red background for errors
- **Ghost**: Transparent with hover effect

---

### Input

Form input with glassmorphism styling and error states.

**Props:**

- `label?: string` - Input label
- `error?: string` - Error message to display
- `helperText?: string` - Helper text below input
- `type?: string` - Input type (default: 'text')
- `placeholder?: string` - Placeholder text
- `value?: string` - Input value
- `onChange?: (e) => void` - Change handler
- `disabled?: boolean` - Disable input
- `required?: boolean` - Show required indicator
- `autoFocus?: boolean` - Auto-focus on mount
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { Input } from '@/components/ui';

<Input
  label="Username"
  placeholder="Enter your username"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
  required
/>

<Input
  label="Email"
  type="email"
  error="Invalid email address"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

**States:**

- **Default**: `border-white/20`
- **Focus**: `focus:border-purple-400 focus:ring-2 focus:ring-purple-500/50`
- **Error**: `border-red-400 focus:border-red-500`
- **Disabled**: `opacity-50 cursor-not-allowed`

---

### Badge

Small pill-shaped indicator for labels and status.

**Props:**

- `children: ReactNode` - Badge content
- `variant?: 'default' | 'success' | 'warning' | 'error' | 'info'` - Color variant (default: 'default')
- `size?: 'sm' | 'md' | 'lg'` - Badge size (default: 'md')
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Correct</Badge>
<Badge variant="error">Incorrect</Badge>
<Badge variant="warning">Missed</Badge>
<Badge variant="info" size="sm">Easy</Badge>
```

**Use Cases:**

- Training difficulty levels
- Answer correctness indicators
- Category labels
- Status indicators

---

### ProgressBar

Progress indicator for scores, timers, and completion tracking.

**Props:**

- `value: number` - Current value
- `max?: number` - Maximum value (default: 100)
- `variant?: 'default' | 'success' | 'warning' | 'danger'` - Color variant (default: 'default')
- `showLabel?: boolean` - Show percentage label (default: false)
- `animated?: boolean` - Animate changes (default: false)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { ProgressBar } from '@/components/ui';

<ProgressBar value={75} max={100} variant="success" showLabel />

<ProgressBar value={correctAnswers} max={totalQuestions} animated />
```

**Variants:**

- **Default**: Purple-to-indigo gradient
- **Success**: Green for high scores
- **Warning**: Yellow for medium scores
- **Danger**: Red for low scores

---

### Modal

Overlay modal with backdrop blur and glassmorphism.

**Props:**

- `isOpen: boolean` - Modal visibility
- `onClose: () => void` - Close handler
- `title?: string` - Modal title
- `children: ReactNode` - Modal content
- `size?: 'sm' | 'md' | 'lg' | 'xl'` - Modal width (default: 'md')
- `closeOnOverlayClick?: boolean` - Close when clicking outside (default: true)
- `showCloseButton?: boolean` - Show X button (default: true)

**Usage:**

```tsx
import { Modal } from '@/components/ui';
import { useState } from 'react';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Training Complete"
  size="lg"
>
  <p>You scored 85%!</p>
  <Button onClick={() => setIsOpen(false)}>Close</Button>
</Modal>
```

**Features:**

- ESC key to close
- Click outside to close (optional)
- Prevents body scroll when open
- Smooth animations (fade + scale)
- Accessible (ARIA attributes)

---

### Timer

Countdown timer with color changes and circular progress.

**Props:**

- `seconds: number` - Initial seconds
- `onComplete?: () => void` - Callback when timer reaches 0
- `variant?: 'default' | 'warning' | 'danger'` - Fixed color variant (default: 'default')
- `size?: 'sm' | 'md' | 'lg'` - Display size (default: 'md')
- `autoStart?: boolean` - Start automatically (default: true)
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { Timer } from '@/components/ui';

<Timer
  seconds={60}
  onComplete={() => console.log('Time up!')}
/>
```

**Behavior:**

- Format: MM:SS
- Color changes automatically:
  - Green: >50% remaining
  - Yellow: 20-50% remaining
  - Red: <20% remaining
- Circular progress ring
- Auto-stops at 0

---

## Layout Components

### AnimatedBackground

Renders animated floating blobs for the background.

**Usage:**

```tsx
import { AnimatedBackground } from '@/components/layout';

<AnimatedBackground />
```

Include once in your root layout (app/layout.tsx).

---

### PageContainer

Centers and constrains page content with responsive padding.

**Props:**

- `children: ReactNode` - Page content
- `maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full'` - Max width (default: 'xl')
- `className?: string` - Additional CSS classes

**Usage:**

```tsx
import { PageContainer } from '@/components/layout';

<PageContainer maxWidth="xl">
  <h1>Page Title</h1>
  <p>Page content...</p>
</PageContainer>
```

---

### NavBar

Navigation bar with user menu and responsive hamburger menu.

**Props:**

- `user?: { name: string; username: string } | null` - Logged in user

**Usage:**

```tsx
import { NavBar } from '@/components/layout';

<NavBar user={{ name: "John Doe", username: "johndoe" }} />
```

**Features:**

- Sticky positioning
- Glassmorphism effect
- Responsive hamburger menu
- User avatar with initials
- Sign in/out links

---

## Accessibility

All components follow WCAG 2.1 AA standards:

- **Keyboard Navigation**: All interactive elements are focusable
- **Focus Indicators**: Purple ring on focus (`focus:ring-2 focus:ring-purple-500`)
- **ARIA Labels**: Proper labels for screen readers
- **Color Contrast**: Minimum 4.5:1 for text
- **Semantic HTML**: Using proper HTML elements

---

## Performance

- **Server Components by default**: Only use 'use client' when necessary
- **Tree-shakeable exports**: Import only what you need
- **Optimized animations**: Using `transform` and `opacity` for 60fps
- **No inline styles**: Pure Tailwind utilities

---

## Best Practices

### Importing Components

```tsx
// Import from barrel export
import { Card, Button, Input } from '@/components/ui';
import { PageContainer, NavBar } from '@/components/layout';
```

### Composing Components

```tsx
<Card blur="lg">
  <h2 className="text-2xl font-bold mb-4">Word Memory</h2>
  <p className="mb-6">Memorize as many words as you can!</p>
  <Button variant="primary" size="lg">
    Start Training
  </Button>
</Card>
```

### Responsive Design

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <Card>Mobile: 1 col, Tablet: 2 cols, Desktop: 4 cols</Card>
</div>
```

### Custom Styling

```tsx
// Add className for custom styles
<Button className="w-full mt-4" variant="primary">
  Full Width Button
</Button>

<Card className="!bg-purple-500/20">
  Custom background opacity
</Card>
```

---

## Examples

See `/app/design-system/page.tsx` for live examples of all components.

---

## Support

For questions or issues with the design system, refer to the component source files in `components/ui/` and `components/layout/`.
