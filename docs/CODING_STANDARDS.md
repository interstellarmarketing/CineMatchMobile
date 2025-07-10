# CineMatch Mobile Coding Standards

This document outlines the coding standards, best practices, and conventions for the CineMatch Mobile React Native application, including performance optimizations and modern development practices.

## 📋 Table of Contents

- [General Principles](#general-principles)
- [TypeScript Standards](#typescript-standards)
- [React Native Standards](#react-native-standards)
- [Component Standards](#component-standards)
- [State Management](#state-management)
- [Performance Standards](#performance-standards)
- [React Query Patterns](#react-query-patterns)
- [Testing Standards](#testing-standards)
- [Styling Standards](#styling-standards)
- [API Integration](#api-integration)
- [File Organization](#file-organization)
- [Naming Conventions](#naming-conventions)
- [Error Handling](#error-handling)
- [Security Standards](#security-standards)
- [Asset & Logo Standards](#asset--logo-standards)

## 🎯 General Principles

### Code Quality
- **Readability**: Code should be self-documenting and easy to understand
- **Maintainability**: Write code that can be easily modified and extended
- **Performance**: Optimize for mobile performance and battery life
- **Security**: Follow security best practices for mobile applications
- **Accessibility**: Ensure the app is accessible to all users
- **Type Safety**: Use TypeScript strict mode for all code

### Mobile-First Approach
- **Touch-Friendly**: Design for touch interactions
- **Responsive**: Adapt to different screen sizes and orientations
- **Offline-Capable**: Handle network connectivity gracefully
- **Battery-Efficient**: Minimize battery consumption
- **Performance-Optimized**: Use React.memo, debouncing, and caching

### Performance-First Development
- **React.memo**: Use for pure components to prevent unnecessary re-renders
- **Debouncing**: Implement for search and user input
- **Caching**: Use React Query for intelligent API caching
- **Code Splitting**: Use dynamic imports for non-critical features
- **Bundle Optimization**: Monitor and optimize bundle size

## 🔷 TypeScript Standards

### Type Definitions

#### Shared Types
```typescript
// src/types/index.ts - Centralized type definitions
export interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
  overview: string;
  release_date: string;
  genre_ids: number[];
}

export interface MovieDetails extends Movie {
  runtime: number;
  genres: Genre[];
  cast: Cast[];
  videos: Video[];
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}
```

#### Interface Naming
```typescript
// Use PascalCase for interfaces
interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

interface MovieDetails extends Movie {
  overview: string;
  release_date: string;
  runtime: number;
  genres: Genre[];
}

// Use descriptive names
interface UserPreferences {
  favorites: Movie[];
  watchlist: Movie[];
  theme: 'light' | 'dark';
  language: string;
}
```

#### Type Aliases
```typescript
// Use type aliases for complex types
type MovieId = number;
type ApiResponse<T> = {
  data: T;
  status: number;
  message: string;
};

type NavigationProps = {
  navigation: any;
  route: any;
};

// Union types for specific values
type ThemeMode = 'light' | 'dark' | 'system';
type SortOrder = 'asc' | 'desc';
```

#### Generic Types
```typescript
// Use generics for reusable components
interface ListProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => React.ReactElement;
  keyExtractor: (item: T, index: number) => string;
  loading?: boolean;
  error?: string | null;
}

// Generic API response
interface ApiResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

### Type Safety

#### Strict Type Checking
```typescript
// Enable strict mode in tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}

// Use proper typing for all variables
const movies: Movie[] = [];
const isLoading: boolean = false;
const error: string | null = null;

// Avoid any type
// ❌ Bad
const data: any = response.data;

// ✅ Good
const data: Movie[] = response.data as Movie[];
```

#### Optional Properties
```typescript
// Use optional properties when appropriate
interface MovieCardProps {
  movie: Movie;
  onPress?: (movie: Movie) => void;
  showRating?: boolean;
  size?: 'small' | 'medium' | 'large';
}

// Provide default values
const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onPress,
  showRating = true,
  size = 'medium'
}) => {
  // Component logic
};
```

## 📱 React Native Standards

### Component Structure

#### Functional Components with Optimization
```typescript
// Use functional components with hooks and optimization
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ComponentProps {
  data: Movie[];
  onItemPress: (movie: Movie) => void;
}

const ComponentName: React.FC<ComponentProps> = React.memo(({ data, onItemPress }) => {
  // 1. State declarations
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 2. Custom hooks
  const { user } = useAuth();

  // 3. Computed values with useMemo
  const filteredData = useMemo(() => {
    return data.filter(movie => movie.vote_average > 7);
  }, [data]);

  // 4. Event handlers with useCallback
  const handlePress = useCallback((movie: Movie) => {
    onItemPress(movie);
  }, [onItemPress]);

  // 5. Effects
  useEffect(() => {
    // Effect logic
  }, [data]);

  // 6. Render
  return (
    <View style={styles.container}>
      {/* Component content */}
    </View>
  );
});

ComponentName.displayName = 'ComponentName';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});

export default ComponentName;
```

### Performance Optimization

#### React.memo Usage
```typescript
// Use React.memo for pure components
const MovieCard: React.FC<MovieCardProps> = React.memo(({ movie, onPress }) => {
  return (
    <TouchableOpacity onPress={() => onPress(movie)}>
      <Image source={{ uri: movie.poster_path }} />
      <Text>{movie.title}</Text>
    </TouchableOpacity>
  );
});

MovieCard.displayName = 'MovieCard';

// For components with complex props, use custom comparison
const MovieList: React.FC<MovieListProps> = React.memo(({ movies, onMoviePress }) => {
  return (
    <FlatList
      data={movies}
      renderItem={({ item }) => (
        <MovieCard movie={item} onPress={onMoviePress} />
      )}
      keyExtractor={(item) => item.id.toString()}
    />
  );
}, (prevProps, nextProps) => {
  // Custom comparison for complex props
  return prevProps.movies.length === nextProps.movies.length &&
         prevProps.movies.every((movie, index) => movie.id === nextProps.movies[index].id);
});
```

#### Debouncing
```typescript
// Use debouncing for search and user input
import { useMemo } from 'react';
import { debounce } from 'lodash';

const SearchScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Debounced search function
  const debouncedSearch = useMemo(
    () => debounce((query: string) => {
      // Perform search
      searchMovies(query);
    }, 300),
    []
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  return (
    <TextInput
      value={searchQuery}
      onChangeText={handleSearchChange}
      placeholder="Search movies..."
    />
  );
};
```

## 🚀 Performance Standards

### Component Optimization

#### Loading States
```typescript
// Use loading skeletons for better perceived performance
const MovieList: React.FC<MovieListProps> = ({ movies, loading, error }) => {
  if (loading) {
    return <MovieSkeleton />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <FlatList
      data={movies}
      renderItem={({ item }) => <MovieCard movie={item} />}
      keyExtractor={(item) => item.id.toString()}
    />
  );
};
```

#### Error Boundaries
```typescript
// Use error boundaries for robust error handling
class MovieListErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MovieList Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message="Something went wrong loading movies." />;
    }

    return this.props.children;
  }
}
```

### Bundle Optimization

#### Dynamic Imports
```typescript
// Use dynamic imports for non-critical screens
import React, { Suspense } from 'react';
import { LoadingSpinner } from '../components/LoadingSpinner';

const MyListsScreen = React.lazy(() => import('../screens/MyListsScreen'));

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Browse" component={BrowseScreen} />
      <Tab.Screen 
        name="MyLists" 
        component={() => (
          <Suspense fallback={<LoadingSpinner />}>
            <MyListsScreen />
          </Suspense>
        )} 
      />
    </Tab.Navigator>
  );
};
```

## 🔄 React Query Patterns

### Query Hooks
```typescript
// Use React Query for API caching
import { useQuery } from '@tanstack/react-query';
import { fetchMovies } from '../utils/api';

export const usePopularMovies = () => {
  return useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: fetchMovies,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

// Search query with debouncing
export const useSearchMovies = (query: string) => {
  return useQuery({
    queryKey: ['movies', 'search', query],
    queryFn: () => fetchSearchMovies(query),
    enabled: query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes for search
  });
};
```

### Mutation Hooks
```typescript
// Use mutations for data updates
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useToggleFavorite = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleFavorite,
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['user', 'favorites'] });
      
      // Optimistic update
      queryClient.setQueryData(['user', 'favorites'], (old: Movie[]) => {
        const isFavorite = old.some(movie => movie.id === variables.movieId);
        if (isFavorite) {
          return old.filter(movie => movie.id !== variables.movieId);
        } else {
          return [...old, data];
        }
      });
    },
    onError: (error) => {
      console.error('Failed to toggle favorite:', error);
    },
  });
};
```

## 🧪 Testing Standards

### Component Testing
```typescript
// Test components with React Native Testing Library
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import MovieList from '../MovieList';

describe('MovieList', () => {
  const mockMovies = [
    { id: 1, title: 'Test Movie 1', poster_path: '/test1.jpg' },
    { id: 2, title: 'Test Movie 2', poster_path: '/test2.jpg' },
  ];

  it('renders skeleton when loading', () => {
    const { getByTestId } = render(
      <MovieList movies={[]} loading={true} error={null} />
    );
    expect(getByTestId('skeleton-row')).toBeTruthy();
  });

  it('renders error message when error occurs', () => {
    const { getByText } = render(
      <MovieList movies={[]} loading={false} error="Failed to load movies" />
    );
    expect(getByText('Failed to load movies')).toBeTruthy();
  });

  it('renders movies when data is available', () => {
    const { getByText } = render(
      <MovieList movies={mockMovies} loading={false} error={null} />
    );
    expect(getByText('Test Movie 1')).toBeTruthy();
    expect(getByText('Test Movie 2')).toBeTruthy();
  });

  it('calls onMoviePress when movie is pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <MovieList 
        movies={mockMovies} 
        loading={false} 
        error={null}
        onMoviePress={mockOnPress}
      />
    );

    fireEvent.press(getByText('Test Movie 1'));
    expect(mockOnPress).toHaveBeenCalledWith(mockMovies[0]);
  });
});
```

### Hook Testing
```typescript
// Test custom hooks
import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePopularMovies } from '../hooks/usePopularMovies';

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

