import React from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState, FavoriteButtonProps } from '../types';
import usePreferences from '../hooks/usePreferences';

const sizeMap = {
  'xs': 18,
  'sm': 24,
  'lg': 32,
};

const FavoriteButton: React.FC<FavoriteButtonProps> = React.memo(({ media, size = 'sm' }) => {
  const { favorites, toggleFavorite } = usePreferences();
  const isFavorited = favorites.some(item => item.id === media.id);
  const isLoading = useSelector((state: RootState) => state.preferences.isLoading);

  const iconSize = sizeMap[size];
  const iconColor = isFavorited ? '#ef4444' : '#ffffff';
  const iconName = isFavorited ? 'favorite' : 'favorite-border';

  return (
    <TouchableOpacity
      onPress={() => toggleFavorite(media)}
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

FavoriteButton.displayName = 'FavoriteButton';

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

export default FavoriteButton; 