import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { COLORS, IMG_CDN_URL } from '../utils/constants';
import MovieList from '../components/MovieList';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useTrendingMovies } from '../hooks/useTrendingMovies';
import { usePopularMovies } from '../hooks/usePopularMovies';
import { useTopRatedMovies } from '../hooks/useTopRatedMovies';
import { useUpcomingMovies } from '../hooks/useUpcomingMovies';
import { useTrendingTV } from '../hooks/useTrendingTV';
import { usePopularTV } from '../hooks/usePopularTV';
import { useTopRatedTV } from '../hooks/useTopRatedTV';
import { useUpcomingTV } from '../hooks/useUpcomingTV';
import { Movie, TVShow } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MovieCard from '../components/MovieCard';
import TVCard from '../components/TVCard';
import Logo from '../components/Logo';

const TAB_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'movies', label: 'Movies' },
  { key: 'tv', label: 'TV' },
];

const FILTER_OPTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'popular', label: 'Popular' },
  { key: 'topRated', label: 'Top Rated' },
  { key: 'upcoming', label: 'Coming Soon' },
];

const BrowseScreen = () => {
  const navigation = useNavigation();
  const { movies: trendingMovies, loading: trendingLoading, error: trendingError } = useTrendingMovies();
  const { movies: popularMovies, loading: popularLoading, error: popularError } = usePopularMovies();
  const { movies: topRatedMovies, loading: topRatedLoading, error: topRatedError } = useTopRatedMovies();
  const { movies: upcomingMovies, loading: upcomingLoading, error: upcomingError } = useUpcomingMovies();
  const { shows: trendingTV, loading: trendingTVLoading, error: trendingTVError } = useTrendingTV();
  const { shows: popularTV, loading: popularTVLoading, error: popularTVError } = usePopularTV();
  const { shows: topRatedTV, loading: topRatedTVLoading, error: topRatedTVError } = useTopRatedTV();
  const { shows: upcomingTV, loading: upcomingTVLoading, error: upcomingTVError } = useUpcomingTV();

  const [selectedTab, setSelectedTab] = useState<'movies' | 'tv' | 'all'>('movies');
  const [selectedFilter, setSelectedFilter] = useState<'popularity' | 'trending'>('popularity');
  const [showDropdown, setShowDropdown] = useState(false);

  // Image preloading for better performance
  useEffect(() => {
    const preloadImages = async () => {
      const allMovies = [
        ...trendingMovies.slice(0, 5),
        ...popularMovies.slice(0, 5),
        ...topRatedMovies.slice(0, 5),
        ...upcomingMovies.slice(0, 5),
      ];
      
      const imagePromises = allMovies.map(movie => 
        Image.prefetch(`${IMG_CDN_URL}${movie.poster_path}`)
      );
      
      try {
        await Promise.all(imagePromises);
      } catch (error) {
        // Silently handle image preload errors
        console.warn('Image preload failed:', error);
      }
    };

    if (trendingMovies.length > 0 || popularMovies.length > 0 || 
        topRatedMovies.length > 0 || upcomingMovies.length > 0) {
      preloadImages();
    }
  }, [trendingMovies, popularMovies, topRatedMovies, upcomingMovies]);

  const handleMoviePress = useCallback((movie: Movie) => {
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      movie 
    } as never);
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile' as never);
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search' as never);
  }, [navigation]);

  const isLoading =
    trendingLoading || popularLoading || topRatedLoading || upcomingLoading ||
    trendingTVLoading || popularTVLoading || topRatedTVLoading || upcomingTVLoading;
  const hasError =
    trendingError || popularError || topRatedError || upcomingError ||
    trendingTVError || popularTVError || topRatedTVError || upcomingTVError;

  // Helper to get filtered and sorted list for the grid
  const getGridList = () => {
    let list: (Movie | TVShow)[] = [];
    if (selectedTab === 'all') {
      list = [...trendingMovies, ...trendingTV, ...popularMovies, ...popularTV];
    } else if (selectedTab === 'movies') {
      list = [...trendingMovies, ...popularMovies];
    } else {
      list = [...trendingTV, ...popularTV];
    }
    // Remove duplicates by id
    const unique = Array.from(new Map(list.map(item => [item.id, item])).values());
    // Sort
    if (selectedFilter === 'popularity') {
      return unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    } else {
      return unique.sort((a, b) => (b.vote_count || 0) - (a.vote_count || 0));
    }
  };
  const gridData = getGridList();

  // Responsive numColumns
  const numColumns = 2;

  // Render card
  const renderMedia = ({ item }: { item: Movie | TVShow }) => {
    if (item.media_type === 'tv' || !!item.name) {
      return <TVCard show={item as TVShow} onPress={handleMoviePress} />;
    }
    return <MovieCard poster_path={item.poster_path} movie={item as Movie} onPress={handleMoviePress} />;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading movies..." />
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="Error loading movies. Please try again." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Sticky Header */}
      <View style={styles.stickyHeader}>
        <View style={styles.headerTop}>
          <Logo size="medium" style={styles.logo} />
          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.headerButton} onPress={handleSearchPress}>
              <Icon name="search" size={22} color={COLORS.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton} onPress={handleProfilePress}>
              <Icon name="person" size={22} color={COLORS.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Tabs and filter/sort icons */}
      <View style={styles.tabBarRow}>
        <View style={styles.tabBar}>
          {TAB_OPTIONS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabButton, selectedTab === tab.key && styles.tabButtonActive]}
              onPress={() => setSelectedTab(tab.key as 'movies' | 'tv' | 'all')}
            >
              <Text style={[styles.tabLabel, selectedTab === tab.key && styles.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.tabIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="sort" size={22} color={selectedTab === 'all' ? COLORS.primary : COLORS.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
            <Icon name="filter-list" size={22} color={selectedTab === 'all' ? COLORS.primary : COLORS.text} />
          </TouchableOpacity>
        </View>
      </View>
      {/* Label and dropdown */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>{`${gridData.length} titles sorted by`}</Text>
        <View style={styles.dropdownWrapper}>
          <TouchableOpacity
            style={styles.dropdown}
            activeOpacity={0.8}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={styles.dropdownText}>
              {selectedFilter === 'popularity' ? 'Popularity' : 'Trending'}
            </Text>
            <Icon name={showDropdown ? 'arrow-drop-up' : 'arrow-drop-down'} size={20} color={COLORS.text} />
          </TouchableOpacity>
          {showDropdown && (
            <View style={styles.dropdownMenu}>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedFilter('popularity'); setShowDropdown(false); }}
              >
                <Text style={styles.dropdownItemText}>Popularity</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dropdownItem}
                onPress={() => { setSelectedFilter('trending'); setShowDropdown(false); }}
              >
                <Text style={styles.dropdownItemText}>Trending</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
      {/* Responsive grid of cards */}
      <FlatList
        data={gridData}
        renderItem={renderMedia}
        keyExtractor={item => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={{ paddingHorizontal: 12, paddingBottom: 8 }}
        showsVerticalScrollIndicator={false}
        columnWrapperStyle={{ marginBottom: 8 }}
        style={styles.grid}
      />
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
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  tabButton: {
    paddingVertical: 8,
    paddingHorizontal: 28,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: 'transparent',
    marginHorizontal: 4,
  },
  tabButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabLabel: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  tabLabelActive: {
    color: COLORS.background,
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    zIndex: 2,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 18,
    minWidth: 120,
    justifyContent: 'center',
  },
  dropdownText: {
    color: COLORS.primary,
    fontWeight: '600',
    fontSize: 16,
    marginRight: 4,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 44,
    right: 0,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  dropdownItemText: {
    color: COLORS.text,
    fontSize: 16,
  },
  stickyHeader: {
    zIndex: 10,
    backgroundColor: COLORS.background,
    // Add shadow if needed
  },
  tabBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 4,
  },
  tabIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 8,
    padding: 6,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  sortLabel: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  dropdownWrapper: {
    position: 'relative',
  },
  grid: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'transparent',
    padding: 6,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    // Logo styling handled by Logo component
  },
});

export default BrowseScreen; 