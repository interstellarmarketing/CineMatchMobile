import { useState, useEffect, useCallback } from 'react';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';



export const useSearchMovies = () => {
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery) {
      searchMovies(debouncedQuery);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [debouncedQuery]);

  const searchMovies = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(
        `${BASE_URL}/search/multi?query=${encodeURIComponent(searchQuery)}&language=en-US&page=1&include_adult=false`,
        API_OPTIONS
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: ApiResponse<Movie> = await response.json();
      // Filter out results without posters and limit to movies/TV shows
      const filteredResults = data.results.filter(
        item => item.poster_path && (item.media_type === 'movie' || item.media_type === 'tv')
      );
      setSearchResults(filteredResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      console.error('Error searching movies:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuery = (newQuery: string) => {
    setQuery(newQuery);
  };

  const clearSearch = () => {
    setQuery('');
    setSearchResults([]);
    setError(null);
  };

  return { 
    searchResults, 
    loading, 
    error, 
    updateQuery, 
    clearSearch 
  };
}; 