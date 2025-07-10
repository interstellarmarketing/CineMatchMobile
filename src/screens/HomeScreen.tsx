import React, { useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { shallowEqual } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../types';
import { COLORS, IMG_CDN_URL } from '../utils/constants';
import MovieList from '../components/MovieList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useTrendingMovies } from '../hooks/useTrendingMovies';
import { Movie } from '../types';
import Logo from '../components/Logo';

const HomeScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  
  // Optimized Redux selector - single selector with shallowEqual
  const { user, isLoading } = useSelector((state: RootState) => ({
    user: state.user.user,
    isLoading: state.user.isLoading,
  }), shallowEqual);
  
  const { movies: trendingMovies, loading, error } = useTrendingMovies();

  // Image preloading for better performance
  useEffect(() => {
    if (trendingMovies.length > 0) {
      const preloadImages = async () => {
        const imagePromises = trendingMovies.slice(0, 10).map(movie => 
          Image.prefetch(`${IMG_CDN_URL}${movie.poster_path}`)
        );
        try {
          await Promise.all(imagePromises);
        } catch (error) {
          // Silently handle image preload errors
          console.warn('Image preload failed:', error);
        }
      };
      preloadImages();
    }
  }, [trendingMovies]);

  const handleMoviePress = useCallback((movie: Movie) => {
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      movie 
    } as never);
  }, [navigation]);

  const handleFeedMeContent = useCallback(() => {
    navigation.navigate('GeminiSearch' as never);
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile' as never);
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search' as never);
  }, [navigation]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Logo size="medium" style={styles.logo} />
            <View style={styles.headerButtons}>
              <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
                <Icon name="search" size={24} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.headerButton} onPress={handleProfilePress}>
                <Icon name="person" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          
          <Text style={styles.description}>
            Too Stupid to Choose a Show? Let AI Do It.
          </Text>

          <TouchableOpacity style={styles.ctaButton} onPress={handleFeedMeContent}>
            <Text style={styles.ctaButtonText}>Feed Me Content</Text>
          </TouchableOpacity>

          {/* Trending Movies Section */}
          <View style={styles.moviesSection}>
            {loading ? (
              <LoadingSpinner message="Loading trending movies..." />
            ) : error ? (
              <ErrorMessage message={`Error loading movies: ${error}`} />
            ) : (
              <MovieList
                title="Trending Now"
                movies={trendingMovies}
                onMoviePress={handleMoviePress}
                loading={loading}
              />
            )}
          </View>
        </View>
      </ScrollView>
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
    padding: 20,
  },
  header: {
    marginBottom: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    backgroundColor: COLORS.surface,
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  logo: {
    // Logo styling handled by Logo component
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  ctaButtonText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: 'bold',
  },
  moviesSection: {
    marginTop: 40,
    width: '100%',
  },
});

export default HomeScreen; 