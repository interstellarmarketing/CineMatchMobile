import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { COLORS } from '../utils/constants';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useSearchMovies } from '../hooks/useSearchMovies';
import { Movie } from '../types';

const SearchScreen = () => {
  const navigation = useNavigation();
  const { searchResults, loading, error, updateQuery, clearSearch } = useSearchMovies();

  const handleSearch = useCallback((query: string) => {
    updateQuery(query);
  }, [updateQuery]);

  const handleMoviePress = useCallback((movie: Movie) => {
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      movie 
    } as never);
  }, [navigation]);

  const handleGeminiSearch = useCallback(() => {
    navigation.navigate('GeminiSearch' as never);
  }, [navigation]);

  const handleRetry = useCallback(() => {
    handleSearch('');
  }, [handleSearch]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Search</Text>
          <TouchableOpacity
            style={styles.geminiButton}
            onPress={handleGeminiSearch}
            activeOpacity={0.7}
          >
            <Icon name="psychology" size={24} color={COLORS.primary} />
            <Text style={styles.geminiButtonText}>AI Search</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      <SearchBar onSearch={handleSearch} />
      
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner message="Searching..." />
        ) : error ? (
          <ErrorMessage message={error} onRetry={handleRetry} />
        ) : searchResults.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Search for movies, TV shows, or actors</Text>
          </View>
        ) : (
          <MovieGrid
            movies={searchResults}
            onMoviePress={handleMoviePress}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  geminiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
  },
  geminiButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default SearchScreen; 