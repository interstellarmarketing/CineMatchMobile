# Trakt API Integration Strategy

This document outlines the current and future strategy for integrating Trakt.tv's rich community data into the CineMatch app to enhance content discovery and provide users with deeper insights.

## Currently Useful Endpoints (Phase 1 & 2 Implementation)

These endpoints are our immediate focus for enriching the app's content.

### 1. Item Statistics

-   **Endpoints**: `/movies/{id}/stats`, `/shows/{id}/stats`
-   **Description**: Provides detailed statistics for a specific movie or show.
-   **Data Points**:
    -   `watchers`: Total number of unique users who have watched the item.
    -   `plays`: Total number of times the item has been played.
    -   `collectors`: Number of users who have the item in their collection.
    -   `comments`: Number of comments.
    -   `lists`: Number of lists the item appears on.
    -   `votes`: Total number of votes in the rating.
-   **Use Case**: Enhance the `MovieDetailsScreen` by displaying these stats. This provides a richer, multi-faceted view of an item's popularity beyond a single rating score.

### 2. Item Ratings

-   **Endpoints**: `/movies/{id}/ratings`, `/shows/{id}/ratings`
-   **Description**: Provides the Trakt community rating (from 0 to 10) and the vote distribution.
-   **Use Case**: Display the Trakt rating alongside the TMDB/IMDb rating on the `MovieDetailsScreen` to offer users an alternative, community-driven score. *(This has already been implemented for movies as a proof-of-concept).*

### 3. Trending Lists

-   **Endpoints**: `/movies/trending`, `/shows/trending`
-   **Description**: Returns a list of movies or shows that are being watched the most *right now*. Results are updated every few hours.
-   **Use Case**: Create a "Trending on Trakt" list on the `BrowseScreen`. This provides a dynamic, real-time view of what is currently popular in the movie enthusiast community.

### 4. Popular Lists

-   **Endpoints**: `/movies/popular`, `/shows/popular`
-   **Description**: Returns a filtered list of the most popular movies or shows, calculated using a combination of ratings, votes, and watch counts.
-   **Use Case**: Create a "Popular on Trakt" list on the `BrowseScreen` to showcase consistently high-rated and frequently watched content.

## Potentially Useful Future Endpoints (Phase 3 and Beyond)

These endpoints offer opportunities for significant feature enhancements in future versions of the app.

### 1. Anticipated Lists

-   **Endpoints**: `/movies/anticipated`, `/shows/anticipated`
-   **Description**: Provides a list of upcoming movies and shows, ordered by how many users have added them to their watchlists.
-   **Use Case**: Create a "Most Anticipated" section to build hype for upcoming releases.

### 2. Box Office Hits

-   **Endpoint**: `/movies/boxoffice`
-   **Description**: Returns the top 10 grossing movies from the U.S. box office for the most recent weekend.
-   **Use Case**: Add a "Top at the Box Office" list to highlight what's currently popular in theaters, providing real-world context.

### 3. Related Items

-   **Endpoints**: `/movies/{id}/related`, `/shows/{id}/related`
-   **Description**: Returns a list of similar or related movies/shows.
-   **Use Case**: Implement a "More Like This" or "You Might Also Like" section on the `MovieDetailsScreen` to improve content discovery and keep users engaged.

### 4. Most Played/Watched Lists

-   **Endpoints**: `/movies/played/{period}`, `/shows/watched/{period}`
-   **Description**: Returns the most played or watched items over a specific period (`daily`, `weekly`, `monthly`, `all`).
-   **Use Case**: Create dynamic lists such as "Most Watched This Week" to showcase sustained popularity over a longer period than the `trending` list.
