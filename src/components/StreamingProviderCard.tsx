import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { WatchProvider } from '../hooks/useWatchProviders';
import { redirectToStreamingService, openAppStore, isMajorStreamingService, getProviderPrice } from '../utils/streamingServices';
import { COLORS } from '../utils/constants';

interface StreamingProviderCardProps {
  provider: WatchProvider;
  title: string;
  type: 'stream' | 'rent' | 'buy' | 'free';
  onPress?: () => void;
}

const StreamingProviderCard: React.FC<StreamingProviderCardProps> = React.memo(({
  provider,
  title,
  type,
  onPress
}) => {
  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (isMajorStreamingService(provider.provider_name)) {
      await redirectToStreamingService(provider.provider_name, title);
    } else {
      // For other services, open a Google search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + provider.provider_name)}`;
      // Note: You'll need to import Linking from react-native and use it here
      // For now, we'll just redirect to the streaming service
      await redirectToStreamingService(provider.provider_name, title);
    }
  };

  const handleLongPress = async () => {
    // Long press to open app store
    await openAppStore(provider.provider_name);
  };

  const getTypeLabel = () => {
    if (type === 'stream') {
      return provider._streamType === 'ads' ? 'Ads' : 'Subs';
    }
    return getProviderPrice(provider, type);
  };

  const getTypeColor = () => {
    if (type === 'stream') {
      return provider._streamType === 'ads' ? COLORS.accent : COLORS.success;
    }
    return COLORS.primary;
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.logoContainer}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/original${provider.logo_path}` }}
          style={styles.logo}
          resizeMode="contain"
          onError={() => {
            // Handle image load error
            console.log('Error loading provider logo:', provider.provider_name);
          }}
        />
      </View>
      
      <Text style={[styles.typeLabel, { color: getTypeColor() }]}>
        {getTypeLabel()}
      </Text>
    </TouchableOpacity>
  );
});

StreamingProviderCard.displayName = 'StreamingProviderCard';

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 70,
    minHeight: 70,
    padding: 6,
  },
  logoContainer: {
    width: 50,
    height: 50,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  logo: {
    width: 40,
    height: 40,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default StreamingProviderCard; 