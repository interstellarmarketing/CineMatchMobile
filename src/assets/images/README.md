# Logo Assets for CineMatch Mobile App

This directory contains the logo assets for the CineMatch mobile application.

## Available Assets

### Main Logos
- `logo.png` - Main CineMatch logo (PNG format, optimized for mobile)
- `logo.svg` - Main CineMatch logo (SVG format, for future use with react-native-svg)
- `logo-alt.svg` - Alternative CineMatch logo variant (SVG format)

### AI Search Logo
- `ai-search-logo.png` - AI search functionality logo

## Usage

### Using the Logo Component
The recommended way to use logos in the app is through the `Logo` component:

```typescript
import Logo from '../components/Logo';

// Basic usage
<Logo />

// With custom size
<Logo size="large" />

// With custom variant
<Logo variant="ai" size="small" />

// With custom styling
<Logo style={{ marginRight: 10 }} />
```

### Available Sizes
- `small` - 80x22px
- `medium` - 120x32px (default)
- `large` - 180x48px
- `xlarge` - 240x64px

### Available Variants
- `main` - Main CineMatch logo (default)
- `alt` - Alternative logo variant
- `ai` - AI search logo

### Direct Asset Import
You can also import assets directly:

```typescript
import { LOGO_ASSETS } from '../assets/images';

// Use in Image component
<Image source={LOGO_ASSETS.main} />
```

## Best Practices

1. **Use the Logo component** for consistent sizing and styling
2. **Choose appropriate sizes** based on context (header, splash screen, etc.)
3. **Maintain aspect ratio** - the Logo component handles this automatically
4. **Consider dark mode** - logos should work well on both light and dark backgrounds
5. **Optimize for performance** - PNG files are pre-optimized for mobile use

## File Specifications

- **Format**: PNG for mobile compatibility
- **Resolution**: Optimized for 2x and 3x device densities
- **Background**: Transparent where appropriate
- **Colors**: Champagne gold (#D4AF37) brand color

## Future Enhancements

- Add dark mode variants
- Create additional size variants
- Implement animated logo variants
- Add support for react-native-svg for vector graphics 