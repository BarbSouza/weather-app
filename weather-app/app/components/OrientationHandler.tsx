import React, { useState, useEffect } from 'react';
import { Dimensions, Platform } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

type OrientationType = 'portrait' | 'landscape';
type ScreenDimensions = { width: number; height: number };

/**
 * Custom hook for handling screen orientation in React Native
 * Provides methods to control and monitor device orientation
 * @returns Object containing orientation state and control methods
 */
export const useOrientation = () => {
  const [orientation, setOrientation] = useState<OrientationType>('portrait');
  const [screenData, setScreenData] = useState<ScreenDimensions>(Dimensions.get('window'));
  const [isToggling, setIsToggling] = useState(false);

  useEffect(() => {
    /**
     * Handles dimension changes and updates orientation state
     * @param result - Dimension change event result
     */
    const onChange = (result: { window: ScreenDimensions }) => {
      setScreenData(result.window);
      const newOrientation = result.window.width > result.window.height ? 'landscape' : 'portrait';
      setOrientation(newOrientation);
      setIsToggling(false); // Reset toggling state when orientation actually changes
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    
    // Set initial orientation
    const { width, height } = Dimensions.get('window');
    if (width > height) setOrientation('landscape');

    return () => subscription?.remove();
  }, []);

  /**
   * Toggles between portrait and landscape orientation
   * Improved version with better iOS compatibility
   */
  const toggleOrientation = async () => {
    if (isToggling) return; // Prevent multiple rapid calls
    
    setIsToggling(true);
    
    try {
      if (Platform.OS === 'ios') {
        // iOS-specific handling
        if (orientation === 'portrait') {
          // First unlock, then lock to landscape
          await ScreenOrientation.unlockAsync();
          setTimeout(async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
          }, 100);
        } else {
          // First unlock, then lock to portrait
          await ScreenOrientation.unlockAsync();
          setTimeout(async () => {
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
          }, 100);
        }
      } else {
        // Android handling (your original logic)
        if (orientation === 'portrait') {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        } else {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
        }
      }
    } catch (error) {
      console.warn('Error toggling orientation:', error);
      setIsToggling(false);
    }
    
    // Reset toggling state after a timeout as fallback
    setTimeout(() => {
      setIsToggling(false);
    }, 1000);
  };

  /**
   * Forces device into portrait orientation
   */
  const lockPortrait = async () => {
    try {
      if (Platform.OS === 'ios') {
        await ScreenOrientation.unlockAsync();
        setTimeout(async () => {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        }, 100);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
      }
    } catch (error) {
      console.warn('Error locking to portrait:', error);
    }
  };

  /**
   * Forces device into landscape orientation
   */
  const lockLandscape = async () => {
    try {
      if (Platform.OS === 'ios') {
        await ScreenOrientation.unlockAsync();
        setTimeout(async () => {
          await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE_LEFT);
        }, 100);
      } else {
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      }
    } catch (error) {
      console.warn('Error locking to landscape:', error);
    }
  };

  /**
   * Removes orientation lock, allowing free rotation
   */
  const unlockOrientation = async () => {
    try {
      await ScreenOrientation.unlockAsync();
    } catch (error) {
      console.warn('Error unlocking orientation:', error);
    }
  };

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    screenData,
    toggleOrientation,
    lockPortrait,
    lockLandscape,
    unlockOrientation,
    isToggling
  };
};