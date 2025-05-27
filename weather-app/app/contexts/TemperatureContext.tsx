import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Temperature units supported by the application */
type TemperatureUnit = 'C' | 'F';

/** 
 * Temperature context interface
 * Provides temperature unit management and conversion utilities
 */
interface TemperatureContextType {
  /** Current temperature unit (Celsius or Fahrenheit) */
  unit: TemperatureUnit;
  /** Toggles between Celsius and Fahrenheit */
  toggleUnit: () => void;
  /** Sets temperature unit directly */
  setUnit: (unit: TemperatureUnit) => void;
  /** Converts temperature between units */
  convertTemp: (temp: number, fromUnit?: TemperatureUnit) => number;
  /** Formats temperature with unit symbol */
  formatTemp: (temp: number, fromUnit?: TemperatureUnit, showUnit?: boolean) => string;
}

/** Temperature context for managing temperature unit preferences */
const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined);

/** Props for the TemperatureProvider component */
interface TemperatureProviderProps {
  children: ReactNode;
}

/**
 * Temperature Provider Component
 * Manages temperature unit preferences and provides conversion utilities
 */
export const TemperatureProvider: React.FC<TemperatureProviderProps> = ({ children }) => {
  const [unit, setUnitState] = useState<TemperatureUnit>('C');

  /** Load saved temperature unit preference from storage */
  useEffect(() => {
    const loadTemperatureUnit = async () => {
      try {
        const savedUnit = await AsyncStorage.getItem('temperatureUnit');
        if (savedUnit === 'C' || savedUnit === 'F') {
          setUnitState(savedUnit);
        }
      } catch (error) {
        console.error('Error loading temperature unit:', error);
      }
    };

    loadTemperatureUnit();
  }, []);

  /** 
   * Sets and persists temperature unit preference
   * @param newUnit - Temperature unit to set
   */
  const setUnit = async (newUnit: TemperatureUnit) => {
    try {
      await AsyncStorage.setItem('temperatureUnit', newUnit);
      setUnitState(newUnit);
    } catch (error) {
      console.error('Error saving temperature unit:', error);
      setUnitState(newUnit);
    }
  };

  /** Toggles between Celsius and Fahrenheit */
  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
  };

  /** 
   * Converts temperature between units
   * @param temp - Temperature value to convert
   * @param fromUnit - Source unit (defaults to Celsius)
   * @returns Converted temperature value
   */
  const convertTemp = (temp: number, fromUnit: TemperatureUnit = 'C'): number => {
    if (fromUnit === unit) return temp;
    
    if (fromUnit === 'C' && unit === 'F') {
      return (temp * 9/5) + 32;
    } else if (fromUnit === 'F' && unit === 'C') {
      return (temp - 32) * 5/9;
    }
    
    return temp;
  };

  /** 
   * Formats temperature with unit symbol
   * @param temp - Temperature value to format
   * @param fromUnit - Source unit (defaults to Celsius)
   * @param showUnit - Whether to include unit symbol
   * @returns Formatted temperature string
   */
  const formatTemp = (temp: number, fromUnit: TemperatureUnit = 'C', showUnit: boolean = true): string => {
    const convertedTemp = Math.round(convertTemp(temp, fromUnit));
    return showUnit ? `${convertedTemp}°${unit}` : `${convertedTemp}°`;
  };

  const value: TemperatureContextType = {
    unit,
    toggleUnit,
    setUnit,
    convertTemp,
    formatTemp,
  };

  return (
    <TemperatureContext.Provider value={value}>
      {children}
    </TemperatureContext.Provider>
  );
};

/**
 * Hook for accessing temperature context
 * Must be used within a TemperatureProvider component
 * @throws Error if used outside of TemperatureProvider
 */
export const useTemperature = (): TemperatureContextType => {
  const context = useContext(TemperatureContext);
  if (!context) {
    throw new Error('useTemperature must be used within a TemperatureProvider');
  }
  return context;
};