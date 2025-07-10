import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

const fetchUpcomingMovies = async (): Promise<Movie[]> => {
  const response = await fetch(
    `${BASE_URL}/movie/upcoming?language=en-US&page=1`,
    API_OPTIONS
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiResponse<Movie> = await response.json();
  return data.results;
};

export const useUpcomingMovies = () => {
  const { data, isLoading, error } = useQuery<Movie[], Error>({
    queryKey: ['upcomingMovies'],
    queryFn: fetchUpcomingMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    movies: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 