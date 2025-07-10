import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { IMG_CDN_URL, MOVIE_BANNER } from '../utils/constants';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';

const { width } = Dimensions.get('window');
const cardWidth = (width - 24) / 2;

import { Movie, MovieCardProps } from '../types';

// Memoized image component for better performance
const MovieImage = React.memo(({ imageUri, onError }: { imageUri: string; onError: () => void }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoadEnd = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    onError();
  }, [onError]);

  const imageSource = hasError ? MOVIE_BANNER : { uri: imageUri };

  return (
    <View style={styles.imageContainer}>
      <Image
        source={imageSource}
        style={styles.poster}
        resizeMode="cover"
        fadeDuration={150}
        onLoadEnd={handleLoadEnd}
        onError={handleError}
      />
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#ffffff" />
        </View>
      )}
    </View>
  );
});

MovieImage.displayName = 'MovieImage';

const MovieCard: React.FC<MovieCardProps> = React.memo(({ poster_path, movie, onPress }) => {
  const [imageError, setImageError] = useState(false);

  // Memoized calculations
  const year = useMemo(() => 
    (movie.release_date || movie.first_air_date)?.split('-')[0], 
    [movie.release_date, movie.first_air_date]
  );
  
  const rating = useMemo(() => 
    movie.vote_average?.toFixed(1), 
    [movie.vote_average]
  );
  
  const isMovie = useMemo(() => 
    movie.media_type === 'movie' || !!movie.title, 
    [movie.media_type, movie.title]
  );

  const imageUri = useMemo(() => {
    if (imageError || !poster_path) {
      return null;
    }
    return `${IMG_CDN_URL}${poster_path}`;
  }, [poster_path, imageError]);

  const handlePress = useCallback(() => {
    onPress?.(movie);
  }, [onPress, movie]);

  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {imageUri ? (
        <MovieImage imageUri={imageUri} onError={handleImageError} />
      ) : (
        <Image
          source={MOVIE_BANNER}
          style={styles.poster}
          resizeMode="cover"
        />
      )}
      
      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{isMovie ? 'Movie' : 'TV'}</Text>
      </View>

      {/* IMDb Badge */}
      <View style={styles.imdbBadge}>
        <Text style={styles.imdbText}>IMDb</Text>
        <Text style={styles.imdbRating}>{rating}</Text>
      </View>

      {/* Watchlist Button (bottom right) */}
      <View style={styles.watchlistContainer}>
        <WatchlistButton media={movie} size="sm" />
      </View>

      {/* Favorite Button (top right) */}
      <View style={styles.favoriteContainer}>
        <FavoriteButton media={movie} size="sm" />
      </View>
    </TouchableOpacity>
  );
});

MovieCard.displayName = 'MovieCard';

const styles = StyleSheet.create({
  container: {
    width: cardWidth,
    aspectRatio: 2/3,
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 2,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
    backgroundColor: '#181A20',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  imdbBadge: {
    position: 'absolute',
    left: 8,
    bottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5C518',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    zIndex: 2,
  },
  imdbText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 10,
    marginRight: 2,
  },
  imdbRating: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 10,
  },
  watchlistContainer: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    zIndex: 2,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 2,
  },
});

export default MovieCard; 