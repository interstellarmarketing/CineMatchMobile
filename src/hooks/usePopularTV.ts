import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { TVShow, ApiResponse } from '../types';
import { refineTVShows } from '../utils/relevanceScore';

const fetchPopularTV = async (): Promise<TVShow[]> => {
  // Discover endpoint with stricter filters and without talk/news genres
  const params = new URLSearchParams({
    language: 'en-US',
    page: '1',
    region: 'US',
    include_adult: 'false',
    sort_by: 'popularity.desc',
    'vote_count.gte': '200',
    'vote_average.gte': '6.0',
    'first_air_date.gte': '2000-01-01', // Ignore shows that first-aired before 2000
    without_genres: '10763,10767',      // Exclude News & Talk-Shows at the API level
  });

  const response = await fetch(
    `${BASE_URL}/discover/tv?${params.toString()}`,
    API_OPTIONS
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data: ApiResponse<TVShow> = await response.json();

  // Client-side filtering & composite scoring
  return refineTVShows(data.results);
};

export const usePopularTV = () => {
  const { data, isLoading, error } = useQuery<TVShow[], Error>({
    queryKey: ['popularTV'],
    queryFn: fetchPopularTV,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    shows: data || [],
    loading: isLoading,
    error: error ? error.message : null,
  };
}; 