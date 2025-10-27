import {
  doc,
  getDoc,
  updateDoc,
  onSnapshot,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import NetInfo from '@react-native-community/netinfo';

import { Movie } from '../../types';

export type MediaItem = Movie;

import { UserPreferences } from '../../types';

// Connection state management
let isOffline = false;
let pendingOperations: Array<() => Promise<void>> = [];

// Monitor network state with NetInfo
const unsubscribe = NetInfo.addEventListener(state => {
  const wasOffline = isOffline;
  isOffline = !state.isConnected;
  
  if (__DEV__) {
    console.log('🌐 Network state changed:', {
      isConnected: state.isConnected,
      type: state.type,
      details: state.details
    });
  }
  
  if (wasOffline && !isOffline) {
    // Back online - process pending operations
    processPendingOperations();
  }
});

// Process pending operations when back online
const processPendingOperations = async () => {
  if (pendingOperations.length === 0) return;
  
  if (__DEV__) {
    console.log(`🔄 Processing ${pendingOperations.length} pending operations`);
  }
  
  const operations = [...pendingOperations];
  pendingOperations = [];
  
  for (const operation of operations) {
    try {
      await operation();
    } catch (error) {
      console.error('Error processing pending operation:', error);
    }
  }
  
  if (__DEV__) {
    console.log('✅ All pending operations processed');
  }
};

// Retry logic for failed operations
const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      if (__DEV__) {
        console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} for operation`);
      }
      
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
    }
  }
  
  throw lastError!;
};

export class FirestoreService {
  // Get user document reference
  private static getUserDoc(userId: string) {
    return doc(db, 'userPreferences', userId);
  }

  // Initialize user document with batch write
  static async initializeUser(userId: string, userData: { email: string; displayName: string }) {
    const operation = async () => {
      const batch = writeBatch(db);
      const userDoc = this.getUserDoc(userId);
      
      batch.set(userDoc, {
        favorites: [],
        watchlist: [],
        lists: [],
        lastUpdated: new Date().toISOString(),
        ...userData
      });
      
      await batch.commit();
    };

    try {
      await retryOperation(operation);
    } catch (error) {
      console.error('Error initializing user:', error);
      
      if (isOffline) {
        if (__DEV__) {
          console.log('📱 Queuing user initialization for when online');
        }
        pendingOperations.push(operation);
      } else {
        throw error;
      }
    }
  }

  // Get user preferences with offline support
  static async getUserPreferences(userId: string): Promise<UserPreferences | null> {
    try {
      const userDoc = this.getUserDoc(userId);
      const docSnap = await getDoc(userDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          favorites: data.favorites || [],
          watchlist: data.watchlist || [],
          lists: data.lists || [],
          lastUpdated: data.lastUpdated
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      
      if (isOffline) {
        if (__DEV__) {
          console.log('📱 Offline - returning null for user preferences');
        }
        // Return cached data if available (could be enhanced with local storage)
        return null;
      }
      
      throw error;
    }
  }

  // Update favorites with optimized batch write
  static async updateFavorites(userId: string, favorites: MediaItem[]): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'preferences.favorites': favorites });
  }

  // Update watchlist with optimized batch write
  static async updateWatchlist(userId: string, watchlist: MediaItem[]): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'preferences.watchlist': watchlist });
  }

  // Update lists with optimized batch write
  static async updateLists(userId: string, lists: UserPreferences['lists']): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { 'preferences.lists': lists });
  }

  // Batch sync all user data for better performance
  static async syncAllToCloud(userId: string, localData: UserPreferences) {
    const operation = async () => {
      const batch = writeBatch(db);
      const userDoc = this.getUserDoc(userId);
      
      batch.update(userDoc, {
        favorites: localData.favorites,
        watchlist: localData.watchlist,
        lists: localData.lists,
        lastUpdated: new Date().toISOString(),
      });
      
      await batch.commit();
    };

    try {
      await retryOperation(operation);
      if (__DEV__) {
        console.log('✅ All data synced to cloud successfully');
      }
    } catch (error) {
      console.error('Error syncing all data to cloud:', error);
      
      if (isOffline) {
        if (__DEV__) {
          console.log('📱 Queuing full sync for when online');
        }
        pendingOperations.push(operation);
      } else {
        throw error;
      }
    }
  }

  // Legacy sync method (kept for backward compatibility)
  static async syncToCloud(userId: string, localData: UserPreferences) {
    return this.syncAllToCloud(userId, localData);
  }

  // Listen to user preferences changes with error handling
  static subscribeToUserPreferences(userId: string, callback: (data: UserPreferences) => void) {
    const userDoc = this.getUserDoc(userId);
    
    return onSnapshot(userDoc, 
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const preferences: UserPreferences = {
            favorites: data.favorites || [],
            watchlist: data.watchlist || [],
            lists: data.lists || [],
            lastUpdated: data.lastUpdated
          };
          callback(preferences);
        }
      },
      (error) => {
        console.error('Error listening to user preferences:', error);
        // Handle the error gracefully without breaking the app
      }
    );
  }

  // Delete user account with batch operation
  static async deleteUserAccount(userId: string) {
    const operation = async () => {
      const batch = writeBatch(db);
      const userDoc = this.getUserDoc(userId);
      
      batch.delete(userDoc);
      await batch.commit();
    };

    try {
      await retryOperation(operation);
      if (__DEV__) {
        console.log('✅ User account deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting user account:', error);
      
      if (isOffline) {
        if (__DEV__) {
          console.log('📱 Queuing account deletion for when online');
        }
        pendingOperations.push(operation);
      } else {
        throw error;
      }
    }
  }

  // Get connection status
  static getConnectionStatus(): boolean {
    return !isOffline;
  }

  // Get detailed network info
  static async getNetworkInfo() {
    return await NetInfo.fetch();
  }

  // Force sync pending operations
  static async forceSyncPendingOperations() {
    if (!isOffline) {
      await processPendingOperations();
    }
  }

  // Clear pending operations (useful for testing)
  static clearPendingOperations() {
    pendingOperations = [];
  }

  // Get pending operations count
  static async getPendingOperationsCount(): number {
    return pendingOperations.length;
  }

  // Cleanup network listener (call when app is closing)
  static cleanup() {
    unsubscribe();
  }
} 