import React, { Suspense, useRef, useCallback, useMemo, createContext } from 'react';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector, shallowEqual } from 'react-redux';
import { RootState, Movie } from '../types';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { performanceMonitor } from '../utils/performanceMonitor';
import { Text, View, StyleSheet } from 'react-native';
import { COLORS } from '../utils/constants';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import SearchScreen from '../screens/SearchScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';
import LoginScreen from '../screens/LoginScreen';
import GeminiSearchScreen from '../screens/GeminiSearchScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import hooks and types
import usePreferences from '../hooks/usePreferences';

// Define Param List for Stack Navigator
type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  MovieDetails: { a: string };
  GeminiSearch: undefined;
  Profile: undefined;
  Search: undefined;
};

// Create Preferences Context
export const PreferencesContext = createContext<{
  favorites: Movie[];
  watchlist: Movie[];
  toggleFavorite: (movie: Movie) => void;
  toggleWatchlist: (movie: Movie) => void;
}>({
  favorites: [],
  watchlist: [],
  toggleFavorite: () => {},
  toggleWatchlist: () => {},
});

// Preferences Provider Component
const PreferencesProvider = ({ children }: { children: React.ReactNode }) => {
  const preferences = usePreferences();
  return (
    <PreferencesContext.Provider value={preferences}>
      {children}
    </PreferencesContext.Provider>
  );
};

// Lazy loaded screens with better error boundaries
const MyListsScreen = React.lazy(() => import('../screens/MyListsScreen'));

// Loading component for lazy screens
const LazyScreenLoading = () => (
  <View style={styles.loadingContainer}>
    <Text style={styles.loadingText}>Loading...</Text>
  </View>
);

LazyScreenLoading.displayName = 'LazyScreenLoading';

const MyListsScreenWrapper = () => (
  <Suspense fallback={<LazyScreenLoading />}>
    <MyListsScreen />
  </Suspense>
);

// Bottom Tab Navigator with performance optimizations
const TabNavigator = React.memo(() => {
  const Tab = createBottomTabNavigator();
  const tabBarOptions = useMemo(() => ({
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.background,
      borderTopColor: '#333',
      borderTopWidth: 1,
    },
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: '#666',
    // Performance optimizations
    lazy: true,
    tabBarHideOnKeyboard: true,
  }), []);

  return (
    <Tab.Navigator screenOptions={tabBarOptions}>
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Popular" 
        component={BrowseScreen}
        options={{
          tabBarLabel: 'Popular',
          tabBarIcon: ({ color, size }) => (
            <Icon name="movie" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Search" 
        component={GeminiSearchScreen}
        options={{
          tabBarLabel: 'AI Search',
          tabBarIcon: ({ color, size }) => (
            <Icon name="auto-awesome" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="MyLists" 
        component={MyListsScreenWrapper}
        options={{
          tabBarLabel: 'My Lists',
          tabBarIcon: ({ color, size }) => (
            <Icon name="favorite" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="person" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
});

TabNavigator.displayName = 'TabNavigator';

// Main Stack Navigator with performance optimizations
export default function AppNavigator() {
  const Stack = createNativeStackNavigator<RootStackParamList>();
  const navigationRef = useRef<NavigationContainerRef<RootStackParamList>>(null);
  const routeNameRef = useRef<string>();
  const navigationStartTime = useRef<number>(0);

  // Optimized Redux selector - memoized with shallowEqual
  const user = useSelector((state: RootState) => state.user.user, shallowEqual);

  // Screen preloading - only run once
  const preloadedScreens = useRef<boolean>(false);
  
  const preloadScreens = useCallback(() => {
    if (preloadedScreens.current) return;
    
    preloadedScreens.current = true;
    
    // Preload critical screens to reduce navigation lag
    const preloadPromises = [
      import('../screens/MovieDetailsScreen'),
      import('../screens/GeminiSearchScreen'),
      import('../screens/MyListsScreen'),
      import('../screens/ProfileScreen'),
      import('../screens/SearchScreen'),
    ];
    
    Promise.all(preloadPromises)
      .then(() => {
        if (__DEV__) {
          console.log('📱 Screens preloaded successfully');
        }
      })
      .catch((error) => {
        console.error('📱 Screen preloading failed:', error);
      });
  }, []);

  // Enhanced navigation performance monitoring
  const onReady = useCallback(() => {
    const currentRoute = navigationRef.current?.getCurrentRoute();
    routeNameRef.current = currentRoute?.name;
    
    // Preload screens after navigation is ready
    preloadScreens();
    
    if (__DEV__) {
      console.log('📱 Navigation ready, initial route:', currentRoute?.name);
    }
  }, [preloadScreens]);

  const onStateChange = useCallback(() => {
    const previousRouteName = routeNameRef.current;
    const currentRoute = navigationRef.current?.getCurrentRoute();
    const currentRouteName = currentRoute?.name;
    
    if (previousRouteName !== currentRouteName) {
      // Track navigation performance
      if (navigationStartTime.current > 0) {
        const navigationDuration = Date.now() - navigationStartTime.current;
        performanceMonitor.endNavigation(previousRouteName || 'unknown', currentRouteName || 'unknown');
        
        if (__DEV__) {
          console.log(`📱 Navigation: ${previousRouteName || 'unknown'} -> ${currentRouteName || 'unknown'} (${navigationDuration}ms)`);
          
          // Warn about slow navigation
          if (navigationDuration > 500) {
            console.warn(`⚠️ Slow navigation detected: ${previousRouteName || 'unknown'} -> ${currentRouteName || 'unknown'} (${navigationDuration}ms)`);
          }
        }
        
        navigationStartTime.current = 0;
      }
    }
    
    routeNameRef.current = currentRouteName;
  }, []);

  // Track navigation start timing
  const navigationOptions = useMemo((): NativeStackNavigationOptions => ({
    headerShown: false,
    // Performance optimizations
    animation: 'slide_from_right',
    animationDuration: 200,
    gestureEnabled: true,
    // Optimize memory usage
    detachPreviousScreen: true,
  }), []);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={onReady}
      onStateChange={onStateChange}
    >
      <PreferencesProvider>
        <Stack.Navigator screenOptions={navigationOptions}>
          {!user ? (
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={TabNavigator} />
              <Stack.Screen 
                name="MovieDetails" 
                component={MovieDetailsScreen}
                options={{
                  presentation: 'modal',
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Screen 
                name="GeminiSearch" 
                component={GeminiSearchScreen}
                options={{
                  presentation: 'modal',
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Screen 
                name="Profile" 
                component={ProfileScreen}
                options={{
                  presentation: 'modal',
                  animationTypeForReplace: 'push',
                }}
              />
              <Stack.Screen 
                name="Search" 
                component={SearchScreen}
                options={{
                  presentation: 'modal',
                  animationTypeForReplace: 'push',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </PreferencesProvider>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    color: COLORS.text,
    fontSize: 16,
  },
}); 