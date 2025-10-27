// API Configuration
export const TMDB_API_KEY = process.env.EXPO_PUBLIC_TMDB_API_KEY || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI0ZmExNDA1ZGNlZGMwNDU2YjViN2E4ZTQwNDZiZWU2NyIsIm5iZiI6MTcwODg5MTMxNi44OTMsInN1YiI6IjY1ZGI5Y2I0M2RjODg1MDE2ODQxNzVlNSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.sa9Yr_CWDIkbj8iP66TOqAyHuBoN4P_BJT-kHAiv9Pw';

export const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer ' + TMDB_API_KEY,
  },
};

// API URLs
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_CDN_URL = 'https://image.tmdb.org/t/p/w500';
export const IMG_CDN_ORG_URL = 'https://image.tmdb.org/t/p/original';

// External URLs
export const GOOGLE_URL = 'https://www.google.com/search?q=';
export const IMDB_URL = 'https://www.imdb.com/title/';

// Default Images
export const MOVIE_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AyVKfKPBL23UVxRaD91gjGBwqWErKHuoScT6F';
export const SERIES_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AyXAlwqBL23UVxRaD91gjGBwqWErKHuoScT6F';
export const ACTOR_BANNER = 'https://utfs.io/f/0Gl64F1LqW8AzpvQZNId7O3n0CwI1YRZ5lVtTFNGou9AE8Qc';

// Colors
export const COLORS = {
  primary: '#3B82F6',
  secondary: '#8B5CF6',
  background: '#000000',
  surface: '#1F2937',
  text: '#FFFFFF',
  textSecondary: '#9CA3AF',
  accent: '#F59E0B',
  error: '#EF4444',
  success: '#10B981',
  card: '#1F2937',
  backgroundLighter: '#23242a',
  // JustWatch color palette
  JW_TOP_BG: '#0D1B2A',
  JW_BOTTOM_BG: '#0A1016',
  JW_PILL_STRIP: '#1A2230',
  JW_PILL_ACTIVE: '#283246',
  JW_TEXT_HIGH: 'rgba(255,255,255,1)',
  JW_TEXT_MEDIUM: 'rgba(255,255,255,0.7)',
};

// Dimensions
export const DIMENSIONS = {
  screenWidth: 375, // Default iPhone width
  screenHeight: 812, // Default iPhone height
  cardWidth: 120,
  cardHeight: 180,
  posterAspectRatio: 2/3,
};

// Supported Languages
export const SUPPORTED_LANGUAGES = [
  { identifier: 'en', name: 'English' },
  { identifier: 'ta', name: 'Tamil' },
  { identifier: 'hi', name: 'Hindi' },
  { identifier: 'ka', name: 'Kannada' },
];

// Gemini AI Configuration
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyCnBiDzCiO94LC7OjEuOdMWR2pAfciZ5RU'; // Replace with your actual Gemini API key

// Trakt API Configuration
export const TRAKT_API_KEY = process.env.EXPO_PUBLIC_TRAKT_API_KEY || 'a4a0361e70aefc960d39a9d7b179475c9d12d8bb41c397b82c85c5287acc9a21';
export const TRAKT_API_URL = 'https://api.trakt.tv'; 