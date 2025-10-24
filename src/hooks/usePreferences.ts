import { useCallback } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { toggleFavorite as toggleFavoriteAction, toggleWatchlist as toggleWatchlistAction } from '../utils/slices/preferencesSlice';
import { RootState, Movie } from '../types';

const usePreferences = () => {
  const dispatch = useDispatch();
  const { favorites, watchlist } = useSelector((state: RootState) => state.preferences, shallowEqual);

  const toggleFavorite = useCallback((movie: Movie) => {
    dispatch(toggleFavoriteAction(movie));
  }, [dispatch]);

  const toggleWatchlist = useCallback((movie: Movie) => {
    dispatch(toggleWatchlistAction(movie));
  }, [dispatch]);

  return { favorites, watchlist, toggleFavorite, toggleWatchlist };
};

export default usePreferences; 