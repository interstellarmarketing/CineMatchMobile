import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';

// Interface for certification data
interface Certification {
  certification: string;
  meaning: string;
  order: number;
}

interface CertificationsResponse {
  certifications: {
    [countryCode: string]: Certification[];
  };
}

// Interface for movie with certifications
interface MovieWithCertifications {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  media_type?: 'movie' | 'tv';
  poster_path?: string;
  overview?: string;
  backdrop_path?: string;
  genre_ids?: number[];
  certifications?: string[];
}

// Fetch certifications for a specific country
const fetchCertifications = async (countryCode: string = 'US'): Promise<Certification[]> => {
  try {
    const response = await fetch(
      `${BASE_URL}/certification/movie/list`,
      API_OPTIONS
    );
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: CertificationsResponse = await response.json();
    return data.certifications[countryCode] || [];
  } catch (error) {
    console.error('Error fetching certifications:', error);
    return [];
  }
};

// Build discover URL with certification filtering
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildDiscoverUrlWithCertifications = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseFilters: any, 
  ageRatings: string[], 
  mediaType: 'movie' | 'tv' = 'movie'
): string => {
  const params = new URLSearchParams({
    language: 'en-US',
    include_adult: 'false',
    page: (baseFilters.page || 1).toString(),
  });

  // Add base filters
  if (baseFilters.genres && baseFilters.genres.length > 0) {
    params.append('with_genres', baseFilters.genres.join(','));
  }
  if (baseFilters.minRating && baseFilters.minRating > 0) {
    params.append('vote_average.gte', baseFilters.minRating.toString());
  }
  if (baseFilters.maxRating && baseFilters.maxRating < 10) {
    params.append('vote_average.lte', baseFilters.maxRating.toString());
  }
  if (baseFilters.sortBy) {
    params.append('sort_by', baseFilters.sortBy);
  } else {
    params.append('sort_by', 'popularity.desc');
  }

  // Add certification filtering for US
  if (ageRatings.length > 0) {
    // TMDB uses certification parameter for US ratings
    // We'll use the first age rating as the primary filter
    // For multiple ratings, we'll need to make multiple requests and combine
    const primaryRating = ageRatings[0];
    params.append('certification_country', 'US');
    params.append('certification', primaryRating);
  }

  return `${BASE_URL}/discover/${mediaType}?${params.toString()}`;
};

