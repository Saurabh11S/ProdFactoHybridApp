# FACTO Logo

## Logo Specifications

- **Design**: Premium Fintech Style
- **Top Text**: "FACTO" curved on top
- **Bottom Text**: "FACTO" curved on bottom  
- **Center Symbol**: ₹ (Rupee symbol)
- **Style**: Clean premium fintech gradient (Blue to Deep Blue)
- **No Circle Outline**: Clean, modern design

## Files

- `NavLogo.svg` - Scalable vector logo (recommended for web/mobile)
- `NavLogo.png` - Raster version (for compatibility)

## Usage

### SVG (Recommended)
```html
<img src="/logo/NavLogo.svg" alt="FACTO Logo" />
```

### React Component
```tsx
import { FactoLogo } from '@/components/common/FactoLogo';

<FactoLogo width={48} height={48} />
```

## Converting SVG to PNG

To generate PNG versions from SVG:

1. **Using Inkscape (Command Line)**:
   ```bash
   inkscape NavLogo.svg --export-filename=NavLogo.png --export-width=512 --export-height=512
   ```

2. **Using ImageMagick**:
   ```bash
   convert -background none -density 300 NavLogo.svg NavLogo.png
   ```

3. **Online Tools**: Use tools like CloudConvert, SVGtoPNG, or similar services

4. **Browser**: Open SVG in browser and use screenshot tools

## Recommended Sizes

- **Favicon**: 32x32, 64x64
- **App Icon**: 192x192, 512x512
- **Navigation**: 48x48, 64x64
- **Header**: 96x96, 128x128

