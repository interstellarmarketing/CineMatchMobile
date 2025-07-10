import { useEffect, useCallback, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { debounce, isEqual } from 'lodash';
import {
  setFavorites,
  setWatchlist,
  setLists,
  toggleFavorite,
  toggleWatchlist,
} from '../utils/slices/preferencesSlice';
import { FirestoreService } from '../utils/firestoreService';
import { useAuth } from './useAuth';
import { RootState, Movie, List } from '../types';

const usePreferences = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { favorites, watchlist, lists } = useSelector(
    (state: RootState) => state.preferences,
  );

  const loadedUserId = useRef<string | null>(null);
  const lastSyncedState = useRef<{ favorites: Movie[], watchlist: Movie[], lists: List[] } | null>(null);

  // Debounced sync function
  const debouncedSync = useCallback(
    debounce(async (userId: string, prefs: { favorites: Movie[], watchlist: Movie[], lists: List[] }) => {
      try {
        await FirestoreService.syncAllToCloud(userId, prefs);
        lastSyncedState.current = prefs;
        if (__DEV__) {
            console.log('☁️ Preferences synced to Firestore');
        }
      } catch (error) {
        console.error('Error in debounced sync:', error);
      }
    }, 2000), // 2-second debounce interval
    [],
  );

  // Load preferences from Firestore on user login
  useEffect(() => {
    const loadPreferences = async () => {
      if (user && user.uid && loadedUserId.current !== user.uid) {
        loadedUserId.current = user.uid;
        try {
          const cloudPrefs = await FirestoreService.getUserPreferences(user.uid);
          if (cloudPrefs) {
            dispatch(setFavorites(cloudPrefs.favorites || []));
            dispatch(setWatchlist(cloudPrefs.watchlist || []));
            dispatch(setLists(cloudPrefs.lists || []));
            lastSyncedState.current = cloudPrefs;
             if (__DEV__) {
                console.log('✅ Preferences loaded from Firestore');
            }
          }
        } catch (error) {
          console.error('Error loading preferences:', error);
        }
      }
    };

    loadPreferences();
  }, [user, dispatch]);

  // Sync preferences to Firestore when they change
  useEffect(() => {
    if (user && user.uid) {
      const currentState = { favorites, watchlist, lists };
      if (lastSyncedState.current && !isEqual(currentState, lastSyncedState.current)) {
        debouncedSync(user.uid, currentState);
      }
    }
  }, [favorites, watchlist, lists, user, debouncedSync]);

  const handleToggleFavorite = useCallback((movie: Movie) => {
    dispatch(toggleFavorite(movie));
  }, [dispatch]);

  const handleToggleWatchlist = useCallback((movie: Movie) => {
    dispatch(toggleWatchlist(movie));
  }, [dispatch]);


  return {
    favorites,
    watchlist,
    lists,
    toggleFavorite: handleToggleFavorite,
    toggleWatchlist: handleToggleWatchlist,
  };
};

export default usePreferences; 