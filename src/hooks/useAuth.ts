import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../types';
import { AuthService } from '../utils/authService';
import { FirestoreService } from '../utils/firestoreService';
import { 
  addUser, 
  removeUser, 
  loadUserPreferences, 
  updatePreferences 
} from '../utils/slices/userSlice';
import { setFavorites, setLists, setWatchlist } from '../utils/slices/preferencesSlice';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

// Helper to ensure userPreferences doc exists
async function ensureUserPreferencesDoc(userId: string) {
  const userDoc = doc(db, 'userPreferences', userId);
  const docSnap = await getDoc(userDoc);
  if (!docSnap.exists()) {
    await setDoc(userDoc, {
      favorites: [],
      lists: [],
      lastUpdated: new Date().toISOString(),
    });
  }
}

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, isAuthenticated, preferences } = useSelector((state: RootState) => state.user);
  const { favorites, lists } = useSelector((state: RootState) => state.preferences);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = AuthService.onAuthStateChange(async (firebaseUser) => {
      if (firebaseUser) {
        // User is signed in
        const authUser = AuthService.convertFirebaseUser(firebaseUser);
        dispatch(addUser(authUser));

        // Ensure userPreferences doc exists
        await ensureUserPreferencesDoc(firebaseUser.uid);

        // Load user preferences from Firestore
        try {
          const userPrefs = await FirestoreService.getUserPreferences(firebaseUser.uid);
          if (userPrefs) {
            dispatch(updatePreferences(userPrefs));
            dispatch(setFavorites(userPrefs.favorites));
            dispatch(setWatchlist(userPrefs.watchlist));
            dispatch(setLists(userPrefs.lists));
          }
        } catch (error) {
          console.error('Error loading user preferences:', error);
        }

        // Subscribe to real-time updates
        const unsubscribePrefs = FirestoreService.subscribeToUserPreferences(
          firebaseUser.uid,
          (userPrefs) => {
            dispatch(updatePreferences(userPrefs));
            dispatch(setFavorites(userPrefs.favorites));
            dispatch(setWatchlist(userPrefs.watchlist));
            dispatch(setLists(userPrefs.lists));
          }
        );

        return () => unsubscribePrefs();
      } else {
        // User is signed out
        dispatch(removeUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  const syncToCloud = async () => {
    if (!user || user.uid === 'temp-user-id') return;

    try {
      const userPrefs = {
        favorites,
        lists,
        lastUpdated: new Date().toISOString()
      };

      await FirestoreService.syncToCloud(user.uid, userPrefs);
    } catch (error) {
      console.error('Error syncing to cloud:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    preferences,
    syncToCloud,
  };
}; 