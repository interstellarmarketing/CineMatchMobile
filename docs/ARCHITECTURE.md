# CineMatch Mobile Architecture Guide

This document provides a comprehensive overview of the CineMatch Mobile application architecture, covering the React Native implementation with Expo, TypeScript, and Firebase integration.

## 🤖 AI Search Architecture (Gemini Integration)

- **Gemini AI Integration:**
  - The `GeminiSearchScreen` provides a conversational AI-powered search experience.
  - Uses Google Gemini API for natural language movie/TV recommendations.
  - Results are mapped to TMDB data for display.
  - State is managed in a dedicated `geminiSlice` in Redux.

- **Component Structure:**
  - `GeminiSearchScreen.tsx`: Main AI search screen, sticky header, FlatList for results.
  - `GeminiMovieCard.tsx`: Card for each AI-recommended movie/TV show.
  - `GeminiMovieSuggestions.tsx`: (legacy, now handled by FlatList)
  - **Sticky Header:** Only the header (back button + title) is sticky; all other content scrolls together.

- **UX Improvements:**
  - All content below the header (search bar, previous search, tips, results) scrolls as a single unit.
  - Loading overlay for AI search.
  - Previous search and quick tips are included in the scrollable area for better usability.
  - **Mobile-Optimized:** The AI search experience is designed for mobile, with a single scrollable area and a sticky header for best usability.

## 🤖 System Overview

CineMatch Mobile is a React Native application built with Expo that provides a native mobile experience for movie discovery and management. The system consists of:

- **Mobile Application** (React Native + Expo + TypeScript)
- **Backend Services** (Firebase + TMDB API)
- **State Management** (Redux Toolkit + Redux Persist)
- **Navigation** (React Navigation v7)

## 📁 Project Structure

```
CineMatchMobile/
├── src/
│   ├── components/                 # Reusable UI components
│   │   ├── AuthProvider.tsx        # Authentication wrapper
│   │   ├── ErrorMessage.tsx        # Error display component
│   │   ├── FavoriteButton.tsx      # Favorite toggle button
│   │   ├── LoadingSpinner.tsx      # Loading indicator
│   │   ├── Logo.tsx                # Brand logo component
│   │   ├── MovieCard.tsx           # Movie display card
│   │   ├── MovieGrid.tsx           # Grid layout for movies
│   │   ├── MovieList.tsx           # Horizontal movie list
│   │   ├── SearchBar.tsx           # Search input component
│   │   └── WatchlistButton.tsx     # Watchlist toggle button
│   ├── screens/                    # Main screen components
│   │   ├── HomeScreen.tsx          # Main dashboard
│   │   ├── BrowseScreen.tsx        # Movie browsing
│   │   ├── LoginScreen.tsx         # Authentication
│   │   ├── MovieDetailsScreen.tsx  # Movie details
│   │   ├── MyListsScreen.tsx       # User collections
│   │   └── SearchScreen.tsx        # Search functionality
│   ├── navigation/                 # React Navigation setup
│   │   └── AppNavigator.tsx        # Main navigation configuration
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAuth.ts              # Authentication hook
│   │   ├── useMovieDetails.ts      # Movie details hook
│   │   ├── useMovieTrailer.ts      # Movie trailer hook
│   │   ├── usePopularMovies.ts     # Popular movies hook
│   │   ├── usePreferences.ts       # Centralized hook for user preferences (favorites, watchlist)
│   │   ├── useSearchMovies.ts      # Search functionality hook
│   │   ├── useTopRatedMovies.ts    # Top rated movies hook
│   │   ├── useTrendingMovies.ts    # Trending movies hook
│   │   └── useUpcomingMovies.ts    # Upcoming movies hook
│   ├── utils/                      # Utilities and configurations
│   │   ├── slices/                 # Redux Toolkit slices
│   │   │   ├── detailsSlice.ts     # Movie details state
│   │   │   ├── moviesSlice.ts      # Movies data state
│   │   │   ├── preferencesSlice.ts # User preferences state
│   │   │   └── userSlice.ts        # User authentication state
│   │   ├── authService.ts          # Authentication service
│   │   ├── constants.ts            # App constants and configuration
│   │   ├── firebase.ts             # Firebase configuration
│   │   ├── firestoreService.ts     # Firestore operations
│   │   └── store.ts                # Redux store setup
│   └── assets/                     # Mobile assets
│       └── images/                 # Image assets
│           ├── index.ts            # Asset exports
│           ├── logo.png            # Main brand logo
│           ├── logo.svg            # SVG logo version
│           ├── logo-alt.svg        # Alternative logo
│           ├── ai-search-logo.png  # AI search logo
│           └── README.md           # Asset documentation
├── App.tsx                         # Main application component
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
└── app.json                        # Expo configuration
```

