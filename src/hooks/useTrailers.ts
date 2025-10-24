import { useState, useEffect } from 'react';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Trailer } from '../types';

export const useTrailers = (mediaId: number | null, mediaType: 'movie' | 'tv' = 'movie') => {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!mediaId) {
      setTrailers([]);
      return;
    }

    const fetchTrailers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(
          `${BASE_URL}/${mediaType}/${mediaId}/videos?language=en-US`,
          API_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data: { id: number; results: Trailer[] } = await response.json();
        
        // Filter for trailers and sort by official first, then by popularity
        const trailerResults = data.results
          .filter(video => video.type === 'Trailer')
          .sort((a, b) => {
            // Official trailers first
            if (a.official && !b.official) return -1;
            if (!a.official && b.official) return 1;
            // Then by site (YouTube preferred)
            if (a.site === 'YouTube' && b.site !== 'YouTube') return -1;
            if (a.site !== 'YouTube' && b.site === 'YouTube') return 1;
            // Then by size (higher quality first)
            return (b.size || 0) - (a.size || 0);
          });
        
        setTrailers(trailerResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load trailers');
        console.error('Error fetching trailers:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTrailers();
  }, [mediaId, mediaType]);

  // Get the best trailer (first in the sorted list)
  const bestTrailer = trailers.length > 0 ? trailers[0] : null;

  return { 
    trailers, 
    bestTrailer, 
    loading, 
    error,
    hasTrailers: trailers.length > 0
  };
}; 