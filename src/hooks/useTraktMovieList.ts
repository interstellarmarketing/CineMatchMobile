import { useQuery } from '@tanstack/react-query';
import { getTraktTrendingList, getTraktPopularList } from '../utils/traktService';
import { Movie, TraktMovie } from '../types';
import { BASE_URL, API_OPTIONS } from '../utils/constants';

type ListType = 'trending' | 'popular';

/**
 * Fetches full movie details from TMDB for a given TMDB ID.
 */
const fetchMovieDetailsFromTMDB = async (tmdbId: number): Promise<Movie | null> => {
  try {
    const response = await fetch(`${BASE_URL}/movie/${tmdbId}`, API_OPTIONS);
    if (!response.ok) {
      // It's okay if a movie isn't found, just skip it.
      if (response.status === 404) return null;
      throw new Error(`TMDB movie fetch failed for ID ${tmdbId}: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Fetches a list of movies (trending or popular) from Trakt, then enriches
 * that list with full movie details from TMDB.
 */
const fetchTraktMovieList = async (listType: ListType): Promise<Movie[]> => {
  // 1. Fetch the movie list from Trakt
  const traktList: TraktMovie[] =
    listType === 'trending'
      ? await getTraktTrendingList()
      : await getTraktPopularList();

  if (!traktList || traktList.length === 0) {
    return [];
  }
  
  // 2. Extract TMDB IDs from the Trakt list
  const tmdbIds = traktList
    .map(item => item.movie?.ids?.tmdb)
    .filter((id): id is number => id != null);

  // 3. Fetch details for all movies from TMDB in parallel
  const movieDetailsPromises = tmdbIds.map(id => fetchMovieDetailsFromTMDB(id));
  const movies = (await Promise.all(movieDetailsPromises)).filter(
    (movie): movie is Movie => movie != null
  );

  return movies;
};

/**
 * Custom hook to get a Trakt movie list (trending or popular) enriched with TMDB data.
 * @param listType The type of list to fetch ('trending' or 'popular').
 */
export const useTraktMovieList = (listType: ListType) => {
  return useQuery<Movie[], Error>({
    queryKey: ['traktMovieList', listType],
    queryFn: () => fetchTraktMovieList(listType),
    staleTime: 1000 * 60 * 60 * 6, // Cache for 6 hours
    refetchOnWindowFocus: false,
  });
};
