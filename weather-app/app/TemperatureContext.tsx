import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type TemperatureUnit = 'C' | 'F';

interface TemperatureContextType {
  unit: TemperatureUnit;
  toggleUnit: () => void;
  setUnit: (unit: TemperatureUnit) => void;
  convertTemp: (temp: number, fromUnit?: TemperatureUnit) => number;
  formatTemp: (temp: number, fromUnit?: TemperatureUnit, showUnit?: boolean) => string;
}

const TemperatureContext = createContext<TemperatureContextType | undefined>(undefined);

interface TemperatureProviderProps {
  children: ReactNode;
}

export const TemperatureProvider: React.FC<TemperatureProviderProps> = ({ children }) => {
  const [unit, setUnitState] = useState<TemperatureUnit>('C');

  // Load saved temperature unit preference
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

  // Save temperature unit preference
  const setUnit = async (newUnit: TemperatureUnit) => {
    try {
      await AsyncStorage.setItem('temperatureUnit', newUnit);
      setUnitState(newUnit);
    } catch (error) {
      console.error('Error saving temperature unit:', error);
      setUnitState(newUnit); // Still update the state even if saving fails
    }
  };

  const toggleUnit = () => {
    const newUnit = unit === 'C' ? 'F' : 'C';
    setUnit(newUnit);
  };

  // Convert temperature from Celsius (API default) to current unit
  const convertTemp = (temp: number, fromUnit: TemperatureUnit = 'C'): number => {
    if (fromUnit === unit) return temp;
    
    if (fromUnit === 'C' && unit === 'F') {
      return (temp * 9/5) + 32;
    } else if (fromUnit === 'F' && unit === 'C') {
      return (temp - 32) * 5/9;
    }
    
    return temp;
  };

  // Format temperature with unit
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

export const useTemperature = (): TemperatureContextType => {
  const context = useContext(TemperatureContext);
  if (!context) {
    throw new Error('useTemperature must be used within a TemperatureProvider');
  }
  return context;
};