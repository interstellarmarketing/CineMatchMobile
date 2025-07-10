import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { Movie, List, PreferencesState, RootState } from '../../types';

const initialState: PreferencesState = {
  favorites: [],
  watchlist: [],
  lists: [],
  isLoading: false,
  error: null,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<Movie>) => {
      const index = state.favorites.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(action.payload);
      }
    },
    toggleWatchlist: (state, action: PayloadAction<Movie>) => {
      const index = state.watchlist.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.watchlist.splice(index, 1);
      } else {
        state.watchlist.push(action.payload);
      }
    },
    createNewList: (state, action: PayloadAction<{ name: string; description: string }>) => {
      const newList: List = {
        id: Date.now().toString(),
        name: action.payload.name,
        description: action.payload.description,
        items: [],
        createdAt: new Date().toISOString(),
      };
      state.lists.push(newList);
    },
    addToList: (state, action: PayloadAction<{ listId: string; item: Movie }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const exists = list.items.find(item => item.id === action.payload.item.id);
        if (!exists) {
          list.items.push(action.payload.item);
        }
      }
    },
    removeFromList: (state, action: PayloadAction<{ listId: string; itemId: number }>) => {
      const list = state.lists.find(l => l.id === action.payload.listId);
      if (list) {
        const itemIndex = list.items.findIndex(item => item.id === action.payload.itemId);
        if (itemIndex !== -1) {
          list.items.splice(itemIndex, 1);
        }
      }
    },
    deleteList: (state, action: PayloadAction<string>) => {
      const listIndex = state.lists.findIndex(list => list.id === action.payload);
      if (listIndex !== -1) {
        state.lists.splice(listIndex, 1);
      }
    },
    setFavorites: (state, action: PayloadAction<Movie[]>) => {
      state.favorites = action.payload;
    },
    setWatchlist: (state, action: PayloadAction<Movie[]>) => {
      state.watchlist = action.payload;
    },
    setLists: (state, action: PayloadAction<List[]>) => {
      state.lists = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  toggleFavorite,
  toggleWatchlist,
  createNewList,
  addToList,
  removeFromList,
  deleteList,
  setFavorites,
  setWatchlist,
  setLists,
  setLoading,
  setError,
  clearError,
} = preferencesSlice.actions;

// EFFICIENT SELECTORS
const selectPreferences = (state: RootState) => state.preferences;

export const selectFavorites = createSelector(
  [selectPreferences],
  (preferences) => preferences.favorites
);

export const selectWatchlist = createSelector(
  [selectPreferences],
  (preferences) => preferences.watchlist
);

export const selectIsFavoriteById = (mediaId: number) =>
  createSelector(selectFavorites, (favorites) =>
    favorites.some((item) => item.id === mediaId)
  );

export const selectIsInWatchlistById = (mediaId: number) =>
  createSelector(selectWatchlist, (watchlist) =>
    watchlist.some((item) => item.id === mediaId)
  );

export default preferencesSlice.reducer; 