import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const SKELETON_COUNT = 5;

const MovieSkeleton = () => {
  return (
    <View style={styles.row} testID="skeleton-row">
      {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
        <View key={i} style={styles.skeletonCard} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  skeletonCard: {
    width: 100,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#222',
    marginRight: 12,
    opacity: 0.5,
  },
});

export default MovieSkeleton; 