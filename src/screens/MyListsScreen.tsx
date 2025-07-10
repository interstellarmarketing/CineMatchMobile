import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { COLORS } from '../utils/constants';
import { RootState } from '../types';
import MovieGrid from '../components/MovieGrid';
import { Movie } from '../types';

const MyListsScreen = () => {
  const navigation = useNavigation();
  const favorites = useSelector((state: RootState) => state.preferences.favorites);
  const watchlist = useSelector((state: RootState) => state.preferences.watchlist);
  const lists = useSelector((state: RootState) => state.preferences.lists);

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      movie 
    } as never);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Lists</Text>
        </View>

        <View style={styles.content}>
          {/* Watchlist Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Watchlist ({watchlist.length})</Text>
            {watchlist.length > 0 ? (
              <MovieGrid
                movies={watchlist}
                onMoviePress={handleMoviePress}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No watchlist items</Text>
                <Text style={styles.emptySubtext}>Add movies to your watchlist to see them here</Text>
              </View>
            )}
          </View>

          {/* Favorites Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Favorites ({favorites.length})</Text>
            {favorites.length > 0 ? (
              <MovieGrid
                movies={favorites}
                onMoviePress={handleMoviePress}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No favorites yet</Text>
                <Text style={styles.emptySubtext}>Add movies to your favorites to see them here</Text>
              </View>
            )}
          </View>

          {/* Lists Section */}
          {lists.map((list) => (
            <View key={list.id} style={styles.section}>
              <Text style={styles.sectionTitle}>{list.name} ({list.items.length})</Text>
              {list.items.length > 0 ? (
                <MovieGrid
                  movies={list.items}
                  onMoviePress={handleMoviePress}
                  showsVerticalScrollIndicator={false}
                />
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyText}>No items in {list.name}</Text>
                  <Text style={styles.emptySubtext}>Add movies to see them here</Text>
                </View>
              )}
            </View>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
  },
});

export default MyListsScreen; 