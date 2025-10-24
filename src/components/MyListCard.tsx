import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import { Movie } from '../types';
import { IMG_CDN_URL, MOVIE_BANNER, COLORS } from '../utils/constants';
import { redirectToStreamingService, pickBestStreamingOption, formatServiceName } from '../utils/streamingServices';
import { useProcessedWatchProviders } from '../hooks/useWatchProviders';

interface MyListCardProps {
  item: Movie;
  onPress?: (item: Movie) => void;
}

const MyListCard: React.FC<MyListCardProps> = ({ item, onPress }) => {
  // Get real streaming data using the hook (must be called before any early returns)
  const isMovie = item?.media_type === 'movie' || !!item?.title;
  const { streamProviders, hasProviders } = useProcessedWatchProviders(
    isMovie ? 'movie' : 'tv',
    item?.id || 0,
    !!item?.id // Only enable the query if we have a valid ID
  );

  // Defensive check for invalid items
  if (!item || !item.id) {
    return null;
  }

  const rating = item.vote_average?.toFixed(1);
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  
  // Pick the best streaming option from available providers
  const streamingOptions = streamProviders.map(provider => ({
    name: provider.provider_name,
    type: provider._streamType
  }));
  const bestStreamingOption = pickBestStreamingOption(streamingOptions);
  
  // Get service initial and color for the button
  const getServiceInitial = (serviceName: string) => {
    const initials: { [key: string]: string } = {
      'Netflix': 'N',
      'Amazon Prime Video': 'P',
      'Disney Plus': 'D',
      'HBO Max': 'H',
      'Hulu': 'H',
      'Apple TV Plus': 'A',
      'Paramount Plus': 'P',
      'Peacock': 'P',
      'Crunchyroll': 'C',
      'Funimation': 'F'
    };
    return initials[serviceName] || 'S';
  };

  const getServiceColor = (serviceName: string) => {
    const colors: { [key: string]: string } = {
      'Netflix': '#E50914',
      'Amazon Prime Video': '#00A8E1',
      'Disney Plus': '#0063E5',
      'HBO Max': '#5F2EEA',
      'Hulu': '#1CE783',
      'Apple TV Plus': '#000000',
      'Paramount Plus': '#0066CC',
      'Peacock': '#000000',
      'Crunchyroll': '#F47521',
      'Funimation': '#7B2CBF'
    };
    return colors[serviceName] || '#666666';
  };

  const serviceInitial = bestStreamingOption ? getServiceInitial(bestStreamingOption.name) : 'S';
  const serviceColor = bestStreamingOption ? getServiceColor(bestStreamingOption.name) : '#666666';
  const serviceName = bestStreamingOption ? formatServiceName(bestStreamingOption.name) : 'Streaming';

  const handlePress = () => {
    onPress?.(item);
  };

  const handleStreamingPress = () => {
    if (bestStreamingOption) {
      redirectToStreamingService(bestStreamingOption.name, item.title || item.name || '');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.card}>
        {/* Poster */}
        <View style={styles.posterContainer}>
          <ExpoImage
            source={item.poster_path ? `${IMG_CDN_URL}${item.poster_path}` : MOVIE_BANNER}
            style={styles.poster}
            placeholder={'L6PZfSi_.AyE_3ofx[a04_a_s;jP'}
            contentFit="cover"
            transition={300}
          />
          
          {/* Type Badge */}
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>{isMovie ? 'MOVIE' : 'TV'}</Text>
          </View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>
              {item.title || item.name}
            </Text>
          </View>

          <View style={styles.metadata}>
            <Text style={styles.metadataText}>
              {year && `${year} • `}
            </Text>
            {rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.imdbLogo}>IMDb</Text>
                <Text style={styles.rating}>{rating}</Text>
              </View>
            )}
          </View>

          {item.overview && (
            <Text style={styles.overview} numberOfLines={2}>
              {item.overview}
            </Text>
          )}

          {/* Streaming Service Button */}
          {hasProviders && bestStreamingOption && (
            <TouchableOpacity
              style={[styles.streamingButton, { backgroundColor: serviceColor }]}
              onPress={handleStreamingPress}
              activeOpacity={0.8}
            >
              <View style={styles.streamingButtonContent}>
                <View style={styles.streamingIconContainer}>
                  <Text style={styles.streamingIconText}>{serviceInitial}</Text>
                </View>
                <Text style={styles.streamingButtonText}>
                  Watch on {serviceName}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    height: 180,
  },
  posterContainer: {
    position: 'relative',
    width: 135,
    height: 180,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  typeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 5,
    paddingVertical: 3,
    borderRadius: 4,
  },
  typeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  header: {
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    lineHeight: 20,
  },
  metadata: {
    marginBottom: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metadataText: {
    fontSize: 12,
    color: 'white',
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
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  overview: {
    fontSize: 11,
    color: 'white',
    lineHeight: 14,
    marginBottom: 8,
  },
  streamingButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  streamingButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  streamingIconContainer: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
  },
  streamingIconText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  streamingButtonText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default MyListCard; 