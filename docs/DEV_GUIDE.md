# CineMatch Mobile Development Guide

This guide provides comprehensive instructions for setting up and developing the CineMatch Mobile application, covering React Native with Expo, TypeScript, Firebase integration, and performance optimizations.

## 🤖 AI Search Development (Gemini Integration)

- **Gemini API Integration:**
  - Add your Gemini API key to `src/utils/constants.ts` as `GEMINI_API_KEY`.
  - The AI search feature is implemented in `src/screens/GeminiSearchScreen.tsx`.

- **Redux State:**
  - The Gemini slice (`src/utils/slices/geminiSlice.ts`) manages AI search state, results, and loading.

- **Component Best Practices:**
  - Use FlatList with `ListHeaderComponent` for any screen that combines a list with other scrollable content.
  - Only the navigation header should be sticky; all other content should scroll.
  - The AI search screen uses a sticky header for navigation and a scrollable area for all other content (search, tips, results).

- **Testing AI Search:**
  - Navigate to the AI Search screen via the "Feed Me Content" button or the "AI Search" button in the Search tab.
  - Enter natural language queries and verify that results, previous search, and tips all scroll together.

## 🚀 Prerequisites

### Required Software
- **Node.js** (v16 or higher)
- **npm** (v8 or higher) or **yarn** (v1.22 or higher)
- **Git** (v2.30 or higher)
- **Expo CLI** (`npm install -g @expo/cli`)

### Mobile Development Tools
- **Expo Go** app on your mobile device
- **Xcode** (for iOS development on macOS)
- **Android Studio** (for Android development)
- **iOS Simulator** (requires Xcode)
- **Android Emulator** (requires Android Studio)

