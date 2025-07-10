import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types';

interface GeminiState {
  searchResultMovies: Movie[] | null;
  searchResultMoviesNames: string[] | null;
  isFromGPTSearch: boolean;
  searchQuery: string | null;
  isLoading: boolean;
}

const initialState: GeminiState = {
  searchResultMovies: null,
  searchResultMoviesNames: null,
  isFromGPTSearch: false,
  searchQuery: null,
  isLoading: false,
};

const geminiSlice = createSlice({
  name: 'gemini',
  initialState,
  reducers: {
    setSearchResults: (state, action: PayloadAction<{
      movieNames: string[];
      movieResults: Movie[];
      searchQuery: string;
    }>) => {
      state.searchResultMoviesNames = action.payload.movieNames;
      state.searchResultMovies = action.payload.movieResults;
      state.searchQuery = action.payload.searchQuery;
      state.isFromGPTSearch = true;
    },
    clearSearchContext: (state) => {
      state.isFromGPTSearch = false;
      state.searchQuery = null;
      state.searchResultMovies = null;
      state.searchResultMoviesNames = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setSearchResults, clearSearchContext, setLoading } = geminiSlice.actions;
export default geminiSlice.reducer; 