describe('usePopularMovies', () => {
  it('fetches popular movies successfully', async () => {
    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => usePopularMovies(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toBeDefined();
  });
});
```

## 📱 State Management

### Redux Toolkit Patterns
```typescript
// Use Redux Toolkit for global state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../types';

interface MoviesState {
  favorites: Movie[];
  watchlist: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  favorites: [],
  watchlist: [],
  loading: false,
  error: null,
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    addToFavorites: (state, action: PayloadAction<Movie>) => {
      state.favorites.push(action.payload);
    },
    removeFromFavorites: (state, action: PayloadAction<number>) => {
      state.favorites = state.favorites.filter(movie => movie.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const { addToFavorites, removeFromFavorites, setLoading, setError } = moviesSlice.actions;
export default moviesSlice.reducer;
```

### React Query for Server State
```typescript
// Use React Query for server state, Redux for client state
// Server state (API data) -> React Query
// Client state (UI state, user preferences) -> Redux

// Example: Combining both
const MovieScreen: React.FC = () => {
  // Server state with React Query
  const { data: movies, isLoading, error } = usePopularMovies();
  
  // Client state with Redux
  const dispatch = useAppDispatch();
  const favorites = useAppSelector(state => state.movies.favorites);

  const handleAddToFavorites = (movie: Movie) => {
    dispatch(addToFavorites(movie));
  };

  return (
    <View>
      {isLoading ? (
        <MovieSkeleton />
      ) : error ? (
        <ErrorMessage message={error.message} />
      ) : (
        <MovieList 
          movies={movies} 
          favorites={favorites}
          onAddToFavorites={handleAddToFavorites}
        />
      )}
    </View>
  );
};
```

## 🎨 Styling Standards

### StyleSheet Usage
```typescript
// Use StyleSheet.create for better performance
import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  movieCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});

// Use consistent spacing and colors
const theme = {
  colors: {
    primary: '#007AFF',
    secondary: '#5856D6',
    background: '#000000',
    surface: '#1a1a1a',
    text: '#ffffff',
    textSecondary: '#8e8e93',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
  },
};
```

## 🔌 API Integration

### API Service Pattern
```typescript
// Centralized API service
import { Movie, ApiResponse } from '../types';

const API_BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

class ApiService {
  private async request<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    return response.json();
  }

  async getPopularMovies(): Promise<ApiResponse<Movie[]>> {
    return this.request('/movie/popular');
  }

  async searchMovies(query: string): Promise<ApiResponse<Movie[]>> {
    return this.request(`/search/movie?query=${encodeURIComponent(query)}`);
  }

  async getMovieDetails(id: number): Promise<Movie> {
    return this.request(`/movie/${id}`);
  }
}

export const apiService = new ApiService();
```

## 📁 File Organization

### Project Structure
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   ├── movie/          # Movie-specific components
│   └── index.ts        # Component exports
├── screens/            # Screen components
│   ├── home/
│   ├── browse/
│   └── search/
├── hooks/              # Custom React hooks
│   ├── api/           # API-related hooks
│   ├── auth/          # Authentication hooks
│   └── index.ts       # Hook exports
├── utils/              # Utility functions
│   ├── api/           # API utilities
│   ├── storage/       # Storage utilities
│   └── validation/    # Validation utilities
├── types/              # TypeScript type definitions
│   └── index.ts       # Centralized types
├── constants/          # App constants
│   ├── colors.ts
│   ├── api.ts
│   └── index.ts
└── store/              # Redux store
    ├── slices/
    └── index.ts
```

## 🏷️ Naming Conventions

### Files and Folders
```typescript
// Use PascalCase for components
MovieCard.tsx
MovieList.tsx
SearchScreen.tsx

// Use camelCase for utilities and hooks
usePopularMovies.ts
apiService.ts
validationUtils.ts

// Use kebab-case for folders
movie-components/
api-hooks/
validation-utils/
```

### Variables and Functions
```typescript
// Use camelCase for variables and functions
const movieList = [];
const isLoading = false;
const handleMoviePress = () => {};

// Use PascalCase for components and types
const MovieCard: React.FC = () => {};
interface MovieDetails { }

// Use UPPER_SNAKE_CASE for constants
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRY_ATTEMPTS = 3;
```

## ⚠️ Error Handling

### Error Boundaries
```typescript
// Use error boundaries for component-level error handling
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to monitoring service
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorMessage message="Something went wrong." />;
    }

    return this.props.children;
  }
}
```

### API Error Handling
```typescript
// Handle API errors gracefully
const usePopularMovies = () => {
  return useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: async () => {
      try {
        const response = await apiService.getPopularMovies();
        return response.data;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Failed to fetch movies: ${error.message}`);
        }
        throw new Error('An unknown error occurred');
      }
    },
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error.message.includes('404') || error.message.includes('403')) {
        return false;
      }
      return failureCount < 3;
    },
  });
};
```

## 🔒 Security Standards

### API Key Management
```typescript
// Never expose API keys in client-side code
// Use environment variables or secure storage

