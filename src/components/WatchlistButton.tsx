import React, { useCallback, useMemo, useContext } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState, Movie, WatchlistButtonProps } from '../types';
import { PreferencesContext } from '../navigation/AppNavigator';

const sizeMap = {
  '2xs': 18,
  'xs': 20,
  'sm': 24,
  'md': 28,
  'lg': 32,
  'xl': 36,
};

const WatchlistButton: React.FC<WatchlistButtonProps> = React.memo(({ media, size = 'sm' }) => {
  const { watchlist, toggleWatchlist } = useContext(PreferencesContext);
  const inWatchlist = useMemo(() => watchlist.some(item => item.id === media.id), [watchlist, media.id]);
  const isLoading = useSelector((state: RootState) => state.preferences.isLoading);

  const iconSize = useMemo(() => sizeMap[size], [size]);
  
  const iconColor = useMemo(() => 
    inWatchlist ? '#0ea5e9' : '#ffffff', 
    [inWatchlist]
  );
  
  const iconName = useMemo(() => 
    inWatchlist ? 'bookmark' : 'bookmark-add', 
    [inWatchlist]
  );

  const handlePress = useCallback(() => {
    toggleWatchlist(media);
  }, [toggleWatchlist, media]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      style={styles.button}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : (
        <Icon
          name={iconName}
          size={iconSize}
          color={iconColor}
          style={styles.icon}
        />
      )}
    </TouchableOpacity>
  );
});

WatchlistButton.displayName = 'WatchlistButton';

const styles = StyleSheet.create({
  button: {
    padding: 4,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default WatchlistButton; 