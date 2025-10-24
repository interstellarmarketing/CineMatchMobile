import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import { COLORS } from '../utils/constants';
import { RootState, Movie } from '../types';
import MyListCard from '../components/MyListCard';
import { 
  createNewList, 
  addToList, 
  removeFromList,
  deleteList 
} from '../utils/slices/preferencesSlice';
import { setSearchResults } from '../utils/slices/geminiSlice';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY, API_OPTIONS } from '../utils/constants';

const MyListsScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const favorites = useSelector((state: RootState) => state.preferences.favorites);
  const watchlist = useSelector((state: RootState) => state.preferences.watchlist);
  const lists = useSelector((state: RootState) => state.preferences.lists);
  const { searchResultMovies } = useSelector((state: RootState) => state.gemini);
  
  const [activeTab, setActiveTab] = useState<'watchlist' | 'likes' | 'myLists'>('watchlist');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'movies' | 'tv'>('all');
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [recommendationsLoading, setRecommendationsLoading] = useState<{[key: string]: boolean}>({});
  const [showRecommendations, setShowRecommendations] = useState<{[key: string]: boolean}>({});

  const handleMoviePress = (movie: Movie) => {
    const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');
    navigation.navigate('MovieDetails' as never, { 
      movieId: movie.id, 
      mediaType 
    } as never);
  };

  const searchTMDMMovie = async (movie: string): Promise<Movie[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(movie)}&include_adult=false&language=en-US&page=1`,
        API_OPTIONS
      );
      const json = await response.json();
      return (json.results || []).map((r: Record<string, unknown>) => ({ ...r, media_type: 'movie' } as Movie));
    } catch (error) {
      console.error('Error searching TMDB movies:', error);
      return [];
    }
  };

  const searchTMDBTV = async (show: string): Promise<Movie[]> => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(show)}&include_adult=false&language=en-US&page=1`,
        API_OPTIONS
      );
      const json = await response.json();
      return (json.results || []).map((r: Record<string, unknown>) => ({ ...r, media_type: 'tv' } as Movie));
    } catch (error) {
      console.error('Error searching TMDB TV:', error);
      return [];
    }
  };

  const getRecommendationsForList = async (listId: string) => {
    if (recommendationsLoading[listId]) return;
    
    const list = lists.find(l => l.id === listId);
    if (!list || list.items.length === 0) {
      Alert.alert('Empty List', 'This list is empty. Add some items first!');
      return;
    }

    setRecommendationsLoading(prev => ({ ...prev, [listId]: true }));

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

      const itemTitles = list.items.map(item => item.title || item.name).join(', ');
      const prompt = `Based on these ${list.items.length} items: ${itemTitles}, recommend 15 movies and TV shows that the user would likely enjoy. Consider their preferences, viewing patterns, and what makes these selections appealing to them. Give me only the titles as a comma-separated list, and ensure no extra text is added.`;

      const result = await model.generateContent(prompt);
      const geminiResults = result.response.text().split(',');

      const promiseArray = geminiResults.map(async (title) => {
        const trimmedTitle = title.trim();
        const movieResults = await searchTMDMMovie(trimmedTitle);
        const tvResults = await searchTMDBTV(trimmedTitle);
        
        const allResults = [...movieResults, ...tvResults];
        const exactMatches = allResults.filter(
          (item) =>
            item &&
            item.id &&
            ((item.media_type === 'movie' && item.title && item.title.trim().toLowerCase() === trimmedTitle.toLowerCase()) ||
             (item.media_type === 'tv' && item.name && item.name.trim().toLowerCase() === trimmedTitle.toLowerCase()))
        );
        
        if (exactMatches.length === 0) return null;
        return exactMatches.sort((a, b) => (b.popularity || 0) - (a.popularity || 0))[0];
      });

      const movieResults = await Promise.all(promiseArray);
      const filteredResults = movieResults.filter((movie): movie is Movie => movie !== null && movie.id !== undefined);
      const uniqueResultsMap = new Map();
      filteredResults.forEach(movie => {
        if (!uniqueResultsMap.has(movie.id)) {
          uniqueResultsMap.set(movie.id, movie);
        }
      });
      const uniqueResults = Array.from(uniqueResultsMap.values());

      dispatch(setSearchResults({
        movieNames: geminiResults,
        movieResults: uniqueResults,
        searchQuery: `Recommendations for ${list.name}`
      }));

      setShowRecommendations(prev => ({ ...prev, [listId]: true }));
    } catch (error) {
      console.error("Error getting recommendations:", error);
      Alert.alert('Error', 'Error getting recommendations. Please try again.');
    } finally {
      setRecommendationsLoading(prev => ({ ...prev, [listId]: false }));
    }
  };

  const handleCreateList = () => {
    if (newListName.trim()) {
      dispatch(createNewList({
        name: newListName.trim(),
        description: newListDescription.trim()
      }));
      setNewListName('');
      setNewListDescription('');
      setIsCreatingList(false);
    } else {
      Alert.alert('Error', 'Please enter a list name');
    }
  };

  const handleAddToList = (listId: string, itemId: string) => {
    const numericItemId = parseInt(itemId, 10);
    const item = favorites.find(f => f.id === numericItemId);
    if (item) {
      dispatch(addToList({ listId, item }));
    }
  };

  const handleRemoveFromList = (listId: string, itemId: number) => {
    const list = lists.find(l => l.id === listId);
    const item = list?.items.find(i => i.id === itemId);
    
    if (item) {
      Alert.alert(
        'Remove Item',
        `Remove "${item.title || item.name}" from "${list?.name}"?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive',
            onPress: () => dispatch(removeFromList({ listId, itemId }))
          }
        ]
      );
    }
  };

  const handleDeleteList = (listId: string) => {
    Alert.alert(
      'Delete List',
      'Are you sure you want to delete this list?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteList(listId))
        }
      ]
    );
  };

  const getDisplayItems = () => {
    let items: Movie[] = [];
    
    if (activeTab === 'watchlist') {
      items = watchlist || [];
    } else if (activeTab === 'likes') {
      items = favorites || [];
    } else if (activeTab === 'myLists') {
      items = lists.flatMap(list => (list.items || []).map(item => ({ ...item, listName: list.name })));
    }

    // Apply category filter
    if (categoryFilter === 'movies') {
      items = items.filter(item => item && item.media_type === 'movie');
    } else if (categoryFilter === 'tv') {
      items = items.filter(item => item && item.media_type === 'tv');
    }

    // Filter out invalid items
    return items.filter(item => item && item.id);
  };

  const renderMovieCard = ({ item }: { item: Movie }) => {
    if (!item || !item.id) {
      return null;
    }
    
    return (
      <MyListCard
        item={item}
        onPress={handleMoviePress}
      />
    );
  };

  const renderRecommendationCard = ({ item }: { item: Movie }) => {
    if (!item || !item.id) {
      return null;
    }
    
    return (
      <MyListCard
        item={item}
        onPress={handleMoviePress}
      />
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyText}>
        {activeTab === 'watchlist' && 'No watchlist items'}
        {activeTab === 'likes' && 'No favorites yet'}
        {activeTab === 'myLists' && 'No lists created'}
      </Text>
      <Text style={styles.emptySubtext}>
        {activeTab === 'watchlist' && 'Add movies to your watchlist to see them here'}
        {activeTab === 'likes' && 'Add movies to your favorites to see them here'}
        {activeTab === 'myLists' && 'Create lists to organize your favorites'}
      </Text>
    </View>
  );

  const renderListCard = ({ item: list }: { item: { id: string; name: string; description?: string; items: Movie[] } }) => (
    <View style={styles.listCard}>
      <View style={styles.listHeader}>
        <View style={styles.listInfo}>
          <Text style={styles.listName}>{list.name}</Text>
          {list.description && (
            <Text style={styles.listDescription}>{list.description}</Text>
          )}
          <Text style={styles.listItemCount}>{list.items.length} items</Text>
        </View>
        <View style={styles.listActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDeleteList(list.id)}
          >
            <Text style={styles.actionButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Recommendations Button */}
      <TouchableOpacity
        style={[
          styles.recommendationsButton,
          (recommendationsLoading[list.id] || list.items.length === 0) && styles.disabledButton
        ]}
        onPress={() => getRecommendationsForList(list.id)}
        disabled={recommendationsLoading[list.id] || list.items.length === 0}
      >
        <Text style={styles.recommendationsButtonText}>
          {recommendationsLoading[list.id] 
            ? 'Getting Recommendations...' 
            : 'Get Recommendations'
          }
        </Text>
      </TouchableOpacity>

      {/* Recommendations Results */}
      {showRecommendations[list.id] && searchResultMovies && (
        <View style={styles.recommendationsSection}>
          <View style={styles.recommendationsHeader}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            <TouchableOpacity
              onPress={() => setShowRecommendations(prev => ({ ...prev, [list.id]: false }))}
            >
              <Text style={styles.hideButton}>Hide</Text>
            </TouchableOpacity>
          </View>
          <FlatList
            data={searchResultMovies}
            renderItem={renderRecommendationCard}
            keyExtractor={(item) => `recommendation-${item.id}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recommendationsList}
          />
        </View>
      )}

      {/* List Items Grid */}
      <View style={styles.listItemsGrid}>
        {list.items
          .filter((item: Movie) => item && item.id)
          .slice(0, 6)
          .map((item: Movie, index) => (
            <View key={`list-item-${list.id}-${item.id || `index-${index}`}`} style={styles.listItemContainer}>
              <TouchableOpacity
                style={styles.listItemThumbnail}
                onPress={() => handleMoviePress(item)}
              >
                <Text style={styles.listItemTitle} numberOfLines={2}>
                  {item.title || item.name || 'Unknown Title'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => handleRemoveFromList(list.id, item.id)}
              >
                <Text style={styles.removeButtonText}>×</Text>
              </TouchableOpacity>
            </View>
          ))}
        {list.items.length > 6 && (
          <View key={`more-items-${list.id}`} style={styles.moreItems}>
            <Text style={styles.moreItemsText}>+{list.items.length - 6} more</Text>
          </View>
        )}
      </View>

      {/* Add to List Dropdown */}
      <View style={styles.addToListSection}>
        <Text style={styles.addToListLabel}>Add to this list:</Text>
        <ScrollView style={styles.favoritesDropdown}>
          {favorites
            .filter(fav => fav && fav.id && !list.items.some((listItem: Movie) => listItem.id === fav.id))
            .map((fav, index) => (
              <TouchableOpacity
                key={`favorite-item-${list.id}-${fav.id || `index-${index}`}`}
                style={styles.favoriteItem}
                onPress={() => handleAddToList(list.id, (fav.id || index).toString())}
              >
                <Text style={styles.favoriteItemText}>
                  {fav.title || fav.name || 'Unknown Title'} ({fav.media_type === 'movie' ? 'Movie' : 'TV Show'})
                </Text>
              </TouchableOpacity>
            ))}
        </ScrollView>
      </View>
    </View>
  );

  const displayItems = getDisplayItems();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Lists</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {[
          { key: 'watchlist' as const, label: 'Watchlist' },
          { key: 'likes' as const, label: 'Likes' },
          { key: 'myLists' as const, label: 'My Lists' }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Category Filter */}
      <View style={styles.filterContainer}>
        {[
          { key: 'all' as const, label: 'All' },
          { key: 'movies' as const, label: 'Movies' },
          { key: 'tv' as const, label: 'TV' }
        ].map(filter => (
          <TouchableOpacity
            key={filter.key}
            style={[styles.filterButton, categoryFilter === filter.key && styles.activeFilterButton]}
            onPress={() => setCategoryFilter(filter.key)}
          >
            <Text style={[styles.filterText, categoryFilter === filter.key && styles.activeFilterText]}>
              {filter.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Title Count */}
      <View style={styles.countContainer}>
        <Text style={styles.countText}>{displayItems.length} titles</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {activeTab === 'myLists' ? (
          <FlatList
            data={lists}
            renderItem={renderListCard}
            keyExtractor={(item) => `list-${item.id}`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={renderEmptyState}
          />
        ) : (
          displayItems.length > 0 ? (
            <FlatList
              data={displayItems}
              renderItem={renderMovieCard}
              keyExtractor={(item) => `display-item-${item?.id || Math.random()}`}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContent}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          ) : (
            renderEmptyState()
          )
        )}
      </View>

      {/* Create List Modal */}
      <Modal
        visible={isCreatingList}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsCreatingList(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New List</Text>
            <TextInput
              style={styles.textInput}
              placeholder="List Name"
              placeholderTextColor={COLORS.textSecondary}
              value={newListName}
              onChangeText={setNewListName}
            />
            <TextInput
              style={[styles.textInput, styles.textArea]}
              placeholder="List Description (optional)"
              placeholderTextColor={COLORS.textSecondary}
              value={newListDescription}
              onChangeText={setNewListDescription}
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setIsCreatingList(false);
                  setNewListName('');
                  setNewListDescription('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateList}
              >
                <Text style={styles.createButtonText}>Create List</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Create List Button */}
      {activeTab === 'myLists' && (
        <TouchableOpacity
          style={styles.createListButton}
          onPress={() => setIsCreatingList(true)}
        >
          <Text style={styles.createListButtonText}>Create New List</Text>
        </TouchableOpacity>
      )}
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
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 16,
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.text,
  },
  countContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  countText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
    paddingTop: 8,
  },
  separator: {
    height: 8,
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
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    opacity: 0.7,
    textAlign: 'center',
  },
  // List Management Styles
  listCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  listInfo: {
    flex: 1,
  },
  listName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  listDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  listItemCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.error,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },
  recommendationsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  disabledButton: {
    backgroundColor: COLORS.textSecondary,
    opacity: 0.5,
  },
  recommendationsButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  recommendationsSection: {
    marginBottom: 12,
  },
  recommendationsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  hideButton: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  recommendationsList: {
    paddingLeft: 0,
  },
  listItemsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
    justifyContent: 'space-between',
  },
  listItemContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  listItemThumbnail: {
    width: '100%',
    minHeight: 60,
    backgroundColor: COLORS.card,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 8,
    flex: 1,
  },
  listItemTitle: {
    fontSize: 12,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 16,
  },
  moreItems: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  addToListSection: {
    marginTop: 8,
  },
  addToListLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  favoritesDropdown: {
    maxHeight: 120,
  },
  favoriteItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: COLORS.card,
    borderRadius: 6,
    marginBottom: 4,
  },
  favoriteItemText: {
    fontSize: 12,
    color: COLORS.text,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    backgroundColor: COLORS.card,
    borderRadius: 8,
    padding: 12,
    color: COLORS.text,
    fontSize: 16,
    marginBottom: 12,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: COLORS.card,
  },
  createButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  createButtonText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  createListButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  createListButtonText: {
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 14,
  },
  removeButton: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  removeButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default MyListsScreen; 