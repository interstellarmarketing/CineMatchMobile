import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { AuthService } from '../authService';
import { FirestoreService, UserPreferences } from '../firestoreService';
import { User, UserState } from '../../types';

const initialState: UserState = {
  user: null,
  isLoading: false,
  error: null,
  isAuthenticated: false,
  preferences: null,
};

// Async thunks
export const signUpUser = createAsyncThunk(
  'user/signUp',
  async ({ email, password, displayName }: { email: string; password: string; displayName: string }) => {
    const user = await AuthService.signUp(email, password, displayName);
    await FirestoreService.initializeUser(user.uid, { email: user.email, displayName: user.displayName });
    return user;
  }
);

export const signInUser = createAsyncThunk(
  'user/signIn',
  async ({ email, password }: { email: string; password: string }) => {
    const user = await AuthService.signIn(email, password);
    return user;
  }
);

export const signOutUser = createAsyncThunk(
  'user/signOut',
  async () => {
    await AuthService.signOut();
  }
);

export const loadUserPreferences = createAsyncThunk(
  'user/loadPreferences',
  async (userId: string) => {
    const preferences = await FirestoreService.getUserPreferences(userId);
    return preferences;
  }
);

export const syncUserPreferences = createAsyncThunk(
  'user/syncPreferences',
  async ({ userId, preferences }: { userId: string; preferences: UserPreferences }) => {
    await FirestoreService.syncToCloud(userId, preferences);
    return preferences;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    addUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.error = null;
    },
    removeUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.preferences = null;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePreferences: (state, action: PayloadAction<UserPreferences>) => {
      state.preferences = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sign Up
      .addCase(signUpUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signUpUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signUpUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign up failed';
      })
      // Sign In
      .addCase(signInUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signInUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Sign in failed';
      })
      // Sign Out
      .addCase(signOutUser.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.preferences = null;
        state.error = null;
      })
      // Load Preferences
      .addCase(loadUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      })
      // Sync Preferences
      .addCase(syncUserPreferences.fulfilled, (state, action) => {
        state.preferences = action.payload;
      });
  },
});

export const { addUser, removeUser, setLoading, setError, clearError, updatePreferences } = userSlice.actions;
export default userSlice.reducer; 