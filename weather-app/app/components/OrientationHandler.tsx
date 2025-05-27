import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
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

  useEffect(() => {
    /**
     * Handles dimension changes and updates orientation state
     * @param result - Dimension change event result
     */
    const onChange = (result: { window: ScreenDimensions }) => {
      setScreenData(result.window);
      setOrientation(result.window.width > result.window.height ? 'landscape' : 'portrait');
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    
    // Set initial orientation
    const { width, height } = Dimensions.get('window');
    if (width > height) setOrientation('landscape');

    return () => subscription?.remove();
  }, []);

  /**
   * Toggles between portrait and landscape orientation
   */
  const toggleOrientation = async () => {
    if (orientation === 'portrait') {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };

  /**
   * Forces device into portrait orientation
   */
  const lockPortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  };

  /**
   * Forces device into landscape orientation
   */
  const lockLandscape = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

  /**
   * Removes orientation lock, allowing free rotation
   */
  const unlockOrientation = async () => {
    await ScreenOrientation.unlockAsync();
  };

  return {
    orientation,
    isPortrait: orientation === 'portrait',
    isLandscape: orientation === 'landscape',
    screenData,
    toggleOrientation,
    lockPortrait,
    lockLandscape,
    unlockOrientation
  };
};