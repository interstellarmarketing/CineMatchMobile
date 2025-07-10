# Firebase Integration Guide

## 🔥 Overview

This document provides comprehensive guidance for the Firebase integration in the CineMatch Mobile app, including authentication, cloud storage, and real-time synchronization.

## ✨ Features Implemented

### 1. Authentication
- **Email/Password Sign Up & Sign In**: Complete user registration and login flow
- **User State Management**: Redux integration for user state
- **Persistent Authentication**: AsyncStorage persistence for seamless app experience
- **Error Handling**: User-friendly error messages for authentication failures

### 2. Cloud Storage (Firestore)
- **User Preferences**: Store favorites, watchlist, and user settings
- **Real-time Sync**: Live updates across devices
- **Offline Support**: Local storage with cloud synchronization
- **Data Structure**: Organized user documents with preferences

### 3. Cross-Device Synchronization
- **Automatic Sync**: Changes sync to cloud automatically
- **Real-time Updates**: Live updates when data changes on other devices
- **Conflict Resolution**: Last-write-wins strategy for data consistency

## 🏗️ Architecture

### File Structure
```
src/
├── utils/
│   ├── firebase.ts          # Firebase configuration
│   ├── authService.ts       # Authentication service
│   ├── firestoreService.ts  # Firestore operations
│   └── slices/
│       ├── userSlice.ts     # User state management
│       └── preferencesSlice.ts # Preferences state
├── hooks/
│   └── useAuth.ts          # Authentication hook
└── components/
    └── AuthProvider.tsx    # Authentication wrapper
```

### Data Flow
1. **User Authentication**: Firebase Auth → Redux Store → UI
2. **Data Sync**: Local State → Firestore → Other Devices
3. **Real-time Updates**: Firestore → Redux Store → UI

## ⚙️ Setup Instructions

### 1. Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Enable Firestore Database
4. Get your Firebase config and update `src/utils/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyAiRVfyoXVWp4u-oSD1LJOWylfckA4DY38",
  authDomain: "cinematch-2b345.firebaseapp.com",
  projectId: "cinematch-2b345",
  storageBucket: "cinematch-2b345.firebasestorage.app",
  messagingSenderId: "429166648472",
  appId: "1:429166648472:web:dcc13fdc237e7eaa7544ed"
};
```

### 2. Firestore Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /userPreferences/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### 3. Authentication Rules

Configure Authentication settings in Firebase Console:
- Enable Email/Password authentication
- Set up password reset (optional)
- Configure user profile fields

## 💻 Usage Examples

### Authentication

```typescript
import { signUpUser, signInUser, signOutUser } from '../utils/slices/userSlice';

// Sign up
await dispatch(signUpUser({ 
  email: 'user@example.com', 
  password: 'password123', 
  displayName: 'John Doe' 
}));

// Sign in
await dispatch(signInUser({ 
  email: 'user@example.com', 
  password: 'password123' 
}));

// Sign out
await dispatch(signOutUser());
```

### Cloud Sync

```typescript
import { useAuth } from '../hooks/useAuth';

const { syncToCloud } = useAuth();

// Sync data to cloud
await syncToCloud();
```

### Real-time Updates

The app automatically handles real-time updates through the `useAuth` hook, which:
- Listens to authentication state changes
- Subscribes to user preferences updates
- Syncs local state with cloud data

## 📊 Data Models

### User Document Structure
```typescript
interface UserDocument {
  uid: string;
  email: string;
  displayName: string;
  createdAt: string;
  preferences: {
    favorites: MediaItem[];
    watchlist: MediaItem[];
    lists: Array<{
      id: string;
      name: string;
      description: string;
      items: MediaItem[];
      createdAt: number;
      updatedAt: number;
    }>;
  };
  lastUpdated?: string;
}
```

### Media Item Structure
```typescript
interface MediaItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  media_type?: 'movie' | 'tv';
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}
```

## 🔒 Security Considerations

1. **Authentication Required**: All Firestore operations require user authentication
2. **User Isolation**: Users can only access their own data
3. **Input Validation**: Client-side validation for all user inputs
4. **Error Handling**: Graceful error handling for network issues

## ⚡ Performance Optimizations

1. **Lazy Loading**: User preferences loaded on demand
2. **Caching**: Redux persistence for offline access
3. **Batch Operations**: Efficient cloud sync operations
4. **Real-time Subscriptions**: Optimized Firestore listeners

