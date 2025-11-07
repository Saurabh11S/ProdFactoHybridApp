# Logo Specifications for Facto

## Recommended Logo Sizes

Based on the current Navigation component implementation, here are the recommended logo dimensions:

### Option 1: Icon-Only Logo (Replaces the blue square with "F")
- **Display Size**: 40px × 40px (current icon size)
- **Recommended Source Size**: 
  - **PNG/JPG**: 80px × 80px (2x for Retina displays) or 120px × 120px (3x for high-DPI)
  - **SVG**: Preferred format (scalable, always sharp)

### Option 2: Full Logo (Icon + Text combined)
- **Display Height**: 40-48px (to fit within the 56-64px header)
- **Display Width**: Flexible (typically 120-180px depending on design)
- **Recommended Source Size**:
  - **PNG/JPG**: 2x or 3x the display size (e.g., 80-96px height, 240-360px width)
  - **SVG**: Preferred format

### Option 3: Logo with Separate Text (Current setup - icon + "Facto" text)
- **Icon/Logo Mark**: 40px × 40px (source: 80px × 80px or SVG)
- **Text**: Can be part of the logo image or kept as separate text

## File Format Recommendations

1. **SVG** (Best Choice)
   - Scalable, always sharp at any size
   - Small file size
   - Supports transparency
   - Recommended for logos

2. **PNG** (Good Alternative)
   - Supports transparency
   - Use 2x or 3x resolution for high-DPI displays
   - Example: 80px × 80px for 40px display

3. **JPG** (Not Recommended)
   - No transparency support
   - Use only if logo has solid background

## File Location

Place your logo file(s) in: `FactoUserWebApp/public/logo/`

Suggested file names:
- `logo.svg` (SVG format - recommended)
- `logo.png` (PNG format)
- `logo-icon.svg` (if using icon-only)
- `logo-full.svg` (if using full logo with text)

## Color Considerations

The current design uses:
- **Primary Blue**: `#007AFF` to `#0056CC` (gradient)
- **Text Color**: Dark mode aware (white in dark mode, gray-800 in light mode)

Your logo should:
- Work well on both light and dark backgrounds
- Consider providing two versions (light and dark) if needed
- Ensure good contrast for accessibility

## Implementation Notes

After creating your logo:
1. Place the file in `FactoUserWebApp/public/logo/`
2. The code will be updated to use `/logo/logo.svg` (or your chosen filename)
3. The logo will automatically adapt to the header size
4. Hover effects and transitions will be maintained

