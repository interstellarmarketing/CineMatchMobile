import React from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useProcessedWatchProviders } from '../hooks/useWatchProviders';
import StreamingProviderCard from './StreamingProviderCard';
import { COLORS } from '../utils/constants';

interface WhereToWatchSectionProps {
  mediaType: 'movie' | 'tv';
  mediaId: number;
  title: string;
  enabled?: boolean;
}

const WhereToWatchSection: React.FC<WhereToWatchSectionProps> = React.memo(({
  mediaType,
  mediaId,
  title,
  enabled = true
}) => {
  const {
    streamProviders,
    rentProviders,
    buyProviders,
    freeProviders,
    hasProviders,
    region,
    isLoading,
    error
  } = useProcessedWatchProviders(mediaType, mediaId, enabled);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WATCH NOW</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading streaming options...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WATCH NOW</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load streaming information</Text>
        </View>
      </View>
    );
  }

  if (!hasProviders) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>WATCH NOW</Text>
        <View style={styles.noProvidersContainer}>
          <Text style={styles.noProvidersEmoji}>🎭</Text>
          <Text style={styles.noProvidersText}>
            This title is not currently available on major streaming platforms
          </Text>
          <Text style={styles.noProvidersSubtext}>
            Check back later for updates
          </Text>
        </View>
      </View>
    );
  }

  const renderProviderRow = (providers: any[], label: string, type: 'stream' | 'rent' | 'buy' | 'free') => {
    if (!providers || providers.length === 0) return null;

    return (
      <View style={styles.providerRow}>
        <View style={styles.rowHeader}>
          <Text style={styles.rowLabel}>{label}</Text>
          <Text style={styles.providerCount}>{providers.length}</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.providersContainer}
        >
          {providers.map((provider) => (
            <StreamingProviderCard
              key={provider.provider_id + (provider._streamType || '')}
              provider={provider}
              title={title}
              type={type}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>WATCH NOW</Text>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {renderProviderRow(streamProviders, 'STREAM', 'stream')}
        {renderProviderRow(rentProviders, 'RENT', 'rent')}
        {renderProviderRow(buyProviders, 'BUY', 'buy')}
        {renderProviderRow(freeProviders, 'FREE', 'free')}
      </ScrollView>
    </View>
  );
});

WhereToWatchSection.displayName = 'WhereToWatchSection';

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
    marginTop: 8,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 14,
  },
  noProvidersContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  noProvidersEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  noProvidersText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 4,
  },
  noProvidersSubtext: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  contentContainer: {
    paddingBottom: 16,
  },
  providerRow: {
    marginBottom: 20,
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  providerCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  providersContainer: {
    paddingRight: 16,
  },
});

export default WhereToWatchSection; 