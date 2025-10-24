import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

// Correct Provider IDs for major streaming services (verified from TMDB)
const STREAMING_PROVIDERS = {
  NETFLIX: 8,
  PRIME_VIDEO: 119,
  DISNEY_PLUS: 2,
  HULU: 15,
  HBO_MAX: 384,
  APPLE_TV: 350,
  PARAMOUNT_PLUS: 531,
  PEACOCK: 386,
  STARZ: 43,
  SHOWTIME: 37,
};

export interface StreamingChartMovie extends Movie {
  rank?: number;
  trend_direction?: 'up' | 'down' | 'stable';
  provider_name?: string;
  media_type?: 'movie' | 'tv';
}

// Cache for movie availability to avoid repeated API calls
const availabilityCache = new Map<string, boolean>();

// Helper function to check if a movie/show is available on a specific provider
const checkAvailability = async (mediaId: number, mediaType: 'movie' | 'tv', providerId: number): Promise<boolean> => {
  const cacheKey = `${mediaType}-${mediaId}-${providerId}`;
  
  // Check cache first
  if (availabilityCache.has(cacheKey)) {
    return availabilityCache.get(cacheKey)!;
  }
  
  try {
    const response = await fetch(
      `${BASE_URL}/${mediaType}/${mediaId}/watch/providers`,
      API_OPTIONS
    );
    
    if (!response.ok) {
      availabilityCache.set(cacheKey, false);
      return false;
    }
    
    const data = await response.json();
    const flatrate = data.results?.US?.flatrate || [];
    const free = data.results?.US?.free || [];
    const ads = data.results?.US?.ads || [];
    
    const allProviders = [...flatrate, ...free, ...ads];
    const isAvailable = allProviders.some(provider => provider.provider_id === providerId);
    
    // Debug logging for first few items
    if (mediaId <= 5) {
      console.log(`${mediaType} ${mediaId} providers:`, allProviders.map(p => `${p.provider_name} (${p.provider_id})`));
      console.log(`Looking for provider ${providerId}, found: ${isAvailable}`);
    }
    
    // Cache the result
    availabilityCache.set(cacheKey, isAvailable);
    return isAvailable;
  } catch (error) {
    console.error(`Error checking availability for ${mediaType} ${mediaId}:`, error);
    availabilityCache.set(cacheKey, false);
    return false;
  }
};

// Get trending movies and filter by provider
const getTrendingMoviesForProvider = async (providerId: number): Promise<StreamingChartMovie[]> => {
  try {
    console.log(`Fetching trending movies for provider ${providerId}...`);
    
    // Get top 100 trending movies
    const response = await fetch(
      `${BASE_URL}/trending/movie/day?language=en-US&region=US&page=1`,
      API_OPTIONS
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<Movie> = await response.json();
    console.log(`Found ${data.results.length} trending movies, checking availability...`);
    
    // Check availability for each movie
    const availableMovies: StreamingChartMovie[] = [];
    
    for (const movie of data.results.slice(0, 50)) { // Check first 50 for performance
      const isAvailable = await checkAvailability(movie.id, 'movie', providerId);
      
      if (isAvailable) {
        console.log(`✅ Movie "${movie.title}" is available on provider ${providerId}`);
        availableMovies.push({
          ...movie,
          rank: availableMovies.length + 1,
          trend_direction: availableMovies.length < 3 ? 'up' : 'stable' as const,
          provider_name: providerId === STREAMING_PROVIDERS.NETFLIX ? 'NETFLIX' : 
                         providerId === STREAMING_PROVIDERS.PRIME_VIDEO ? 'PRIME VIDEO' :
                         providerId === STREAMING_PROVIDERS.DISNEY_PLUS ? 'DISNEY+' :
                         providerId === STREAMING_PROVIDERS.HULU ? 'HULU' :
                         providerId === STREAMING_PROVIDERS.HBO_MAX ? 'HBO MAX' :
                         'STREAMING',
          media_type: 'movie' as const,
        });
        
        if (availableMovies.length >= 10) {
          break;
        }
      }
    }
    
    console.log(`Found ${availableMovies.length} available movies for provider ${providerId}`);
    return availableMovies;
  } catch (error) {
    console.error('Error in getTrendingMoviesForProvider:', error);
    return [];
  }
};

// Get trending TV shows and filter by provider
const getTrendingTVShowsForProvider = async (providerId: number): Promise<StreamingChartMovie[]> => {
  try {
    console.log(`Fetching trending TV shows for provider ${providerId}...`);
    
    // Get top 100 trending TV shows
    const response = await fetch(
      `${BASE_URL}/trending/tv/day?language=en-US&region=US&page=1`,
      API_OPTIONS
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse<Movie> = await response.json();
    console.log(`Found ${data.results.length} trending TV shows, checking availability...`);
    
    // Check availability for each TV show
    const availableTVShows: StreamingChartMovie[] = [];
    
    for (const show of data.results.slice(0, 50)) { // Check first 50 for performance
      const isAvailable = await checkAvailability(show.id, 'tv', providerId);
      
      if (isAvailable) {
        console.log(`✅ TV Show "${show.name}" is available on provider ${providerId}`);
        availableTVShows.push({
          ...show,
          rank: availableTVShows.length + 1,
          trend_direction: availableTVShows.length < 3 ? 'up' : 'stable' as const,
          provider_name: providerId === STREAMING_PROVIDERS.NETFLIX ? 'NETFLIX' : 
                         providerId === STREAMING_PROVIDERS.PRIME_VIDEO ? 'PRIME VIDEO' :
                         providerId === STREAMING_PROVIDERS.DISNEY_PLUS ? 'DISNEY+' :
                         providerId === STREAMING_PROVIDERS.HULU ? 'HULU' :
                         providerId === STREAMING_PROVIDERS.HBO_MAX ? 'HBO MAX' :
                         'STREAMING',
          media_type: 'tv' as const,
        });
        
        if (availableTVShows.length >= 10) {
          break;
        }
      }
    }
    
    console.log(`Found ${availableTVShows.length} available TV shows for provider ${providerId}`);
    return availableTVShows;
  } catch (error) {
    console.error('Error in getTrendingTVShowsForProvider:', error);
    return [];
  }
};

const fetchStreamingCharts = async (providerId: number = STREAMING_PROVIDERS.NETFLIX): Promise<StreamingChartMovie[]> => {
  try {
    // Get both movies and TV shows for the provider
    const [movies, tvShows] = await Promise.all([
      getTrendingMoviesForProvider(providerId),
      getTrendingTVShowsForProvider(providerId)
    ]);
    
    // Combine and sort by rank
    const combinedContent = [...movies, ...tvShows].sort((a, b) => (a.rank || 0) - (b.rank || 0));
    
    return combinedContent.slice(0, 10);
  } catch (error) {
    console.error('Error in fetchStreamingCharts:', error);
    return [];
  }
};

export const useStreamingCharts = (providerId: number = STREAMING_PROVIDERS.NETFLIX) => {
  const { data, isLoading, error } = useQuery<StreamingChartMovie[], Error>({
    queryKey: ['streamingCharts', providerId],
    queryFn: () => fetchStreamingCharts(providerId),
    staleTime: 1000 * 60 * 15, // 15 minutes (longer cache for streaming data)
    gcTime: 1000 * 60 * 60, // 1 hour garbage collection
  });

  return {
    movies: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
};

export { STREAMING_PROVIDERS }; 