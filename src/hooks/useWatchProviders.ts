import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';

// Types for watch providers
export interface WatchProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  _streamType?: string; // For internal use to distinguish subscription vs ads
}

export interface WatchProvidersResponse {
  results: {
    [region: string]: {
      flatrate?: WatchProvider[];
      rent?: WatchProvider[];
      buy?: WatchProvider[];
      free?: WatchProvider[];
      ads?: WatchProvider[];
    };
  };
}

// Function to detect user's region
const detectUserRegion = async (): Promise<string> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return data.country_code || 'US';
  } catch (error) {
    console.log('Could not detect region, using US as default');
    return 'US';
  }
};

// Function to fetch watch providers for a specific media
const fetchWatchProviders = async (
  mediaType: 'movie' | 'tv',
  mediaId: number
): Promise<WatchProvidersResponse> => {
  const url = `${BASE_URL}/${mediaType}/${mediaId}/watch/providers`;
  
  const response = await fetch(url, API_OPTIONS);
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: WatchProvidersResponse = await response.json();
  return data;
};

// Hook to get watch providers for a movie or TV show
export const useWatchProviders = (
  mediaType: 'movie' | 'tv',
  mediaId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: ['watchProviders', mediaType, mediaId],
    queryFn: async () => {
      const region = await detectUserRegion();
      return fetchWatchProviders(mediaType, mediaId, region);
    },
    enabled: enabled && !!mediaId,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: 1000,
  });
};

// Hook to get watch providers for a movie
export const useMovieWatchProviders = (movieId: number, enabled: boolean = true) => {
  return useWatchProviders('movie', movieId, enabled);
};

// Hook to get watch providers for a TV show
export const useTVWatchProviders = (tvId: number, enabled: boolean = true) => {
  return useWatchProviders('tv', tvId, enabled);
};

// Utility function to process watch providers data
export const processWatchProviders = (data: WatchProvidersResponse | undefined, region: string = 'US') => {
  if (!data || !data.results) {
    return {
      streamProviders: [],
      rentProviders: [],
      buyProviders: [],
      freeProviders: [],
      hasProviders: false,
      region
    };
  }

  // Get providers for user's region, fallback to US
  const regionProviders = data.results[region] || data.results.US;
  
  if (!regionProviders) {
    return {
      streamProviders: [],
      rentProviders: [],
      buyProviders: [],
      freeProviders: [],
      hasProviders: false,
      region
    };
  }

  // Destructure provider arrays
  const { flatrate = [], rent = [], buy = [], free = [], ads = [] } = regionProviders;

  // Combine flatrate and ads into a single streamProviders array with type info
  const streamProviders = [
    ...(flatrate?.map(p => ({ ...p, _streamType: 'subs' })) || []),
    ...(ads?.map(p => ({ ...p, _streamType: 'ads' })) || []),
  ];

  const totalProviders = streamProviders.length + rent.length + buy.length + free.length;

  return {
    streamProviders,
    rentProviders: rent,
    buyProviders: buy,
    freeProviders: free,
    hasProviders: totalProviders > 0,
    region,
    totalProviders
  };
};

// Hook that returns processed watch providers data
export const useProcessedWatchProviders = (
  mediaType: 'movie' | 'tv',
  mediaId: number,
  enabled: boolean = true
) => {
  const { data, isLoading, error } = useWatchProviders(mediaType, mediaId, enabled);
  
  const processedData = processWatchProviders(data);
  
  return {
    ...processedData,
    isLoading,
    error: error ? error.message : null,
    rawData: data
  };
}; 