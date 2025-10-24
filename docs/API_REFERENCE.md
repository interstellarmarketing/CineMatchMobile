# CineMatch Mobile API Reference

This document provides a comprehensive reference for all API integrations, services, and data patterns used in the CineMatch Mobile application.

## 📋 Table of Contents

- [External APIs](#external-apis)
- [Firebase Services](#firebase-services)
- [Redux Store API](#redux-store-api)
- [Custom Hooks API](#custom-hooks-api)
- [Navigation API](#navigation-api)
- [Storage API](#storage-api)
- [Error Handling](#error-handling)
- [Data Models](#data-models)

## 🌐 External APIs

### TMDB (The Movie Database) API

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

// API URLs
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_CDN_ORG_URL = 'https://image.tmdb.org/t/p/original';

// External URLs
export const GOOGLE_URL = 'https://www.google.com/search?q=';
export const IMDB_URL = 'https://www.imdb.com/title/';

// Default Images
export const MOVIE_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AyVKfKPBL23UVxRaD91gjGBwqWErKHuoScT6F';
export const SERIES_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AyXAlwqBL23UVxRaD91gjGBwqWErKHuoScT6F';
export const ACTOR_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AzpvQZNId7O3n0CwI1YRZ5lVtTFNGou9AE8Qc';
```

#### Movie Endpoints

##### Get Trending Movies
```typescript
// GET /trending/all/day
const getTrendingMovies = async () => {
  const response = await fetch(
    `${BASE_URL}/trending/all/day?language=en-US`,
    API_OPTIONS
  );
  return response.json();
};

// Response type
interface TrendingMoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}
```

##### Get Popular Movies
```typescript
// GET /movie/popular
const getPopularMovies = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/movie/popular?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Top Rated Movies
```typescript
// GET /movie/top_rated
const getTopRatedMovies = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/movie/top_rated?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Upcoming Movies
```typescript
// GET /movie/upcoming
const getUpcomingMovies = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Movie Details
```typescript
// GET /movie/{movie_id}
const getMovieDetails = async (movieId: number) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}`,
    API_OPTIONS
  );
  return response.json();
};

// Response type
interface MovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: Genre[];
  production_companies: ProductionCompany[];
  spoken_languages: SpokenLanguage[];
}
```

##### Get Movie Trailers
```typescript
// GET /movie/{movie_id}/videos
const getMovieTrailers = async (movieId: number) => {
  const response = await fetch(
    `${BASE_URL}/movie/${movieId}/videos`,
    API_OPTIONS
  );
  return response.json();
};

// Response type
interface MovieVideosResponse {
  id: number;
  results: Video[];
}

interface Video {
  id: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}
```

##### Get TV Show Endpoints

##### Get Popular TV Shows
```typescript
// GET /tv/popular
const getPopularTVShows = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/tv/popular?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Top Rated TV Shows
```typescript
// GET /tv/top_rated
const getTopRatedTVShows = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/tv/top_rated?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Upcoming TV Shows
```typescript
// GET /tv/on_the_air
const getUpcomingTVShows = async (page: number = 1) => {
  const response = await fetch(
    `${BASE_URL}/tv/on_the_air?page=${page}`,
    API_OPTIONS
  );
  return response.json();
};
```

##### Get Trending TV Shows
```typescript
// GET /trending/tv/week
const getTrendingTVShows = async () => {
  const response = await fetch(
    `${BASE_URL}/trending/tv/week?language=en-US`,
    API_OPTIONS
  );
  return response.json();
};
```

#### Data Models

##### Movie & TVShow
```typescript
interface Movie {
  id: number;
  title: string; // For movies
  name: string; // For TV shows
  overview: string;
  poster_path: string;
  backdrop_path: string;
  release_date: string; // For movies
  first_air_date: string; // For TV shows
  vote_average: number;
  vote_count: number;
  popularity: number;
  adult: boolean;
  video: boolean;
  genre_ids: number[];
}
```

##### Genre
```typescript
interface Genre {
  id: number;
  name: string;
}
```

##### Production Company
```typescript
interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}
```

##### Spoken Language
```typescript
interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}
```

## 🔥 Firebase Services

### Authentication

#### Firebase Configuration
```typescript
// src/utils/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyAiRVfyoXVWp4u-oSD1LJOWylfckA4DY38",
  authDomain: "cinematch-2b345.firebaseapp.com",
  projectId: "cinematch-2b345",
  storageBucket: "cinematch-2b345.firebasestorage.app",
  messagingSenderId: "429166648472",
  appId: "1:429166648472:web:dcc13fdc237e7eaa7544ed"
};

const app = initializeApp(firebaseConfig);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
const db = getFirestore(app);

export { auth, db };
export default app;
```

#### Authentication Service
```typescript
// src/utils/authService.ts
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { auth } from './firebase';

// Sign up user
export const signUpUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in user
export const signInUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign out user
export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Get current user
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
```

### Firestore Database

#### Firestore Service
```typescript
// src/utils/firestoreService.ts
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';

// User preferences
export const saveUserPreferences = async (userId: string, preferences: UserPreferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { preferences }, { merge: true });
  } catch (error) {
    throw new Error('Failed to save preferences');
  }
};