// Fetch filtered content with age ratings using TMDB's certification system
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const fetchFilteredWithAgeRatings = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseFilters: any,
  ageRatings: string[],
  mediaType: 'movie' | 'tv',
  page: number = 1
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> => {
  if (ageRatings.length === 0) {
    // No age rating filter, use regular discover
    const params = new URLSearchParams({
      language: 'en-US',
      include_adult: 'false',
      page: page.toString(),
    });

    if (baseFilters.genres && baseFilters.genres.length > 0) {
      params.append('with_genres', baseFilters.genres.join(','));
    }
    if (baseFilters.minRating && baseFilters.minRating > 0) {
      params.append('vote_average.gte', baseFilters.minRating.toString());
    }
    if (baseFilters.maxRating && baseFilters.maxRating < 10) {
      params.append('vote_average.lte', baseFilters.maxRating.toString());
    }
    if (baseFilters.sortBy) {
      params.append('sort_by', baseFilters.sortBy);
    } else {
      params.append('sort_by', 'popularity.desc');
    }

    const url = `${BASE_URL}/discover/${mediaType}?${params.toString()}`;
    const response = await fetch(url, API_OPTIONS);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }

  // For multiple age ratings, we need to make multiple requests and combine results
  if (ageRatings.length > 1) {
    const promises = ageRatings.map(async (rating) => {
      const url = buildDiscoverUrlWithCertifications(
        { ...baseFilters, page: Math.ceil(page / ageRatings.length) },
        [rating],
        mediaType
      );
      
      const response = await fetch(url, API_OPTIONS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    });

    const results = await Promise.all(promises);
    
    // Combine and deduplicate results
    const allResults = results.flatMap(result => result.results);
    const uniqueResults = Array.from(
      new Map(allResults.map(item => [item.id, item])).values()
    );
    
    // Sort by the original sort criteria
    const sortBy = baseFilters.sortBy || 'popularity.desc';
    if (sortBy === 'popularity.desc') {
      uniqueResults.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else if (sortBy === 'vote_average.desc') {
      uniqueResults.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    } else if (sortBy === 'release_date.desc') {
      uniqueResults.sort((a, b) => {
        const dateA = a.release_date || a.first_air_date || '';
        const dateB = b.release_date || b.first_air_date || '';
        return dateB.localeCompare(dateA);
      });
    } else if (sortBy === 'title.asc') {
      uniqueResults.sort((a, b) => {
        const titleA = (a.title || a.name || '').toLowerCase();
        const titleB = (b.title || b.name || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }
    
    // Paginate the combined results
    const itemsPerPage = 20;
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedResults = uniqueResults.slice(startIndex, endIndex);
    
    return {
      page,
      results: paginatedResults,
      total_pages: Math.ceil(uniqueResults.length / itemsPerPage),
      total_results: uniqueResults.length,
    };
  } else {
    // Single age rating, use direct API call
    const url = buildDiscoverUrlWithCertifications(
      { ...baseFilters, page },
      ageRatings,
      mediaType
    );
    
    const response = await fetch(url, API_OPTIONS);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  }
};

// Hook to get available certifications
export const useCertifications = (countryCode: string = 'US') => {
  return useQuery<Certification[], Error>({
    queryKey: ['certifications', countryCode],
    queryFn: () => fetchCertifications(countryCode),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

// Hook to get movie with certifications
export const useMovieWithCertifications = (movieId: number, mediaType: 'movie' | 'tv' = 'movie') => {
  return useQuery<MovieWithCertifications, Error>({
    queryKey: ['movieWithCertifications', movieId, mediaType],
    queryFn: async () => {
      try {
        const appendToResponse = mediaType === 'movie' ? 'release_dates' : 'content_ratings';
        const response = await fetch(
          `${BASE_URL}/${mediaType}/${movieId}?append_to_response=${appendToResponse}`,
          API_OPTIONS
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        let certifications: string[] = [];
        
        if (mediaType === 'movie') {
          // Extract US certifications from release_dates
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const usReleaseDates = data.release_dates?.results?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result: any) => result.iso_3166_1 === 'US'
          );
          
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          certifications = usReleaseDates?.release_dates?.map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (release: any) => release.certification
          ).filter(Boolean) || [];
        } else {
          // Extract US content ratings for TV shows
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const usContentRatings = data.content_ratings?.results?.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (result: any) => result.iso_3166_1 === 'US'
          );
          
          certifications = usContentRatings?.rating ? [usContentRatings.rating] : [];
        }
        
        return {
          ...data,
          certifications
        };
      } catch (error) {
        console.error(`Error fetching ${mediaType} ${movieId} certifications:`, error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
    enabled: !!movieId,
  });
};

// Infinite query for filtered content with age ratings
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useInfiniteFilteredWithAgeRatings = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  baseFilters: any,
  ageRatings: string[],
  mediaType: 'movie' | 'tv'
) => {
  // Simplify the enabled condition to avoid React Query errors
  const shouldEnable = () => {
    // Always enable this query since we handle empty filters in the function
    return true;
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return useInfiniteQuery<any, Error>({
    queryKey: ['infiniteFilteredWithAgeRatings', baseFilters, ageRatings, mediaType],
    queryFn: ({ pageParam = 1 }) => fetchFilteredWithAgeRatings(baseFilters, ageRatings, mediaType, pageParam),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: shouldEnable(),
  });
};

// Legacy hook for single-page filtering (keeping for backward compatibility)
export const useFilterByAgeRating = (items: MovieWithCertifications[], ageRatings: string[], mediaType: 'movie' | 'tv') => {
  // Simplify the enabled condition to avoid React Query errors
  const shouldEnable = () => {
    return items.length > 0 && ageRatings.length > 0;
  };

  return useQuery<MovieWithCertifications[], Error>({
    queryKey: ['filterByAgeRating', items.map(item => item.id), ageRatings, mediaType],
    queryFn: async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const ratingPatterns = ageRatings;
      
      if (!ageRatings || ageRatings.length === 0) {
        return items;
      }
      
      // For now, we'll use a simplified approach since fetching certifications for each movie is expensive
      // In a production app, you'd want to cache this data or use a different approach
      
      // Map age ratings to certification patterns
      // This is for future use when implementing actual certification filtering
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const _ratingPatterns = {
        'G': ['G'],
        'PG': ['PG'],
        'PG-13': ['PG-13'],
        'R': ['R'],
        'NC-17': ['NC-17'],
        'TV-Y': ['TV-Y'],
        'TV-G': ['TV-G'],
        'TV-PG': ['TV-PG'],
        'TV-14': ['TV-14'],
        'TV-MA': ['TV-MA']
      };

      // For now, we'll use a fallback approach based on content characteristics
      // This is not ideal but works until we implement proper certification fetching
      const filteredItems = items.filter(item => {
        const rating = item.vote_average || 0;
        const popularity = item.popularity || 0;
        const title = item.title || item.name || 'Unknown';
        
        // Simple heuristic based on typical content characteristics
        // This is a temporary solution - ideally we'd use actual certification data
        let shouldInclude = false;
        
        if (ageRatings.includes('G') || ageRatings.includes('TV-Y')) {
          // Family-friendly content typically has higher ratings
          shouldInclude = rating >= 6.5 && popularity >= 15;
        } else if (ageRatings.includes('PG') || ageRatings.includes('TV-G')) {
          // General audience content
          shouldInclude = rating >= 6.0 && popularity >= 10;
        } else if (ageRatings.includes('PG-13') || ageRatings.includes('TV-PG')) {
          // Teen and up content
          shouldInclude = rating >= 5.5 && popularity >= 8;
        } else if (ageRatings.includes('R') || ageRatings.includes('TV-14')) {
          // Mature content
          shouldInclude = rating >= 5.0 && popularity >= 5;
        } else if (ageRatings.includes('NC-17') || ageRatings.includes('TV-MA')) {
          // Adult content
          shouldInclude = rating >= 4.0;
        }
        
        if (!shouldInclude) {
          console.log(`Filtered out: "${title}" (rating: ${rating}, popularity: ${popularity}) - doesn't match age rating criteria`);
        }
        
        return shouldInclude;
      });
      
      console.log(`Age rating filtering: ${items.length} -> ${filteredItems.length} items`);
      return filteredItems;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: shouldEnable(),
  });
}; 