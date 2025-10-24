import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Animated,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../utils/constants';
import { HERO_ASSETS } from '../assets/images';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: false,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: false,
        }),
      ])
    );
    shimmerAnimation.start();

    return () => shimmerAnimation.stop();
  }, [shimmerAnim]);

  const handleGeminiSearch = () => {
    navigation.navigate('Search' as never);
  };

  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.3],
  });

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroContainer}>
        {/* Hero spotlight effect */}
        <View style={styles.heroSpotlight} />
        
        {/* Hero image */}
        <View style={styles.heroImageContainer}>
          <Image
            source={HERO_ASSETS.frogNetflix}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>
        
        {/* Hero heading */}
        <Text style={styles.heroHeading}>
          Too Stupid to Choose a Show?{'\n'}Let AI Do It.
        </Text>
        
        {/* CTA Button */}
        <TouchableOpacity
          style={styles.ctaButtonContainer}
          onPress={handleGeminiSearch}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3B82F6', '#8B5CF6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Icon name="auto-awesome" size={24} color="#FFFFFF" />
            <Text style={styles.ctaButtonText}>Feed Me Content</Text>
          </LinearGradient>
          <Animated.View 
            style={[
              styles.shimmerOverlay,
              { opacity: shimmerOpacity }
            ]} 
          />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  heroContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    maxWidth: 500,
  },
  heroSpotlight: {
    position: 'absolute',
    top: screenHeight * 0.25,
    left: screenWidth * 0.5,
    width: Math.min(320, screenWidth * 0.6),
    height: Math.min(320, screenWidth * 0.6),
    backgroundColor: 'rgba(79, 154, 255, 0.2)',
    borderRadius: Math.min(320, screenWidth * 0.6) / 2,
    transform: [
      { translateX: -Math.min(320, screenWidth * 0.6) / 2 },
      { translateY: -Math.min(320, screenWidth * 0.6) / 2 }
    ],
    zIndex: 0,
  },
  heroImageContainer: {
    width: screenWidth,
    height: screenHeight * 0.5,
    zIndex: 10,
    shadowColor: '#4f9aff',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroHeading: {
    fontSize: Math.min(40, screenWidth * 0.1),
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 40,
    lineHeight: Math.min(48, screenWidth * 0.12),
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    letterSpacing: -0.02,
  },
  ctaButtonContainer: {
    borderRadius: 12,
    shadowColor: '#6366f1',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
    position: 'relative',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 8,
  },
  ctaButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  shimmerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 1,
  },
});

export default HomeScreen; 