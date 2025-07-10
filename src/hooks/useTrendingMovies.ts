import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

const fetchTrendingMovies = async (): Promise<Movie[]> => {
  const response = await fetch(
    `${BASE_URL}/trending/movie/week?language=en-US`,
    API_OPTIONS
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiResponse<Movie> = await response.json();
  return data.results;
};

export const useTrendingMovies = () => {
  const { data, isLoading, error } = useQuery<Movie[], Error>({
    queryKey: ['trendingMovies'],
    queryFn: fetchTrendingMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    movies: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 