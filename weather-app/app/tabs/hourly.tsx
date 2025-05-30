import React, { useLayoutEffect, useState } from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { getStyles } from '../styles/styles';
import { useWeather } from '../contexts/WeatherContext';
import { WeatherIcon, formatHour, formatPrecipitation } from '../components/WeatherUtils';
import { useTheme } from '../contexts/ThemeContext';
import { useTemperature } from '../contexts/TemperatureContext';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * Hourly Forecast Screen
 * Displays detailed weather predictions for the next 24 hours
 * Features:
 * - Hour-by-hour temperature
 * - Precipitation probability
 * - Weather conditions
 * - Theme-aware styling
 */
export default function Hourly() {
  const { hourlyForecastData, isLoading, errorMsg, weatherData } = useWeather();
  const { isDarkTheme } = useTheme();
  const { unit } = useTemperature();
  const navigation = useNavigation();
  const styles = getStyles(isDarkTheme);

  /**
   * Converts temperature to selected unit
   * @param temp Temperature in Celsius
   * @returns Converted and rounded temperature
   */
  const convertTemp = (temp: number): number => {
    if (unit === 'F') {
      return Math.round((temp * 9/5) + 32);
    }
    return Math.round(temp);
  };

  /**
   * Gets current temperature unit symbol
   */
  const getTempUnit = (): string => unit;

  return (
    <LinearGradient
      colors={isDarkTheme ? ['#277ea5', '#0d0f12'] : ['#7fd7ff', '#fff']}
      start={{ x: 0.4, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>

      {/* Location Header */}
      {weatherData && (
        <View style={styles.locationHeaderContainer}>
          <Text style={styles.locationHeaderText}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>
        </View>
      )}

      {/* Content States */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading hourly forecast...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : hourlyForecastData.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Hourly Forecast List */}
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>Hourly Forecast</Text>
            
            {hourlyForecastData.map((hour, index) => (
              <View key={index} style={styles.hourlyDetailItem}>
                <View style={styles.hourlyDetailLeft}>
                  <Text style={styles.hourlyDetailTime}>{formatHour(hour.dt)}</Text>
                  <WeatherIcon weatherId={hour.weather[0].id} size={22} />
                </View>
                <View style={styles.hourlyDetailCenter}>
                  <Text style={styles.hourlyDetailDescription}>
                    {hour.weather[0].description}
                  </Text>
                </View>
                <View style={styles.hourlyDetailRight}>
                  <Text style={styles.hourlyDetailTemp}>
                    {convertTemp(hour.temp)}°{getTempUnit()}
                  </Text>
                  <View style={styles.hourlyDetailPrecip}>
                    <Feather name="droplet" size={14} color="#1E90FF" />
                    <Text style={styles.hourlyDetailPrecipText}>
                      {formatPrecipitation(hour.pop)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Forecast Information */}
          <View style={[styles.forecastContainer, { marginTop: 16 }]}>
            <Text style={styles.forecastTitle}>About Hourly Forecast</Text>
            <Text style={styles.forecastInfoText}>
              The hourly forecast provides detailed weather predictions for the next 24 hours.
              Temperature readings are in {unit === 'F' ? 'Fahrenheit' : 'Celsius'} and precipitation percentages indicate the 
              likelihood of rain during that hour.
            </Text>
            <Text style={styles.forecastInfoText}>
              Data is updated regularly to ensure accuracy, but weather conditions may change 
              rapidly in some regions.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No hourly forecast data available</Text>
        </View>
      )}
    </SafeAreaView>
   </LinearGradient>
  );
}