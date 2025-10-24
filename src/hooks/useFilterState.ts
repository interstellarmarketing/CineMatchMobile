import { useState, useMemo, useCallback } from 'react';
import { FilterOptions } from './useFilteredMovies';

export interface FilterState {
  genreFilters: { [genreId: number]: 'include' | 'exclude' | null };
  minRating: number;
  maxRating: number;
  movieAgeRatings: string[];
  tvAgeRatings: string[];
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
}

const INITIAL_FILTER_STATE: FilterState = {
  genreFilters: {},
  minRating: 0,
  maxRating: 10,
  movieAgeRatings: [],
  tvAgeRatings: [],
  sortBy: 'popularity.desc',
};

export const useFilterState = () => {
  const [filterState, setFilterState] = useState<FilterState>(INITIAL_FILTER_STATE);

  // Convert filter state to API format
  const apiFilters = useMemo((): FilterOptions => {
    const filters: FilterOptions = {};

    // Convert genre filters
    const includeGenres = Object.entries(filterState.genreFilters)
      .filter(([_, value]) => value === 'include')
      .map(([key]) => parseInt(key));
    
    const excludeGenres = Object.entries(filterState.genreFilters)
      .filter(([_, value]) => value === 'exclude')
      .map(([key]) => parseInt(key));

    if (includeGenres.length > 0) {
      filters.genres = includeGenres;
    }
    if (excludeGenres.length > 0) {
      filters.excludeGenres = excludeGenres;
    }

    // Add rating filters
    if (filterState.minRating > 0) {
      filters.minRating = filterState.minRating;
    }
    if (filterState.maxRating < 10) {
      filters.maxRating = filterState.maxRating;
    }

    // Movie age ratings (array)
    if (filterState.movieAgeRatings.length > 0) {
      filters.ageRatings = [...filterState.movieAgeRatings];
    }

    // Add sorting
    filters.sortBy = filterState.sortBy;

    return filters;
  }, [filterState]);

  // Create separate filters for movies and TV shows
  const movieFilters = useMemo((): FilterOptions => {
    const filters = { ...apiFilters };
    if (filterState.movieAgeRatings.length > 0) {
      filters.ageRatings = [...filterState.movieAgeRatings];
    }
    return filters;
  }, [apiFilters, filterState.movieAgeRatings]);

  const tvFilters = useMemo((): FilterOptions => {
    const filters = { ...apiFilters };
    if (filterState.tvAgeRatings.length > 0) {
      filters.ageRatings = [...filterState.tvAgeRatings];
    }
    return filters;
  }, [apiFilters, filterState.tvAgeRatings]);

  // Filter state update functions
  const updateGenreFilter = useCallback((genreId: number) => {
    setFilterState(prev => {
      const current = prev.genreFilters[genreId] || null;
      let next: 'include' | 'exclude' | null;
      
      if (current === null) next = 'include';
      else if (current === 'include') next = 'exclude';
      else next = null;
      
      return {
        ...prev,
        genreFilters: { ...prev.genreFilters, [genreId]: next }
      };
    });
  }, []);

  const updateMinRating = useCallback((rating: number) => {
    setFilterState(prev => ({ ...prev, minRating: rating }));
  }, []);

  const updateMaxRating = useCallback((rating: number) => {
    setFilterState(prev => ({ ...prev, maxRating: rating }));
  }, []);

  const toggleMovieAgeRating = useCallback((rating: string) => {
    setFilterState(prev => ({
      ...prev,
      movieAgeRatings: prev.movieAgeRatings.includes(rating)
        ? prev.movieAgeRatings.filter(r => r !== rating)
        : [...prev.movieAgeRatings, rating]
    }));
  }, []);

  const toggleTvAgeRating = useCallback((rating: string) => {
    setFilterState(prev => ({
      ...prev,
      tvAgeRatings: prev.tvAgeRatings.includes(rating)
        ? prev.tvAgeRatings.filter(r => r !== rating)
        : [...prev.tvAgeRatings, rating]
    }));
  }, []);

  const updateSortBy = useCallback((sortBy: FilterState['sortBy']) => {
    setFilterState(prev => ({ ...prev, sortBy }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilterState(INITIAL_FILTER_STATE);
  }, []);

  const hasActiveFilters = useMemo(() => {
    return (
      Object.values(filterState.genreFilters).some(value => value !== null) ||
      filterState.minRating > 0 ||
      filterState.maxRating < 10 ||
      filterState.movieAgeRatings.length > 0 ||
      filterState.tvAgeRatings.length > 0 ||
      filterState.sortBy !== 'popularity.desc'
    );
  }, [filterState]);

  return {
    filterState,
    apiFilters,
    movieFilters,
    tvFilters,
    updateGenreFilter,
    updateMinRating,
    updateMaxRating,
    toggleMovieAgeRating,
    toggleTvAgeRating,
    updateSortBy,
    clearFilters,
    hasActiveFilters,
  };
}; 