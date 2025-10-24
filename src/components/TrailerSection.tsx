import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useTrailers } from '../hooks/useTrailers';
import { COLORS } from '../utils/constants';

interface TrailerSectionProps {
  movieId: number;
  mediaType: 'movie' | 'tv';
  title: string;
}

const TrailerSection: React.FC<TrailerSectionProps> = React.memo(({
  movieId,
  mediaType,
  title
}) => {
  const { trailers, bestTrailer, loading, error, hasTrailers } = useTrailers(movieId, mediaType);

  const handleTrailerPress = async () => {
    if (bestTrailer) {
      const youtubeUrl = `https://www.youtube.com/watch?v=${bestTrailer.key}`;
      try {
        await Linking.openURL(youtubeUrl);
      } catch (error) {
        console.error('Error opening trailer:', error);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TRAILER</Text>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading trailer...</Text>
        </View>
      </View>
    );
  }

  if (error || !hasTrailers) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>TRAILER</Text>
        <View style={styles.noTrailerContainer}>
          <Text style={styles.noTrailerText}>No trailer available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>TRAILER</Text>
      
      <TouchableOpacity
        style={styles.trailerCard}
        onPress={handleTrailerPress}
        activeOpacity={0.8}
      >
        <View style={styles.thumbnailContainer}>
          <Image
            source={{ uri: `https://img.youtube.com/vi/${bestTrailer.key}/hqdefault.jpg` }}
            style={styles.thumbnail}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.7)']}
            style={styles.playButtonOverlay}
          >
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
          </LinearGradient>
        </View>
        
        <View style={styles.trailerInfo}>
          <Text style={styles.trailerTitle}>{bestTrailer.name}</Text>
          <Text style={styles.trailerType}>
            {bestTrailer.official ? 'Official Trailer' : 'Trailer'}
            {trailers.length > 1 && ` • ${trailers.length} trailers available`}
          </Text>
          <Text style={styles.tapToWatch}>Tap to watch on YouTube</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
});

TrailerSection.displayName = 'TrailerSection';

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.accent,
    marginBottom: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  noTrailerContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noTrailerText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  trailerCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    position: 'relative',
    height: 180,
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  playButtonOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  playIcon: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  trailerInfo: {
    padding: 16,
  },
  trailerTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  trailerType: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 8,
  },
  tapToWatch: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '500',
  },
});

export default TrailerSection; 