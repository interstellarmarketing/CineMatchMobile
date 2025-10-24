import { Linking, Platform } from 'react-native';

// Streaming service configurations and redirect URLs
export const STREAMING_SERVICES = {
  // Major streaming services with their base URLs and mobile app schemes
  'Netflix': {
    baseUrl: 'https://www.netflix.com',
    searchUrl: 'https://www.netflix.com/search?q=',
    icon: '🔴',
    mobileAppScheme: 'netflix://',
    appStoreId: Platform.OS === 'ios' ? '363590051' : 'com.netflix.mediaclient',
    playStoreId: 'com.netflix.mediaclient'
  },
  'Amazon Prime Video': {
    baseUrl: 'https://www.primevideo.com',
    searchUrl: 'https://www.primevideo.com/search?q=',
    icon: '🔵',
    mobileAppScheme: 'amazonprimevideo://',
    appStoreId: Platform.OS === 'ios' ? '545519333' : 'com.amazon.avod.thirdpartyclient',
    playStoreId: 'com.amazon.avod.thirdpartyclient'
  },
  'Disney Plus': {
    baseUrl: 'https://www.disneyplus.com',
    searchUrl: 'https://www.disneyplus.com/search?q=',
    icon: '🔵',
    mobileAppScheme: 'disneyplus://',
    appStoreId: Platform.OS === 'ios' ? '1446075923' : 'com.disney.disneyplus',
    playStoreId: 'com.disney.disneyplus'
  },
  'Hulu': {
    baseUrl: 'https://www.hulu.com',
    searchUrl: 'https://www.hulu.com/search?q=',
    icon: '🟢',
    mobileAppScheme: 'hulu://',
    appStoreId: Platform.OS === 'ios' ? '376510438' : 'com.hulu.plus',
    playStoreId: 'com.hulu.plus'
  },
  'HBO Max': {
    baseUrl: 'https://www.max.com',
    searchUrl: 'https://www.max.com/search?q=',
    icon: '🟣',
    mobileAppScheme: 'hbomax://',
    appStoreId: Platform.OS === 'ios' ? '1509343949' : 'com.hbo.hbonow',
    playStoreId: 'com.hbo.hbonow'
  },
  'Apple TV Plus': {
    baseUrl: 'https://tv.apple.com',
    searchUrl: 'https://tv.apple.com/search?q=',
    icon: '⚪',
    mobileAppScheme: 'appletv://',
    appStoreId: Platform.OS === 'ios' ? '1174078549' : 'com.apple.atve',
    playStoreId: 'com.apple.atve'
  },
  'Peacock': {
    baseUrl: 'https://www.peacocktv.com',
    searchUrl: 'https://www.peacocktv.com/search?q=',
    icon: '🦚',
    mobileAppScheme: 'peacocktv://',
    appStoreId: Platform.OS === 'ios' ? '1501124654' : 'com.peacocktv.peacockandroid',
    playStoreId: 'com.peacocktv.peacockandroid'
  },
  'Paramount Plus': {
    baseUrl: 'https://www.paramountplus.com',
    searchUrl: 'https://www.paramountplus.com/search?q=',
    icon: '🔵',
    mobileAppScheme: 'paramountplus://',
    appStoreId: Platform.OS === 'ios' ? '1503095889' : 'com.cbs.ott',
    playStoreId: 'com.cbs.ott'
  },
  'Crunchyroll': {
    baseUrl: 'https://www.crunchyroll.com',
    searchUrl: 'https://www.crunchyroll.com/search?q=',
    icon: '🟠',
    mobileAppScheme: 'crunchyroll://',
    appStoreId: Platform.OS === 'ios' ? '1008869313' : 'com.crunchyroll.crunchyroid',
    playStoreId: 'com.crunchyroll.crunchyroid'
  },
  'Funimation': {
    baseUrl: 'https://www.funimation.com',
    searchUrl: 'https://www.funimation.com/search?q=',
    icon: '🟠',
    mobileAppScheme: 'funimation://',
    appStoreId: Platform.OS === 'ios' ? '418438751' : 'com.funimation.funimationnow',
    playStoreId: 'com.funimation.funimationnow'
  }
};

// Priority list for ad-free, popular streaming services
export const STREAMING_PRIORITY = [
  'Netflix',
  'Amazon Prime Video',
  'Disney Plus',
  'HBO Max',
  'Apple TV Plus',
  'Paramount Plus',
  'Peacock',
  'Hulu',
  'Crunchyroll',
  'Funimation'
];

// Function to get streaming service info by name
export const getStreamingServiceInfo = (serviceName: string) => {
  return STREAMING_SERVICES[serviceName] || {
    baseUrl: 'https://www.google.com/search?q=',
    searchUrl: 'https://www.google.com/search?q=',
    icon: '📺',
    mobileAppScheme: null,
    appStoreId: null,
    playStoreId: null
  };
};

// Function to check if a service is a major streaming platform
export const isMajorStreamingService = (serviceName: string): boolean => {
  return Object.keys(STREAMING_SERVICES).includes(serviceName);
};

// Function to get service icon
export const getServiceIcon = (serviceName: string): string => {
  const serviceInfo = getStreamingServiceInfo(serviceName);
  return serviceInfo.icon;
};

