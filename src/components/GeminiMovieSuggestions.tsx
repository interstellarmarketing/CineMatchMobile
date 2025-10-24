import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { RootState, Movie } from '../types';
import GeminiMovieCard from './GeminiMovieCard';
import { COLORS } from '../utils/constants';

const GeminiMovieSuggestions = () => {
  const navigation = useNavigation();
  const { searchResultMoviesNames, searchResultMovies } = useSelector(
    (state: RootState) => state.gemini
  );

  if (!searchResultMoviesNames || !Array.isArray(searchResultMovies)) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          Enter a search query to get AI-powered movie recommendations
        </Text>
      </View>
    );
  }

  const filteredMovies = searchResultMovies.filter((movie) => !!movie);



  const handleMoviePress = (movie: Movie) => {
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      mediaType 
    } as never);
  };

  const renderMovie = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.movieContainer}
      onPress={() => handleMoviePress(item)}
      activeOpacity={0.8}
    >
      <GeminiMovieCard movie={item} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.resultsText}>
          Found {filteredMovies.length} results
        </Text>
      </View>
      
      <FlatList
        data={filteredMovies}
        renderItem={renderMovie}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No movies found for your search. Try a different query.
            </Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 20,
  },
  resultsText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  movieContainer: {
    flex: 1,
    marginHorizontal: 4,
  },
  separator: {
    height: 16,
  },
});

export default GeminiMovieSuggestions; 