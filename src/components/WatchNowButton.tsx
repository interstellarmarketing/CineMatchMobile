import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { redirectToStreamingService, pickBestStreamingOption, getServiceIcon, formatServiceName } from '../utils/streamingServices';
import { COLORS } from '../utils/constants';

interface WatchNowButtonProps {
  streamingOptions?: Array<{ name: string; type?: string }>;
  title: string;
  onPress?: () => void;
  style?: any;
}

const WatchNowButton: React.FC<WatchNowButtonProps> = React.memo(({
  streamingOptions = [],
  title,
  onPress,
  style
}) => {
  const bestOption = pickBestStreamingOption(streamingOptions);
  const serviceIcon = bestOption ? getServiceIcon(bestOption.name) : null;
  const serviceName = bestOption ? formatServiceName(bestOption.name) : null;

  const handlePress = async () => {
    if (onPress) {
      onPress();
      return;
    }

    if (bestOption) {
      await redirectToStreamingService(bestOption.name, title);
    }
  };

  if (!bestOption) {
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.button, style]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <View style={styles.content}>
        {serviceIcon && (
          <Text style={styles.icon}>{serviceIcon}</Text>
        )}
        <Text style={styles.text}>WATCH NOW</Text>
        {serviceName && (
          <Text style={styles.serviceName}>({serviceName})</Text>
        )}
      </View>
    </TouchableOpacity>
  );
});

WatchNowButton.displayName = 'WatchNowButton';

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 6,
  },
  text: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  serviceName: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    marginLeft: 4,
  },
});

export default WatchNowButton; 