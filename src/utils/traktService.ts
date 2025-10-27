import { TRAKT_API_KEY, TRAKT_API_URL } from './constants';
import { TraktMovie, TraktRating } from '../types';

const traktApiOptions = {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': TRAKT_API_KEY,
  },
};

/**
 * Fetches Trakt movie ratings for a given TMDB ID.
 * @param tmdbId The TMDB ID of the movie.
 * @returns A promise that resolves to the Trakt rating object.
 */
export const getTraktRatings = async (tmdbId: number): Promise<TraktRating | null> => {
  try {
    // First, find the Trakt movie using the TMDB ID to get the Trakt slug
    const searchResponse = await fetch(
      `${TRAKT_API_URL}/search/tmdb/${tmdbId}?type=movie`,
      traktApiOptions
    );

    if (!searchResponse.ok) {
      // If the movie is not found (404), it's not an error, just no rating available.
      if (searchResponse.status === 404) {
        return null;
      }
      throw new Error(`Trakt search failed: ${searchResponse.status}`);
    }

    const searchResult: TraktMovie[] = await searchResponse.json();
    
    if (!searchResult.length || !searchResult[0].movie) {
      return null;
    }

    const traktSlug = searchResult[0].movie.ids.slug;

    // Then, fetch the ratings for that movie using the Trakt slug
    const ratingsResponse = await fetch(
      `${TRAKT_API_URL}/movies/${traktSlug}/ratings`,
      traktApiOptions
    );

    if (!ratingsResponse.ok) {
      throw new Error(`Trakt ratings fetch failed: ${ratingsResponse.status}`);
    }

    const ratings: TraktRating = await ratingsResponse.json();
    return ratings;
  } catch (error) {
    console.error('Error fetching Trakt ratings:', error);
    // Return null to indicate that ratings could not be fetched, rather than crashing.
    return null;
  }
};

/**
 * Fetches the list of trending movies from Trakt.
 * @returns A promise that resolves to an array of Trakt movie objects.
 */
export const getTraktTrendingList = async (): Promise<TraktMovie[]> => {
  try {
    const response = await fetch(
      `${TRAKT_API_URL}/movies/trending?limit=20`,
      traktApiOptions
    );
    if (!response.ok) {
      throw new Error(`Trakt trending fetch failed: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching Trakt trending list:', error);
    return [];
  }
};

/**
 * Fetches the list of popular movies from Trakt.
 * @returns A promise that resolves to an array of Trakt movie objects.
 */
export const getTraktPopularList = async (): Promise<TraktMovie[]> => {
  try {
    const response = await fetch(
      `${TRAKT_API_URL}/movies/popular?limit=20`,
      traktApiOptions
    );
    if (!response.ok) {
      throw new Error(`Trakt popular fetch failed: ${response.status}`);
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching Trakt popular list:', error);
    return [];
  }
};
