import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Animated,
  PanResponder,
  Modal,
  Pressable,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { COLORS } from '../utils/constants';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useTrendingMovies } from '../hooks/useTrendingMovies';
import { usePopularMovies } from '../hooks/usePopularMovies';
import { useTraktMovieList } from '../hooks/useTraktMovieList';
import { useTrendingTV } from '../hooks/useTrendingTV';
import { usePopularTV } from '../hooks/usePopularTV';
import { useInfiniteFilteredMovies, useInfiniteFilteredTVShows } from '../hooks/useFilteredMovies';
import { useFilterState } from '../hooks/useFilterState';
import { Movie, TVShow, ApiResponse } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MovieCard from '../components/MovieCard';
import TVCard from '../components/TVCard';
import Logo from '../components/Logo';
import { Feather } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Assuming RootStackParamList is defined in your navigation types
// You might need to import this from your navigation setup file
type RootStackParamList = {
  MovieDetails: { movieId: number; mediaType: 'movie' | 'tv' };
  Profile: undefined;
  Search: undefined;
  // Add other routes here
};

type BrowseScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

const SORT_OPTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'popularity.desc', label: 'Popular' },
  { key: 'trakt-trending', label: 'Trending on Trakt' },
  { key: 'trakt-popular', label: 'Popular on Trakt' },
  { key: 'vote_average.desc', label: 'Rating' },
  { key: 'release_date.desc', label: 'Release Date' },
  { key: 'title.asc', label: 'Title' },
];

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 35, name: 'Comedy' },
  { id: 18, name: 'Drama' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 16, name: 'Animation' },
  { id: 12, name: 'Adventure' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 14, name: 'Fantasy' },
  { id: 9648, name: 'Mystery' },
  { id: 878, name: 'Science Fiction' },
  { id: 53, name: 'Thriller' },
];

const MOVIE_AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
const TV_AGE_RATINGS = ['TV-Y', 'TV-G', 'TV-PG', 'TV-14', 'TV-MA'];

