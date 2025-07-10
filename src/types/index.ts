// SVG module declarations
declare module '*.svg' {
  const content: any;
  export default content;
}

// Image module declarations
declare module '*.png' {
  const content: any;
  export default content;
}

// Shared TypeScript interfaces for CineMatchMobile

export interface Movie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
  poster_path?: string;
  overview?: string;
  backdrop_path?: string;
}

export interface MovieDetails extends Movie {
  genres: Array<{
    id: number;
    name: string;
  }>;
  runtime?: number;
  status: string;
  tagline?: string;
  budget?: number;
  revenue?: number;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string;
  }>;
}

export interface Trailer {
  key: string;
  name: string;
  site: string;
  size: number;
  type: string;
  official: boolean;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
}

export interface UserPreferences {
  favorites: Movie[];
  watchlist: Movie[];
  lists: Array<{
    id: string;
    name: string;
    description: string;
    items: Movie[];
    createdAt: string;
    updatedAt?: string;
  }>;
  lastUpdated?: string;
}

export interface List {
  id: string;
  name: string;
  description: string;
  items: Movie[];
  createdAt: string;
  updatedAt?: string;
}

export interface ApiResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface NavigationParams {
  movieId: number;
  movie: Movie;
}

export interface RouteParams {
  movieId: number;
  movie: Movie;
}

// Component prop interfaces
export interface MovieCardProps {
  poster_path?: string;
  movie: Movie;
  onPress?: (movie: Movie) => void;
}

export interface MovieListProps {
  title: string;
  movies: Movie[];
  onMoviePress?: (movie: Movie) => void;
}

export interface FavoriteButtonProps {
  media: Movie;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

export interface WatchlistButtonProps {
  media: Movie;
  size?: '2xs' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

// Hook return types
export interface UseMoviesReturn {
  movies: Movie[];
  loading: boolean;
  error: string | null;
}

export interface UseSearchMoviesReturn {
  searchResults: Movie[];
  loading: boolean;
  error: string | null;
  searchMovies: (query: string) => Promise<void>;
  clearSearch: () => void;
}

export interface UseMovieDetailsReturn {
  movieDetails: MovieDetails | null;
  loading: boolean;
  error: string | null;
}

export interface UseMovieTrailerReturn {
  trailer: Trailer | null;
  loading: boolean;
  error: string | null;
}

// Redux state interfaces
export interface MoviesState {
  nowPlayingMovies: Movie[];
  popularMovies: Movie[];
  trendingMovies: Movie[];
  upcomingMovies: Movie[];
  isLoading: boolean;
  error: string | null;
}

export interface UserState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  preferences: UserPreferences | null;
}

export interface DetailsState {
  selectedMovie: MovieDetails | null;
  isLoading: boolean;
  error: string | null;
}

export interface PreferencesState {
  favorites: Movie[];
  watchlist: Movie[];
  lists: List[];
  isLoading: boolean;
  error: string | null;
}

export interface GeminiState {
  searchResultMovies: Movie[] | null;
  searchResultMoviesNames: string[] | null;
  isFromGPTSearch: boolean;
  searchQuery: string | null;
  isLoading: boolean;
}

// Root state type
export interface RootState {
  user: UserState;
  movies: MoviesState;
  details: DetailsState;
  preferences: PreferencesState;
  gemini: GeminiState;
} 