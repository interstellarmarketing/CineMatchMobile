import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

const fetchPopularMovies = async (): Promise<Movie[]> => {
  // Use discover endpoint with a high vote count for better popular content
  const params = new URLSearchParams({
    language: 'en-US',
    page: '1',
    include_adult: 'false',
    include_video: 'false',
    sort_by: 'popularity.desc',
    'vote_count.gte': '1000', // Ensure movies are well-known
  });

  const response = await fetch(
    `${BASE_URL}/discover/movie?${params.toString()}`,
    API_OPTIONS
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: ApiResponse<Movie> = await response.json();
  
  return data.results;
};

// Helper function to calculate recency boost
const getRecencyBoost = (releaseDate: string | undefined): number => {
  if (!releaseDate) return 0;
  
  const release = new Date(releaseDate);
  const now = new Date();
  const daysDiff = (now.getTime() - release.getTime()) / (1000 * 60 * 60 * 24);
  
  // Give boost to content released in the last 2 years, diminishing over time
  if (daysDiff < 365) return 50; // Last year gets highest boost
  if (daysDiff < 730) return 25; // Second year gets medium boost
  if (daysDiff < 1095) return 10; // Third year gets small boost
  return 0; // Older content gets no recency boost
};

export const usePopularMovies = () => {
  const { data, isLoading, error } = useQuery<Movie[], Error>({
    queryKey: ['popularMovies'],
    queryFn: fetchPopularMovies,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    movies: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 