import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
} from 'react-native';
import { COLORS } from '../utils/constants';
import { useStreamingCharts, STREAMING_PROVIDERS, StreamingChartMovie } from '../hooks/useStreamingCharts';
import LoadingSpinner from './LoadingSpinner';

const { width: screenWidth } = Dimensions.get('window');

interface StreamingChartsProps {
  onMoviePress?: (movie: StreamingChartMovie) => void;
}

const StreamingCharts: React.FC<StreamingChartsProps> = ({ onMoviePress }) => {
  const [selectedProvider, setSelectedProvider] = useState(STREAMING_PROVIDERS.NETFLIX);
  const { movies, loading, error } = useStreamingCharts(selectedProvider);

  const getProviderName = (providerId: number) => {
    switch (providerId) {
      case STREAMING_PROVIDERS.NETFLIX:
        return 'NETFLIX';
      case STREAMING_PROVIDERS.PRIME_VIDEO:
        return 'PRIME VIDEO';
      case STREAMING_PROVIDERS.DISNEY_PLUS:
        return 'DISNEY+';
      case STREAMING_PROVIDERS.HULU:
        return 'HULU';
      case STREAMING_PROVIDERS.HBO_MAX:
        return 'HBO MAX';
      default:
        return 'STREAMING';
    }
  };

  const renderTrendIcon = (trendDirection: 'up' | 'down' | 'stable') => {
    if (trendDirection === 'up') {
      return <Text style={styles.trendIcon}>↗</Text>;
    } else if (trendDirection === 'down') {
      return <Text style={[styles.trendIcon, styles.trendIconDown]}>↘</Text>;
    }
    return null;
  };

  const renderMovieCard = (movie: StreamingChartMovie) => (
    <TouchableOpacity
      key={movie.id}
      style={styles.movieCard}
      onPress={() => onMoviePress?.(movie)}
      activeOpacity={0.7}
    >
      <View style={styles.rankContainer}>
        <Text style={styles.rankText}>{movie.rank}</Text>
      </View>
      
      {/* Media type indicator */}
      <View style={styles.mediaTypeContainer}>
        <Text style={styles.mediaTypeText}>
          {movie.media_type === 'tv' ? 'TV' : 'MOVIE'}
        </Text>
      </View>
      
      <Image
        source={{
          uri: movie.poster_path
            ? `https://image.tmdb.org/t/p/w200${movie.poster_path}`
            : 'https://via.placeholder.com/120x180/333/666?text=No+Image'
        }}
        style={styles.poster}
        resizeMode="cover"
      />
      
      <View style={styles.movieInfo}>
        <Text style={styles.movieTitle} numberOfLines={2}>
          {movie.title || movie.name}
        </Text>
        <View style={styles.trendContainer}>
          {renderTrendIcon(movie.trend_direction || 'stable')}
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No trending content</Text>
      <Text style={styles.emptySubtitle}>
        No trending movies are currently available on {getProviderName(selectedProvider)}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load streaming charts</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.JW_TOP_BG} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Today&apos;s streaming charts</Text>
      </View>

      {/* Provider Filter */}
      <View style={styles.providerFilter}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providerScrollContent}
        >
          {Object.entries(STREAMING_PROVIDERS).slice(0, 5).map(([key, providerId]) => (
            <TouchableOpacity
              key={key}
              style={[
                styles.providerPill,
                selectedProvider === providerId && styles.providerPillActive
              ]}
              onPress={() => setSelectedProvider(providerId)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.providerText,
                selectedProvider === providerId && styles.providerTextActive
              ]}>
                {getProviderName(providerId)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Movies Grid */}
      <ScrollView 
        style={styles.moviesContainer} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.moviesContent}
      >
        {movies.length > 0 ? (
          <View style={styles.moviesGrid}>
            {movies.map((movie, index) => renderMovieCard(movie, index))}
          </View>
        ) : (
          renderEmptyState()
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.JW_TOP_BG,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.JW_TOP_BG,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.JW_TEXT_HIGH,
    textAlign: 'center',
  },
  providerFilter: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  providerScrollContent: {
    paddingRight: 20,
  },
  providerPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.JW_PILL_STRIP,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    alignItems: 'center',
  },
  providerPillActive: {
    backgroundColor: COLORS.JW_PILL_ACTIVE,
    borderColor: COLORS.accent,
  },
  providerText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.JW_TEXT_MEDIUM,
  },
  providerTextActive: {
    color: COLORS.JW_TEXT_HIGH,
  },
  moviesContainer: {
    flex: 1,
  },
  moviesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  moviesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  movieCard: {
    width: (screenWidth - 60) / 2,
    marginBottom: 20,
    backgroundColor: COLORS.JW_BOTTOM_BG,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  rankContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.accent,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  rankText: {
    color: COLORS.JW_TEXT_HIGH,
    fontSize: 12,
    fontWeight: 'bold',
  },
  poster: {
    width: '100%',
    height: 180,
  },
  movieInfo: {
    padding: 12,
  },
  movieTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.JW_TEXT_HIGH,
    marginBottom: 4,
    lineHeight: 18,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendIcon: {
    fontSize: 16,
    color: COLORS.success,
    fontWeight: 'bold',
  },
  trendIconDown: {
    color: COLORS.error,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.JW_TOP_BG,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.JW_TOP_BG,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.JW_TEXT_HIGH,
    marginBottom: 10,
  },
  emptySubtitle: {
    color: COLORS.JW_TEXT_MEDIUM,
    fontSize: 16,
    textAlign: 'center',
  },
  mediaTypeContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 12,
    backgroundColor: COLORS.accent,
    zIndex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  mediaTypeText: {
    color: COLORS.JW_TEXT_HIGH,
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default StreamingCharts; 