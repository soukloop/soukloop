# Soukloop Design System

## Overview
This document defines the standardized design system for Soukloop V3, ensuring consistency across all admin, seller, and user-facing pages.

## Color Palette

### Primary Colors
- **Orange (Primary)**: `orange-500` (#F97316) - Main brand color for CTAs and primary actions
- **Orange Hover**: `orange-600` (#EA580C) - Hover state for orange buttons
- **Orange Light**: `orange-50` (#FFF7ED) - Background highlights

### Neutral Colors
- **Gray Scale**: Use Tailwind's gray palette (`gray-50` to `gray-900`)
- **White**: `white` (#FFFFFF) - Background and cards
- **Black**: `gray-900` (#111827) - Primary text

### Semantic Colors
- **Success**: `green-500` (#22C55E) - Success states, positive metrics
- **Warning**: `yellow-500` (#EAB308) - Warning states, pending items
- **Error**: `red-500` (#EF4444) - Error states, destructive actions
- **Info**: `blue-500` (#3B82F6) - Informational messages

## Typography

### Font Family
- **Primary**: Geomanist (custom font loaded via `@font-face`)
- **Fallback**: System fonts (sans-serif)

### Font Sizes
- **Heading 1**: `text-3xl` (30px) - Page titles
- **Heading 2**: `text-2xl` (24px) - Section titles
- **Heading 3**: `text-xl` (20px) - Subsection titles
- **Body**: `text-base` (16px) - Default body text
- **Small**: `text-sm` (14px) - Secondary text, labels
- **Extra Small**: `text-xs` (12px) - Captions, helper text

### Font Weights
- **Bold**: `font-bold` (700) - Headings, emphasis
- **Semibold**: `font-semibold` (600) - Subheadings
- **Medium**: `font-medium` (500) - Labels, buttons
- **Normal**: `font-normal` (400) - Body text

## Components

### Buttons

#### Primary Button
```tsx
<Button>Primary Action</Button>
```
- **Use**: Main CTAs, primary actions
- **Style**: Orange background, white text, rounded corners

#### Secondary Button
```tsx
<Button variant="secondary">Secondary Action</Button>
```
- **Use**: Secondary actions, less emphasis
- **Style**: Gray background, dark text

#### Outline Button
```tsx
<Button variant="outline">Outline Action</Button>
```
- **Use**: Tertiary actions, cancel buttons
- **Style**: Transparent background, border, dark text

#### Destructive Button
```tsx
<Button variant="destructive">Delete</Button>
```
- **Use**: Destructive actions (delete, remove)
- **Style**: Red background, white text

#### Ghost Button
```tsx
<Button variant="ghost">Ghost Action</Button>
```
- **Use**: Minimal emphasis, icon buttons
- **Style**: Transparent background, no border

#### Button Sizes
- **Default**: `size="default"` - Standard size
- **Small**: `size="sm"` - Compact areas, tables
- **Large**: `size="lg"` - Hero sections, emphasis
- **Icon**: `size="icon"` - Icon-only buttons

#### Button Modifiers
- **Rounded Full**: Add `className="rounded-full"` for pill-shaped buttons
- **Disabled**: Use `disabled` prop for inactive state

### Cards

#### Basic Card
```tsx
<Card>
  <CardContent>
    Content here
  </CardContent>
</Card>
```
- **Use**: Content containers, data display
- **Style**: White background, subtle shadow, rounded corners

#### Card with Header
```tsx
<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Description</CardDescription>
  </CardHeader>
  <CardContent>
    Content here
  </CardContent>
</Card>
```

### Modals/Dialogs

#### Standard Dialog
```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogDescription>Dialog description</DialogDescription>
    </DialogHeader>
    {/* Content */}
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button>Confirm</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Inputs

#### Text Input
```tsx
<Input type="text" placeholder="Enter text" />
```

#### Select Dropdown
```tsx
<Select>
  <SelectTrigger>
    <SelectValue placeholder="Select option" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Option 1</SelectItem>
    <SelectItem value="option2">Option 2</SelectItem>
  </SelectContent>
</Select>
```

### Status Badges

#### Success Badge
```tsx
<span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-800">
  Success
</span>
```

#### Warning Badge
```tsx
<span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
  Warning
</span>
```

#### Error Badge
```tsx
<span className="inline-flex items-center rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-800">
  Error
</span>
```

## Spacing

### Padding
- **Extra Small**: `p-2` (8px)
- **Small**: `p-4` (16px)
- **Medium**: `p-6` (24px)
- **Large**: `p-8` (32px)

### Margin
- **Extra Small**: `m-2` (8px)
- **Small**: `m-4` (16px)
- **Medium**: `m-6` (24px)
- **Large**: `m-8` (32px)

### Gap
- **Small**: `gap-2` (8px)
- **Medium**: `gap-4` (16px)
- **Large**: `gap-6` (24px)

## Border Radius
- **Small**: `rounded-sm` (2px)
- **Default**: `rounded` (4px)
- **Medium**: `rounded-md` (6px)
- **Large**: `rounded-lg` (8px)
- **Extra Large**: `rounded-xl` (12px)
- **Full**: `rounded-full` (9999px) - Pills, circles

## Shadows
- **Small**: `shadow-sm` - Subtle elevation
- **Default**: `shadow` - Standard elevation
- **Medium**: `shadow-md` - Moderate elevation
- **Large**: `shadow-lg` - High elevation
- **Extra Large**: `shadow-xl` - Maximum elevation

## Dark Mode

### Implementation
- Use `dark:` prefix for dark mode variants
- Theme managed by `next-themes` with `class` attribute
- CSS variables defined in `globals.css` for both light and dark modes

### Example
```tsx
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
  Content adapts to theme
</div>
```

## Best Practices

### Do's ✅
- Use shadcn/ui components for all UI elements
- Follow the defined color palette
- Maintain consistent spacing and sizing
- Use semantic HTML elements
- Implement proper loading and error states
- Ensure accessibility (ARIA labels, keyboard navigation)
- Test in both light and dark modes

### Don'ts ❌
- Don't create custom button styles - use Button component variants
- Don't use arbitrary colors - stick to the defined palette
- Don't mix different design patterns in the same section
- Don't forget responsive design (use Tailwind breakpoints)
- Don't hardcode colors - use Tailwind classes or CSS variables
- Don't skip loading states for async operations

## Responsive Design

### Breakpoints
- **Mobile**: Default (< 640px)
- **Tablet**: `sm:` (≥ 640px)
- **Desktop**: `md:` (≥ 768px)
- **Large Desktop**: `lg:` (≥ 1024px)
- **Extra Large**: `xl:` (≥ 1280px)

### Mobile-First Approach
Always design for mobile first, then add larger breakpoint styles:
```tsx
<div className="p-4 sm:p-6 lg:p-8">
  {/* Padding increases on larger screens */}
</div>
```

## Accessibility

### Guidelines
- Maintain color contrast ratios (WCAG AA minimum)
- Provide alt text for images
- Use semantic HTML (button, nav, main, etc.)
- Include ARIA labels for icon-only buttons
- Ensure keyboard navigation works
- Test with screen readers

### Example
```tsx
<Button aria-label="Close dialog">
  <X className="h-4 w-4" />
</Button>
```

## Animation & Transitions

### Standard Transitions
```tsx
className="transition-colors duration-200"  // Color transitions
className="transition-all duration-300"     // All properties
className="hover:scale-105 transition-transform"  // Scale on hover
```

### Loading States
```tsx
<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
```

## File Organization

### Component Structure
```
components/
├── ui/              # shadcn/ui components
├── theme-provider.tsx
├── theme-toggle.tsx
└── [custom-components].tsx
```

### Page Structure
```
app/
├── admin/
│   ├── components/
│   ├── page.tsx
│   └── loading.tsx
├── seller/
│   ├── components/
│   ├── page.tsx
│   └── loading.tsx
└── [other-routes]/
```

## Version
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16
- **Maintained By**: Soukloop Development Team

---

For questions or suggestions about the design system, please contact the development team.

