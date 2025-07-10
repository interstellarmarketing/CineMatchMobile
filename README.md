# CineMatch Mobile App

A highly optimized React Native mobile application for discovering and managing movies and TV shows with cloud synchronization, built with Expo, TypeScript, and modern performance best practices.

## 🎬 Overview

CineMatch Mobile is a native mobile application that provides users with a seamless movie discovery experience. Built with React Native and Expo, it offers native performance with cross-platform compatibility, featuring real-time search, personalized recommendations, and cloud synchronization.

## ✨ Key Features

### 🤖 AI-Powered Movie & TV Search (Gemini Integration)
- **AI Search Screen:** Access an "AI Movie Search" screen powered by Google Gemini for smart, conversational movie and TV recommendations.
- **Natural Language Queries:** Type queries like "movies like 300" or "disaster movies" and get relevant results.
- **Smart Content Detection:** Automatically detects if the user wants movies, TV shows, or both.
- **TMDB Data Integration:** AI suggestions are mapped to real TMDB data for rich results.
- **Sticky Header, Scrollable Content:** The AI search screen uses a sticky header for navigation and a scrollable area for all other content, including search, tips, and results.
- **Mobile-Optimized UX:** The entire AI search experience is optimized for mobile, with a single scrollable area and a sticky header for best usability.

### 🎯 Core Functionality
- **Movie Discovery** - Browse trending, popular, top-rated, and upcoming movies
- **Real-time Search** - Debounced search with TMDB API integration
- **Movie Details** - Comprehensive movie information with trailers
- **User Collections** - Favorites and watchlist management
- **Cross-Device Sync** - Firebase-powered cloud synchronization
- **Offline Support** - Local storage with cloud synchronization

### 🔐 Authentication & Security
- **Firebase Authentication** - Email/password sign up and sign in
- **Secure Data Storage** - Firestore with user-based access control
- **Real-time Updates** - Live synchronization across devices
- **Session Management** - Persistent user sessions with AsyncStorage

### 📱 Mobile Experience
- **Native Performance** - React Native with Expo optimization
- **Touch-Friendly UI** - Designed for mobile interactions
- **Dark Theme** - Modern, eye-friendly interface
- **Responsive Design** - Adapts to different screen sizes
- **Smooth Navigation** - Tab and stack navigation
- **Brand Integration** - Consistent logos and branding across screens

## 🚀 Performance Optimizations

### Phase 1: Quick Wins ✅
- **React.memo** for pure components (30-50% fewer re-renders)
- **Debounced search** (70% fewer API calls)
- **TypeScript strictness** with shared types
- **Debug code cleanup**

### Phase 2: Core Optimizations ✅
- **React Query** for intelligent API caching
- **Error boundaries** for robust error handling
- **Loading skeletons** for better perceived performance
- **ESLint/Prettier** for code quality
- **Jest/Testing Library** for automated testing

### Phase 3: Advanced & Polish ✅
- **Dynamic imports/code splitting** for non-critical screens
- **Hermes JS engine** for production builds
- **Asset optimization** recommendations
- **CI/CD pipeline** with automated lint/test/build
- **Performance monitoring** setup

## 🏗️ Architecture

The mobile app follows a modern React Native architecture with TypeScript:

- **Gemini Slice in Redux:** State management for AI search results, loading, and previous queries is handled via a dedicated Redux slice.
- **FlatList with Custom Header:** The AI search results use a FlatList with a custom header for performance and best-practice scrolling.
- **Sticky Header, Scrollable Content:** Only the top navigation header is sticky; all other content (search, tips, results) scrolls together for optimal mobile UX.

