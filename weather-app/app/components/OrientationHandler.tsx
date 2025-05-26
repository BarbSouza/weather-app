import React, { useState, useEffect } from 'react';
import { Dimensions } from 'react-native';
import * as ScreenOrientation from 'expo-screen-orientation';

export const useOrientation = () => {
  const [orientation, setOrientation] = useState('portrait');
  const [screenData, setScreenData] = useState(Dimensions.get('window'));

  useEffect(() => {
    const onChange = (result: any) => {
      setScreenData(result.window);
      // Determine orientation based on dimensions
      if (result.window.width > result.window.height) {
        setOrientation('landscape');
      } else {
        setOrientation('portrait');
      }
    };

    const subscription = Dimensions.addEventListener('change', onChange);
    
    // Initial orientation check
    const { width, height } = Dimensions.get('window');
    if (width > height) {
      setOrientation('landscape');
    }

    return () => subscription?.remove();
  }, []);

  const toggleOrientation = async () => {
    if (orientation === 'portrait') {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    } else {
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
    }
  };

  const lockPortrait = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
  };

  const lockLandscape = async () => {
    await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  };

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