const BrowseScreen = () => {
  const navigation = useNavigation<BrowseScreenNavigationProp>();
  const insets = useSafeAreaInsets();
  const { movies: trendingMovies, loading: trendingMoviesLoading, error: trendingError } = useTrendingMovies();
  const { movies: popularMovies, loading: popularMoviesLoading, error: popularError } = usePopularMovies();
  const { data: traktTrending, isLoading: isTraktTrendingLoading } = useTraktMovieList('trending');
  const { data: traktPopular, isLoading: isTraktPopularLoading } = useTraktMovieList('popular');
  const { shows: trendingTV, loading: trendingTVLoading, error: trendingTVError } = useTrendingTV();
  const { shows: popularTV, loading: popularTVLoading, error: popularTVError } = usePopularTV();

  const [selectedTab, setSelectedTab] = useState<'all' | 'movies' | 'tv'>('all');
  const [selectedFilter, setSelectedFilter] = useState<'trending' | 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc' | 'trakt-trending' | 'trakt-popular'>('trending');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);
  const [filterPan] = useState(new Animated.Value(0));

  const pan = useState(new Animated.Value(0))[0];
  
  const {
    filterState,
    movieFilters,
    tvFilters,
    updateGenreFilter,
    updateMinRating,
    toggleMovieAgeRating,
    toggleTvAgeRating,
    updateSortBy,
    clearFilters,
    hasActiveFilters,
  } = useFilterState();
  
  const closeSortSheet = useCallback(() => {
    Animated.timing(pan, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setShowSortSheet(false));
  }, [pan]);

  const panResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) pan.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 80) {
        closeSortSheet();
      } else {
        Animated.spring(pan, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const closeFilterSheet = useCallback(() => {
    Animated.timing(filterPan, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setShowFilterSheet(false);
      if (hasActiveFilters && selectedFilter === 'trending') {
        setSelectedFilter('popularity.desc');
        updateSortBy('popularity.desc');
      }
    });
  }, [filterPan, hasActiveFilters, selectedFilter, updateSortBy]);

  const filterPanResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) filterPan.setValue(gestureState.dy);
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 80) {
        closeFilterSheet();
      } else {
        Animated.spring(filterPan, { toValue: 0, useNativeDriver: true }).start();
      }
    },
  });

  const openSortSheet = useCallback(() => {
    setShowSortSheet(true);
    pan.setValue(300);
    Animated.timing(pan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [pan]);

  const openFilterSheet = useCallback(() => {
    setShowFilterSheet(true);
    filterPan.setValue(300);
    Animated.timing(filterPan, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  }, [filterPan]);

  // The 'enabled' flag is now controlled by hasActiveFilters and the selected tab
  const {
    data: infiniteMoviesData,
    fetchNextPage: fetchNextMoviesPage,
    hasNextPage: hasNextMoviesPage,
    isFetchingNextPage: isFetchingNextMoviesPage,
  } = useInfiniteFilteredMovies(
    movieFilters,
    hasActiveFilters && (selectedTab === 'all' || selectedTab === 'movies')
  );

  const {
    data: infiniteTVData,
    fetchNextPage: fetchNextTVPage,
    hasNextPage: hasNextTVPage,
    isFetchingNextPage: isFetchingNextTVPage,
  } = useInfiniteFilteredTVShows(
    tvFilters,
    hasActiveFilters && (selectedTab === 'all' || selectedTab === 'tv')
  );

  // This is the core fix: a memoized selector for the grid's data
  const gridData = useMemo(() => {
    if (hasActiveFilters) {
      // When filters are ON, use data from the infinite queries
      const filteredMovies = infiniteMoviesData?.pages.flatMap((p) => p.results || []) || [];
      const filteredTV = infiniteTVData?.pages.flatMap((p) => p.results || []) || [];

      if (selectedTab === 'movies') return filteredMovies;
      if (selectedTab === 'tv') return filteredTV;
      // 'all' tab
      const allFiltered = [...filteredMovies, ...filteredTV];
      return Array.from(new Map(allFiltered.map(item => [item.id, item])).values());

    } else {
      // When filters are OFF, use either trending OR popular data based on sort selection
      let defaultList: (Movie | TVShow)[] = [];
      
      if (selectedFilter === 'trending') {
        // Use trending data
        if (selectedTab === 'all') {
          defaultList = [...trendingMovies, ...trendingTV];
        } else if (selectedTab === 'movies') {
          defaultList = [...trendingMovies];
        } else { // 'tv'
          defaultList = [...trendingTV];
        }
      } else if (selectedFilter === 'trakt-trending') {
        if (selectedTab === 'all' || selectedTab === 'movies') {
          defaultList = [...(traktTrending || [])];
        }
        // No TV shows from Trakt in this implementation yet
      } else if (selectedFilter === 'trakt-popular') {
        if (selectedTab === 'all' || selectedTab === 'movies') {
          defaultList = [...(traktPopular || [])];
        }
        // No TV shows from Trakt in this implementation yet
      } else {
        // Use popular data (or other sorting methods use popular as base)
        if (selectedTab === 'all') {
          defaultList = [...popularMovies, ...popularTV];
        } else if (selectedTab === 'movies') {
          defaultList = [...popularMovies];
        } else { // 'tv'
          defaultList = [...popularTV];
        }
      }
      
      const unique = Array.from(new Map(defaultList.map(item => [item.id, item])).values());
      
      // Apply sorting based on selected filter
      if (selectedFilter === 'vote_average.desc') {
        unique.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      } else if (selectedFilter === 'release_date.desc') {
        unique.sort((a, b) => {
          const dateA = new Date(('release_date' in a ? a.release_date : a.first_air_date) || '1970-01-01');
          const dateB = new Date(('release_date' in b ? b.release_date : b.first_air_date) || '1970-01-01');
          return dateB.getTime() - dateA.getTime();
        });
      } else if (selectedFilter === 'title.asc') {
        unique.sort((a, b) => {
          const titleA = ('title' in a ? a.title : a.name) || '';
          const titleB = ('title' in b ? b.title : b.name) || '';
          return titleA.localeCompare(titleB);
        });
      } else {
        // Default to popularity sorting for 'popularity.desc' and 'trending'
        unique.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
      }
      
      return unique;
    }
  }, [hasActiveFilters, selectedTab, selectedFilter, infiniteMoviesData, infiniteTVData, trendingMovies, trendingTV, popularMovies, popularTV, traktTrending, traktPopular]);
  
  const loadMore = useCallback(() => {
    // Only load more if filters are active, since default lists aren't paginated
    if (hasActiveFilters) {
        if (selectedTab !== 'tv' && hasNextMoviesPage) {
            fetchNextMoviesPage();
        }
        if (selectedTab !== 'movies' && hasNextTVPage) {
            fetchNextTVPage();
        }
    }
  }, [hasActiveFilters, selectedTab, hasNextMoviesPage, hasNextTVPage, fetchNextMoviesPage, fetchNextTVPage]);
  
  const handleMoviePress = useCallback((movie: Movie | TVShow) => {
    const mediaType = 'name' in movie && movie.name ? 'tv' : 'movie';
    navigation.navigate('MovieDetails', { 
      movieId: movie.id, 
      mediaType: mediaType 
    });
  }, [navigation]);

  const handleProfilePress = useCallback(() => {
    navigation.navigate('Profile' as never);
  }, [navigation]);

  const handleSearchPress = useCallback(() => {
    navigation.navigate('Search' as never);
  }, [navigation]);

  const hasError = trendingError || popularError || trendingTVError || popularTVError;

  const renderMedia = ({ item }: { item: Movie | TVShow }) => {
    if ('name' in item) {
      return <TVCard movie={item as TVShow} onPress={handleMoviePress} />;
    }
    return <MovieCard movie={item as Movie} onPress={handleMoviePress} />;
  };

  const handleSortChange = (sortKey: string) => {
    if (sortKey !== 'trending' && sortKey !== 'trakt-trending' && sortKey !== 'trakt-popular') {
      updateSortBy(sortKey as 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc');
    }
    setSelectedFilter(sortKey as 'trending' | 'popularity.desc' | 'vote_average.desc' | 'release_date.desc' | 'title.asc' | 'trakt-trending' | 'trakt-popular');
    closeSortSheet();
  };

  const isLoading = trendingMoviesLoading || popularMoviesLoading || trendingTVLoading || popularTVLoading || isTraktTrendingLoading || isTraktPopularLoading;

  const renderListHeader = useCallback(() => (
    <View>
      <View style={styles.tabSectionWrapperNoBg}>
        <View style={styles.tabRowWithSeparateFilter}>
          <View style={styles.tabContainer}>
            {['all', 'movies', 'tv'].map(tabKey => {
              const label = tabKey === 'all' ? 'All' : tabKey === 'movies' ? 'Movies' : 'TV';
              const isActive = selectedTab === tabKey;
              return (
                <TouchableOpacity
                  key={tabKey}
                  style={[styles.tabPillSmall, isActive ? styles.tabPillActiveSmall : styles.tabPillInactiveSmall]}
                  onPress={() => setSelectedTab(tabKey as 'all' | 'movies' | 'tv')}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tabPillLabelSmall, isActive ? styles.tabPillLabelActiveSmall : styles.tabPillLabelInactiveSmall]}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.filterButtonSeparate, hasActiveFilters && styles.filterButtonActive]}
            onPress={openFilterSheet}
            activeOpacity={0.8}
          >
            <Icon name="filter-list" size={18} color={hasActiveFilters ? COLORS.accent : COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.sortRowRedesignedCompactPad}>
        <Text style={styles.sortCountLabelCompact}>{`${gridData.length} titles  –`}</Text>
        <View style={styles.sortDropdownWrapperCompact}>
          <TouchableOpacity
            style={styles.sortDropdownCompactPad}
            activeOpacity={0.8}
            onPress={openSortSheet}
          >
            <Text style={styles.sortDropdownTextCompact}>
              {SORT_OPTIONS.find(opt => opt.key === selectedFilter)?.label || 'Popular'}
            </Text>
            <Icon name={'arrow-drop-down'} size={18} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  ), [selectedTab, gridData.length, selectedFilter, hasActiveFilters, openFilterSheet, openSortSheet]);

  if (isLoading && gridData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner message="Loading..." />
      </SafeAreaView>
    );
  }

  if (hasError) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage message="Error loading content. Please try again." />
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.containerSplitBg}>
      <View style={styles.topBg} />
      
      <SafeAreaView style={styles.safeAreaContent} edges={['left', 'right']}>
        <View style={[styles.topBlueSection, { paddingTop: insets.top }]}>
          <View style={styles.stickyHeader}>
            <View style={styles.headerTopCentered}>
              <Logo size="large" style={styles.logoLargeCentered} />
              <View style={styles.headerButtonsNoBg}>
                <TouchableOpacity style={styles.headerButtonNoBg} onPress={handleSearchPress}>
                  <Feather name="search" size={20} color={COLORS.primary} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.headerButtonNoBg} onPress={handleProfilePress}>
                  <Feather name="user" size={20} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.mainContentDarkerBg}>
          <FlatList
            data={gridData}
            renderItem={renderMedia}
            keyExtractor={item => item.id.toString()}
            numColumns={2}
            contentContainerStyle={{ paddingBottom: 8 }}
            showsVerticalScrollIndicator={false}
            columnWrapperStyle={{ marginBottom: 4, paddingHorizontal: 20, justifyContent: 'space-between' }}
            style={styles.grid}
            ListHeaderComponent={renderListHeader}
            onEndReached={loadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={(isFetchingNextMoviesPage || isFetchingNextTVPage) ? <ActivityIndicator style={{ marginVertical: 20 }} /> : null}
          />
        </View>
      </SafeAreaView>
      <Modal
        visible={showFilterSheet}
        animationType="fade"
        transparent
        onRequestClose={closeFilterSheet}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeFilterSheet} />
        <Animated.View
          style={[
            styles.fullScreenSheet,
            { paddingTop: insets.top, transform: [{ translateY: filterPan }] },
          ]}
          {...filterPanResponder.panHandlers}
        >
          <View style={styles.sheetIndicator} />
          <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
            <Text style={styles.sheetTitle}>Filter</Text>
            <Text style={styles.sheetSectionTitle}>Genre</Text>
            <View style={styles.genreChipsContainer}>
              {GENRES.map((genre) => {
                const state = filterState.genreFilters[genre.id] || null;
                let chipStyle: any = styles.genreChip;
                let chipText: any = styles.genreChipText;
                if (state === 'include') {
                  chipStyle = [styles.genreChip, styles.genreChipInclude];
                  chipText = [styles.genreChipText, styles.genreChipTextInclude];
                } else if (state === 'exclude') {
                  chipStyle = [styles.genreChip, styles.genreChipExclude];
                  chipText = [styles.genreChipText, styles.genreChipTextExclude];
                }
                return (
                  <TouchableOpacity
                    key={genre.id}
                    style={chipStyle}
                    onPress={() => updateGenreFilter(genre.id)}
                  >
                    <Text style={chipText}>{genre.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <Text style={styles.sheetSectionTitle}>Minimum Rating</Text>
            <View style={styles.ratingSliderRow}>
              <Slider
                style={{ flex: 1 }}
                minimumValue={0}
                maximumValue={10}
                step={0.5}
                value={filterState.minRating}
                onValueChange={updateMinRating}
                minimumTrackTintColor={COLORS.primary}
                maximumTrackTintColor={COLORS.surface}
                thumbTintColor={COLORS.primary}
              />
              <Text style={styles.ratingValueText}>{filterState.minRating.toFixed(1)}</Text>
            </View>
            <Text style={styles.sheetSectionTitle}>Movie Age Rating</Text>
            <View style={styles.genreChipsContainer}>
              {MOVIE_AGE_RATINGS.map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.genreChip, filterState.movieAgeRatings.includes(rating) && styles.genreChipInclude] as any}
                  onPress={() => toggleMovieAgeRating(rating)}
                >
                  <Text style={[styles.genreChipText, filterState.movieAgeRatings.includes(rating) && styles.genreChipTextInclude] as any}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.sheetSectionTitle}>TV Age Rating</Text>
            <View style={styles.genreChipsContainer}>
              {TV_AGE_RATINGS.map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={[styles.genreChip, filterState.tvAgeRatings.includes(rating) && styles.genreChipInclude] as any}
                  onPress={() => toggleTvAgeRating(rating)}
                >
                  <Text style={[styles.genreChipText, filterState.tvAgeRatings.includes(rating) && styles.genreChipTextInclude] as any}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.sheetFooter}>
              <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
                <Text style={styles.clearButtonText}>Clear</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={closeFilterSheet}>
                <Text style={styles.applyButtonText}>Done</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animated.View>
      </Modal>
      <Modal
        visible={showSortSheet}
        animationType="fade"
        transparent
        onRequestClose={closeSortSheet}
      >
        <Pressable style={styles.sheetOverlay} onPress={closeSortSheet} />
        <Animated.View
          style={[
            styles.sortSheet,
            { paddingBottom: insets.bottom, transform: [{ translateY: pan }] },
          ]}
          {...panResponder.panHandlers}
        >
          <View style={styles.sheetIndicator} />
          {SORT_OPTIONS.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={styles.sortOption}
              onPress={() => handleSortChange(option.key)}
            >
              <Text style={styles.sortOptionText}>{option.label}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    containerSplitBg: {
      flex: 1,
    },
    topBg: {
      backgroundColor: COLORS.JW_TOP_BG,
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 300, 
    },
    safeAreaContent: {
      flex: 1,
    },
    topBlueSection: {
      backgroundColor: COLORS.JW_TOP_BG,
      paddingBottom: 12,
    },
    mainContentDarkerBg: {
      flex: 1,
      backgroundColor: '#0A1016',
    },
    stickyHeader: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    headerTopCentered: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logoLargeCentered: {
        
    },
    headerButtonsNoBg: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    headerButtonNoBg: {
        padding: 6,
    },
    grid: {
        flex: 1,
    },
    tabSectionWrapperNoBg: {
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    tabRowWithSeparateFilter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: COLORS.JW_PILL_STRIP,
        borderRadius: 20,
        padding: 4,
    },
    tabContainer: {
        flex: 1,
        flexDirection: 'row',
    },
    tabPillSmall: {
        flex: 1,
        paddingVertical: 8,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabPillActiveSmall: {
        backgroundColor: '#3B82F6',
    },
    tabPillInactiveSmall: {
        backgroundColor: 'transparent',
    },
    tabPillLabelSmall: {
        fontWeight: '600',
        fontSize: 14,
    },
    tabPillLabelActiveSmall: {
        color: '#FFFFFF',
    },
    tabPillLabelInactiveSmall: {
        color: '#9CA3AF',
    },
    filterButtonSeparate: {
        padding: 10,
    },
    filterButtonActive: {
        backgroundColor: 'rgba(252, 163, 17, 0.2)',
    },
    sortRowRedesignedCompactPad: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 18,
        paddingVertical: 8,
    },
    sortCountLabelCompact: {
        color: COLORS.JW_TEXT_MEDIUM,
        fontSize: 13,
        fontWeight: '500',
    },
    sortDropdownWrapperCompact: {
        marginLeft: 4,
    },
    sortDropdownCompactPad: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
    },
    sortDropdownTextCompact: {
        color: COLORS.primary,
        fontSize: 13,
        fontWeight: '600',
    },
    sheetOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    fullScreenSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '95%',
        backgroundColor: '#181A20',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    sheetIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#4B5563',
        alignSelf: 'center',
        marginBottom: 16,
    },
    sheetTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
        textAlign: 'center',
        marginBottom: 24,
    },
    sheetSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: 'white',
        marginBottom: 12,
        marginTop: 16,
    },
    genreChipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genreChip: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        backgroundColor: COLORS.surface,
    },
    genreChipInclude: {
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
    },
    genreChipExclude: {
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: '#EF4444',
    },
    genreChipText: {
        color: '#E5E7EB',
        fontWeight: '500',
        fontSize: 14,
    },
    genreChipTextInclude: {
        color: '#60A5FA',
        fontWeight: '500',
        fontSize: 14,
    },
    genreChipTextExclude: {
        color: '#F87171',
        fontWeight: '500',
        fontSize: 14,
    },
    ratingSliderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 16,
    },
    ratingValueText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sheetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 32,
        borderTopWidth: 1,
        borderTopColor: COLORS.surface,
        paddingTop: 16,
    },
    clearButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
    },
    clearButtonText: {
        color: COLORS.primary,
        fontSize: 16,
        fontWeight: '600',
    },
    applyButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 8,
    },
    applyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
    },
    sortSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#1F2937',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    sortOption: {
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#374151',
    },
    sortOptionText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
    },
});

export default BrowseScreen; 