export const getUserPreferences = async (userId: string): Promise<UserPreferences | null> => {
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

// Favorites
export const addToFavorites = async (userId: string, movie: Movie) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentFavorites = userDoc.data().favorites || [];
      const updatedFavorites = [...currentFavorites, movie];
      
      await updateDoc(userRef, { favorites: updatedFavorites });
    } else {
      await setDoc(userRef, { favorites: [movie] });
    }
  } catch (error) {
    throw new Error('Failed to add to favorites');
  }
};

export const removeFromFavorites = async (userId: string, movieId: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentFavorites = userDoc.data().favorites || [];
      const updatedFavorites = currentFavorites.filter((movie: Movie) => movie.id !== movieId);
      
      await updateDoc(userRef, { favorites: updatedFavorites });
    }
  } catch (error) {
    throw new Error('Failed to remove from favorites');
  }
};

export const getFavorites = async (userId: string): Promise<Movie[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().favorites || [];
    }
    
    return [];
  } catch (error) {
    throw new Error('Failed to get favorites');
  }
};

// Watchlist
export const addToWatchlist = async (userId: string, movie: Movie) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentWatchlist = userDoc.data().watchlist || [];
      const updatedWatchlist = [...currentWatchlist, movie];
      
      await updateDoc(userRef, { watchlist: updatedWatchlist });
    } else {
      await setDoc(userRef, { watchlist: [movie] });
    }
  } catch (error) {
    throw new Error('Failed to add to watchlist');
  }
};

export const removeFromWatchlist = async (userId: string, movieId: number) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const currentWatchlist = userDoc.data().watchlist || [];
      const updatedWatchlist = currentWatchlist.filter((movie: Movie) => movie.id !== movieId);
      
      await updateDoc(userRef, { watchlist: updatedWatchlist });
    }
  } catch (error) {
    throw new Error('Failed to remove from watchlist');
  }
};

export const getWatchlist = async (userId: string): Promise<Movie[]> => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().watchlist || [];
    }
    
    return [];
  } catch (error) {
    throw new Error('Failed to get watchlist');
  }
};

// Real-time listeners
export const subscribeToUserData = (userId: string, callback: (data: any) => void) => {
  const userRef = doc(db, 'users', userId);
  return onSnapshot(userRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data());
    } else {
      callback(null);
    }
  });
};
```

## 🔄 Redux Store API

### Store Configuration
```typescript
// src/utils/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['user', 'preferences'], // Only persist specific slices
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

### Redux Slices

#### User Slice
```typescript
// src/utils/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signInUser, signUpUser, signOutUser } from '../authService';

// Async thunks
export const signInUserAsync = createAsyncThunk(
  'user/signIn',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await signInUser(credentials.email, credentials.password);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signUpUserAsync = createAsyncThunk(
  'user/signUp',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const user = await signUpUser(credentials.email, credentials.password);
      return user;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOutUserAsync = createAsyncThunk(
  'user/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOutUser();
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  currentUser: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload;
      state.isAuthenticated = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign in
      .addCase(signInUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signInUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signInUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign up
      .addCase(signUpUserAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(signUpUserAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(signUpUserAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Sign out
      .addCase(signOutUserAsync.fulfilled, (state) => {
        state.currentUser = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, setUser } = userSlice.actions;
export default userSlice.reducer;
```

