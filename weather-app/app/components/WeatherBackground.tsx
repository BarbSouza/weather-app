import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, Dimensions } from 'react-native';

/**
 * Weather condition codes:
 * 200-599: Rain and thunderstorms
 * 600-699: Snow
 * 800: Clear sky
 * 801-899: Clouds
 */

interface WeatherBackgroundProps {
  /** Weather condition code from OpenWeather API */
  weatherId: number;
  /** Current theme state */
  isDarkTheme: boolean;
  /** Controls whether animations are enabled */
  animationsEnabled: boolean;
}

const { width, height } = Dimensions.get('window');

/**
 * Animated weather background component
 * Renders dynamic weather effects based on weather condition
 * Supports rain, snow, and cloud animations with theme awareness
 */
export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ 
  weatherId, 
  isDarkTheme, 
  animationsEnabled 
}) => {
  const raindrops = useRef(Array.from({ length: 15 }, () => new Animated.Value(0))).current;
  const snowflakes = useRef(Array.from({ length: 12 }, () => new Animated.Value(0))).current;
  const clouds = useRef(Array.from({ length: 3 }, () => new Animated.Value(0))).current;

  /**
   * Animation control functions
   */
  const stopAllAnimations = () => {
    raindrops.forEach(drop => drop.stopAnimation());
    snowflakes.forEach(flake => flake.stopAnimation());
    clouds.forEach(cloud => cloud.stopAnimation());
  };

  const resetAllAnimations = () => {
    raindrops.forEach(drop => drop.setValue(0));
    snowflakes.forEach(flake => flake.setValue(0));
    clouds.forEach(cloud => cloud.setValue(0));
  };

  /**
   * Weather effect animations
   */
  const startRainAnimation = () => {
    const animations = raindrops.map(drop => 
      Animated.loop(
        Animated.timing(drop, {
          toValue: 1,
          duration: 2000 + Math.random() * 1500,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      )
    );
    Animated.stagger(150, animations).start();
  };

  const startSnowAnimation = () => {
    const animations = snowflakes.map(flake => 
      Animated.loop(
        Animated.timing(flake, {
          toValue: 1,
          duration: 4000 + Math.random() * 3000,
          useNativeDriver: true,
        }),
        { resetBeforeIteration: true }
      )
    );
    Animated.stagger(300, animations).start();
  };

  const startCloudAnimation = () => {
    clouds.map(cloud => 
      Animated.loop(
        Animated.timing(cloud, {
          toValue: 1,
          duration: 15000 + Math.random() * 3000,
          useNativeDriver: true,
        })
      ).start()
    );
  };

  /**
   * Weather effect lifecycle management
   */
  useEffect(() => {
    stopAllAnimations();
    resetAllAnimations();

    if (!animationsEnabled) return;

    const timer = setTimeout(() => {
      if (weatherId >= 200 && weatherId < 600) startRainAnimation();
      else if (weatherId >= 600 && weatherId < 700) startSnowAnimation();
      else if (weatherId >= 801 && weatherId < 900) startCloudAnimation();
    }, 100);

    return () => {
      clearTimeout(timer);
      stopAllAnimations();
    };
  }, [weatherId, animationsEnabled]);

  /**
   * Weather effect rendering functions
   */
  const renderRaindrops = () => {
    if (!animationsEnabled || weatherId < 200 || weatherId >= 600) return null;

    return raindrops.map((drop, index) => (
      <Animated.View
        key={`rain-${index}`}
        style={[
          styles.raindrop,
          {
            left: Math.random() * width,
            transform: [
              {
                translateY: drop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, height + 20],
                }),
              },
            ],
            opacity: drop.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 0.8, 0.8, 0],
            }),
          },
        ]}
      />
    ));
  };

  const renderSnowflakes = () => {
    if (!animationsEnabled || weatherId < 600 || weatherId >= 700) return null;

    return snowflakes.map((flake, index) => (
      <Animated.View
        key={`snow-${index}`}
        style={[
          styles.snowflake,
          {
            left: Math.random() * width,
            transform: [
              {
                translateY: flake.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-20, height + 20],
                }),
              },
              {
                translateX: flake.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 20, -10],
                }),
              },
            ],
            opacity: flake.interpolate({
              inputRange: [0, 0.1, 0.9, 1],
              outputRange: [0, 1, 1, 0],
            }),
          },
        ]}
      />
    ));
  };

  const renderClouds = () => {
    if (!animationsEnabled || weatherId < 801 || weatherId >= 900) return null;

    return clouds.map((cloud, index) => (
      <Animated.View
        key={`cloud-${index}`}
        style={[
          styles.cloud,
          {
            top: 50 + index * 60,
            transform: [
              {
                translateX: cloud.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-100, width + 100],
                }),
              },
            ],
          },
        ]}
      >
        <View style={[styles.cloudPart, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.3)' }]} />
        <View style={[styles.cloudPart, styles.cloudPart2, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.25)' }]} />
        <View style={[styles.cloudPart, styles.cloudPart3, { backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.2)' }]} />
      </Animated.View>
    ));
  };

  return (
    <View style={styles.container} pointerEvents="none">
      {renderRaindrops()}
      {renderSnowflakes()}
      {renderClouds()}
    </View>
  );
};

/**
 * Component styles
 */
const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  raindrop: {
    position: 'absolute',
    width: 2,
    height: 20,
    backgroundColor: '#87CEEB',
    borderRadius: 1,
  },
  snowflake: {
    position: 'absolute',
    width: 8,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  cloud: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  cloudPart: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  cloudPart2: {
    width: 40,
    height: 25,
    marginLeft: -15,
    marginBottom: 5,
  },
  cloudPart3: {
    width: 25,
    height: 20,
    marginLeft: -10,
    marginBottom: 8,
  },
});