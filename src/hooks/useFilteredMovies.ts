import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

// Map TV certification labels to an ordinal scale for proper range handling
const TV_CERT_ORDER = ['TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];

export interface FilterOptions {
  genres?: number[];
  excludeGenres?: number[];
  minRating?: number;
  maxRating?: number;
  // Supports multiple age/certification selections, e.g., ['TV-14','TV-MA']
  ageRatings?: string[];
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
  page?: number;
}

const buildDiscoverUrl = (filters: FilterOptions, mediaType: 'movie' | 'tv' = 'movie'): string => {
  const params = new URLSearchParams({
    language: 'en-US',
    include_adult: 'false',
    page: (filters.page || 1).toString(),
  });

  // Add genre filters
  if (filters.genres && filters.genres.length > 0) {
    params.append('with_genres', filters.genres.join(','));
  }

  // Add rating filters
  if (filters.minRating && filters.minRating > 0) {
    params.append('vote_average.gte', filters.minRating.toString());
  }
  if (filters.maxRating && filters.maxRating < 10) {
    params.append('vote_average.lte', filters.maxRating.toString());
  }

  // ----------------------
  // Age-rating / certification filtering
  // ----------------------
  if (filters.ageRatings && filters.ageRatings.length > 0) {
    params.append('certification_country', 'US');

    // Movie & TV certifications use different parameter names. Movies accept
    // `certification` (exact) or `.lte` / `.gte`. TV ONLY supports the range
    // params. We'll build a range if the user selected >1 rating.

    const ratings = filters.ageRatings;

    // If using TV discover endpoint, leverage range params
    if (mediaType === 'tv') {
      // Determine min & max using our defined order
      const ordered = [...ratings].sort(
        (a, b) => TV_CERT_ORDER.indexOf(a) - TV_CERT_ORDER.indexOf(b)
      );
      const min = ordered[0];
      const max = ordered[ordered.length - 1];

      if (min === max) {
        // Single rating selected – exact match ok
        params.append('certification', min);
      } else {
        params.append('certification.gte', min);
        params.append('certification.lte', max);
      }
    } else {
      // Movies: TMDB allows either exact match or range – we'll use exact for now.
      params.append('certification', ratings[0]);
    }
  }

  // Add sorting
  if (filters.sortBy) {
    params.append('sort_by', filters.sortBy);
  } else {
    params.append('sort_by', 'popularity.desc');
  }

  return `${BASE_URL}/discover/${mediaType}?${params.toString()}`;
};

const fetchFilteredMovies = async (filters: FilterOptions): Promise<ApiResponse<Movie>> => {
  // If no meaningful filters are applied, return empty response
  if (Object.keys(filters).length === 0 || 
      (filters.genres?.length === 0 && !filters.minRating && !filters.maxRating && (!filters.ageRatings || filters.ageRatings.length === 0) && !filters.sortBy)) {
    console.log('No meaningful filters for movies, returning empty response');
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const url = buildDiscoverUrl(filters, 'movie');
  console.log('Fetching filtered movies with URL:', url);
  
  const response = await fetch(url, API_OPTIONS);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: ApiResponse<Movie> = await response.json();

  // Debug: Log some sample movies to understand the data
  if (data.results.length > 0) {
    console.log('Sample movie data:', {
      id: data.results[0].id,
      title: data.results[0].title,
      vote_average: data.results[0].vote_average,
      popularity: data.results[0].popularity,
      genre_ids: data.results[0].genre_ids,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    });
  }

  return data;
};

const fetchFilteredTVShows = async (filters: FilterOptions): Promise<ApiResponse<Movie>> => {
  // If no meaningful filters are applied, return empty response
  if (Object.keys(filters).length === 0 || 
      (filters.genres?.length === 0 && !filters.minRating && !filters.maxRating && (!filters.ageRatings || filters.ageRatings.length === 0) && !filters.sortBy)) {
    console.log('No meaningful filters for TV shows, returning empty response');
    return { page: 1, results: [], total_pages: 0, total_results: 0 };
  }

  const url = buildDiscoverUrl(filters, 'tv');
  console.log('Fetching filtered TV shows with URL:', url);
  
  const response = await fetch(url, API_OPTIONS);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: ApiResponse<Movie> = await response.json();

  // Debug: Log some sample TV shows to understand the data
  if (data.results.length > 0) {
    console.log('Sample TV show data:', {
      id: data.results[0].id,
      name: data.results[0].name,
      vote_average: data.results[0].vote_average,
      popularity: data.results[0].popularity,
      genre_ids: data.results[0].genre_ids,
      page: data.page,
      total_pages: data.total_pages,
      total_results: data.total_results
    });
  }

  return data;
};

// Infinite query for paginated movies
export const useInfiniteFilteredMovies = (filters: FilterOptions, enabled: boolean) => {
  return useInfiniteQuery<ApiResponse<Movie>, Error>({
    queryKey: ['infiniteFilteredMovies', filters],
    queryFn: ({ pageParam = 1 }) => fetchFilteredMovies({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

// Infinite query for paginated TV shows
export const useInfiniteFilteredTVShows = (filters: FilterOptions, enabled: boolean) => {
  return useInfiniteQuery<ApiResponse<Movie>, Error>({
    queryKey: ['infiniteFilteredTVShows', filters],
    queryFn: ({ pageParam = 1 }) => fetchFilteredTVShows({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled,
  });
};

// Legacy single-page queries (keeping for backward compatibility)
export const useFilteredMovies = (filters: FilterOptions) => {
  const { data, isLoading, error } = useQuery<ApiResponse<Movie>, Error>({
    queryKey: ['filteredMovies', filters],
    queryFn: () => fetchFilteredMovies(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, // Always enabled, we'll handle empty filters in the function
  });

  return {
    movies: data?.results || [],
    loading: isLoading,
    error: error ? error.message : null,
    totalPages: data?.total_pages || 0,
    totalResults: data?.total_results || 0,
  };
};

export const useFilteredTVShows = (filters: FilterOptions) => {
  const { data, isLoading, error } = useQuery<ApiResponse<Movie>, Error>({
    queryKey: ['filteredTVShows', filters],
    queryFn: () => fetchFilteredTVShows(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: true, // Always enabled, we'll handle empty filters in the function
  });

  return {
    shows: data?.results || [],
    loading: isLoading,
    error: error ? error.message : null,
    totalPages: data?.total_pages || 0,
    totalResults: data?.total_results || 0,
  };
};

export const useFilteredContent = (filters: FilterOptions, mediaType: 'all' | 'movies' | 'tv', ageRatings?: { movies: string[], tv: string[] }) => {
  const movieFilters = { ...filters };
  const tvFilters = { ...filters };

  const { movies, loading: moviesLoading, error: moviesError, totalResults: movieTotalResults } = useFilteredMovies(
    mediaType === 'tv' ? {} : movieFilters
  );
  
  const { shows, loading: tvLoading, error: tvError, totalResults: tvTotalResults } = useFilteredTVShows(
    mediaType === 'movies' ? {} : tvFilters
  );

  let combinedResults: Movie[] = [];
  let totalResults = 0;
  
  if (mediaType === 'all') {
    combinedResults = [...movies, ...shows];
    totalResults = movieTotalResults + tvTotalResults;
  } else if (mediaType === 'movies') {
    combinedResults = movies;
    totalResults = movieTotalResults;
  } else {
    combinedResults = shows;
    totalResults = tvTotalResults;
  }

  // For now, we'll return the combined results without age rating filtering
  // Age rating filtering should be implemented using the useMovieCertifications hook
  // in the component that uses this hook
  
  console.log(`Filtered results: ${combinedResults.length} items (movies: ${movies.length}, shows: ${shows.length})`);
  console.log(`Total available results: ${totalResults}`);
  if (ageRatings) {
    console.log('Age ratings requested but not yet implemented:', ageRatings);
  }

  return {
    results: combinedResults,
    loading: moviesLoading || tvLoading,
    error: moviesError || tvError,
    totalResults,
  };
}; 