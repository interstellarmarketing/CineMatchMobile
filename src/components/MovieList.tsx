import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MovieCard from './MovieCard';
import MovieSkeleton from './MovieSkeleton';
import TVCard from './TVCard';
import { Movie, MovieListProps } from '../types';

interface MovieListWithLoadingProps extends MovieListProps {
  loading?: boolean;
}

const { width } = Dimensions.get('window');

const MovieList: React.FC<MovieListWithLoadingProps> = React.memo(({ title, movies, onMoviePress, loading }) => {
  if (loading) return <MovieSkeleton />;
  if (!movies || movies.length === 0) return null;

  const renderMedia = useCallback(({ item }: { item: Movie }) => {
    if (item.media_type === 'tv' || !!item.name) {
      // TV show
      return <TVCard show={item as any} onPress={onMoviePress} />;
    }
    // Movie
    return <MovieCard poster_path={item.poster_path} movie={item} onPress={onMoviePress} />;
  }, [onMoviePress]);

  const renderArrow = useCallback((direction: 'left' | 'right') => (
    <TouchableOpacity
      style={[
        styles.arrowButton,
        direction === 'left' ? styles.leftArrow : styles.rightArrow,
      ]}
      activeOpacity={0.7}
    >
      <Icon
        name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
        size={24}
        color="white"
      />
    </TouchableOpacity>
  ), []);

  const keyExtractor = useCallback((item: Movie) => item.id.toString(), []);

  const getItemLayout = useCallback((data: Movie[] | null, index: number) => ({
    length: 200,
    offset: 200 * index,
    index,
  }), []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      
      <View style={styles.listContainer}>
        {renderArrow('left')}
        
        <FlatList
          data={movies}
          renderItem={renderMedia}
          keyExtractor={keyExtractor}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          snapToInterval={200} // Adjust based on card width + margins
          decelerationRate="fast"
          bounces={false}
          // Performance optimizations
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          getItemLayout={getItemLayout}
          // Memory optimization
          updateCellsBatchingPeriod={50}
          disableVirtualization={false}
          // Smooth scrolling
          scrollEventThrottle={16}
        />
        
        {renderArrow('right')}
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 16,
  },
  listContainer: {
    position: 'relative',
  },
  listContent: {
    paddingHorizontal: 20,
  },
  arrowButton: {
    position: 'absolute',
    top: '50%',
    transform: [{ translateY: -20 }],
    width: 40,
    height: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftArrow: {
    left: 0,
  },
  rightArrow: {
    right: 0,
  },
});

export default MovieList; 