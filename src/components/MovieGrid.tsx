import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  Dimensions,
} from 'react-native';
import MovieCard from './MovieCard';

const { width } = Dimensions.get('window');
const numColumns = 2;
const cardWidth = (width - 60) / numColumns; // 60 = padding + gaps

interface Movie {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
  media_type?: string;
  poster_path?: string;
}

interface MovieGridProps {
  movies: Movie[];
  onMoviePress?: (movie: Movie) => void;
  numColumns?: number;
  showsVerticalScrollIndicator?: boolean;
}

const MovieGrid: React.FC<MovieGridProps> = ({
  movies,
  onMoviePress,
  numColumns: columns = 2,
  showsVerticalScrollIndicator = false,
}) => {
  const renderMovie = ({ item }: { item: Movie }) => (
    <View style={[styles.cardContainer, { width: cardWidth }]}>
      <MovieCard
        poster_path={item.poster_path}
        movie={item}
        onPress={() => onMoviePress?.(item)}
      />
    </View>
  );

  // Defensive filtering to prevent crashes from invalid data
  const validMovies = movies.filter(item => item && typeof item === 'object' && item.id);

  return (
    <FlatList
      data={validMovies}
      renderItem={renderMovie}
      keyExtractor={(item) => item.id.toString()}
      numColumns={columns}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={showsVerticalScrollIndicator}
      columnWrapperStyle={styles.row}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 20,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardContainer: {
    alignItems: 'center',
  },
});

export default MovieGrid; 