#### Movies Slice
```typescript
// src/utils/slices/moviesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Async thunks
export const fetchTrendingMovies = createAsyncThunk(
  'movies/fetchTrending',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/trending/movie/week`,
        API_OPTIONS
      );
      const data = await response.json();
      return data.results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPopularMovies = createAsyncThunk(
  'movies/fetchPopular',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/popular?page=${page}`,
        API_OPTIONS
      );
      const data = await response.json();
      return data.results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTopRatedMovies = createAsyncThunk(
  'movies/fetchTopRated',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/top_rated?page=${page}`,
        API_OPTIONS
      );
      const data = await response.json();
      return data.results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUpcomingMovies = createAsyncThunk(
  'movies/fetchUpcoming',
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/upcoming?page=${page}`,
        API_OPTIONS
      );
      const data = await response.json();
      return data.results;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
interface MoviesState {
  trending: Movie[];
  popular: Movie[];
  topRated: Movie[];
  upcoming: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: MoviesState = {
  trending: [],
  popular: [],
  topRated: [],
  upcoming: [],
  loading: false,
  error: null,
};

const moviesSlice = createSlice({
  name: 'movies',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Trending movies
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
      })
      // Popular movies
      .addCase(fetchPopularMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchPopularMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.popular = action.payload;
      })
      .addCase(fetchPopularMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Top rated movies
      .addCase(fetchTopRatedMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTopRatedMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.topRated = action.payload;
      })
      .addCase(fetchTopRatedMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upcoming movies
      .addCase(fetchUpcomingMovies.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUpcomingMovies.fulfilled, (state, action) => {
        state.loading = false;
        state.upcoming = action.payload;
      })
      .addCase(fetchUpcomingMovies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = moviesSlice.actions;
export default moviesSlice.reducer;
```

#### Details Slice
```typescript
// src/utils/slices/detailsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Async thunks
export const fetchMovieDetails = createAsyncThunk(
  'details/fetchMovieDetails',
  async (movieId: number, { rejectWithValue }) => {
    try {
      const response = await fetch(
        `${BASE_URL}/movie/${movieId}`,
        API_OPTIONS
      );
      const data = await response.json();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
interface DetailsState {
  currentMovie: MovieDetails | null;
  loading: boolean;
  error: string | null;
}

const initialState: DetailsState = {
  currentMovie: null,
  loading: false,
  error: null,
};

const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {
    clearMovieDetails: (state) => {
      state.currentMovie = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Movie details
      .addCase(fetchMovieDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMovieDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMovie = action.payload;
      })
      .addCase(fetchMovieDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearMovieDetails, clearError } = detailsSlice.actions;
export default detailsSlice.reducer;
```

#### Preferences Slice
```typescript
// src/utils/slices/preferencesSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  addToFavorites, 
  removeFromFavorites, 
  getFavorites,
  addToWatchlist,
  removeFromWatchlist,
  getWatchlist
} from '../firestoreService';

// Async thunks
export const addToFavoritesAsync = createAsyncThunk(
  'preferences/addToFavorites',
  async ({ userId, movie }: { userId: string; movie: Movie }, { rejectWithValue }) => {
    try {
      await addToFavorites(userId, movie);
      return movie;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromFavoritesAsync = createAsyncThunk(
  'preferences/removeFromFavorites',
  async ({ userId, movieId }: { userId: string; movieId: number }, { rejectWithValue }) => {
    try {
      await removeFromFavorites(userId, movieId);
      return movieId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadFavoritesAsync = createAsyncThunk(
  'preferences/loadFavorites',
  async (userId: string, { rejectWithValue }) => {
    try {
      const favorites = await getFavorites(userId);
      return favorites;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const addToWatchlistAsync = createAsyncThunk(
  'preferences/addToWatchlist',
  async ({ userId, movie }: { userId: string; movie: Movie }, { rejectWithValue }) => {
    try {
      await addToWatchlist(userId, movie);
      return movie;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const removeFromWatchlistAsync = createAsyncThunk(
  'preferences/removeFromWatchlist',
  async ({ userId, movieId }: { userId: string; movieId: number }, { rejectWithValue }) => {
    try {
      await removeFromWatchlist(userId, movieId);
      return movieId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const loadWatchlistAsync = createAsyncThunk(
  'preferences/loadWatchlist',
  async (userId: string, { rejectWithValue }) => {
    try {
      const watchlist = await getWatchlist(userId);
      return watchlist;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

// Slice
interface PreferencesState {
  favorites: Movie[];
  watchlist: Movie[];
  loading: boolean;
  error: string | null;
}

const initialState: PreferencesState = {
  favorites: [],
  watchlist: [],
  loading: false,
  error: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Favorites
      .addCase(addToFavoritesAsync.fulfilled, (state, action) => {
        state.favorites.push(action.payload);
      })
      .addCase(removeFromFavoritesAsync.fulfilled, (state, action) => {
        state.favorites = state.favorites.filter(movie => movie.id !== action.payload);
      })
      .addCase(loadFavoritesAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadFavoritesAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.favorites = action.payload;
      })
      .addCase(loadFavoritesAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Watchlist
      .addCase(addToWatchlistAsync.fulfilled, (state, action) => {
        state.watchlist.push(action.payload);
      })
      .addCase(removeFromWatchlistAsync.fulfilled, (state, action) => {
        state.watchlist = state.watchlist.filter(movie => movie.id !== action.payload);
      })
      .addCase(loadWatchlistAsync.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadWatchlistAsync.fulfilled, (state, action) => {
        state.loading = false;
        state.watchlist = action.payload;
      })
      .addCase(loadWatchlistAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = preferencesSlice.actions;
export default preferencesSlice.reducer;
```

## 🪝 Custom Hooks API

### Authentication Hook
```typescript
// src/hooks/useAuth.ts
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { signInUserAsync, signUpUserAsync, signOutUserAsync } from '../utils/slices/userSlice';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { currentUser, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.user
  );

  const signIn = (email: string, password: string) => {
    dispatch(signInUserAsync({ email, password }));
  };

  const signUp = (email: string, password: string) => {
    dispatch(signUpUserAsync({ email, password }));
  };

  const signOut = () => {
    dispatch(signOutUserAsync());
  };

  return {
    user: currentUser,
    isAuthenticated,
    loading,
    error,
    signIn,
    signUp,
    signOut,
  };
};
```

### Movies Hooks

#### Trending Movies Hook
```typescript
// src/hooks/useTrendingMovies.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { fetchTrendingMovies } from '../utils/slices/moviesSlice';

export const useTrendingMovies = () => {
  const dispatch = useDispatch();
  const { trending, loading, error } = useSelector(
    (state: RootState) => state.movies
  );

  useEffect(() => {
    dispatch(fetchTrendingMovies());
  }, [dispatch]);

  return { trending, loading, error };
};
```

#### Popular Movies Hook
```typescript
// src/hooks/usePopularMovies.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { fetchPopularMovies } from '../utils/slices/moviesSlice';

export const usePopularMovies = () => {
  const dispatch = useDispatch();
  const { popular, loading, error } = useSelector(
    (state: RootState) => state.movies
  );

  useEffect(() => {
    dispatch(fetchPopularMovies());
  }, [dispatch]);

  return { popular, loading, error };
};
```

#### Top Rated Movies Hook
```typescript
// src/hooks/useTopRatedMovies.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { fetchTopRatedMovies } from '../utils/slices/moviesSlice';

export const useTopRatedMovies = () => {
  const dispatch = useDispatch();
  const { topRated, loading, error } = useSelector(
    (state: RootState) => state.movies
  );

  useEffect(() => {
    dispatch(fetchTopRatedMovies());
  }, [dispatch]);

  return { topRated, loading, error };
};
```

#### Upcoming Movies Hook
```typescript
// src/hooks/useUpcomingMovies.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { fetchUpcomingMovies } from '../utils/slices/moviesSlice';

export const useUpcomingMovies = () => {
  const dispatch = useDispatch();
  const { upcoming, loading, error } = useSelector(
    (state: RootState) => state.movies
  );

  useEffect(() => {
    dispatch(fetchUpcomingMovies());
  }, [dispatch]);

  return { upcoming, loading, error };
};
```

### Movie Details Hook
```typescript
// src/hooks/useMovieDetails.ts
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../utils/store';
import { fetchMovieDetails } from '../utils/slices/detailsSlice';
import { useTrailers } from './useTrailers';

export const useMovieDetails = (movieId: number) => {
  const dispatch = useDispatch();
  const { currentMovie, trailer, loading, error } = useSelector(
    (state: RootState) => state.details
  );
  const { bestTrailer } = useTrailers(movieId, 'movie');

  useEffect(() => {
    if (movieId) {
      dispatch(fetchMovieDetails(movieId));
    }
  }, [dispatch, movieId]);

  return { movie: currentMovie, trailer: bestTrailer, loading, error };
};
```

### TV Show Hooks

#### Trending TV Shows Hook
```typescript
// src/hooks/useTrendingTV.ts
import { useQuery } from '@tanstack/react-query';
import { fetchTrendingTV } from '../utils/api'; // Assuming API function

export const useTrendingTV = () => {
  return useQuery({
    queryKey: ['tv', 'trending'],
    queryFn: fetchTrendingTV,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### Popular TV Shows Hook
```typescript
// src/hooks/usePopularTV.ts
import { useQuery } from '@tanstack/react-query';
import { fetchPopularTV } from '../utils/api'; // Assuming API function

export const usePopularTV = () => {
  return useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: fetchPopularTV,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### Top Rated TV Shows Hook
```typescript
// src/hooks/useTopRatedTV.ts
import { useQuery } from '@tanstack/react-query';
import { fetchTopRatedTV } from '../utils/api'; // Assuming API function

export const useTopRatedTV = () => {
  return useQuery({
    queryKey: ['tv', 'top-rated'],
    queryFn: fetchTopRatedTV,
    staleTime: 5 * 60 * 1000,
  });
};
```

#### Upcoming TV Shows Hook
```typescript
// src/hooks/useUpcomingTV.ts
import { useQuery } from '@tanstack/react-query';
import { fetchUpcomingTV } from '../utils/api'; // Assuming API function

export const useUpcomingTV = () => {
  return useQuery({
    queryKey: ['tv', 'upcoming'],
    queryFn: fetchUpcomingTV,
    staleTime: 5 * 60 * 1000,
  });
};
```

### Advanced Hooks

#### Trailers Hook
```typescript
// src/hooks/useTrailers.ts
import { useState, useEffect } from 'react';

export const useTrailers = (mediaId: number, mediaType: 'movie' | 'tv') => {
  // ... implementation ...
  return { trailers, bestTrailer, loading, error, hasTrailers };
};
```

#### Watch Providers Hook
```typescript
// src/hooks/useWatchProviders.ts
import { useQuery } from '@tanstack/react-query';

export const useWatchProviders = (mediaType: 'movie' | 'tv', mediaId: number) => {
  // ... implementation ...
  return useQuery({ ... });
};
```

#### Filtered Content Hooks
```typescript
// src/hooks/useFilterState.ts & useFilteredMovies.ts
import { useState, useMemo } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';

export const useFilterState = () => {
  // ... state management for filters ...
};

export const useInfiniteFilteredMovies = (filters: FilterOptions, enabled: boolean) => {
  // ... fetches paginated filtered movies ...
};

export const useInfiniteFilteredTVShows = (filters: FilterOptions, enabled: boolean) => {
  // ... fetches paginated filtered TV shows ...
};
```

### Search Hook
```typescript
// src/hooks/useSearchMovies.ts
import { useState, useEffect } from 'react';

export const useSearchMovies = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const searchMovies = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `${BASE_URL}/search/movie?query=${encodeURIComponent(query)}`,
          API_OPTIONS
        );
        const data = await response.json();
        setResults(data.results);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchMovies, 500);
    return () => clearTimeout(timeoutId);
  }, [query]);

  return {
    query,
    setQuery,
    results,
    loading,
    error,
  };
};
```

## 🧭 Navigation API

### Navigation Types
```typescript
// src/types/navigation.ts
export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  MovieDetails: { movieId: number };
  Profile: undefined;
};

export type TabParamList = {
  Home: undefined;
  Browse: undefined;
  Search: undefined;
  MyLists: undefined;
};
```

### Navigation Configuration
```typescript
// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../utils/store';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

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
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
            <Stack.Screen name="Profile" component={ProfileScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

### Navigation Usage
```typescript
// In components
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

type NavigationProp = StackNavigationProp<RootStackParamList>;

const MyComponent = () => {
  const navigation = useNavigation<NavigationProp>();

  const handleMoviePress = (movieId: number) => {
    navigation.navigate('MovieDetails', { movieId });
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    // Component JSX
  );
};
```

## 💾 Storage API

### AsyncStorage Service
```typescript
// src/utils/storageService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  // Store data
  async setItem(key: string, value: any): Promise<void> {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(key, jsonValue);
    } catch (error) {
      console.error('Error storing data:', error);
      throw error;
    }
  },

  // Retrieve data
  async getItem<T>(key: string): Promise<T | null> {
    try {
      const jsonValue = await AsyncStorage.getItem(key);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  // Remove data
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing data:', error);
      throw error;
    }
  },

  // Clear all data
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  },

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  },
};

// Storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'user_preferences',
  SEARCH_HISTORY: 'search_history',
  OFFLINE_DATA: 'offline_data',
  APP_SETTINGS: 'app_settings',
} as const;
```

### Usage Examples
```typescript
// Store user preferences
const savePreferences = async (preferences: UserPreferences) => {
  await storageService.setItem(STORAGE_KEYS.USER_PREFERENCES, preferences);
};

// Load user preferences
const loadPreferences = async (): Promise<UserPreferences | null> => {
  return await storageService.getItem<UserPreferences>(STORAGE_KEYS.USER_PREFERENCES);
};

// Store search history
const saveSearchHistory = async (queries: string[]) => {
  await storageService.setItem(STORAGE_KEYS.SEARCH_HISTORY, queries);
};

// Load search history
const loadSearchHistory = async (): Promise<string[]> => {
  return await storageService.getItem<string[]>(STORAGE_KEYS.SEARCH_HISTORY) || [];
};
```

## ⚠️ Error Handling

### Error Types
```typescript
// src/types/errors.ts
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class NetworkError extends Error {
  constructor(message: string = 'Network connection failed') {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
```