## 🔄 Data Flow Architecture

### High-Level Data Flow

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  React Native   │───▶│  Redux Store    │
│   (Touch/Text)  │    │     App         │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │                        │
                                ▼                        ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Updates    │◀───│  Custom Hooks   │◀───│  API Services   │
│   (Screens)     │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                        ┌─────────────────┐
                                        │  External APIs  │
                                        │  (TMDB, Firebase)│
                                        └─────────────────┘
```

### Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Login     │───▶│  Firebase   │───▶│  Redux      │───▶│  UI Update  │
│   Screen    │    │   Auth      │    │  User Slice │    │             │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

### Movie Data Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   User      │───▶│  Custom     │───▶│  TMDB API   │───▶│  Redux      │
│   Action    │    │   Hook      │    │             │    │  Movies     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                        │
                                                        ▼
                                        ┌─────────────┐
                                        │  UI         │
                                        │  Components │
                                        └─────────────┘
```

## 🧩 Component Architecture

### Screen Components

#### Core Screens
- **HomeScreen.tsx** - Main dashboard with trending movies
- **BrowseScreen.tsx** - Movie browsing with multiple categories
- **SearchScreen.tsx** - Real-time search functionality
- **MovieDetailsScreen.tsx** - Detailed movie information
- **LoginScreen.tsx** - User authentication interface
- **MyListsScreen.tsx** - User collections and favorites

#### Screen Structure Pattern
```typescript
// Standard screen component structure
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';

interface ScreenProps {
  navigation: any;
  route: any;
}

const ScreenName: React.FC<ScreenProps> = ({ navigation, route }) => {
  // 1. Hooks and state
  const dispatch = useDispatch();
  const data = useSelector((state: RootState) => state.someSlice.data);

  // 2. Effects
  useEffect(() => {
    // Initialize data
  }, []);

  // 3. Event handlers
  const handleAction = () => {
    // Handle user actions
  };

  // 4. Render
  return (
    <View style={styles.container}>
      {/* Screen content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default ScreenName;
```

### Reusable Components

#### UI Components
- **Logo.tsx** - Brand logo component with multiple sizes and variants
- **MovieCard.tsx** - Movie display card with poster and info
- **MovieList.tsx** - Horizontal scrollable movie list
- **MovieGrid.tsx** - Grid layout for movie display
- **SearchBar.tsx** - Search input with clear functionality
- **LoadingSpinner.tsx** - Loading indicator component
- **ErrorMessage.tsx** - Error display with retry option

#### Action Components
- **FavoriteButton.tsx** - Toggle favorite status
- **WatchlistButton.tsx** - Add/remove from watchlist

