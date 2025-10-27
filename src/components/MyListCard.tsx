import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Image as ExpoImage } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Movie } from '../types';
import { IMG_CDN_URL, MOVIE_BANNER } from '../utils/constants';
import { redirectToStreamingService, pickBestStreamingOption } from '../utils/streamingServices';
import { useProcessedWatchProviders } from '../hooks/useWatchProviders';
import { useTitleMiniDetails } from '../hooks/useTitleMiniDetails';

interface MyListCardProps {
  item: Movie;
  onPress?: (item: Movie) => void;
  // Which tab is rendering this card; controls the top-right status icon
  context?: 'watchlist' | 'likes';
}

const MyListCard: React.FC<MyListCardProps> = ({ item, onPress, context }) => {
  // Get real streaming data using the hook (must be called before any early returns)
  const isMovie = item?.media_type === 'movie' || !!item?.title;
  const { streamProviders, rentProviders, buyProviders, freeProviders, totalProviders } = useProcessedWatchProviders(
    isMovie ? 'movie' : 'tv',
    item?.id || 0,
    !!item?.id // Only enable the query if we have a valid ID
  );

  // Mini details (runtime/seasons/overview/year) to fill gaps when list items are sparse
  const { runtimeMinutes, seasons, overview: fetchedOverview, year: fetchedYear, voteAverage, releaseDate } = useTitleMiniDetails(
    isMovie ? 'movie' : 'tv',
    item?.id || 0,
    !!item?.id
  );

  // Defensive check for invalid items
  if (!item || !item.id) {
    return null;
  }

  const baseVote = item.vote_average ?? voteAverage ?? 0;
  const rating = baseVote ? baseVote.toFixed(1) : undefined;
  const year = (item.release_date || item.first_air_date || fetchedYear || '').slice(0, 4);
  const userScorePct = Math.round((baseVote || 0) * 10);
  
  // Pick the best streaming option from available providers
  const streamingOptions = streamProviders.map(provider => ({
    name: provider.provider_name,
    type: provider._streamType
  }));
  const bestStreamingOption = pickBestStreamingOption(streamingOptions);
  // Match provider object to get logo
  const bestProviderObj = bestStreamingOption
    ? streamProviders.find(p => p.provider_name === bestStreamingOption.name)
    : undefined;
  const providerLogo = bestProviderObj?.logo_path
    ? `https://image.tmdb.org/t/p/w45${bestProviderObj.logo_path}`
    : undefined;
  
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
  const serviceColor = bestStreamingOption ? getServiceColor(bestStreamingOption.name) : '#3A3A3A';

  const handlePress = () => {
    onPress?.(item);
  };

  // Button strategy
  const hasStream = streamProviders.length > 0;
  const rentBuyOffers = (rentProviders?.length || 0) + (buyProviders?.length || 0);
  const hasAnyProviders = (totalProviders ?? (streamProviders.length + rentProviders.length + buyProviders.length + freeProviders.length)) > 0;
  const releaseDateStr = (item.release_date || item.first_air_date || releaseDate || '') as string;
  const inTheaters = !hasAnyProviders && isWithinDays(releaseDateStr, 60);

  let buttonLabel = 'SEARCH TO WATCH';
  let buttonBg = serviceColor;
  let showLogo = false;
  let onButtonPress: () => void = () => openGoogleSearch(item.title || item.name || '');

  if (hasStream && bestStreamingOption) {
    buttonLabel = 'WATCH NOW';
    buttonBg = serviceColor;
    showLogo = !!providerLogo;
    onButtonPress = () => redirectToStreamingService(bestStreamingOption.name, item.title || item.name || '');
  } else if (rentBuyOffers > 0) {
    buttonLabel = `${rentBuyOffers} OFFERS AVAILABLE`;
    buttonBg = '#3A3A3A';
    showLogo = false; // per your note, no logo for rent/buy-only
    const offerOptions: Array<{ name: string; type?: string }> = [...rentProviders, ...buyProviders].map(p => ({ name: p.provider_name }));
    const bestOffer = pickBestStreamingOption(offerOptions);
    if (bestOffer) {
      onButtonPress = () => redirectToStreamingService(bestOffer.name, item.title || item.name || '');
    }
  } else if (inTheaters) {
    buttonLabel = 'IN THEATERS';
    buttonBg = '#3A3A3A';
    showLogo = false;
    onButtonPress = () => openGoogleSearch(`${item.title || item.name || ''} showtimes`);
  }

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <View style={styles.card}>
        {/* Top-right status icon (watchlist/likes) */}
        {context && (
          <View style={styles.statusIconContainer}>
            {context === 'watchlist' ? (
              <Icon name="check-circle" size={22} color="#9CA3AF" />
            ) : (
              <Icon name="favorite" size={20} color="#9CA3AF" />
            )}
          </View>
        )}
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
            {!!year && <Text style={styles.metadataText}>{year}</Text>}
            {rating && (
              <View style={styles.ratingContainer}>
                <Text style={styles.imdbLogo}>TMDB</Text>
                <Text style={styles.rating}>{rating}</Text>
              </View>
            )}
            <View style={styles.userScoreContainer}>
              <Icon name="local-activity" size={12} color="#FBBF24" />
              <Text style={styles.userScoreText}> {userScorePct}%</Text>
            </View>
            {isMovie && runtimeMinutes ? (
              <Text style={styles.metadataText}> | {formatRuntime(runtimeMinutes)}</Text>
            ) : !isMovie && seasons ? (
              <Text style={styles.metadataText}> | {seasons} {seasons === 1 ? 'Season' : 'Seasons'}</Text>
            ) : null}
          </View>

          {(item.overview || fetchedOverview) && (
            <Text style={styles.overview} numberOfLines={3}>
              {item.overview || fetchedOverview}
            </Text>
          )}

          {/* Action Button - always visible with appropriate label */}
          <TouchableOpacity
            style={[styles.streamingButton, { backgroundColor: buttonBg }]}
            onPress={onButtonPress}
            activeOpacity={0.8}
          >
            <View style={styles.streamingButtonContent}>
              {showLogo && (
                <View style={styles.streamingIconContainer}>
                  {providerLogo ? (
                    <ExpoImage source={providerLogo} style={styles.providerLogo} contentFit="contain" />
                  ) : (
                    <Text style={styles.streamingIconText}>{serviceInitial}</Text>
                  )}
                </View>
              )}
              <Text style={styles.streamingButtonText}>
                {buttonLabel}
              </Text>
            </View>
          </TouchableOpacity>
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
  statusIconContainer: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
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
    flexWrap: 'wrap',
  },
  metadataText: {
    fontSize: 12,
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  imdbLogo: {
    backgroundColor: '#01B4E4',
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
  userScoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  userScoreText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
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
  providerLogo: {
    width: 18,
    height: 18,
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

// Helpers
function formatRuntime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}h ${minutes}min`;
  }
  return `${minutes}min`;
}

function isWithinDays(dateStr: string, days: number): boolean {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return false;
  const diff = Date.now() - d.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  return diff >= 0 && diff <= days * dayMs;
}

function openGoogleSearch(query: string) {
  if (!query) return;
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  Linking.openURL(url);
}