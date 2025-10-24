import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { TVShow, ApiResponse } from '../types';

const fetchTrendingTV = async (): Promise<TVShow[]> => {
  const response = await fetch(
    `${BASE_URL}/trending/tv/week?language=en-US&region=US`,
    API_OPTIONS
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiResponse<TVShow> = await response.json();

  // Return the raw, unfiltered list from TMDB
  return data.results;
};

export const useTrendingTV = () => {
  const { data, isLoading, error } = useQuery<TVShow[], Error>({
    queryKey: ['trendingTV'],
    queryFn: fetchTrendingTV,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    shows: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 