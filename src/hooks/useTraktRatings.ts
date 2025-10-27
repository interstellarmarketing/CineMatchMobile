import { useQuery } from '@tanstack/react-query';
import { getTraktRatings } from '../utils/traktService';
import { TraktRating } from '../types';

/**
 * Custom hook to fetch Trakt ratings for a movie.
 * @param tmdbId The TMDB ID of the movie.
 * @param enabled Whether the query should be enabled.
 * @returns The result of the query.
 */
export const useTraktRatings = (tmdbId: number, enabled: boolean = true) => {
  return useQuery<TraktRating | null, Error>({
    queryKey: ['traktRatings', tmdbId],
    queryFn: () => getTraktRatings(tmdbId),
    enabled: enabled && !!tmdbId, // Only run if enabled and tmdbId is valid
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
    refetchOnWindowFocus: false, // No need to refetch on focus
    retry: 1, // Only retry once on failure
  });
};
