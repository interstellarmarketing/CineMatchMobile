import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface MovieDetails {
  id: number;
  title: string;
  name?: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  release_date: string;
  first_air_date?: string;
  vote_average: number;
  vote_count: number;
  runtime?: number;
  episode_run_time?: number[];
  genres: Array<{ id: number; name: string }>;
  media_type?: 'movie' | 'tv';
}

interface DetailsState {
  movieDetails: MovieDetails | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: DetailsState = {
  movieDetails: null,
  isLoading: false,
  error: null,
};

const detailsSlice = createSlice({
  name: 'details',
  initialState,
  reducers: {
    addMovieDetails: (state, action: PayloadAction<MovieDetails>) => {
      state.movieDetails = action.payload;
      state.error = null;
    },
    clearMovieDetails: (state) => {
      state.movieDetails = null;
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
  },
});

export const {
  addMovieDetails,
  clearMovieDetails,
  setLoading,
  setError,
  clearError,
} = detailsSlice.actions;

export default detailsSlice.reducer; 