// Function to format service name for display
export const formatServiceName = (serviceName: string): string => {
  // Handle common variations
  const nameMap: { [key: string]: string } = {
    'Netflix': 'Netflix',
    'Amazon Prime Video': 'Prime Video',
    'Disney Plus': 'Disney+',
    'HBO Max': 'Max',
    'Apple TV Plus': 'Apple TV+',
    'Paramount Plus': 'Paramount+'
  };
  
  return nameMap[serviceName] || serviceName;
};

// Function to check if streaming app is installed (iOS only)
export const checkAppInstalled = async (serviceName: string): Promise<boolean> => {
  if (Platform.OS !== 'ios') return false;
  
  const serviceInfo = getStreamingServiceInfo(serviceName);
  if (!serviceInfo.mobileAppScheme) return false;
  
  try {
    const canOpen = await Linking.canOpenURL(serviceInfo.mobileAppScheme);
    return canOpen;
  } catch (error) {
    console.log(`Error checking if ${serviceName} is installed:`, error);
    return false;
  }
};

// Function to redirect to streaming service (mobile-optimized)
export const redirectToStreamingService = async (serviceName: string, title: string): Promise<void> => {
  const serviceInfo = getStreamingServiceInfo(serviceName);
  
  if (!isMajorStreamingService(serviceName)) {
    // For non-major services, open Google search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(title + ' ' + serviceName)}`;
    await Linking.openURL(searchUrl);
    return;
  }
  
  // Try to open mobile app first
  if (serviceInfo.mobileAppScheme) {
    try {
      const appUrl = `${serviceInfo.mobileAppScheme}search?q=${encodeURIComponent(title)}`;
      const canOpen = await Linking.canOpenURL(appUrl);
      
      if (canOpen) {
        await Linking.openURL(appUrl);
        return;
      }
    } catch (error) {
      console.log(`Error opening ${serviceName} app:`, error);
    }
  }
  
  // Fallback to web search
  const searchUrl = serviceInfo.searchUrl + encodeURIComponent(title);
  await Linking.openURL(searchUrl);
};

// Function to open app store for streaming service
export const openAppStore = async (serviceName: string): Promise<void> => {
  const serviceInfo = getStreamingServiceInfo(serviceName);
  
  if (Platform.OS === 'ios' && serviceInfo.appStoreId) {
    const appStoreUrl = `https://apps.apple.com/app/id${serviceInfo.appStoreId}`;
    await Linking.openURL(appStoreUrl);
  } else if (Platform.OS === 'android' && serviceInfo.playStoreId) {
    const playStoreUrl = `https://play.google.com/store/apps/details?id=${serviceInfo.playStoreId}`;
    await Linking.openURL(playStoreUrl);
  } else {
    // Fallback to web search
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(serviceName + ' app')}`;
    await Linking.openURL(searchUrl);
  }
};

// Function to pick best streaming option from available providers
export const pickBestStreamingOption = (options: Array<{ name: string; type?: string }> = []): { name: string; type?: string } | null => {
  if (!options || options.length === 0) return null;
  
  // Prefer ad-free services
  const adFreeServices = [
    'Netflix',
    'Amazon Prime Video',
    'Disney Plus',
    'HBO Max',
    'Apple TV Plus',
    'Paramount Plus',
    'Crunchyroll',
    'Funimation'
  ];
  
  const adFree = options.filter(opt => adFreeServices.includes(opt.name));
  
  // Try to find ad-free service by priority
  for (const name of STREAMING_PRIORITY) {
    const found = adFree.find(opt => opt.name === name);
    if (found) return found;
  }
  
  // If no ad-free, pick first in priority
  for (const name of STREAMING_PRIORITY) {
    const found = options.find(opt => opt.name === name);
    if (found) return found;
  }
  
  // Fallback: first available
  return options[0] || null;
};

// Function to get provider type label
export const getProviderTypeLabel = (type: string): string => {
  const typeMap: { [key: string]: string } = {
    'flatrate': 'Subscription',
    'rent': 'Rent',
    'buy': 'Buy',
    'free': 'Free',
    'ads': 'With Ads'
  };
  
  return typeMap[type] || type;
};

// Function to get provider price/quality (mocked, as TMDB API doesn't provide price info)
export const getProviderPrice = (provider: any, type: string): string => {
  if (type === 'cinema') return 'Ticket';
  if (type === 'rent') return '$19.99 4K';
  if (type === 'buy') return '$24.99 4K';
  return '';
};

// Streaming service interfaces
export interface StreamingOption {
  name: string;
  type?: string;
}

export interface StreamingProvider {
  provider_id: number;
  provider_name: string;
  logo_path: string;
  _streamType?: string;
}

// Mock function to get streaming options for a movie/show
// In real implementation, this would call the TMDB watch providers API
export const getStreamingOptions = async (movieId: number, mediaType: 'movie' | 'tv'): Promise<StreamingOption[]> => {
  // Mock implementation - in real app, this would fetch from TMDB API
  const mockOptions: StreamingOption[] = [
    { name: 'Netflix', type: 'subscription' },
    { name: 'Amazon Prime Video', type: 'subscription' },
    { name: 'Disney Plus', type: 'subscription' }
  ];
  
  // Randomly return 1-3 options for demo purposes
  const count = Math.floor(Math.random() * 3) + 1;
  return mockOptions.slice(0, count);
}; 