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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { getStyles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatDate, formatPrecipitation } from './components/WeatherUtils';
import MonthlyCalendarForecast from './MontlyCalendarForecast'; 
import { useTheme } from './ThemeContext';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function Daily() {
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
  const { dailyForecastData, monthlyForecastData, isLoading, errorMsg } = useWeather();
  const [showMonthly, setShowMonthly] = useState(false);

  // Format date for monthly forecast (could be different from daily format)
  const formatMonthlyDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const toggleForecastType = () => {
    setShowMonthly(!showMonthly);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Toggle Button for Forecast Type */}
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
        // 5-Day Forecast Display
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
                    <WeatherIcon weatherId={forecast.weather[0].id} />
                    <View style={styles.forecastTempContainer}>
                      <Text style={styles.forecastTemp}>
                        {Math.round(forecast.main.temp)}°C
                      </Text>
                      <View style={styles.forecastMinMaxContainer}>
                        <Text style={styles.forecastMinMax}>
                          H: {Math.round(forecast.main.temp_max)}° L: {Math.round(forecast.main.temp_min)}°
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.forecastRightColumn}>
                    <Text style={styles.forecastDescription}>
                      {forecast.weather[0].description}
                    </Text>
                    <View style={styles.forecastPrecipitation}>
                      <Feather name="droplet" size={14} color="#1E90FF" />
                      <Text style={styles.forecastPrecipitationText}>
                        {formatPrecipitation(forecast.pop)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Additional Forecast Information */}
          <View style={[styles.forecastContainer, { marginTop: 16 }]}>
            <Text style={styles.forecastTitle}>What to Expect</Text>
            <Text style={styles.forecastInfoText}>
              This 5-day forecast provides a daily summary of expected weather conditions. 
              The temperature shown is the average daily temperature, with highs and lows indicated.
            </Text>
            <Text style={styles.forecastInfoText}>
              Precipitation percentage indicates the likelihood of rain or snow during the day.
            </Text>
          </View>
        </ScrollView>
      ) : showMonthly && monthlyForecastData.length > 0 ? (
        // Monthly Climate Forecast Display
        <MonthlyCalendarForecast />
      ) : (
        // No Data Available
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>
            {showMonthly ? 
              "30-day climate forecast data is not available. This may require a premium API subscription." : 
              "No forecast data available"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}