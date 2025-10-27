import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useMovieDetails } from '../hooks/useMovieDetails';
import { useTraktRatings } from '../hooks/useTraktRatings';
import { COLORS, IMG_CDN_URL } from '../utils/constants';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import ErrorMessage from '../components/ErrorMessage';
import WhereToWatchSection from '../components/WhereToWatchSection';
import TrailerSection from '../components/TrailerSection';
import Icon from 'react-native-vector-icons/MaterialIcons';
import usePreferences from '../hooks/usePreferences';

const MovieDetailsScreen = () => {
  const route = useRoute();
  const { movieId, mediaType = 'movie' } = route.params as { movieId: number; mediaType?: 'movie' | 'tv' };
  
  const { movieDetails, loading, error } = useMovieDetails(movieId, mediaType);
  const { data: traktRating, isLoading: isTraktLoading } = useTraktRatings(movieDetails?.id || 0, mediaType === 'movie');
  const { favorites, watchlist, toggleFavorite, toggleWatchlist } = usePreferences();

  const [showFullOverview, setShowFullOverview] = useState(false);

  if (loading) {
    return <ActivityIndicator size="large" color={COLORS.primary} style={styles.centered} />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  if (!movieDetails) {
    return <View />;
  }

  const {
    title,
    name,
    overview,
    backdrop_path,
    release_date,
    first_air_date,
    vote_average,
    vote_count,
    genres,
    runtime,
    status
  } = movieDetails;

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const displayTitle = title || name;
  const displayDate = release_date || first_air_date;
  const year = displayDate ? new Date(displayDate).getFullYear() : '';
  
  const isFavorited = favorites.some(item => item.id === movieDetails.id);
  const inWatchlist = watchlist.some(item => item.id === movieDetails.id);

  return (
    <ScrollView style={styles.container}>
      {/* Backdrop with Gradient Overlay */}
      <View style={styles.backdropContainer}>
        <Image
          style={styles.backdrop}
          source={backdrop_path ? `${IMG_CDN_URL}${backdrop_path}` : undefined}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.backdropGradient}
        />
        
        {/* Overlay Info on Backdrop */}
        <View style={styles.backdropOverlay}>
          {/* IMDb Rating and Metadata */}
          <View style={styles.metadataContainer}>
            {/* IMDb Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.imdbContainer}>
                <Text style={styles.imdbLogo}>IMDb</Text>
              </View>
              <Text style={styles.ratingText}>{(vote_average || 0).toFixed(1)}</Text>
              <Text style={styles.voteCount}>({vote_count?.toLocaleString() || 0})</Text>
            </View>

            {/* Trakt Rating */}
            {!isTraktLoading && traktRating && (
              <>
                <Text style={styles.separator}>•</Text>
                <View style={styles.ratingContainer}>
                  <View style={[styles.imdbContainer, styles.traktContainer]}>
                    <Text style={styles.imdbLogo}>TRAKT</Text>
                  </View>
                  <Text style={styles.ratingText}>{traktRating.rating.toFixed(1)}</Text>
                  <Text style={styles.voteCount}>({traktRating.votes.toLocaleString()})</Text>
                </View>
              </>
            )}
            
            <Text style={styles.separator}>•</Text>
            
            {/* Year and other metadata */}
            <Text style={styles.year}>{year}</Text>
            {runtime && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.runtime}>{formatRuntime(runtime)}</Text>
              </>
            )}
            {status && (
              <>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.status}>{status}</Text>
              </>
            )}
          </View>
        </View>
      </View>

      {/* Content Section */}
      <View style={styles.content}>
        {/* Details Section */}
        <View style={styles.details}>
          {/* Title */}
          <Text style={styles.title}>{displayTitle}</Text>
        </View>
      </View>

      {/* Overview Section */}
      <View style={styles.overviewContainer}>
        <Text style={styles.overview}>
          {showFullOverview ? overview : (overview || '').slice(0, 200)}
        </Text>
        {(overview || '').length > 200 && (
          <TouchableOpacity
            style={styles.readMoreButton}
            onPress={() => setShowFullOverview(!showFullOverview)}
          >
            <Text style={styles.readMoreButtonText}>
              {showFullOverview ? 'Read Less' : 'Read More'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Where to Watch Section */}
      <WhereToWatchSection
        mediaType={mediaType}
        mediaId={movieId}
        title={displayTitle || ''}
      />

      {/* Action Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.likeButton]} 
          onPress={() => toggleFavorite(movieDetails)}
        >
          <Icon 
            name={isFavorited ? 'favorite' : 'favorite-border'} 
            size={22} 
            color="#ef4444" 
          />
          <Text style={styles.buttonText}>{isFavorited ? 'Liked' : 'Like'}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.watchlistButton]} 
          onPress={() => toggleWatchlist(movieDetails)}
        >
          <Icon 
            name={inWatchlist ? 'bookmark' : 'bookmark-add'} 
            size={22} 
            color="#0ea5e9" 
          />
          <Text style={styles.buttonText}>{inWatchlist ? 'In Watchlist' : 'Watchlist'}</Text>
        </TouchableOpacity>
      </View>

      {/* Trailer Section */}
      <TrailerSection
        movieId={movieId}
        mediaType={mediaType}
        title={displayTitle || ''}
      />

      {/* Details Section */}
      <View style={styles.detailsSection}>
        {/* Genres */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>GENRES</Text>
          <Text style={styles.detailValue}>{genres.map(g => g.name).join(', ')}</Text>
        </View>

        {/* Runtime */}
        {runtime && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>RUNTIME</Text>
            <Text style={styles.detailValue}>{formatRuntime(runtime)}</Text>
          </View>
        )}

        {/* Age Rating */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>AGE RATING</Text>
          <Text style={styles.detailValue}>TV-MA</Text>
        </View>

        {/* Production Country */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>PRODUCTION COUNTRY</Text>
          <Text style={styles.detailValue}>United States</Text>
        </View>

        {/* Cast */}
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>CAST</Text>
          <Text style={styles.detailValue}>Eric Bana, Sam Neill, Rosemarie DeWitt, Lily Sa, Kyle Turner, Paul Souter, Jill Bodwin, Naya</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  backdropContainer: {
    position: 'relative',
    height: 250,
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 15,
    backgroundColor: COLORS.background,
  },
  details: {
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  imdbContainer: {
    backgroundColor: '#F5C518',
    padding: 2,
    borderRadius: 4,
  },
  traktContainer: {
    backgroundColor: '#ED1C24', // Trakt's brand color
  },
  imdbLogo: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  ratingText: {
    color: '#87CEEB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  voteCount: {
    color: '#87CEEB',
    fontSize: 14,
    fontWeight: 'bold',
  },
  metadataContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    flexWrap: 'wrap',
  },
  year: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  separator: {
    color: '#ffffff',
    fontSize: 16,
    marginHorizontal: 8,
  },
  runtime: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  status: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: COLORS.text,
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 0,
    lineHeight: 34,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
  },
  likeButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  watchlistButton: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    borderColor: 'rgba(14, 165, 233, 0.3)',
  },
  buttonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  genre: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  genreText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  overviewContainer: {
    padding: 15,
    paddingBottom: 0,
  },
  overview: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 24,
  },
  detailsSection: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 16,
  },
  ratingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingIcon: {
    color: '#FFD700',
    fontSize: 16,
  },
  backdropOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    justifyContent: 'flex-end',
  },
  readMoreButton: {
    backgroundColor: 'rgba(14, 165, 233, 0.1)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  readMoreButtonText: {
    color: '#0ea5e9',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MovieDetailsScreen; 