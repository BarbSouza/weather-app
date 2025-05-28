import React, { useLayoutEffect, useState } from 'react';
import {
  Text, View, ActivityIndicator, ScrollView,
  SafeAreaView, StatusBar, TouchableOpacity,
} from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useNavigation } from 'expo-router';
import { getStyles } from '../styles/styles';
import { useWeather } from '../contexts/WeatherContext';
import { useTheme } from '../contexts/ThemeContext';
import { useTemperature } from '../contexts/TemperatureContext';
import { WeatherIcon, formatDate, formatPrecipitation } from '../components/WeatherUtils';
import MonthlyCalendarForecast from './MontlyCalendarForecast';

/**
 * Daily Weather Forecast Screen
 * Displays either a 5-day weather forecast or 30-day climate forecast
 * Features:
 * - Toggle between 5-day and 30-day views
 * - Temperature unit conversion
 * - Detailed daily weather information
 * - Precipitation probability
 */
export default function Daily() {
  const { isDarkTheme } = useTheme();
  const { unit } = useTemperature();
  const navigation = useNavigation();
  const styles = getStyles(isDarkTheme);
  const iconColor = isDarkTheme ? '#F1F5F9' : '#333';
  
  const {
    dailyForecastData,
    monthlyForecastData,
    isLoading,
    errorMsg,
    weatherData
  } = useWeather();
  
  const [showMonthly, setShowMonthly] = useState(false);

  /**
   * Converts temperature to selected unit (C/F)
   * @param temp - Temperature in Celsius
   * @returns Rounded temperature in selected unit
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
        <StatusBar barStyle="light-content" />

        {weatherData && (
          <View style={styles.locationHeaderContainer}>
            <Text style={styles.locationHeaderText}>
              {weatherData.name}, {weatherData.sys.country}
            </Text>
          </View>
        )}

        {/* Forecast Type Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              !showMonthly && styles.toggleButtonActive,
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
            ]}
            onPress={() => setShowMonthly(false)}
          >
            <Text style={[
              styles.toggleButtonText,
              !showMonthly && styles.toggleButtonTextActive
            ]}>5-Day Forecast</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.toggleButton,
              showMonthly && styles.toggleButtonActive,
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
            ]}
            onPress={() => setShowMonthly(true)}
          >
            <Text style={[
              styles.toggleButtonText,
              showMonthly && styles.toggleButtonTextActive
            ]}>30-Day Climate</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0066cc" />
            <Text style={styles.loadingText}>Loading forecast data...</Text>
          </View>
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : !showMonthly && dailyForecastData.length > 0 ? (
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>Daily Forecast</Text>
              {dailyForecastData.map((forecast, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{formatDate(forecast.dt)}</Text>
                  <View style={styles.forecastDetails}>
                    <View style={styles.forecastIconTemp}>
                      <WeatherIcon weatherId={forecast.weather[0].id} size={35} />
                      <View style={styles.forecastTempContainer}>
                        <Text style={styles.forecastTemp}>
                          {convertTemp(forecast.main.temp)}°{getTempUnit()}
                        </Text>
                        <View style={styles.forecastMinMaxContainer}>
                          <Text style={styles.forecastMinMax}>
                            H: {convertTemp(forecast.main.temp_max)}° L: {convertTemp(forecast.main.temp_min)}°
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.forecastRightColumn}>
                      <Text style={styles.forecastDescription}>
                        {forecast.weather[0].description}
                      </Text>
                      <View style={styles.forecastPrecipitation}>
                        <Feather name="droplet" size={15} color="#1E90FF" />
                        <Text style={styles.forecastPrecipitationText}>
                          {formatPrecipitation(forecast.pop)}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>

            <View style={[styles.forecastContainer, { marginTop: 16 }]}>
              <Text style={styles.forecastTitle}>What to Expect</Text>
              <Text style={styles.forecastInfoText}>
                This 5-day forecast provides a daily summary of expected weather conditions. 
                The temperature shown is the average daily temperature, with highs and lows indicated.
              </Text>
              <Text style={styles.forecastInfoText}>
                Precipitation percentage indicates the likelihood of rain or snow during the day.
                {unit === 'F' ? ' Temperatures are shown in Fahrenheit.' : ' Temperatures are shown in Celsius.'}
              </Text>
            </View>
          </ScrollView>
        ) : showMonthly && monthlyForecastData.length > 0 ? (
          <MonthlyCalendarForecast />
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>
              {showMonthly 
                ? "30-day climate forecast data is not available. This may require a premium API subscription." 
                : "No forecast data available"}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}