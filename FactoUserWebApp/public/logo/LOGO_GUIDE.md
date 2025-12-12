# FACTO Logo - Design Guide

## Logo Design Specifications

✅ **"FACTO" curved on top** - Text follows an upward arc  
✅ **"FACTO" curved on bottom** - Text follows a downward arc  
✅ **No circle outline** - Clean, modern design  
✅ **₹ symbol in the center** - Prominent rupee symbol  
✅ **Clean premium fintech gradient style** - Blue gradient (#007AFF → #0056CC → #003D99)

## Files Created

1. **NavLogo.svg** - Scalable vector logo (primary format)
   - Location: `public/logo/NavLogo.svg`
   - ViewBox: 200x200
   - Format: SVG with gradients and filters

2. **FactoLogo.tsx** - React component
   - Location: `src/components/common/FactoLogo.tsx`
   - Usage: `<FactoLogo width={48} height={48} />`

3. **logo-preview.html** - Preview file
   - Location: `public/logo/logo-preview.html`
   - Open in browser to preview logo at different sizes

4. **generate-logo-png.js** - Conversion script
   - Location: `scripts/generate-logo-png.js`
   - Converts SVG to PNG for compatibility

## Usage

### In HTML/React (SVG)
```tsx
// Direct image reference
<img src="/logo/NavLogo.svg" alt="FACTO Logo" width="48" height="48" />

// React component
import { FactoLogo } from '@/components/common/FactoLogo';
<FactoLogo width={48} height={48} />
```

### Current Implementation
The logo is already integrated in:
- `src/components/mobile/MobileHeader.tsx` - Uses `/logo/NavLogo.png`
- `src/components/Navigation.tsx` - Uses `/logo/NavLogo.png`
- `index.html` - Favicon uses `/logo/NavLogo.svg` (with PNG fallback)

## Generating PNG Versions

For better browser compatibility (especially favicons), generate PNG versions:

### Option 1: Using the Script
```bash
cd FactoUserWebApp
npm install --save-dev puppeteer  # or sharp
node scripts/generate-logo-png.js
```

### Option 2: Manual Conversion
1. Open `NavLogo.svg` in Chrome/Firefox
2. Right-click → Inspect → Screenshot node
3. Or use online tools: CloudConvert, SVGtoPNG

### Option 3: Browser DevTools
1. Open `public/logo/logo-preview.html` in browser
2. Use browser screenshot tools
3. Export at required sizes

## Recommended Sizes

- **Favicon**: 32x32, 64x64
- **App Icon**: 192x192, 512x512  
- **Navigation**: 48x48, 64x64
- **Header**: 96x96, 128x128
- **Large Display**: 200x200, 400x400

## Color Palette

- **Primary Gradient**: #007AFF → #0056CC → #003D99
- **Accent Gradient**: #00D4FF → #007AFF → #0056CC
- **Style**: Premium fintech blue tones

## Design Notes

- The logo uses SVG textPath for curved text
- Gradients create depth and premium feel
- Shadow filter adds subtle depth
- No circular outline maintains modern, clean aesthetic
- Rupee symbol is prominently centered

## Browser Support

- **SVG**: Supported in all modern browsers
- **PNG**: Universal support (generate for fallback)
- **React Component**: Works with React 16+

## Next Steps

1. ✅ SVG logo created
2. ✅ React component created  
3. ✅ HTML updated with SVG favicon
4. ⏳ Generate PNG versions (optional, for compatibility)
5. ⏳ Update app icons in Android/iOS projects (if needed)

