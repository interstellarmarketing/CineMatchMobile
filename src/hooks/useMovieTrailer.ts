import { useState, useEffect } from 'react';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Trailer } from '../types';

export const useMovieTrailer = (movieId: number | null) => {
  const [trailer, setTrailer] = useState<Trailer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!movieId) {
      setTrailer(null);
      return;
    }

    const fetchTrailer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${BASE_URL}/movie/${movieId}/videos?language=en-US`,
          API_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: { id: number; results: Trailer[] } = await response.json();
        
        // Find the official trailer or the first trailer
        const officialTrailer = data.results.find(
          video => video.type === 'Trailer' && video.official
        );
        
        const firstTrailer = data.results.find(
          video => video.type === 'Trailer'
        );
        
        setTrailer(officialTrailer || firstTrailer || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trailer');
        console.error('Error fetching trailer:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailer();
  }, [movieId]);

  return { trailer, loading, error };
}; 