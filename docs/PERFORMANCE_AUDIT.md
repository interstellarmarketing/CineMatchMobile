# Performance Audit & Optimization Summary

This document summarizes the results of a performance audit conducted on the CineMatch Mobile application. It details the identified bottlenecks and the fixes implemented to resolve them.

### 1. Navigation Lag & Screen Freezing

*   **Problem:** A severe 2-3 second freeze was observed when switching between tabs in the main navigator.
*   **Root Cause:** The Tab Navigator was configured with `unmountOnBlur: true`, which caused entire screens to be destroyed and rebuilt from scratch on every tab switch. This is a costly operation involving component re-mounting, state re-initialization, and data re-fetching.
*   **Solution:** The `unmountOnBlur: true` option was removed. Screens are now kept in memory after their initial load, resulting in instantaneous tab switching.

### 2. Post-Interaction Slowdown (Re-render Storm)

*   **Problem:** After adding an item to the favorites or watchlist, the application would become extremely sluggish, with navigation latency ballooning to 10+ seconds.
*   **Root Cause:** This was caused by a "re-render storm." Inefficient Redux reducers were creating new arrays for the entire `favorites` list on every change. Components like `FavoriteButton` were subscribed to this entire array, causing every instance of the button to re-render simultaneously when any single item was changed.
*   **Solution:**
    1.  **Optimized Reducers:** The Redux reducers in `preferencesSlice` were refactored to use Immer's mutation capabilities (`findIndex` and `splice`), preventing the creation of new array references on minor changes.
    2.  **Memoized Selectors:** Memoized selectors (`selectIsFavoriteById`) were created to allow components to subscribe to the state of a *single item* rather than the entire list.
    3.  **Component Refactoring:** `FavoriteButton` and `WatchlistButton` were updated to use these new, highly-efficient selectors, ensuring they only re-render when their own state changes.

### 3. Inefficient Firestore Writes and UI Blocking (Refactored)

*   **Problem:** Despite previous optimizations, significant UI lag and screen freezes (2-10 seconds) still occurred, particularly after adding/removing items from the Watchlist or Favorites. The app felt unresponsive.
*   **Root Cause Investigation:** A deeper analysis revealed that the core issue was architectural. The application was triggering an asynchronous Firestore write operation (`updateDoc`) directly from the UI thread for *every single button tap*. Even though `arrayUnion` and `arrayRemove` are efficient on the backend, the client-side cost of initiating a network request and handling the promise resolution on the main JS thread was high enough to block rendering and cause severe jank.
*   **Solution: Architectural Refactor to a Debounced, Centralized Model**
    1.  **Optimistic UI:** The `preferencesSlice` was stripped of all `createAsyncThunk` logic. Reducers are now purely synchronous, updating the in-memory Redux state instantly for immediate user feedback.
    2.  **Centralized `usePreferences` Hook:** All preference management logic was consolidated into a new `usePreferences` hook. This hook is the single source of truth for interacting with user preferences.
    3.  **Debounced Batch Syncing:** The `usePreferences` hook listens for any change to the `favorites` or `watchlist` state. It then uses `lodash.debounce` to wait for a 2-second period of inactivity before sending all accumulated changes to Firestore in a single, batched write operation.
    4.  **Context API:** The `usePreferences` hook provides its state and methods (like `toggleFavorite`) to the entire app via `PreferencesContext`. UI components like `FavoriteButton` now simply call a synchronous function from this context, completely decoupling them from the persistence logic.

This new architecture eliminates UI thread blocking from database operations, drastically reduces the number of writes to Firestore, and aligns the mobile app with the proven, performant architecture of the web application.

### 4. `MyLists` Screen Crash & Permissions Errors

*   **Problem:** The `MyLists` screen would crash with a `TypeError`, and "Missing or insufficient permissions" warnings would appear in the logs.
*   **Root Cause:** The `FirestoreService` was attempting to write to the wrong collection (`users` instead of `userPreferences`), causing the writes to fail. This led to data inconsistencies between the local Redux state and the backend, which ultimately crashed the list rendering component.
*   **Solution:**
    1.  The paths in `FirestoreService` were corrected to point to the `userPreferences` collection for all operations.
    2.  A defensive filter was added to the `MovieGrid` component to prevent it from crashing in the event of malformed data.

**Conclusion:**

These fixes have resolved the critical performance bottlenecks, resulting in a more responsive, stable, and user-friendly application. 