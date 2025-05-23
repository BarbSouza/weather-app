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
import { getStyles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatHour, formatPrecipitation } from './components/WeatherUtils';
import { useTheme } from './ThemeContext';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function Hourly() {
  const { hourlyForecastData, isLoading, errorMsg } = useWeather();
  const { isDarkTheme, toggleTheme } = useTheme();
  const navigation = useNavigation();
  useLayoutEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
                <FontAwesome5
                    name={isDarkTheme ? 'sun' : 'moon'}
                    size={20}
                    color="#fff"
                />
                </TouchableOpacity>
        ),
    });
  }, [navigation, isDarkTheme]);
  
  const styles = getStyles(isDarkTheme); // Dynamic styles
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

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
                  <Text style={styles.hourlyDetailTemp}>{Math.round(hour.temp)}°C</Text>
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
          
          {/* Additional Information */}
          <View style={[styles.forecastContainer, { marginTop: 16 }]}>
            <Text style={styles.forecastTitle}>About Hourly Forecast</Text>
            <Text style={styles.forecastInfoText}>
              The hourly forecast provides detailed weather predictions for the next 24 hours.
              Temperature readings are in Celsius and precipitation percentages indicate the 
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
  );
}