import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { IMG_CDN_URL, MOVIE_BANNER, COLORS } from '../utils/constants';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';
import { Movie } from '../types';

const { width: screenWidth } = Dimensions.get('window');

interface GeminiMovieCardProps {
  movie: Movie;
}

const GeminiMovieCard: React.FC<GeminiMovieCardProps> = ({ movie }) => {
  const isMovie = movie.media_type === 'movie' || !!movie.title;
  const imageSource = movie.poster_path ? `${IMG_CDN_URL}${movie.poster_path}` : MOVIE_BANNER;
  
  const cardStyle = useMemo(() => ({
    width: (screenWidth - 48) / 2, // Calculate for 2-column grid (48 = 16px padding * 2 + 16px gap)
    marginBottom: 2, // Reduced bottom margin for tighter spacing
  }), []);

  return (
    <View style={[styles.container, cardStyle]}>
      <Image
        style={styles.poster}
        source={imageSource}
        placeholder={'L6PZfSi_.AyE_3ofx[a04_a_s;jP'}
        contentFit="cover"
        transition={300}
      />
      <View style={styles.favoriteContainer}>
        <FavoriteButton media={movie} size="xs" />
      </View>
      <View style={styles.badgeContainer}>
        <Text style={styles.badgeText}>
          {isMovie ? 'MOVIE' : 'TV'}
        </Text>
      </View>
      
      {/* Bottom gradient overlay */}
      <LinearGradient
        colors={['transparent', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.9)']}
        style={styles.gradientOverlay}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        <View style={styles.overlayContent}>
          <View style={styles.ratingContainer}>
            <Text style={styles.imdbLogo}>IMDb</Text>
            <Text style={styles.rating}>{(movie.vote_average || 0).toFixed(1)}</Text>
          </View>
          <View style={styles.watchlistContainer}>
            <WatchlistButton media={movie} size="xs" />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    aspectRatio: 2 / 3,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'flex-end',
    paddingHorizontal: 6,
    paddingBottom: 4,
  },
  overlayContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imdbLogo: {
    backgroundColor: '#F5C518',
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
    marginRight: 3,
  },
  rating: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  watchlistContainer: {
    // Positioned at bottom right via parent flexbox
    marginBottom: -7,
    marginRight: -2,
  },
});

export default GeminiMovieCard; 