```
CineMatchMobile/
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── AuthProvider.tsx        # Authentication wrapper
│   │   ├── ErrorBoundary.tsx       # Error boundary component
│   │   ├── ErrorMessage.tsx        # Error display component
│   │   ├── FavoriteButton.tsx      # Favorite toggle button
│   │   ├── LoadingSpinner.tsx      # Loading indicator
│   │   ├── Logo.tsx                # Brand logo component
│   │   ├── MovieCard.tsx           # Movie display card
│   │   ├── MovieGrid.tsx           # Grid layout for movies
│   │   ├── MovieList.tsx           # Horizontal movie list
│   │   ├── MovieSkeleton.tsx       # Loading skeleton
│   │   ├── SearchBar.tsx           # Search input component
│   │   ├── WatchlistButton.tsx     # Watchlist toggle button
│   │   ├── GeminiMovieCard.tsx     # AI search result card
│   │   └── GeminiMovieSuggestions.tsx # (legacy, now handled by FlatList)
│   ├── screens/           # Main screen components
│   │   ├── HomeScreen.tsx          # Main dashboard
│   │   ├── BrowseScreen.tsx        # Movie browsing
│   │   ├── LoginScreen.tsx         # Authentication
│   │   ├── MovieDetailsScreen.tsx  # Movie details
│   │   ├── MyListsScreen.tsx       # User collections (lazy loaded)
│   │   ├── SearchScreen.tsx        # Search functionality
│   │   └── GeminiSearchScreen.tsx  # AI-powered search screen
│   ├── navigation/        # React Navigation setup
│   │   └── AppNavigator.tsx        # Main navigation with code splitting
│   ├── hooks/            # Custom React hooks with React Query
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useMovieDetails.ts      # Movie details hook
│   │   ├── useMovieTrailer.ts      # Movie trailer hook
│   │   ├── usePopularMovies.ts     # Popular movies hook
│   │   ├── useSearchMovies.ts      # Search functionality hook
│   │   ├── useTopRatedMovies.ts    # Top rated movies hook
│   │   ├── useTrendingMovies.ts    # Trending movies hook
│   │   └── useUpcomingMovies.ts    # Upcoming movies hook
│   ├── types/            # Shared TypeScript interfaces
│   │   └── index.ts               # Centralized type definitions
│   ├── utils/            # Utilities and configurations
│   │   ├── slices/                 # Redux Toolkit slices
│   │   │   ├── detailsSlice.ts     # Movie details state
│   │   │   ├── moviesSlice.ts      # Movies data state
│   │   │   ├── preferencesSlice.ts # User preferences state
│   │   │   ├── userSlice.ts        # User authentication state
│   │   │   └── geminiSlice.ts      # AI search state
│   │   ├── authService.ts          # Authentication service
│   │   ├── constants.ts            # App constants and configuration
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── firestoreService.ts     # Firestore operations
│   │   └── store.ts                # Redux store setup
│   └── assets/           # Mobile assets
│       └── images/       # Logo assets and documentation
├── docs/                 # Comprehensive documentation
│   ├── README.md         # Documentation navigation hub
│   ├── DEV_GUIDE.md      # Development setup guide
│   ├── ARCHITECTURE.md   # System architecture
│   ├── CODING_STANDARDS.md # Code quality standards
│   ├── API_REFERENCE.md  # API integrations
│   ├── FIREBASE_INTEGRATION.md # Firebase setup
│   ├── CHANGELOG.md      # Version history
│   ├── DEVELOPMENT_HISTORY.md # Development timeline
│   └── PERFORMANCE_AUDIT.md # Performance analysis
├── .github/workflows/    # CI/CD pipeline
├── App.tsx               # Main application component
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── app.json              # Expo configuration
```

## 🛠️ Technology Stack

### Core Technologies
- **React Native** (0.79.5) - Cross-platform mobile development
- **Expo** (53.0.17) - Development platform and build tools
- **TypeScript** (5.8.3) - Type-safe JavaScript
- **React** (19.0.0) - UI library
- **React Navigation** (7.x) - Navigation library
- **Redux Toolkit** (2.8.2) - State management
- **Redux Persist** (6.0.0) - State persistence

### Performance & Caching
- **React Query** (@tanstack/react-query) - API caching and state management
- **React.memo** - Component memoization
- **Hermes** - JavaScript engine for production

### Backend Services
- **Firebase Auth** - User authentication
- **Firebase Firestore** - Cloud database
- **TMDB API** - Movie data and information

