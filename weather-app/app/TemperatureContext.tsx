import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';

interface TemperatureDisplayProps {
  temperature: number;
  unit: 'C' | 'F';
  onToggleUnit: () => void;
  style?: any;
  showToggle?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const TemperatureDisplay: React.FC<TemperatureDisplayProps> = ({
  temperature,
  unit,
  onToggleUnit,
  style,
  showToggle = true,
  size = 'medium'
}) => {
  const { isDarkTheme } = useTheme();
  
  const convertTemperature = (temp: number, from: 'C' | 'F', to: 'C' | 'F'): number => {
    if (from === to) return temp;
    
    if (from === 'C' && to === 'F') {
      return (temp * 9/5) + 32;
    } else if (from === 'F' && to === 'C') {
      return (temp - 32) * 5/9;
    }
    
    return temp;
  };

  const displayTemp = Math.round(convertTemperature(temperature, 'C', unit));
  
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
      backgroundColor: isDarkTheme ? '#444' : '#f0f0f0',
      marginVertical: 1,
    },
    activeUnit: {
      backgroundColor: '#0066cc',
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
          ]}>
            C
          </Text>
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
          ]}>
            F
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Utility functions for temperature conversion
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

export const formatTemperature = (temp: number, unit: 'C' | 'F'): string => {
  return `${Math.round(temp)}°${unit}`;
};