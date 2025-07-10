import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { IMG_CDN_URL, MOVIE_BANNER } from '../utils/constants';
import FavoriteButton from './FavoriteButton';
import WatchlistButton from './WatchlistButton';
import { Movie } from '../types';

const { width } = Dimensions.get('window');
const cardWidth = (width - 60) / 2; // 60 = padding + gaps

interface GeminiMovieCardProps {
  movie: Movie;
}

const GeminiMovieCard: React.FC<GeminiMovieCardProps> = ({ movie }) => {
  const isMovie = movie.media_type === 'movie' || !!movie.title;
  const rating = movie.vote_average?.toFixed(1);

  return (
    <View style={[styles.container, { width: cardWidth }]}>
      <Image
        source={{
          uri: movie.poster_path ? `${IMG_CDN_URL}${movie.poster_path}` : MOVIE_BANNER,
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      
      {/* Type Badge */}
      <View style={styles.typeBadge}>
        <Text style={styles.typeText}>{isMovie ? 'Movie' : 'TV'}</Text>
      </View>

      {/* Bottom Overlay with Rating and Watchlist */}
      <View style={styles.bottomOverlay}>
        <Text style={styles.ratingText}>⭐ {rating}</Text>
        <View style={styles.watchlistContainer}>
          <WatchlistButton media={movie} size="sm" />
        </View>
      </View>

      {/* Favorite Button */}
      <View style={styles.favoriteContainer}>
        <FavoriteButton media={movie} size="sm" />
      </View>

      {/* Title Overlay */}
      <View style={styles.titleOverlay}>
        <Text style={styles.titleText} numberOfLines={2}>
          {isMovie ? movie.title : movie.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    aspectRatio: 2/3,
    borderRadius: 12,
    overflow: 'hidden',
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  poster: {
    width: '100%',
    height: '100%',
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
  bottomOverlay: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingText: {
    color: '#fbbf24',
    fontSize: 10,
    fontWeight: 'bold',
  },
  watchlistContainer: {
    paddingRight: 0,
  },
  favoriteContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  titleOverlay: {
    position: 'absolute',
    bottom: 40,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
  },
  titleText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default GeminiMovieCard; 