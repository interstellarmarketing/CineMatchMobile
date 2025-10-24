import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { Movie, ApiResponse } from '../types';

const fetchPopularMovies = async (): Promise<Movie[]> => {
  // Use discover endpoint with quality filters for better popular content
  const params = new URLSearchParams({
    language: 'en-US',
    page: '1',
    region: 'US',
    include_adult: 'false',
    include_video: 'false',
    sort_by: 'popularity.desc',
    // Quality filters to get better content like JustWatch
    'vote_count.gte': '200',        // Minimum votes for recognition
    'vote_average.gte': '6.0',      // Decent quality threshold
    // Slight recency bias - prefer content from last 5 years
    'primary_release_date.gte': '2019-01-01',
  });

  const response = await fetch(
    `${BASE_URL}/discover/movie?${params.toString()}`,
    API_OPTIONS
  );
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  const data: ApiResponse<Movie> = await response.json();
  
  // Apply additional quality scoring to the results
  const scoredResults = data.results.map(movie => {
    const popularityScore = movie.popularity || 0;
    const ratingScore = (movie.vote_average || 0) * Math.log(movie.vote_count || 1);
    const recencyBoost = getRecencyBoost(movie.release_date);
    
    // Weighted score: 50% popularity, 30% quality, 20% recency
    const finalScore = (popularityScore * 0.5) + (ratingScore * 0.3) + (recencyBoost * 0.2);
    
    return {
      ...movie,
      calculated_score: finalScore
    };
  });
  
  // Sort by calculated score and return top results
  return scoredResults
    .sort((a, b) => (b.calculated_score || 0) - (a.calculated_score || 0))
    .map(({ calculated_score, ...movie }) => movie); // Remove the score field
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