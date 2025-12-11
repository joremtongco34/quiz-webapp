# Design Variants Guide

This application supports two design variants that can be run simultaneously on different ports.

## Design Variants

### 1. Flat Design (Port 3001)
- **Style**: Minimalist, clean, flat design
- **Colors**: Gray scale with blue accents
- **Shadows**: Subtle, minimal shadows
- **Borders**: Simple, clean borders
- **Rounded Corners**: Moderate (8-12px)
- **Gradients**: None (solid colors only)

### 2. Colorful Design (Port 3002)
- **Style**: Vibrant, colorful, modern design
- **Colors**: Indigo, purple, pink gradients
- **Shadows**: Enhanced shadows with color tints
- **Borders**: Colorful borders with gradients
- **Rounded Corners**: More pronounced (16-24px)
- **Gradients**: Extensive use of gradients throughout

## Running the Designs

### Run Flat Design (Port 3001)
```bash
npm run dev:flat
```
Access at: http://localhost:3001

### Run Colorful Design (Port 3002)
```bash
npm run dev:colorful
```
Access at: http://localhost:3002

### Run Both Simultaneously
Open two terminal windows:
- Terminal 1: `npm run dev:flat`
- Terminal 2: `npm run dev:colorful`

## Design Differences

### Buttons
- **Flat**: Solid blue/gray backgrounds, minimal shadows
- **Colorful**: Gradient backgrounds (indigo→purple→pink), enhanced shadows

### Cards
- **Flat**: White background, subtle gray borders, minimal shadows
- **Colorful**: White background, colorful borders, enhanced shadows with color tints

### Rankings/Leaderboard
- **Flat**: Gray backgrounds for top 3, simple borders
- **Colorful**: Gradient backgrounds (yellow/orange for top 3), colorful borders

### Input Fields
- **Flat**: Gray borders, simple focus states
- **Colorful**: Purple/pink borders, gradient backgrounds, colorful focus rings

### Backgrounds
- **Flat**: Solid gray (#f5f5f5)
- **Colorful**: Gradient backgrounds (indigo→purple→pink)

### Timer
- **Flat**: Blue circular progress, simple design
- **Colorful**: Gradient circular progress (indigo→purple→pink)

## Technical Implementation

The design system uses:
- Environment variable `NEXT_PUBLIC_DESIGN_THEME` to switch themes
- Theme context (`ThemeContext`) for component-level theme access
- Utility functions (`themeClasses`) for consistent styling
- Tailwind CSS classes with conditional rendering

## Notes

- Both designs maintain the same functionality
- All components are theme-aware
- The theme is determined at build/runtime via environment variable
- No code changes needed to switch themes - just use different npm scripts
