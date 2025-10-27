import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { RootState, Movie } from '../types';
import { setSearchResults, setLoading } from '../utils/slices/geminiSlice';
import { GEMINI_API_KEY, API_OPTIONS, COLORS } from '../utils/constants';
import GeminiMovieCard from '../components/GeminiMovieCard';
import Logo from '../components/Logo';

const GeminiSearchScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { searchResultMovies, isLoading } = useSelector(
    (state: RootState) => state.gemini
  );
  const [inputText, setInputText] = useState('');
  const searchTextRef = useRef<TextInput>(null);

  const searchTMDMMovie = async (movie: string) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie)}&include_adult=false&language=en-US&page=1`,
        API_OPTIONS
      );
      const data = await response.json();
      return (data.results || []).map((r: Record<string, unknown>) => ({ ...r, media_type: 'movie' }));
    } catch (error) {
      console.error('Error searching TMDB movies:', error);
      return [];
    }
  };

  const searchTMDBTV = async (show: string) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(show)}&include_adult=false&language=en-US&page=1`,
        API_OPTIONS
      );
      const data = await response.json();
      return (data.results || []).map((r: Record<string, unknown>) => ({ ...r, media_type: 'tv' }));
    } catch (error) {
      console.error('Error searching TMDB TV:', error);
      return [];
    }
  };

  const handleGPTSearch = async () => {
    if (!inputText.trim()) {
      Alert.alert('Error', 'Please enter a search query');
      return;
    }

    // Dismiss keyboard when search starts
    if (searchTextRef.current) {
      searchTextRef.current.blur();
    }

    dispatch(setLoading(true));

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

      // Smart content detection
      const userInput = inputText.toLowerCase();
      let typePhrase = "movies and TV shows";
      if (userInput.includes("movie") && !userInput.includes("tv show") && !userInput.includes("series")) {
        typePhrase = "movies";
      } else if ((userInput.includes("tv show") || userInput.includes("series")) && !userInput.includes("movie")) {
        typePhrase = "TV shows";
      }

      const prompt = `Act as a recommendation engine and suggest up to 20 relevant ${typePhrase} based on the user's input: ${inputText}. Give me only the titles as a comma-separated list, and ensure no extra text is added.`;

      const result = await model.generateContent(prompt);
      const geminiResults = result.response.text().split(",");

      // Fetch TMDB data for AI suggestions
      const promiseArray = geminiResults.map((title) => {
        const trimmedTitle = title.trim();
        let searches = [];
        if (typePhrase.includes('movie')) searches.push(searchTMDMMovie(trimmedTitle));
        if (typePhrase.toLowerCase().includes('tv show')) searches.push(searchTMDBTV(trimmedTitle));
        if (searches.length === 0) searches = [searchTMDMMovie(trimmedTitle), searchTMDBTV(trimmedTitle)];
        
        return Promise.all(searches).then(resultsArrays => {
          const allResults = resultsArrays.flat();
          // Filter for exact title matches (case-insensitive)
          const exactMatches = allResults.filter(
            (item) =>
              item &&
              item.id &&
              ((item.media_type === 'movie' && item.title && item.title.trim().toLowerCase() === trimmedTitle.toLowerCase()) ||
               (item.media_type === 'tv' && item.name && item.name.trim().toLowerCase() === trimmedTitle.toLowerCase()))
          );
          if (exactMatches.length === 0) return null;
          // Sort by popularity and take the most popular
          return exactMatches.sort((a, b) => b.popularity - a.popularity)[0];
        });
      });

      const movieResults = await Promise.all(promiseArray);
      const filteredResults = movieResults
        .filter(movie => movie && movie.id)
        .filter((movie, index, self) => 
          index === self.findIndex(m => m.id === movie.id)
        );

      dispatch(setSearchResults({
        movieNames: geminiResults,
        movieResults: filteredResults,
        searchQuery: inputText,
      }));
    } catch (error) {
      console.error("Error during GPT search:", error);
      Alert.alert('Error', 'Failed to perform AI search. Please try again.');
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleMoviePress = (movie: Movie) => {
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      mediaType 
    } as never);
  };

  // Tips Section Component
  const TipsSection = () => (
    <View style={styles.tipsContainer}>
      <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Describe what you want to watch</Text>
      </View>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Use references — &quot;movies like Brokeback Mountain&quot;</Text>
      </View>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>Add mood or genre preferences</Text>
      </View>
      <View style={styles.tipItem}>
        <Text style={styles.tipBullet}>•</Text>
        <Text style={styles.tipText}>&quot;Shows similar to breaking bad&quot;</Text>
      </View>
    </View>
  );

  // Results data
  const filteredMovies = Array.isArray(searchResultMovies)
    ? searchResultMovies.filter((movie) => !!movie)
    : [];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Sticky Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <View style={styles.titleContainer}>
            <Logo variant="main" size="medium" style={styles.aiLogo} />
          </View>
        </View>

        {/* Search Container - Fixed outside FlatList */}
        <View style={styles.searchContainer}>
          <View style={styles.inputContainer}>
            <TextInput
              ref={searchTextRef}
              style={styles.input}
              placeholder="Search movies, TV shows, actors..."
              placeholderTextColor="#666"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleGPTSearch}
              returnKeyType="search"
              autoCapitalize="none"
              autoCorrect={false}
              blurOnSubmit={false}
            />
            {inputText.length > 0 && (
              <TouchableOpacity onPress={() => setInputText('')} style={styles.clearInputButton}>
                <Text style={styles.clearInputText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          
          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleGPTSearch}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Results List */}
        <FlatList
          data={filteredMovies}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleMoviePress(item as Movie)}>
              <GeminiMovieCard movie={item as Movie} />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={filteredMovies.length === 0 ? TipsSection : null}
          ListEmptyComponent={() => (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isLoading
                  ? ''
                  : 'Enter a search query to get Smith-powered movie recommendations'}
              </Text>
            </View>
          )}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="none"
        />

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 20,
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 20,
    zIndex: 1,
  },
  backButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiLogo: {
    // Remove margin since it's now centered
  },

  searchContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
    paddingHorizontal: 20,
  },
  inputContainer: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: COLORS.surface,
    color: COLORS.text,
    padding: 15,
    borderRadius: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  clearInputButton: {
    position: 'absolute',
    right: 12,
    top: 15,
    padding: 4,
  },
  clearInputText: {
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  searchButtonDisabled: {
    backgroundColor: COLORS.textSecondary,
  },
  searchButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 16,
  },

  tipsContainer: {
    backgroundColor: COLORS.surface,
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
  },
  tipsTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipBullet: {
    color: COLORS.primary,
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  tipText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
  listContent: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  loadingText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginTop: 15,
  },
});

export default GeminiSearchScreen; 