#### Logo Component Architecture
```typescript
// src/components/Logo.tsx - Brand logo component
interface LogoProps {
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  style?: ImageStyle;
  containerStyle?: ViewStyle;
  variant?: 'main' | 'alt' | 'ai';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'medium', 
  style, 
  containerStyle,
  variant = 'main' 
}) => {
  const getSize = () => {
    switch (size) {
      case 'small': return { width: 80, height: 22 };
      case 'medium': return { width: 120, height: 32 };
      case 'large': return { width: 180, height: 48 };
      case 'xlarge': return { width: 240, height: 64 };
      default: return { width: 120, height: 32 };
    }
  };

  const getImageSource = () => {
    switch (variant) {
      case 'alt': return require('../assets/images/logo-alt.svg');
      case 'ai': return require('../assets/images/ai-search-logo.png');
      default: return require('../assets/images/logo.png');
    }
  };

  return (
    <Image
      source={getImageSource()}
      style={[styles.logo, getSize(), style]}
      resizeMode="contain"
    />
  );
};
```

#### Component Structure Pattern
```typescript
// Standard component structure
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  data: any;
  onPress?: () => void;
}

const ComponentName: React.FC<ComponentProps> = ({ data, onPress }) => {
  // Component logic
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // Styles
  },
});

export default ComponentName;
```

## 🔧 State Management Architecture

### Redux Store Structure

```typescript
// Store configuration
interface RootState {
  user: {
    currentUser: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  movies: {
    trending: Movie[];
    popular: Movie[];
    topRated: Movie[];
    upcoming: Movie[];
    loading: boolean;
    error: string | null;
  };
  details: {
    currentMovie: MovieDetails | null;
    trailer: Video | null;
    loading: boolean;
    error: string | null;
  };
  preferences: {
    favorites: Movie[];
    watchlist: Movie[];
    loading: boolean;
    error: string | null;
  };
}
```

### Redux Toolkit Slices

#### User Slice
```typescript
// src/utils/slices/userSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const signInUser = createAsyncThunk(
  'user/signIn',
  async (credentials: { email: string; password: string }) => {
    // Firebase authentication logic
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState: {
    currentUser: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    signOut: (state) => {
      state.currentUser = null;
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

#### Movies Slice
```typescript
// src/utils/slices/moviesSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTrendingMovies = createAsyncThunk(
  'movies/fetchTrending',
  async () => {
    // TMDB API call
  }
);

const moviesSlice = createSlice({
  name: 'movies',
  initialState: {
    trending: [],
    popular: [],
    topRated: [],
    upcoming: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrendingMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTrendingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.trending = action.payload;
      })
      .addCase(fetchTrendingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});
```

### State Persistence

```typescript
// src/utils/store.ts
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'preferences'], // Only persist user and preferences
};

const persistedUserReducer = persistReducer(persistConfig, userReducer);
const persistedPreferencesReducer = persistReducer(persistConfig, preferencesReducer);

export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    movies: moviesReducer,
    details: detailsReducer,
    preferences: persistedPreferencesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});
```

## 🌐 API Integration Architecture

### TMDB API Integration

#### Base Configuration
```typescript
// src/utils/constants.ts
export const TMDB_API_KEY = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmExNDA1ZGNlZGMwNDU2YjViN2E4ZTQwNDZiZWU2NyIsIm5iZiI6MTcwODg5MTMxNi44OTMsInN1YiI6IjY1ZGI5Y2I0M2RjODg1MDE2ODQxNzVlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sa9Yr_CWDIkbj8iP66TOqAyHuBoN4P_BJT-kHAiv9Pw';

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer ' + TMDB_API_KEY,
  },
};

export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_CDN_ORG_URL = 'https://image.tmdb.org/t/p/original';
```

#### Custom Hooks Pattern
```typescript
// src/hooks/useTrendingMovies.ts
import { useState, useEffect } from 'react';
import { BASE_URL, API_OPTIONS } from '../utils/constants';

interface Movie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  poster_path?: string;
  overview?: string;
  backdrop_path?: string;
}

export const useTrendingMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${BASE_URL}/trending/all/day?language=en-US`,
          API_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setMovies(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching trending movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrendingMovies();
  }, []);

  return { movies, loading, error };
};
```

### Firebase Integration

#### Authentication Service
```typescript
// src/utils/authService.ts
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from './firebase';

export const signUpUser = async (email: string, password: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw new Error(error.message);
  }
};
```

