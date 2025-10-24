# Advanced Filtering Guide

This document provides a detailed explanation of the advanced filtering system in CineMatch Mobile, which allows users to discover movies and TV shows based on specific criteria.

## Architecture

The filtering system is composed of three main hooks that work in concert:

1.  **`useFilterState`**: A state management hook that encapsulates all user-selected filter options.
2.  **`useFilteredMovies` / `useFilteredTVShows`**: Hooks that fetch data from the TMDB API based on the filters provided by `useFilterState`. These now support infinite scrolling.
3.  **`useMovieCertifications`**: A hook to fetch available age ratings and apply them as a filter.

### Data Flow

1.  The user interacts with filter controls in the UI (e.g., genre toggles, rating sliders).
2.  These interactions call update functions provided by `useFilterState`.
3.  `useFilterState` updates its internal state and exposes the formatted filters.
4.  The UI passes these filters to `useInfiniteFilteredMovies` and `useInfiniteFilteredTVShows`.
5.  These hooks then fetch the filtered data from the TMDB API and return it for rendering.

## `useFilterState` Hook

This hook is the "brain" of the filtering system. It manages a complex state object and provides memoized selectors and updater functions to the UI.

### State (`FilterState`)
```typescript
export interface FilterState {
  genreFilters: { [genreId: number]: 'include' | 'exclude' | null };
  minRating: number;
  maxRating: number;
  movieAgeRatings: string[];
  tvAgeRatings: string[];
  sortBy: 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc';
}
```

### Key Functions
- `updateGenreFilter(genreId)`: Cycles a genre through "include," "exclude," or "null" (off).
- `updateMinRating(rating)` / `updateMaxRating(rating)`: Set the rating range.
- `toggleMovieAgeRating(rating)` / `toggleTvAgeRating(rating)`: Adds or removes an age rating from the filter.
- `updateSortBy(sortBy)`: Changes the sorting order.
- `clearFilters()`: Resets all filters to their initial state.

## `useFilteredMovies` & `useFilteredTVShows`

These hooks are responsible for fetching the data. They are now implemented as infinite queries to support pagination and improve performance.

### Key Features
- **Infinite Scrolling**: They use `useInfiniteQuery` from React Query to automatically handle pagination.
- **Dynamic URL Construction**: A `buildDiscoverUrl` utility function constructs the complex TMDB API URL based on the provided filters.
- **Efficient Fetching**: They only refetch when the filter options change.
- **Separate Movie/TV Filters**: The hooks handle the different API parameters required for filtering movies versus TV shows (e.g., for certifications).

### Example: `useInfiniteFilteredMovies`
```typescript
export const useInfiniteFilteredMovies = (filters: FilterOptions, enabled: boolean) => {
  return useInfiniteQuery<ApiResponse<Movie>, Error>({
    queryKey: ['infiniteFilteredMovies', filters],
    queryFn: ({ pageParam = 1 }) => fetchFilteredMovies({ ...filters, page: pageParam as number }),
    getNextPageParam: (lastPage) => {
      if (lastPage.page < lastPage.total_pages) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    // ... other options
  });
};
```

## `useMovieCertifications` Hook

This hook fetches the official list of content certifications (e.g., "PG-13", "TV-MA") from TMDB for a specific country. This allows the UI to present the user with a list of valid age ratings to filter by. It also includes logic to handle the different ways TMDB applies certifications for movies versus TV shows.

This modular and hook-based architecture makes the advanced filtering feature powerful, maintainable, and performant.
