# Component Quick Reference

## Import Statement

```tsx
import { Card, Button, Input, Badge, ProgressBar, Modal, Timer } from '@/components/ui';
import { AnimatedBackground, PageContainer, NavBar } from '@/components/layout';
```

---

## Card

```tsx
<Card blur="md" hover={true} className="p-6">
  <h2>Title</h2>
  <p>Content</p>
</Card>
```

**Props**: `blur?: 'sm'|'md'|'lg'`, `hover?: boolean`, `onClick?: () => void`

---

## Button

```tsx
<Button variant="primary" size="md" onClick={handleClick}>
  Click Me
</Button>
```

**Variants**: `primary`, `secondary`, `success`, `danger`, `ghost`
**Sizes**: `sm`, `md`, `lg`

---

## Input

```tsx
<Input
  label="Username"
  value={value}
  onChange={handleChange}
  error="Error message"
  required
/>
```

---

## Badge

```tsx
<Badge variant="success" size="md">Correct</Badge>
```

**Variants**: `default`, `success`, `warning`, `error`, `info`

---

## ProgressBar

```tsx
<ProgressBar value={75} max={100} variant="success" showLabel animated />
```

---

## Modal

```tsx
const [isOpen, setIsOpen] = useState(false);

<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Title">
  <p>Content</p>
</Modal>
```

---

## Timer

```tsx
<Timer seconds={60} onComplete={() => alert('Done!')} size="lg" />
```

Auto color-changing: Green > 50%, Yellow 20-50%, Red < 20%

---

## PageContainer

```tsx
<PageContainer maxWidth="xl">
  <h1>Page content</h1>
</PageContainer>
```

**Max Width**: `sm`, `md`, `lg`, `xl`, `2xl`, `full`

---

## NavBar

```tsx
<NavBar user={{ name: "John", username: "john" }} />
```

Sticky navbar with glassmorphism, responsive hamburger menu

---

## AnimatedBackground

```tsx
// In app/layout.tsx (once only)
<AnimatedBackground />
```

Three floating animated blobs

---

## Color System

- **Primary**: Purple-to-Indigo gradient (`from-purple-500 to-indigo-600`)
- **Success**: Green `#10b981` - Correct answers
- **Error**: Red `#ef4444` - Incorrect answers
- **Warning**: Yellow `#f59e0b` - Missed items
- **Info**: Blue `#3b82f6` - Information

---

## Responsive Breakpoints

- `sm`: 640px (Tablet portrait)
- `md`: 768px (Tablet landscape)
- `lg`: 1024px (Desktop)
- `xl`: 1280px (Large desktop)
- `2xl`: 1536px (XL desktop)

---

## Accessibility

All components include:
- Keyboard navigation
- Focus indicators (purple ring)
- ARIA labels
- Semantic HTML
- Screen reader support

---

## Full Docs

See `components/ui/README.md` for complete documentation.

## Live Demo

http://localhost:3002/design-system