#### Firestore Service
```typescript
// src/utils/firestoreService.ts
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export const saveUserPreferences = async (userId: string, preferences: any) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { preferences }, { merge: true });
  } catch (error) {
    throw new Error('Failed to save preferences');
  }
};

export const getUserPreferences = async (userId: string) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().preferences;
    }
    
    return null;
  } catch (error) {
    throw new Error('Failed to get preferences');
  }
};
```

## 📱 Navigation Architecture

### React Navigation Structure

```
AppNavigator
├── LoginScreen (if not authenticated)
└── TabNavigator (if authenticated)
    ├── HomeScreen
    ├── BrowseScreen
    ├── SearchScreen
    └── MyListsScreen
        └── MovieDetailsScreen (modal)
```

### Navigation Configuration
```typescript
// src/navigation/AppNavigator.tsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#000',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#666',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyLists" component={MyListsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useSelector((state: RootState) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

## 🎨 Design System Architecture

### Color Palette
```typescript
// src/utils/constants.ts
export const COLORS = {
  primary: '#3B82F6',      // Blue
  secondary: '#8B5CF6',    // Purple
  background: '#000000',   // Black
  surface: '#1F2937',      // Dark Gray
  text: '#FFFFFF',         // White
  textSecondary: '#9CA3AF', // Light Gray
  accent: '#F59E0B',       // Yellow
  error: '#EF4444',        // Red
  success: '#10B981',      // Green
};
```

### Typography System
```typescript
// Typography constants
export const TYPOGRAPHY = {
  h1: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  h2: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  body: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  caption: {
    fontSize: 14,
    fontWeight: 'normal',
  },
};
```

### Component Styling Pattern
```typescript
// Standard styling pattern
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  title: {
    fontSize: TYPOGRAPHY.h1.fontSize,
    fontWeight: TYPOGRAPHY.h1.fontWeight,
    color: COLORS.text,
    marginBottom: 16,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
});
```

## 🚀 Performance Architecture

### React Native Optimizations

#### FlatList Optimization
```typescript
// Optimized FlatList for large datasets
<FlatList
  data={movies}
  renderItem={({ item }) => <MovieCard movie={item} />}
  keyExtractor={(item) => item.id.toString()}
  initialNumToRender={10}
  maxToRenderPerBatch={10}
  windowSize={10}
  removeClippedSubviews={true}
  getItemLayout={(data, index) => ({
    length: 200,
    offset: 200 * index,
    index,
  })}
/>
```

#### Image Optimization
```typescript
// Optimized image loading
<Image
  source={{ uri: movie.poster_path }}
  style={styles.poster}
  resizeMode="cover"
  fadeDuration={300}
  onLoadStart={() => setImageLoading(true)}
  onLoadEnd={() => setImageLoading(false)}