### API Keys Required
- **TMDB API Key** - [Get from TMDB](https://www.themoviedb.org/settings/api)
- **Firebase Project** - [Create at Firebase Console](https://console.firebase.google.com/)

## 📦 Installation & Setup

### 1. Clone and Navigate to Mobile App

```bash
# Navigate to mobile app directory
cd CineMatchMobile
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# Or using yarn
yarn install
```

### 3. Configure Environment Variables

#### Update TMDB API Key
```typescript
// src/utils/constants.ts
export const TMDB_API_KEY = 'your_tmdb_bearer_token_here';
```

#### Update Firebase Configuration
```typescript
// src/utils/firebase.ts
const firebaseConfig = {
  apiKey: "your_firebase_api_key",
  authDomain: "your_project.firebaseapp.com",
  projectId: "your_project_id",
  storageBucket: "your_project.appspot.com",
  messagingSenderId: "your_sender_id",
  appId: "your_app_id"
};
```

### 4. Start Development Server

```bash
# Start Expo development server
npx expo start

# Start with specific platform
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
npx expo start --web        # Web version
```

### 5. Run on Device

- **Physical Device**: Scan QR code with Expo Go app
- **iOS Simulator**: Press 'i' in terminal
- **Android Emulator**: Press 'a' in terminal

## 🔧 Development Workflow

### Code Quality Commands

```bash
# Lint code with ESLint
npm run lint

# Format code with Prettier
npm run format

# Run tests with Jest
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### Development Commands

```bash
# Start development server
npx expo start

# Start with specific platform
npx expo start --ios        # iOS simulator
npx expo start --android    # Android emulator
npx expo start --web        # Web version

# Start with tunnel (for physical device testing)
npx expo start --tunnel

# Clear cache and restart
npx expo start --clear
```

### Building Commands

```bash
# Build for iOS
npx expo build:ios

# Build for Android
npx expo build:android

# Build for web
npx expo build:web

# Analyze bundle size
expo export --dump-assetmap
```

## 🎨 UI Components & Assets

### Logo Component
The app includes a reusable Logo component for consistent brand representation:

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

#### Available Sizes
- `small` - 80x22px
- `medium` - 120x32px (default)
- `large` - 180x48px
- `xlarge` - 240x64px

#### Available Variants
- `main` - Main CineMatch logo (default)
- `alt` - Alternative logo variant
- `ai` - AI search logo

### Asset Management
- **Location**: `src/assets/images/`
- **Index File**: `src/assets/images/index.ts` for easy importing
- **Documentation**: `src/assets/images/README.md` for usage guidelines
- **Formats**: PNG for mobile compatibility, SVG for future use

### Best Practices
- Use the Logo component for consistent sizing and styling
- Choose appropriate sizes based on context (header, splash screen, etc.)
- Maintain aspect ratio - the Logo component handles this automatically
- Consider dark mode compatibility

## 🚀 Performance Optimizations

### React Query Setup
The app uses React Query for intelligent API caching. All movie fetching hooks are optimized with:
- **Automatic caching** with 5-minute stale time
- **Background refetching** for fresh data
- **Error handling** and retry logic
- **Loading states** management

### Component Optimization
- **React.memo** for pure components (30-50% fewer re-renders)
- **Loading skeletons** for better perceived performance
- **Error boundaries** for robust error handling
- **Dynamic imports** for code splitting

### Search Optimization
- **Debounced search** (300ms delay, 70% fewer API calls)
- **Input validation** and sanitization
- **Cached search results**

## 🧪 Testing

### Testing Framework
The app uses Jest and React Native Testing Library for comprehensive testing:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run specific test file
npm test -- MovieList.test.tsx
```

### Test Structure
- **Unit tests** for components and utilities
- **Integration tests** for hooks and services
- **Test coverage** for critical paths

### Writing Tests
```typescript
// Example test structure
import React from 'react';
import { render } from '@testing-library/react-native';
import MovieList from '../MovieList';

describe('MovieList', () => {
  it('renders skeleton when loading', () => {
    const { getByTestId } = render(
      <MovieList title="Test" movies={[]} loading={true} />
    );
    expect(getByTestId('skeleton-row')).toBeTruthy();
  });
});
```

## 🔍 Code Quality

### ESLint Configuration
The app uses ESLint with TypeScript and React rules:

```bash
# Check for linting issues
npm run lint

# Auto-fix linting issues (where possible)
npm run lint -- --fix
```

### Prettier Configuration
Consistent code formatting with Prettier:

```bash
# Format all code
npm run format

# Check formatting without changing files
npx prettier --check ./src
```

### TypeScript Strictness
- **Strict mode** enabled
- **No explicit any** types allowed
- **Shared type definitions** in `src/types/index.ts`

## 🚀 Production Optimization

### Bundle Analysis
```bash
# Analyze bundle size and assets
expo export --dump-assetmap
```

### Performance Monitoring
Recommended tools for production monitoring:
- **Flipper** - React Native debugging and performance
- **Sentry** - Error tracking and performance monitoring

### Hermes Engine
The app uses Hermes JS engine for better production performance:
```json
// app.json
{
  "expo": {
    "jsEngine": "hermes"
  }
}
```

## 🔐 Firebase Integration

### Features Implemented
- **User Authentication**: Email/password sign up and sign in
- **Cloud Storage**: User preferences, favorites, and watchlist
- **Real-time Sync**: Live updates across devices
- **Offline Support**: Local storage with cloud synchronization

### Setup Instructions
1. Create a Firebase project
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Update `src/utils/firebase.ts` with your configuration
5. Set up Firestore security rules

## 📱 App Architecture

### State Management
- **Redux Toolkit** for global state
- **Redux Persist** for state persistence
- **React Query** for server state
- **TypeScript** for type safety

### Navigation
- **React Navigation v7** for navigation
- **Tab navigation** for main screens
- **Stack navigation** for detail screens
- **Dynamic imports** for code splitting

### API Integration
- **TMDB API** for movie data
- **Firebase** for authentication and storage
- **React Query** for caching and synchronization

## 🚀 Deployment

### Expo Application Services
```bash
# Build for app stores
npx expo build:ios
npx expo build:android

# Submit to stores
npx expo submit:ios
npx expo submit:android
```

### CI/CD Pipeline
The app includes a GitHub Actions workflow for automated:
- **Linting** with ESLint
- **Testing** with Jest
- **Building** with Expo

See `.github/workflows/ci.yml` for details.

## 🔧 Troubleshooting

### Common Issues

#### Metro Bundler Issues
```bash
# Clear Metro cache
npx expo start --clear

# Reset Metro cache
npx expo start --reset-cache
```

#### TypeScript Errors
```bash
# Check TypeScript compilation
npx tsc --noEmit

# Fix type issues
npm run lint -- --fix
```

#### Performance Issues
- Check React Query cache with Flipper
- Monitor bundle size with `expo export --dump-assetmap`
- Verify Hermes engine is enabled

## 📚 Additional Resources

- [Performance Audit](PERFORMANCE_AUDIT.md) - Comprehensive performance analysis
- [Phase 1 Implementation](PHASE1_IMPLEMENTATION.md) - Quick wins and optimizations
- [Phase 3 Implementation](PHASE3_IMPLEMENTATION.md) - Advanced optimizations
- [Architecture Guide](ARCHITECTURE.md) - System architecture and design patterns
- [Coding Standards](CODING_STANDARDS.md) - Code style and best practices
- [API Reference](API_REFERENCE.md) - API integrations and patterns
- [Firebase Integration](FIREBASE_INTEGRATION.md) - Firebase setup and usage

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes following our coding standards
4. Run `npm run lint` and `npm test`
5. Test thoroughly on both iOS and Android
6. Submit a pull request

### Code Standards
- Follow TypeScript strict mode
- Use ESLint and Prettier
- Write tests for new features
- Document complex logic
- Follow React Native best practices

---

**Happy coding! 🎬📱** 