## 🧪 Testing

### Local Testing
- Use "Skip Login" feature for development
- Test with temporary user account
- Verify cloud sync functionality

### Production Testing
- Test with real Firebase project
- Verify cross-device synchronization
- Test offline/online scenarios

## 🔧 Troubleshooting

### Common Issues

1. **Firebase Config Error**
   - Verify Firebase configuration in `firebase.ts`
   - Check API keys and project settings

2. **Authentication Failures**
   - Verify email/password format
   - Check Firebase Authentication settings
   - Review error messages in console

3. **Sync Issues**
   - Check network connectivity
   - Verify Firestore rules
   - Review Redux state for conflicts

### Debug Mode

Enable debug logging by adding to `firebase.ts`:
```typescript
if (__DEV__) {
  console.log('Firebase initialized in debug mode');
}
```

## 🚀 Future Enhancements

1. **Google OAuth**: Add Google Sign-In support
2. **Social Features**: User profiles and sharing
3. **Advanced Sync**: Conflict resolution strategies
4. **Analytics**: User behavior tracking
5. **Push Notifications**: Movie recommendations

## 📦 Dependencies

- `firebase`: ^11.10.0
- `@react-native-async-storage/async-storage`: 2.1.2
- `@reduxjs/toolkit`: ^2.8.2
- `redux-persist`: ^6.0.0

## 📞 Support

For issues related to Firebase integration:
1. Check Firebase Console for errors
2. Review Redux DevTools for state issues
3. Verify network connectivity
4. Check Firestore rules and authentication settings

## 🔗 Related Documentation

- [API Reference](API_REFERENCE.md) - Complete API documentation
- [Architecture Guide](ARCHITECTURE.md) - System architecture details
- [Development Guide](DEV_GUIDE.md) - Setup and development instructions
- [Coding Standards](CODING_STANDARDS.md) - Development guidelines

## Firebase Integration

Firebase is used for backend services, including authentication and database storage. This document outlines the integration details.

### Authentication

Firebase Authentication is used to manage user sign-up, sign-in, and session management. The `useAuth` hook provides a simple interface to access the user's authentication state throughout the application.

### Firestore Database

Cloud Firestore is used as the primary database for storing user-specific data.

**Data Structure:**

User data is stored in a top-level collection named `userPreferences`. Each document in this collection is keyed by the user's unique `userId` from Firebase Authentication.

A typical document in the `userPreferences` collection looks like this:
```json
{
  "favorites": [
    { "id": 123, "title": "Example Movie" /* ...other movie data */ },
    { "id": 456, "title": "Another Movie" }
  ],
  "watchlist": [
    { "id": 789, "title": "A Show to Watch" }
  ],
  "lists": [
    { 
      "id": "list1", 
      "name": "My Custom List",
      "items": [
        { "id": 101, "title": "Item in a custom list" }
      ]
    }
  ],
  "lastUpdated": "2023-10-27T10:00:00Z"
}
```

**Best Practices for Data Synchronization:**

To ensure maximum performance, reduce network traffic, and minimize Firestore costs, the application has been refactored to use a centralized, debounced data synchronization strategy.

Instead of writing to Firestore on every individual user action (e.g., adding a single favorite), the application now follows these principles:

1.  **Local-First, Optimistic Updates:** All state changes are first applied to the local Redux store. This makes the UI feel instantaneous.
2.  **Centralized Sync Logic:** A `usePreferences` hook is responsible for observing changes to the user's preferences in the Redux store.
3.  **Debounced Batch Writes:** When changes are detected, the hook waits for a short period of inactivity (e.g., 2 seconds) before gathering all modifications (favorites, watchlist, etc.) and writing them to Firestore in a single, batched operation (`writeBatch` or a single `updateDoc`).

This approach avoids the performance pitfalls of frequent, small writes and is significantly more efficient than the previous method of using `arrayUnion` or `arrayRemove` for every single interaction.

**Example from `FirestoreService`:**
```typescript
// syncAllToCloud is called by the usePreferences hook after debouncing.
// It syncs the entire local preferences state to the cloud in one operation.
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
  // ... retry logic ...
}
```

This architecture ensures a responsive user experience while maintaining efficient and cost-effective communication with the backend. 