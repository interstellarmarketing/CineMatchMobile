# TV Shows Integration Guide

This document outlines the architecture and implementation for fetching, managing, and displaying TV show data within the CineMatch Mobile application.

## Architecture

The integration of TV show data mirrors the existing architecture for movies to maintain consistency and reusability. This includes:

- **Custom Hooks**: Dedicated hooks for fetching different categories of TV shows from the TMDB API.
- **State Management**: A separate Redux slice for managing TV show data, though currently, the global state is managed via React Query.
- **Unified Components**: Reusing existing components like `MovieCard` and `MovieList` to display TV show information.

## Custom Hooks for TV Shows

A suite of custom hooks has been developed to handle API requests for TV show data. These hooks leverage React Query for caching, refetching, and state management.

- **`useTrendingTV()`**: Fetches a list of the most trending TV shows for the week.
- **`usePopularTV()`**: Retrieves a list of popular TV shows, refined with a relevance score.
- **`useTopRatedTV()`**: Gets a list of the highest-rated TV shows.
- **`useUpcomingTV()`**: Fetches TV shows that are currently on the air.

### Example: `usePopularTV.ts`
```typescript
import { useQuery } from '@tanstack/react-query';
import { BASE_URL, API_OPTIONS } from '../utils/constants';
import { TVShow, ApiResponse } from '../types';
import { refineTVShows } from '../utils/relevanceScore';

const fetchPopularTV = async (): Promise<TVShow[]> => {
  // Discover endpoint with stricter filters
  const params = new URLSearchParams({
    // ... params
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
```

## Data Model

To accommodate both movies and TV shows without significant refactoring, the existing `Movie` interface is used for both. The key difference is the use of the `name` and `first_air_date` properties for TV shows, versus `title` and `release_date` for movies.

```typescript
// src/types/index.ts
export interface Movie {
  id: number;
  title?: string; // For movies
  name?: string; // For TV shows
  overview: string;
  poster_path: string;
  // ... other properties
  release_date?: string; // For movies
  first_air_date?: string; // For TV shows
}
```

## UI Integration

The UI components have been designed to handle both movie and TV show data gracefully.

- **`MovieCard.tsx`**: This component checks for the presence of `title` or `name` and `release_date` or `first_air_date` to display the correct information.
- **`BrowseScreen.tsx`**: This screen now includes sections for trending, popular, and top-rated TV shows, fetched using the respective hooks.
- **`SearchScreen.tsx`**: The search functionality is capable of querying both movies and TV shows.

This unified approach simplifies development and ensures a consistent user experience across different types of media content.