### UI/UX Libraries
- **React Native Vector Icons** - Icon library
- **React Native Linear Gradient** - Gradient components
- **React Native Safe Area Context** - Safe area handling
- **React Native Async Storage** - Local storage

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Jest** - Testing framework
- **React Native Testing Library** - Component testing

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g @expo/cli`)
- **Expo Go** app on your mobile device
- **Firebase project** (for authentication and cloud sync)

### Installation

1. **Clone and navigate to the mobile app:**
   ```bash
   cd CineMatchMobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Update src/utils/constants.ts with your TMDB API key
   # Update src/utils/firebase.ts with your Firebase config
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on your device:**
   - Scan the QR code with Expo Go app
   - Or press 'i' for iOS simulator (requires Xcode)
   - Or press 'a' for Android emulator (requires Android Studio)

## 🔧 Development

### Available Scripts

```bash
# Development
npx expo start              # Start development server
npx expo start --ios        # Start iOS simulator
npx expo start --android    # Start Android emulator
npx expo start --web        # Start web version

# Code Quality
npm run lint                # Lint code with ESLint
npm run format              # Format code with Prettier
npm test                    # Run tests with Jest

# Building
npx expo build:ios          # Build for iOS
npx expo build:android      # Build for Android
npx expo build:web          # Build for web

# Publishing
npx expo publish            # Publish to Expo
npx expo publish:set        # Set publish channel

# Development Tools
npx expo doctor             # Check for common issues
npx expo install            # Install compatible dependencies
expo export --dump-assetmap # Analyze bundle size
```

### Environment Configuration

#### Required Environment Variables
```typescript
// src/utils/constants.ts
export const TMDB_API_KEY = 'your_tmdb_bearer_token_here';

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

## 🧪 Testing

### Testing Framework
- **Jest** - Unit and integration testing
- **React Native Testing Library** - Component testing
- **Test coverage** - Automated testing for critical components

### Running Tests
```bash
npm test                    # Run all tests
npm test -- --watch        # Run tests in watch mode
npm test -- --coverage     # Run tests with coverage report
```

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

### Production Optimization
- **Bundle Analysis**: `expo export --dump-assetmap`
- **Hermes Engine**: Enabled for better JS performance
- **Asset Optimization**: Compress images and use appropriate resolutions
- **Performance Monitoring**: Flipper/Sentry integration recommended

## 📚 Documentation

- **[Documentation Hub](docs/README.md)** - Navigation and organization of all docs
- **[Development Guide](docs/DEV_GUIDE.md)** - Detailed setup and workflow
- **[Architecture](docs/ARCHITECTURE.md)** - System design and patterns
- **[Coding Standards](docs/CODING_STANDARDS.md)** - Best practices
- **[API Reference](docs/API_REFERENCE.md)** - API integrations
- **[Firebase Integration](docs/FIREBASE_INTEGRATION.md)** - Firebase setup
- **[Performance Audit](docs/PERFORMANCE_AUDIT.md)** - Optimization status
- **[Changelog](docs/CHANGELOG.md)** - Version history
- **[Development History](docs/DEVELOPMENT_HISTORY.md)** - Development timeline

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

## 🎯 Current Status

### ✅ Completed Features
- **Core App**: Complete movie discovery and management
- **Authentication**: Firebase-powered user system
- **Performance**: Three-phase optimization complete
- **Testing**: Automated testing framework
- **CI/CD**: Automated lint, test, and build pipeline
- **Documentation**: Comprehensive guides and references

### 🔄 In Progress
- **App Store Preparation**: Final polish and submission
- **Performance Monitoring**: Production monitoring setup

### 📋 Planned Features
- **Push Notifications**: Movie recommendations and updates
- **AI-powered Recommendations**: Personalized content suggestions
- **Advanced Search Filters**: Genre, year, rating filters
- **Social Features**: Share and recommend movies
- **Video Player Integration**: In-app trailer playback

## 🤝 Contributing

We welcome contributions! Please read our [Coding Standards](docs/CODING_STANDARDS.md) before submitting pull requests.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes following our coding standards
4. Run `npm run lint` and `npm test`
5. Test thoroughly on both iOS and Android
6. Submit a pull request

## 📞 Support

For questions, issues, or contributions:
- Create an issue in the repository
- Contact: sankargnanasekar.k@gmail.com
- LinkedIn: [Sankar Gnanasekar](https://www.linkedin.com/in/sankargnanasekar/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

---

**Enjoy discovering movies with CineMatch Mobile! 🎬📱** 