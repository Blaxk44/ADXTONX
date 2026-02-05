# AdTONX Branding Guide 🎨

## Visual Identity

### Color Palette

**Primary Colors:**
- **Cyan/Turquoise:** `#00d4ff` - Main brand color from logo
- **Primary Dark:** `#00b8e6` - Darker shade for hover states

**Secondary Colors:**
- **Purple:** `#7b2cbf` - From welcome banner, used for accents
- **Dark Blue:** `#0a0e27` - Primary background
- **Light Blue:** `#141a3d` - Secondary background

**Functional Colors:**
- **Success:** `#4caf50` - Green for positive actions
- **Error:** `#f44336` - Red for errors
- **Warning:** `#ff9800` - Orange for warnings

### Typography

**Font Family:**
- Primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif`

**Font Weights:**
- Regular: 400
- Medium: 500
- Semi-Bold: 600
- Bold: 700

**Text Colors:**
- Primary: `#ffffff` - White
- Secondary: `#b0b8d4` - Light blue-gray
- Muted: `#707890` - Darker gray

### Effects

**Glow Effect:**
```css
box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
```

**Backdrop Blur:**
```css
backdrop-filter: blur(10px);
```

**Gradients:**
```css
background: linear-gradient(135deg, #0a0e27 0%, #1a1f4e 100%);
```

## Logo Usage

### Main Logo
- **URL:** https://i.ibb.co/kVv1y82G/IMG-20260201-144811.png
- **Description:** Cyan/turquoise play button with concentric circles
- **Background:** Dark navy blue/black
- **Style:** Glowing, futuristic, digital aesthetic

### Placement Guidelines

**Header Logo:**
- Size: 32px × 32px
- Position: Top left of header
- Usage: Main app header, admin panel

**Loading Logo:**
- Size: 120px × 120px
- Position: Center of loading screen
- Animation: Pulse effect (scale and glow)

### Logo Variations

**With Text:**
```
[Logo Icon] AdTONX
```

**Icon Only:**
```
[Logo Icon]
```

## Welcome Banner

### Banner Image
- **URL:** https://i.ibb.co/1Y995gP6/IMG-20260201-153702.png
- **Description:** Digital wallet with TON coins, referral figures, task completion icons
- **Style:** Futuristic, dark blue to purple gradient
- **Usage:** Welcome screen for new users

## Design Principles

### 1. Futuristic & Digital
- Use glow effects on interactive elements
- Apply backdrop blur for modern glass effect
- Incorporate gradient backgrounds
- Use cyan/turquoise as accent color

### 2. High Contrast
- Ensure text readability on dark backgrounds
- Use white text for primary content
- Use light blue-gray for secondary text
- Maintain sufficient contrast ratios

### 3. Smooth Animations
- Fade-in effects for screen transitions
- Pulse animation for loading states
- Scale effects on button hover
- Smooth transitions (0.3s ease)

### 4. Mobile-First
- Optimize for 320px-500px width
- Touch-friendly button sizes (min 44px height)
- Readable font sizes (14px base)
- Clear visual hierarchy

## Component Styling

### Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #00d4ff, #00b8e6);
box-shadow: 0 0 20px rgba(0, 212, 255, 0.3);
border: 1px solid rgba(0, 212, 255, 0.3);
```

**Secondary Button:**
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid #2a3266;
```

### Cards

**Standard Card:**
```css
background: rgba(255, 255, 255, 0.05);
border: 1px solid #2a3266;
backdrop-filter: blur(10px);
box-shadow: 0 4px 16px rgba(0, 212, 255, 0.15);
```

**Balance Card:**
```css
background: linear-gradient(135deg, rgba(0, 212, 255, 0.2), rgba(0, 184, 230, 0.1));
border: 1px solid rgba(0, 212, 255, 0.3);
box-shadow: 0 4px 16px rgba(0, 212, 255, 0.15), 0 0 20px rgba(0, 212, 255, 0.3);
```

### Inputs

**Text Input:**
```css
background: rgba(0, 0, 0, 0.2);
border: 1px solid #2a3266;
color: #ffffff;
```

**Input Focus:**
```css
border-color: #00d4ff;
box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.2);
```

## Animation Timings

- **Fast:** 0.2s - Button hover, small interactions
- **Medium:** 0.3s - Screen transitions, card animations
- **Slow:** 0.5s - Welcome screen fade-in
- **Pulse:** 2s - Loading animation

## Spacing System

- **XS:** 4px - Small gaps
- **SM:** 8px - Element spacing
- **MD:** 16px - Component padding
- **LG:** 24px - Section spacing
- **XL:** 32px - Major spacing

## Border Radius

- **SM:** 6px - Small elements
- **MD:** 10px - Cards, buttons
- **LG:** 16px - Large cards, modals
- **XL:** 24px - Welcome screen elements

## Responsive Breakpoints

- **Mobile:** 320px - 500px (primary target)
- **Tablet:** 501px - 768px
- **Desktop:** 769px+

## Accessibility

### Color Contrast
- Ensure WCAG AA compliance (4.5:1 ratio)
- Use lighter shades of cyan for text on dark backgrounds

### Focus States
- Always provide visual feedback for keyboard navigation
- Use cyan glow for focused elements

### Screen Readers
- Include alt text for all images
- Use semantic HTML elements
- Provide text alternatives for icons

## Image Assets

### Logo
- **Primary:** https://i.ibb.co/kVv1y82G/IMG-20260201-144811.png
- **Format:** PNG with transparency
- **Background:** Transparent (for light/dark modes)

### Welcome Banner
- **URL:** https://i.ibb.co/1Y995gP6/IMG-20260201-153702.png
- **Format:** PNG
- **Usage:** Welcome screen only

## Icon System

### UI Icons
- Use emoji for simple icons (📺, ✅, 👥, 💰)
- Consistent style throughout app
- Size: 20px default, 32px for featured

### Status Icons
- Success: ✅
- Error: ❌
- Warning: ⚠️
- Info: ℹ️

## Customizing the Theme

### Changing Primary Color
Update CSS variables:
```css
:root {
    --primary-color: #YOUR_COLOR;
    --primary-dark: #DARKER_SHADE;
}
```

### Updating Logo
Replace logo URLs in:
1. `index.html` - Loading screen, header
2. `admin.html` - Login screen, sidebar

### Modifying Gradients
Update background gradient:
```css
background: linear-gradient(135deg, #COLOR1 0%, #COLOR2 100%);
```

## Brand Consistency

### Do's
✅ Use cyan/turquoise for primary actions
✅ Apply glow effects to interactive elements
✅ Maintain dark theme throughout
✅ Use consistent spacing and typography
✅ Include logo on all screens

### Don'ts
❌ Don't use bright colors for backgrounds
❌ Don't mix too many accent colors
❌ Don't remove glow effects from buttons
❌ Don't use light backgrounds for main content
❌ Don't deviate from the defined color palette

## Future Enhancements

- [ ] Light mode variant
- [ ] Custom icon set (SVG)
- [ ] Animated logo
- [ ] Particle effects
- [ ] Sound effects for interactions
- [ ] Dark mode auto-detection

---

**Maintain consistency across all touchpoints to build a strong brand identity!**