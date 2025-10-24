import { useState, useEffect } from 'react';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { MovieDetails } from '../types';

export const useMovieDetails = (movieId: number | null, mediaType: 'movie' | 'tv' = 'movie') => {
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setMovieDetails(null);
      return;
    }

    const fetchMovieDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const endpoint = mediaType === 'tv' ? 'tv' : 'movie';
        const response = await fetch(
          `${BASE_URL}/${endpoint}/${movieId}?language=en-US`,
          API_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: MovieDetails = await response.json();
        setMovieDetails(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load details');
        console.error('Error fetching details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovieDetails();
  }, [movieId, mediaType]);

  return { movieDetails, loading, error };
}; 