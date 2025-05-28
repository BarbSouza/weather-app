import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Props for the temperature display component
 */
interface TemperatureDisplayProps {
  /** Temperature value in Celsius */
  temperature: number;
  /** Current temperature unit (C/F) */
  unit: 'C' | 'F';
  /** Callback for unit toggle */
  onToggleUnit: () => void;
  /** Optional style overrides */
  style?: any;
  /** Whether to show unit toggle buttons */
  showToggle?: boolean;
  /** Size variant of the display */
  size?: 'small' | 'medium' | 'large';
}

/**
 * TemperatureDisplay Component
 * Displays temperature with optional unit toggle
 * Supports different sizes and theme modes
 */
export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  unit,
  onToggleUnit,
  style,
  showToggle = true,
  size = 'medium'
}) => {
  const { isDarkTheme } = useTheme();
  
  /**
   * Converts temperature between Celsius and Fahrenheit
   */
  const convertTemperature = (temp: number, from: 'C' | 'F', to: 'C' | 'F'): number => {
    if (from === to) return temp;
    return from === 'C' ? celsiusToFahrenheit(temp) : fahrenheitToCelsius(temp);
  };

  const displayTemp = Math.round(convertTemperature(temperature, 'C', unit));
  
  /**
   * Dynamic styles based on theme and size
   */
  const getStyles = () => ({
    container: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      ...style,
    },
    temperatureText: {
      fontSize: size === 'large' ? 48 : size === 'medium' ? 32 : 20,
      fontWeight: 'bold' as const,
      color: isDarkTheme ? '#fff' : '#333',
    },
    unitContainer: {
      marginLeft: 4,
      flexDirection: 'column' as const,
      alignItems: 'center' as const,
    },
    unitButton: {
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 12,
      backgroundColor: isDarkTheme ? 'light-grey' : 'white',
      marginVertical: 1,
    },
    activeUnit: {
      backgroundColor: isDarkTheme ? '#0e1114' :'#275772',
    },
    unitText: {
      fontSize: size === 'large' ? 16 : size === 'medium' ? 14 : 12,
      fontWeight: '600' as const,
      color: isDarkTheme ? '#fff' : '#333',
    },
    activeUnitText: {
      color: '#fff',
    },
  });

  const styles = getStyles();

  if (!showToggle) {
    return (
      <View style={styles.container}>
        <Text style={styles.temperatureText}>
          {displayTemp}°{unit}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.temperatureText}>
        {displayTemp}°
      </Text>
      <View style={styles.unitContainer}>
        <TouchableOpacity
          style={[
            styles.unitButton,
            unit === 'C' && styles.activeUnit
          ]}
          onPress={() => unit !== 'C' && onToggleUnit()}
        >
          <Text style={[
            styles.unitText,
            unit === 'C' && styles.activeUnitText
          ]}>C</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.unitButton,
            unit === 'F' && styles.activeUnit
          ]}
          onPress={() => unit !== 'F' && onToggleUnit()}
        >
          <Text style={[
            styles.unitText,
            unit === 'F' && styles.activeUnitText
          ]}>F</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

/**
 * Utility functions for temperature conversion
 */
export const celsiusToFahrenheit = (celsius: number): number => (celsius * 9/5) + 32;

export const fahrenheitToCelsius = (fahrenheit: number): number => (fahrenheit - 32) * 5/9;

export const formatTemperature = (temp: number, unit: 'C' | 'F'): string => 
  `${Math.round(temp)}°${unit}`;