import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { TVShow, ApiResponse } from '../types';

const fetchUpcomingTV = async (): Promise<TVShow[]> => {
  const response = await fetch(
    `${BASE_URL}/tv/on_the_air?language=en-US&page=1`,
    API_OPTIONS
  );
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data: ApiResponse<TVShow> = await response.json();
  return data.results;
};

export const useUpcomingTV = () => {
  const { data, isLoading, error } = useQuery<TVShow[], Error>({
    queryKey: ['upcomingTV'],
    queryFn: fetchUpcomingTV,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    shows: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 