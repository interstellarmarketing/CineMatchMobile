import React, { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';

// Enhanced performance monitoring utility
class PerformanceMonitor {
  private navigationTimes: Map<string, number> = new Map();
  private renderTimes: Map<string, number> = new Map();
  private memoryUsage: number[] = [];
  private navigationHistory: Array<{
    from: string;
    to: string;
    duration: number;
    timestamp: number;
  }> = [];

  // Track navigation start with better timing
  startNavigation(from: string, to: string) {
    const key = `${from}->${to}`;
    const timestamp = performance.now();
    this.navigationTimes.set(key, timestamp);
    
    if (__DEV__) {
      console.log(`🚀 Navigation started: ${from} -> ${to} at ${timestamp.toFixed(2)}ms`);
    }
  }

  // Track navigation end with detailed metrics
  endNavigation(from: string, to: string) {
    const key = `${from}->${to}`;
    const startTime = this.navigationTimes.get(key);
    
    if (startTime) {
      const duration = performance.now() - startTime;
      this.navigationTimes.delete(key);
      
      // Store in navigation history
      this.navigationHistory.push({
        from,
        to,
        duration,
        timestamp: Date.now()
      });
      
      // Keep only last 50 entries
      if (this.navigationHistory.length > 50) {
        this.navigationHistory.shift();
      }
      
      if (__DEV__) {
        console.log(`✅ Navigation completed: ${from} -> ${to} (${duration.toFixed(2)}ms)`);
        
        // Performance warnings
        if (duration > 500) {
          console.warn(`⚠️ Slow navigation detected: ${from} -> ${to} (${duration.toFixed(2)}ms)`);
        }
        if (duration > 1000) {
          console.error(`❌ Critical navigation lag: ${from} -> ${to} (${duration.toFixed(2)}ms)`);
        }
      }
      
      return duration;
    }
    
    return 0;
  }

  // Track component render time with better precision
  startRender(componentName: string) {
    const timestamp = performance.now();
    this.renderTimes.set(componentName, timestamp);
    
    if (__DEV__) {
      console.log(`🎨 Render started: ${componentName} at ${timestamp.toFixed(2)}ms`);
    }
  }

  endRender(componentName: string) {
    const startTime = this.renderTimes.get(componentName);
    
    if (startTime) {
      const duration = performance.now() - startTime;
      this.renderTimes.delete(componentName);
      
      if (__DEV__) {
        // Only log if render takes longer than 16ms (60fps threshold)
        if (duration > 16) {
          console.log(`🎨 Render completed: ${componentName} (${duration.toFixed(2)}ms)`);
        }
        
        // Warning for slow renders
        if (duration > 50) {
          console.warn(`⚠️ Slow render detected: ${componentName} (${duration.toFixed(2)}ms)`);
        }
      }
      
      return duration;
    }
    
    return 0;
  }

  // Track memory usage (simplified)
  trackMemoryUsage() {
    try {
      // @ts-ignore - performance.memory is available in development
      const memoryInfo = performance.memory;
      if (memoryInfo) {
        const usedJSHeapSize = memoryInfo.usedJSHeapSize / 1024 / 1024; // MB
        this.memoryUsage.push(usedJSHeapSize);
        
        // Keep only last 100 entries
        if (this.memoryUsage.length > 100) {
          this.memoryUsage.shift();
        }
        
        if (__DEV__) {
          console.log(`💾 Memory usage: ${usedJSHeapSize.toFixed(2)}MB`);
          
          // Memory warnings
          if (usedJSHeapSize > 100) {
            console.warn(`⚠️ High memory usage: ${usedJSHeapSize.toFixed(2)}MB`);
          }
        }
      }
    } catch (error) {
      // Memory monitoring not available
    }
  }

  // Get comprehensive performance summary
  getPerformanceSummary() {
    const averageNavigationTime = this.navigationHistory.length > 0
      ? this.navigationHistory.reduce((sum, nav) => sum + nav.duration, 0) / this.navigationHistory.length
      : 0;
    
    const slowNavigations = this.navigationHistory.filter(nav => nav.duration > 500);
    const averageMemoryUsage = this.memoryUsage.length > 0
      ? this.memoryUsage.reduce((sum, mem) => sum + mem, 0) / this.memoryUsage.length
      : 0;

    return {
      activeNavigations: this.navigationTimes.size,
      activeRenders: this.renderTimes.size,
      totalNavigations: this.navigationHistory.length,
      averageNavigationTime: averageNavigationTime.toFixed(2),
      slowNavigations: slowNavigations.length,
      averageMemoryUsage: averageMemoryUsage.toFixed(2),
      recentNavigations: this.navigationHistory.slice(-5),
    };
  }

  // Get navigation analytics
  getNavigationAnalytics() {
    const analytics = this.navigationHistory.reduce((acc, nav) => {
      const route = `${nav.from}->${nav.to}`;
      if (!acc[route]) {
        acc[route] = { count: 0, totalDuration: 0, avgDuration: 0 };
      }
      acc[route].count++;
      acc[route].totalDuration += nav.duration;
      acc[route].avgDuration = acc[route].totalDuration / acc[route].count;
      return acc;
    }, {} as Record<string, { count: number; totalDuration: number; avgDuration: number }>);

    return analytics;
  }

  // Clear all performance data
  clear() {
    this.navigationTimes.clear();
    this.renderTimes.clear();
    this.memoryUsage = [];
    this.navigationHistory = [];
  }

  // Log current performance state
  logPerformanceState() {
    if (__DEV__) {
      const summary = this.getPerformanceSummary();
      console.group('📊 Performance Summary');
      console.log('Active navigations:', summary.activeNavigations);
      console.log('Active renders:', summary.activeRenders);
      console.log('Total navigations:', summary.totalNavigations);
      console.log('Average navigation time:', summary.averageNavigationTime + 'ms');
      console.log('Slow navigations:', summary.slowNavigations);
      console.log('Average memory usage:', summary.averageMemoryUsage + 'MB');
      console.log('Recent navigations:', summary.recentNavigations);
      console.groupEnd();
    }
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Enhanced hook for tracking navigation performance
export const useNavigationPerformance = () => {
  const navigation = useNavigation();
  
  const navigateWithTracking = useCallback((routeName: string, params?: any) => {
    const currentRoute = navigation.getCurrentRoute()?.name || 'unknown';
    
    // Start tracking
    performanceMonitor.startNavigation(currentRoute, routeName);
    
    // Navigate
    navigation.navigate(routeName as never, params as never);
    
    // Track memory usage
    performanceMonitor.trackMemoryUsage();
  }, [navigation]);

  const goBackWithTracking = useCallback(() => {
    const currentRoute = navigation.getCurrentRoute()?.name || 'unknown';
    performanceMonitor.startNavigation(currentRoute, 'back');
    navigation.goBack();
  }, [navigation]);

  return { 
    navigateWithTracking, 
    goBackWithTracking,
    getPerformanceSummary: () => performanceMonitor.getPerformanceSummary()
  };
};

// Enhanced performance tracking hook for components
export const usePerformanceTracking = (componentName: string) => {
  React.useEffect(() => {
    performanceMonitor.startRender(componentName);
    
    return () => {
      performanceMonitor.endRender(componentName);
    };
  }, [componentName]);
  
  // Track memory usage periodically
  React.useEffect(() => {
    const interval = setInterval(() => {
      performanceMonitor.trackMemoryUsage();
    }, 10000); // Every 10 seconds
    
    return () => clearInterval(interval);
  }, []);
}; 