// ❌ Bad - Hardcoded API key
const API_KEY = 'your-api-key-here';

// ✅ Good - Environment variable
const API_KEY = process.env.TMDB_API_KEY;

// ✅ Better - Secure storage
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiKey = async () => {
  return await AsyncStorage.getItem('api_key');
};
```

### Input Validation
```typescript
// Validate all user inputs
const validateSearchQuery = (query: string): boolean => {
  if (!query || typeof query !== 'string') {
    return false;
  }
  
  if (query.length < 2 || query.length > 100) {
    return false;
  }
  
  // Check for malicious patterns
  const maliciousPatterns = /[<>\"'&]/;
  if (maliciousPatterns.test(query)) {
    return false;
  }
  
  return true;
};

const handleSearch = (query: string) => {
  if (!validateSearchQuery(query)) {
    setError('Invalid search query');
    return;
  }
  
  // Proceed with search
  searchMovies(query);
};
```

## 📝 Code Quality Tools

### ESLint Configuration
```json
{
  "extends": [
    "@react-native-community",
    "@typescript-eslint/recommended"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "react-hooks/exhaustive-deps": "warn",
    "react-hooks/rules-of-hooks": "error"
  }
}
```

### Prettier Configuration
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

## 🚀 Performance Checklist

### Before Committing
- [ ] All components use React.memo where appropriate
- [ ] Search inputs are debounced
- [ ] API calls use React Query for caching
- [ ] Error boundaries are in place
- [ ] Loading states are implemented
- [ ] Bundle size is optimized
- [ ] TypeScript strict mode is enabled
- [ ] Tests are written for critical components
- [ ] Code is linted and formatted

### Performance Monitoring
- [ ] Monitor bundle size with `expo export --dump-assetmap`
- [ ] Use Flipper for React Native debugging
- [ ] Monitor API response times
- [ ] Track component re-render frequency
- [ ] Monitor memory usage

## 🎨 Asset & Logo Standards

### Logo Component Usage
```typescript
// Always use the Logo component for brand consistency
import Logo from '../components/Logo';

// ✅ Good - Use predefined sizes
<Logo size="large" />
<Logo size="medium" />
<Logo size="small" />

// ✅ Good - Use appropriate variants
<Logo variant="main" />
<Logo variant="ai" />
<Logo variant="alt" />

// ✅ Good - Combine size and variant
<Logo variant="ai" size="small" />

// ❌ Bad - Don't use raw Image component for logos
<Image source={require('../assets/images/logo.png')} />
```

### Logo Sizing Guidelines
```typescript
// Use appropriate sizes for different contexts
const logoSizeMap = {
  header: 'medium',      // Navigation headers
  splash: 'xlarge',      // Splash screens
  login: 'large',        // Authentication screens
  footer: 'small',       // Footer areas
  card: 'small',         // Card components
  modal: 'medium',       // Modal dialogs
};

// Example usage
<Logo size={logoSizeMap.header} />
```

### Asset Organization
```typescript
// File structure for assets
src/assets/
├── images/
│   ├── index.ts          // Asset exports
│   ├── logo.png          // Main logo
│   ├── logo.svg          // SVG version
│   ├── logo-alt.svg      // Alternative logo
│   ├── ai-search-logo.png // AI search logo
│   └── README.md         // Usage documentation

// Import assets using the index file
import { LOGO_ASSETS, LOGO_SIZES } from '../assets/images';
```

### Asset Import Standards
```typescript
// ✅ Good - Use the Logo component
import Logo from '../components/Logo';

// ✅ Good - Use asset index for direct imports
import { LOGO_ASSETS } from '../assets/images';

// ❌ Bad - Direct require statements
const logo = require('../assets/images/logo.png');

// ✅ Good - Type-safe asset imports
interface AssetImports {
  main: any;
  alt: any;
  ai: any;
}

const assets: AssetImports = LOGO_ASSETS;
```

### Logo Styling Guidelines
```typescript
// ✅ Good - Minimal custom styling
<Logo style={{ marginRight: 8 }} />

// ✅ Good - Responsive sizing
<Logo size={isTablet ? 'large' : 'medium'} />

// ❌ Bad - Override dimensions directly
<Logo style={{ width: 100, height: 50 }} />

// ✅ Good - Use container for positioning
<View style={styles.logoContainer}>
  <Logo size="large" />
</View>
```

### Brand Consistency
```typescript
// Maintain brand colors and styling
const brandColors = {
  primary: '#D4AF37',    // Champagne gold
  secondary: '#1f2937',  // Dark gray
  accent: '#3b82f6',     // Blue accent
};

// Use consistent spacing
const logoSpacing = {
  small: 4,
  medium: 8,
  large: 16,
  xlarge: 24,
};
```

### Performance Considerations
```typescript
// ✅ Good - Optimize for mobile
// PNG files are pre-optimized for mobile use
// SVG files are available for future react-native-svg integration

// ✅ Good - Use appropriate formats
const imageFormats = {
  logos: 'png',      // Best for logos with transparency
  icons: 'png',      // Best for small icons
  photos: 'jpeg',    // Best for photos (smaller file size)
  vectors: 'svg',    // Best for scalable graphics
};

// ✅ Good - Consider loading states
const LogoWithLoading: React.FC = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  return (
    <View>
      {!isLoaded && <LoadingSpinner />}
      <Logo 
        size="large" 
        onLoad={() => setIsLoaded(true)}
      />
    </View>
  );
};
```

---

**Follow these standards to maintain high code quality and performance in the CineMatch Mobile application.** 