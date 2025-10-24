import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Movie } from '../../types';

interface GeminiState {
  toggleState: boolean;
  toggleGemini: boolean;
  searchResultMovies: Movie[] | null;
  searchResultMoviesNames: string[] | null;
  isFromGPTSearch: boolean;
  searchQuery: string | null;
  isLoading: boolean;
}

const initialState: GeminiState = {
  toggleState: false,
  toggleGemini: false,
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
    toggleGPTSearch: (state) => {
      state.toggleState = !state.toggleState;
    },
    toggleGeminiSearch: (state) => {
      state.toggleGemini = !state.toggleGemini;
    },
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

export const { toggleGPTSearch, toggleGeminiSearch, setSearchResults, clearSearchContext, setLoading } = geminiSlice.actions;
export default geminiSlice.reducer; 