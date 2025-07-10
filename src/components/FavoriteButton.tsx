import React, { useCallback, useMemo, useContext } from 'react';
import { TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import { RootState, Movie, FavoriteButtonProps } from '../types';
import { PreferencesContext } from '../navigation/AppNavigator';

const sizeMap = {
  '2xs': 18,
  'xs': 20,
  'sm': 24,
  'md': 28,
  'lg': 32,
  'xl': 36,
};

const FavoriteButton: React.FC<FavoriteButtonProps> = React.memo(({ media, size = 'sm' }) => {
  const { favorites, toggleFavorite } = useContext(PreferencesContext);
  const favorited = useMemo(() => favorites.some(item => item.id === media.id), [favorites, media.id]);
  const isLoading = useSelector((state: RootState) => state.preferences.isLoading);

  const iconSize = useMemo(() => sizeMap[size], [size]);
  
  const iconColor = useMemo(() => 
    favorited ? '#ef4444' : '#ffffff', 
    [favorited]
  );
  
  const iconName = useMemo(() => 
    favorited ? 'favorite' : 'favorite-border', 
    [favorited]
  );

  const handlePress = useCallback(() => {
    toggleFavorite(media);
  }, [toggleFavorite, media]);

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

FavoriteButton.displayName = 'FavoriteButton';

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

export default FavoriteButton; 