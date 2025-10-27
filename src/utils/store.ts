import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootState } from '../types';

// Import reducers
import userReducer from './slices/userSlice';
import preferencesReducer from './slices/preferencesSlice';
import geminiReducer from './slices/geminiSlice';

// Separate persist configurations for better performance
const userPersistConfig = {
  key: 'user',
  storage: AsyncStorage,
  whitelist: ['user', 'isAuthenticated'], // Only persist essential user data
};

const preferencesPersistConfig = {
  key: 'preferences',
  storage: AsyncStorage,
  whitelist: ['favorites', 'watchlist', 'lists'], // Only persist user preferences
  throttle: 1000, // Throttle saves to prevent excessive writes
};

// Create persisted reducers
const persistedUserReducer = persistReducer(userPersistConfig, userReducer);
const persistedPreferencesReducer = persistReducer(preferencesPersistConfig, preferencesReducer);

// Configure store with performance optimizations
export const store = configureStore({
  reducer: {
    user: persistedUserReducer,
    preferences: persistedPreferencesReducer,
    gemini: geminiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PURGE',
          'persist/REGISTER',
          'persist/FLUSH',
          'persist/PAUSE',
          'persist/RESUME',
        ],
        ignoredPaths: ['_persist'],
      },
      // Improve performance with immutability checks
      immutableCheck: {
        warnAfter: 32,
        ignoredPaths: ['_persist'],
      },
    }),
  // Enable Redux DevTools only in development
  devTools: __DEV__,
});

export const persistor = persistStore(store);

// Export the AppDispatch type from the store itself
export type AppDispatch = typeof store.dispatch;

// Enhanced Redux monitoring with debouncing and filtering
if (__DEV__) {
  let previousState: RootState;
  let monitoringTimeout: NodeJS.Timeout | null = null;
  const pendingChanges = new Set<string>();

  // Deep comparison for meaningful changes
  const hasSignificantChange = (prev: unknown, current: unknown, sliceName: string): boolean => {
    // Type assertions for proper comparison
    const prevTyped = prev as Record<string, unknown>;
    const currentTyped = current as Record<string, unknown>;
    
    if (sliceName === 'user') {
      // Only log if user data actually changed, not just loading states
      return prevTyped?.user?.uid !== currentTyped?.user?.uid || 
             prevTyped?.user?.email !== currentTyped?.user?.email ||
             prevTyped?.isAuthenticated !== currentTyped?.isAuthenticated;
    }
    
    if (sliceName === 'preferences') {
      // Only log if actual preferences changed, not just loading states
      return (prevTyped?.favorites as unknown[])?.length !== (currentTyped?.favorites as unknown[])?.length ||
             (prevTyped?.watchlist as unknown[])?.length !== (currentTyped?.watchlist as unknown[])?.length ||
             (prevTyped?.lists as unknown[])?.length !== (currentTyped?.lists as unknown[])?.length;
    }
    
    if (sliceName === 'movies') {
      // Only log if movie data actually changed
      return (prevTyped?.trendingMovies as unknown[])?.length !== (currentTyped?.trendingMovies as unknown[])?.length ||
             (prevTyped?.popularMovies as unknown[])?.length !== (currentTyped?.popularMovies as unknown[])?.length;
    }
    
    // For other slices, use reference comparison
    return prev !== current;
  };

  const logStateChanges = () => {
    if (pendingChanges.size > 0) {
      const changes = Array.from(pendingChanges);
      
      // Only log if there are meaningful changes
      if (changes.length > 0) {
        console.log('🔄 Redux state updated:', changes.join(', '));
        
        // Additional context for debugging
        if (changes.includes('user')) {
          const userState = store.getState().user;
          console.log('   👤 User:', userState.user?.email || 'Not logged in');
        }
        
        if (changes.includes('preferences')) {
          const prefState = store.getState().preferences;
          console.log('   ⭐ Preferences:', {
            favorites: prefState.favorites.length,
            watchlist: prefState.watchlist.length,
            lists: prefState.lists.length
          });
        }
      }
      
      pendingChanges.clear();
    }
  };

  // Debounced monitoring
  store.subscribe(() => {
    const currentState = store.getState();
    
    if (previousState) {
      const changedSlices = Object.keys(currentState).filter(
        (key) => {
          const sliceKey = key as keyof RootState;
          return hasSignificantChange(previousState[sliceKey], currentState[sliceKey], key);
        }
      );
      
      changedSlices.forEach(slice => pendingChanges.add(slice));
      
      // Debounce logging to avoid spam
      if (monitoringTimeout) {
        clearTimeout(monitoringTimeout);
      }
      
      monitoringTimeout = setTimeout(logStateChanges, 500); // 500ms debounce
    }
    
    previousState = currentState;
  });
  
  // Log store initialization
  console.log('🏪 Redux store initialized');
} 