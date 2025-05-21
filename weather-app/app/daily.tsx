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
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list'); // Add this state variable

  // Format date for monthly forecast (could be different from daily format)
  const formatMonthlyDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const toggleForecastType = () => {
    setShowMonthly(!showMonthly);
    // Reset to list view when switching forecast types
    setViewMode('list');
  };

  // Toggle between list and calendar views for monthly forecast
  const toggleMonthlyViewMode = () => {
    setViewMode(viewMode === 'list' ? 'calendar' : 'list');
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

      {/* Show View Toggle Button only for Monthly Forecast */}
      {showMonthly && monthlyForecastData.length > 0 && (
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'list' && styles.toggleButtonActive,
              { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 }
            ]}
            onPress={() => setViewMode('list')}
          >
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'list' && styles.toggleButtonTextActive
            ]}>List View</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              viewMode === 'calendar' && styles.toggleButtonActive,
              { borderTopRightRadius: 8, borderBottomRightRadius: 8 }
            ]}
            onPress={() => setViewMode('calendar')}
          >
            <Text style={[
              styles.toggleButtonText,
              viewMode === 'calendar' && styles.toggleButtonTextActive
            ]}>Calendar View</Text>
          </TouchableOpacity>
        </View>
      )}

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
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
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
        viewMode === 'calendar' ? (
          // Calendar View
          <MonthlyCalendarForecast />
        ) : (
          // List View (original display)
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
          >
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>30-Day Climate Forecast</Text>
              
              {monthlyForecastData.map((forecast, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{formatMonthlyDate(forecast.dt)}</Text>
                  <View style={styles.forecastDetails}>
                    <View style={styles.forecastIconTemp}>
                      {forecast.weather && forecast.weather[0]?.id ? (
                        <WeatherIcon weatherId={forecast.weather[0].id} />
                      ) : (
                        <MaterialCommunityIcons name="calendar-month" size={42} color="#D3D3D3" />
                      )}
                      <View style={styles.forecastTempContainer}>
                        <Text style={styles.forecastTemp}>
                          {Math.round(forecast.temp.average)}°C
                        </Text>
                        <View style={styles.forecastMinMaxContainer}>
                          <Text style={styles.forecastMinMax}>
                            H: {Math.round(forecast.temp.max)}° L: {Math.round(forecast.temp.min)}°
                          </Text>
                        </View>
                      </View>
                    </View>
                    <View style={styles.forecastRightColumn}>
                      <Text style={styles.forecastDescription}>
                        {forecast.weather && forecast.weather[0]?.description ? 
                          forecast.weather[0].description : 'Climate prediction'}
                      </Text>

                      <View style={styles.forecastPrecipitation}>
                        <MaterialCommunityIcons name="water-percent" size={14} color="#1E90FF" />
                        <Text style={[styles.forecastPrecipitationText, {color: '#1E90FF'}]}>
                          {forecast.humidity}%
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Additional Monthly Forecast Information */}
            <View style={[styles.forecastContainer, { marginTop: 16 }]}>
              <Text style={styles.forecastTitle}>About Monthly Climate</Text>
              <Text style={styles.forecastInfoText}>
                The 30-day climate forecast provides expected average temperatures and precipitation over a longer period.
                This forecast represents climate trends rather than specific daily weather events.
              </Text>
              <Text style={styles.forecastInfoText}>
                Monthly forecasts are best used for general planning and understanding seasonal climate patterns.
                Accuracy tends to decrease for predictions further into the future.
              </Text>
            </View>
          </ScrollView>
        )
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