/>
```

#### Memory Management
```typescript
// Proper cleanup in useEffect
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    try {
      const data = await api.getMovies();
      if (isMounted) {
        setMovies(data);
      }
    } catch (error) {
      if (isMounted) {
        setError(error.message);
      }
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

### State Optimization

#### Selective Redux Subscriptions
```typescript
// Only subscribe to needed state
const movies = useSelector((state: RootState) => state.movies.trending);
const loading = useSelector((state: RootState) => state.movies.loading);

// Instead of subscribing to entire movies slice
const moviesState = useSelector((state: RootState) => state.movies);
```

#### Memoization
```typescript
// Memoize expensive calculations
const filteredMovies = useMemo(() => {
  return movies.filter(movie => movie.vote_average > 7);
}, [movies]);

// Memoize callback functions
const handleMoviePress = useCallback((movie: Movie) => {
  navigation.navigate('MovieDetails', { movieId: movie.id });
}, [navigation]);
```

## 🔐 Security Architecture

### Authentication Security
- Firebase Authentication with email/password
- Secure token management with AsyncStorage
- Session persistence with proper expiration
- User state validation

### Data Security
- Firestore security rules for user data isolation
- API key management through constants
- Input validation and sanitization
- Secure data transmission

### API Security
- Bearer token authentication for TMDB
- Rate limiting and error handling
- Secure API key storage
- Network request validation

## 📊 Error Handling Architecture

### Error Boundaries
```typescript
// Error boundary for React Native
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Something went wrong</Text>
          <TouchableOpacity onPress={() => this.setState({ hasError: false })}>
            <Text>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Centralized error handling
const handleAPIError = (error: any) => {
  if (error.response) {
    throw new Error(`API Error: ${error.response.status}`);
  } else if (error.request) {
    throw new Error('Network connection failed');
  } else {
    throw new Error('An unexpected error occurred');
  }
};
```

## 🔄 Data Synchronization

### Cross-Device Sync Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Local      │───▶│  Firebase   │───▶│  Other      │
│  Changes    │    │  Firestore  │    │  Devices    │
└─────────────┘    └─────────────┘    └─────────────┘
       ▲                   │                   │
       │                   ▼                   ▼
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Redux      │◀───│  Real-time  │◀───│  Firebase   │
│  Store      │    │  Listeners  │    │  Sync       │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Sync Strategy
- Real-time updates via Firestore listeners
- Offline support with AsyncStorage
- Conflict resolution with last-write-wins
- Batch operations for efficiency

## 🔧 Development Architecture

### Build System
- **Expo**: Development platform and build tools
- **Metro**: JavaScript bundler
- **TypeScript**: Type-safe development
- **Babel**: JavaScript compilation

### Development Tools
- **Expo CLI**: Command-line tools
- **Expo DevTools**: Development interface
- **React Native Debugger**: Advanced debugging
- **Flipper**: Performance and debugging

### Hot Reloading
- **Fast Refresh**: Instant code updates
- **Live Reloading**: Automatic app restart
- **Error Overlay**: In-app error display

## 📊 Monitoring and Analytics

### Error Tracking
- Error boundaries for crash handling
- Console logging for development
- User feedback collection (planned)

### Performance Monitoring
- React Native Performance Monitor
- Memory usage tracking
- API response time monitoring
- User interaction metrics (planned)

## 🔮 Future Architecture Considerations

### Scalability
- Microservices architecture for backend
- CDN for image optimization
- Database optimization and indexing
- Caching strategies

### Maintainability
- Monorepo structure with shared code
- Comprehensive test coverage
- Automated testing pipeline
- Documentation automation

### Performance
- Service workers for offline support
- Progressive Web App features
- Native modules for performance
- Background sync capabilities

## Architecture

The CineMatch Mobile application follows a standard React Native architecture, leveraging Redux for state management and React Navigation for screen transitions. The core architectural principles are separation of concerns, component reusability, and performance.

### State Management (Redux)

The application's state is centralized in a Redux store, following the principles of a single source of truth. The state is divided into logical slices, each managed by its own reducer.

**Key Slices:**

*   `userSlice`: Manages user authentication state, including user profile information.
*   `moviesSlice`: Caches movie data fetched from the TMDB API, such as trending, popular, and upcoming movies.
*   `preferencesSlice`: Manages user-specific data like favorites and watchlists. This slice is architected for high performance and offline-first functionality.

**State Synchronization with Firestore:**

User preferences (favorites, watchlist) are persisted in Firestore. The synchronization strategy is built for optimal performance and a responsive user experience:

1.  **Optimistic Updates:** When a user interacts with a feature like the "Favorite" button, the UI is updated *instantly* by dispatching an action that modifies the local Redux state (`preferencesSlice`). The user never has to wait for a network request to complete.

2.  **Atomic Background Sync:** After the local state is updated, a separate asynchronous thunk is dispatched. This thunk communicates with `FirestoreService` to perform a granular, atomic update in the backend using Firestore's `arrayUnion` and `arrayRemove` operations.

This architecture ensures that the UI remains fluid and responsive, while data is efficiently and reliably persisted in the background. It avoids performance bottlenecks associated with sending large data payloads or waiting for network latency.

### Navigation

Navigation is handled by `react-navigation`. The main navigation structure consists of a bottom tab navigator nested within a native stack navigator. This allows for a standard tab-based interface for primary screens (Home, Browse, Search) and modal-style screens for detailed views like `MovieDetails`. Screens are configured to remain mounted to ensure fast switching between tabs.

### Component Design

Components are designed to be modular, reusable, and performant.
*   **Presentational Components:** Dumb components that receive props and render UI (e.g., `MovieCard`, `FavoriteButton`).
*   **Container Components:** Smart components that manage state and logic, often connecting to the Redux store (e.g., screens like `HomeScreen`, `MyListsScreen`).

Performance is a key consideration. Components that render lists of data are memoized using `React.memo`, and callbacks are stabilized with `useCallback` to prevent unnecessary re-renders. Selectors from `reselect` are used to ensure that components only re-render when the specific data they need has changed.

### User Preferences Architecture (Optimized)

To address performance bottlenecks related to Firestore writes, the architecture for managing user preferences (favorites, watchlist, etc.) has been refactored to follow a more robust and performant pattern.

**Key Principles:**

1.  **Optimistic UI Updates:** User interactions (e.g., tapping the Favorite button) immediately dispatch a synchronous Redux action. This updates the local Redux state instantly, providing a snappy and responsive UI without waiting for the database.
2.  **Centralized Logic:** A new `usePreferences.ts` hook contains all the logic for managing and syncing preferences. This decouples the UI components from the complexities of data persistence.
3.  **Debounced Batch Syncing:** The `usePreferences` hook listens for changes to the preferences state in Redux. When changes are detected, it uses a debounced function (`lodash.debounce`) to batch them together. A single `updateDoc` call is then made to Firestore after a short delay (e.g., 2 seconds), syncing all changes at once.
4.  **Context-Based Access:** The state and action dispatchers (e.g., `toggleFavorite`) from the `usePreferences` hook are provided to the component tree via a React Context (`PreferencesContext`). This allows any component to access the preferences logic without prop-drilling.

**Data Flow:**

```
                                  (1. Instant, Synchronous Action)
┌──────────────────┐       ┌────────────────────────┐       ┌─────────────────┐
│ FavoriteButton   ├──────▶│ preferencesSlice       ├──────▶│ Redux Store     │
│ (User Tap)       │       │ (Synchronous Reducer)  │       │ (In-Memory)     │
└──────────────────┘       └────────────────────────┘       └───────┬─────────┘
        ▲                                                          │ (2. State Change)
        │                                                          │
(5. Consumes      ┌──────────────────┐       ┌──────────────────┐    │
   Context)       │ PreferencesContext├───────┤ usePreferences   │◀───┘
                  └──────────────────┘       │ Hook             │
                                             └────────┬─────────┘
                                                      │ (3. Debounced Effect)
                                                      │
                                             ┌────────▼─────────┐
                                             │ FirestoreService │
                                             │ (Batched Write)  │
                                             └──────────────────┘
```

This architecture significantly improves perceived performance by eliminating network latency from the user-interaction loop, reducing the number of Firestore writes, and preventing UI jank during navigation and state updates.

### Redux Store Structure

```typescript
// Store configuration
// ... existing code ...
```

This replaces the previous pattern where each `FavoriteButton` press would trigger its own asynchronous thunk and individual Firestore write, which caused significant UI blocking and performance degradation.

### Redux Toolkit Slices

#### User Slice
```typescript
// ... existing code ...
```

#### Movies Slice
```typescript
// ... existing code ...
```

---

For development setup and guidelines, see [docs/DEV_GUIDE.md](DEV_GUIDE.md).
For coding standards and best practices, see [docs/CODING_STANDARDS.md](CODING_STANDARDS.md). 