import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState, WatchlistButtonProps } from '../types';
import usePreferences from '../hooks/usePreferences';

const sizeMap = {
  'xs': 18,
  'sm': 24,
  'lg': 32,
};

const WatchlistButton: React.FC<WatchlistButtonProps> = React.memo(({ media, size = 'sm' }) => {
  const { watchlist, toggleWatchlist } = usePreferences();
  const inWatchlist = watchlist.some(item => item.id === media.id);
  const isLoading = useSelector((state: RootState) => state.preferences.isLoading);

  const iconSize = sizeMap[size];
  const iconColor = inWatchlist ? '#0ea5e9' : '#ffffff';
  const iconName = inWatchlist ? 'bookmark' : 'bookmark-add';

  return (
    <TouchableOpacity
      onPress={() => toggleWatchlist(media)}
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
  },
  icon: {
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default WatchlistButton; 