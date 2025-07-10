import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { COLORS, IMG_CDN_URL, IMG_CDN_ORG_URL } from '../utils/constants';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useMovieTrailer } from '../hooks/useMovieTrailer';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import FavoriteButton from '../components/FavoriteButton';
import WatchlistButton from '../components/WatchlistButton';
import Icon from 'react-native-vector-icons/MaterialIcons';

const { width, height } = Dimensions.get('window');

import { RouteParams, MovieDetails } from '../types';

const MovieDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { movieId, movie } = route.params as RouteParams;
  
  const { movieDetails, loading: detailsLoading, error: detailsError } = useMovieDetails(movieId);
  const { trailer, loading: trailerLoading } = useMovieTrailer(movieId);

  const handleBack = () => {
    navigation.goBack();
  };

  const handlePlayTrailer = () => {
    if (trailer) {
      // TODO: Implement trailer playback functionality
      // For now, this is a placeholder for future implementation
    }
  };

  if (detailsLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading movie details..." />
      </SafeAreaView>
    );
  }

  if (detailsError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message={detailsError} />
      </SafeAreaView>
    );
  }

  if (!movieDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="Movie not found" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        {/* Backdrop Image */}
        <View style={styles.backdropContainer}>
          <Image
            source={{
              uri: movieDetails.backdrop_path 
                ? `${IMG_CDN_ORG_URL}${movieDetails.backdrop_path}`
                : `${IMG_CDN_URL}${movieDetails.poster_path}`
            }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <View style={styles.backdropOverlay} />
          
          {/* Back Button */}
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Icon name="arrow-back" size={24} color="white" />
          </TouchableOpacity>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <FavoriteButton media={movieDetails} size="lg" />
            <WatchlistButton media={movieDetails} size="lg" />
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title and Rating */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{movieDetails.title}</Text>
            <View style={styles.ratingContainer}>
              <Icon name="star" size={20} color="#fbbf24" />
              <Text style={styles.rating}>{movieDetails.vote_average.toFixed(1)}</Text>
            </View>
          </View>

          {/* Genres */}
          <View style={styles.genresContainer}>
            {movieDetails.genres.map((genre, index) => (
              <View key={genre.id} style={styles.genreTag}>
                <Text style={styles.genreText}>{genre.name}</Text>
              </View>
            ))}
          </View>

          {/* Play Trailer Button */}
          {trailer && (
            <TouchableOpacity style={styles.playButton} onPress={handlePlayTrailer}>
              <Icon name="play-arrow" size={24} color="white" />
              <Text style={styles.playButtonText}>Watch Trailer</Text>
            </TouchableOpacity>
          )}

          {/* Overview */}
          <View style={styles.overviewSection}>
            <Text style={styles.overviewTitle}>Overview</Text>
            <Text style={styles.overview}>{movieDetails.overview}</Text>
          </View>

          {/* Additional Info */}
          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Release Date:</Text>
              <Text style={styles.infoValue}>
                {movieDetails.release_date ? new Date(movieDetails.release_date).toLocaleDateString() : 'TBA'}
              </Text>
            </View>
            {movieDetails.runtime && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Runtime:</Text>
                <Text style={styles.infoValue}>{movieDetails.runtime} min</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status:</Text>
              <Text style={styles.infoValue}>{movieDetails.status}</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  backdropContainer: {
    height: height * 0.4,
    position: 'relative',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  actionButtons: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    gap: 12,
    zIndex: 10,
  },
  content: {
    padding: 20,
    marginTop: -40,
    backgroundColor: COLORS.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flex: 1,
  },
  titleSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    marginRight: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  rating: {
    color: '#fbbf24',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
    gap: 8,
  },
  genreTag: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignSelf: 'flex-start',
  },
  playButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  overviewSection: {
    marginBottom: 24,
  },
  overviewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  overview: {
    fontSize: 16,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  infoSection: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
  },
});

export default MovieDetailsScreen; 