# Assets Directory

This directory is set up for your Submix branding assets.

## How to Add Your Assets

### 1. Logo Files
Upload your logo files and place them in this directory:
- `submix-logo-default.png` - Main logo
- `submix-logo-white.png` - White version for dark backgrounds
- `submix-logo-dark.png` - Dark version for light backgrounds
- `submix-logo.svg` - Vector version (preferred)

### 2. Font Files
If you have custom Submix fonts, place them here:
- `submix-font-regular.woff2`
- `submix-font-bold.woff2`
- `submix-font-light.woff2`

### 3. Using Assets in Components
Once uploaded, you can import assets like this:

```typescript
// Import logo
import submixLogo from "@assets/submix-logo-default.png";

// Use in component
<img src={submixLogo} alt="Submix Logo" className="h-8 w-auto" />
```

### 4. Alternative: Upload via Chat
You can also attach files directly to your messages and I'll move them to the right locations automatically.

## Current Setup
- ✅ Vite alias configured (`@assets` → `attached_assets`)
- ✅ Font loading ready in `index.css`
- ✅ Tailwind configured with custom fonts
- ✅ Brand colors added to Tailwind config
- ✅ Logo component ready to use

## Next Steps
1. Upload your logo files
2. Upload your font files (if any)
3. Tell me your brand colors
4. I'll update the components automatically