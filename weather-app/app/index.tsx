import React, { useLayoutEffect, useState } from 'react';
import {
  Text, View, TextInput, TouchableOpacity, ActivityIndicator,
  ScrollView, SafeAreaView, StatusBar, Keyboard, FlatList, Platform
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getStyles } from './styles/styles';
import { useWeather } from './contexts/WeatherContext';
import { WeatherIcon, formatHour, formatDate, formatPrecipitation } from './components/WeatherUtils';
import SearchHistory from './components/SearchHistory';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from './contexts/ThemeContext'; 
import { LinearGradient } from 'expo-linear-gradient';
import { TemperatureDisplay } from './components/TemperatureDisplay';
import { useTemperature } from './contexts/TemperatureContext';
import { WeatherBackground } from './components/WeatherBackground';
import { ResponsiveLayout, ResponsiveSection } from './components/ResponsiveLayout';
import { useOrientation } from './components/OrientationHandler';

 /**
 * Main weather application component that displays current weather,
 * hourly forecast, and daily forecast information.
 * 
 * Features:
 * - Current weather display
 * - Location search with suggestions
 * - Search history
 * - Hourly and 5-day forecast
 * - Responsive layout for portrait/landscape
 * - Dark/light theme support
 * - Temperature unit toggle
 */
export default function Home() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const { unit, toggleUnit, formatTemp } = useTemperature();
  const { isLandscape, isPortrait } = useOrientation();
  const navigation = useNavigation();
  const styles = getStyles(isDarkTheme);
  const iconColor = isDarkTheme ? '#F1F5F9' : '#333';

  // Weather context values and handlers
  const {
    weatherData,
    hourlyForecastData,
    dailyForecastData,
    isLoading, 
    errorMsg, 
    searchQuery, 
    setSearchQuery, 
    handleSearchLocation, 
    handleGetCurrentLocation,
    searchHistory,
    showSearchHistory,
    setShowSearchHistory,
    handleSelectHistoryItem,
    handleClearSearchHistory,
    lastUpdated,
    citySuggestions,
    isLoadingSuggestions,
    showSuggestions,
    handleSearchInputChange,
    handleSelectSuggestion
  } = useWeather();

  /**
   * Renders an individual hourly forecast item
   * @param {Object} param0 - Destructured item object containing forecast data
   */
  const renderHourlyItem = ({ item }: { item: any }) => (
    <View style={[styles.hourlyItem, isLandscape && { width: 80 }]}>
      <Text style={styles.hourlyTime}>{formatHour(item.dt)}</Text>
      <WeatherIcon weatherId={item.weather[0].id} size={22} />
      <Text style={styles.hourlyTemp}>{formatTemp(item.temp)}</Text>
      <View style={styles.precipContainer}>
        <Feather name="droplet" size={15} color="#1E90FF" />
        <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
      </View>
    </View>
  );

  /**
   * Renders an individual daily forecast item
   * @param {Object} param0 - Destructured item object containing forecast data
   */
  const renderDailyItem = ({ item }: { item: any }) => (
    <View style={[styles.dailyItem, isLandscape && { width: 120 }]}>
      <Text style={styles.dailyDay}>{formatDate(item.dt)}</Text>
      <WeatherIcon weatherId={item.weather[0].id} size={22} />
      <View style={styles.dailyTempContainer}>
        <Text style={styles.dailyTemp}>{formatTemp(item.main.temp)}</Text>
        <View style={styles.precipContainer}>
          <Feather name="droplet" size={15} color="#1E90FF" />
          <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
        </View>
      </View>
    </View>
  );

  /**
   * Formats the last updated time into a human-readable string
   * @returns {string} Formatted time string (e.g., "Updated 5 minutes ago")
   */
  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastUpdated.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Updated just now';
    if (diffMins === 1) return 'Updated 1 minute ago';
    if (diffMins < 60) return `Updated ${diffMins} minutes ago`;
    
    const hours = Math.floor(diffMins / 60);
    if (hours === 1) return 'Updated 1 hour ago';
    return `Updated ${hours} hours ago`;
  };

  return (
    <LinearGradient 
      colors={isDarkTheme ? ['#277ea5', '#0d0f12'] : ['#7fd7ff', '#fff']}
      start={{ x: 0.4, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.container} 
    >
      {/* Background weather effects */}
      {weatherData && (
        <WeatherBackground 
          weatherId={weatherData.weather[0].id} 
          isDarkTheme={isDarkTheme} 
        />
      )}
      
      {/* Main content sections */}
      {/* Search interface */}
      <View style={[
        styles.searchContainer, 
        isLandscape && Platform.OS !== 'web' && { 
          marginVertical: 5,
          maxWidth: 1000,
          alignSelf: 'center'
        }
      ]}>
        <TextInput
          style={[
            styles.searchInput,
            isLandscape && Platform.OS !== 'web' && {
              marginVertical: -15,
              height: 25,
              fontSize: 14
            }
          ]}
          placeholder="Search for a city"
          value={searchQuery}
          onChangeText={handleSearchInputChange}
          placeholderTextColor="#888"
          onSubmitEditing={handleSearchLocation}
          onFocus={() => {
            if (searchQuery.length >= 3) {
              setShowSearchHistory(true);
            } else if (searchHistory.length > 0) {
              setShowSearchHistory(true);
            }
          }}
        />
        <TouchableOpacity 
          style={[
            styles.searchButton,
            isLandscape && Platform.OS !== 'web' && {
              marginVertical: -15,
              width: 25,
              height: 25
            }
          ]} 
          onPress={handleSearchLocation}
        >
          <Feather name="search" size={isLandscape && Platform.OS !== 'web' ? 18 : 22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search History/Suggestions Popup */}
      <SearchHistory
        visible={showSearchHistory}
        history={searchHistory}
        suggestions={citySuggestions}
        isLoadingSuggestions={isLoadingSuggestions}
        showSuggestions={showSuggestions}
        onSelectItem={handleSelectHistoryItem}
        onSelectSuggestion={handleSelectSuggestion}
        onClearHistory={handleClearSearchHistory}
        onDismiss={() => setShowSearchHistory(false)}
      />
      
      <TouchableOpacity 
        style={[
          styles.locationButton, 
          isLandscape && Platform.OS !== 'web' && { 
            marginVertical: 5,
            paddingVertical: 6,
            maxWidth: 300,
            alignSelf: 'center',
            height: 28
          }
        ]} 
        onPress={handleGetCurrentLocation}
      >
        <Feather name="map-pin" size={isLandscape && Platform.OS !== 'web' ? 16 : 18} color="#fff" />
        <Text style={[
          styles.locationButtonText,
          isLandscape && Platform.OS !== 'web' && {
            fontSize: 13
          }
        ]}>Current Location</Text>
      </TouchableOpacity>

      {isLoading ? (
        // Loading state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      ) : errorMsg ? (
        // Error state
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="weather-cloudy-alert" size={60} color="#d32f2f" style={styles.emptyStateIcon} />
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity 
            style={[styles.locationButton, { marginTop: 20 }]} 
            onPress={handleGetCurrentLocation}
          >
            <Feather name="refresh-cw" size={18} color="#fff" />
            <Text style={styles.locationButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : weatherData ? (
        // Weather data display
        <ResponsiveLayout scrollable={true}>
          {/* Current weather section */}
          <ResponsiveSection 
            
            style={styles.currentWeatherContainer}
          >
            <Text style={styles.currentDateTime}>
              {new Date().toLocaleDateString('en-US', { 
              weekday: 'long',
              hour: 'numeric',
              minute: 'numeric',
              })}
            </Text>
            <Text style={styles.locationName}>{weatherData.name}, {weatherData.sys.country}</Text>
            <View style={styles.currentWeatherContent}>
              <View style={styles.temperatureContainer}>
                <WeatherIcon weatherId={weatherData.weather[0].id} />
                <TemperatureDisplay
                  temperature={weatherData.main.temp}
                  unit={unit}
                  onToggleUnit={toggleUnit}
                  size="large"
                />
              </View>

              <Text style={styles.weatherDescription}>{weatherData.weather[0].description}</Text>
              <View style={styles.weatherDetailsContainer}>
                <View style={styles.weatherDetail}>
                  <Feather name="wind" size={20} color={iconColor} />
                  <Text style={styles.weatherDetailText}>{weatherData.wind.speed} m/s</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Feather name="droplet" size={20} color={iconColor} />
                  <Text style={styles.weatherDetailText}>{weatherData.main.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <MaterialCommunityIcons name="thermometer" size={20} color={iconColor} />
                  <Text style={styles.weatherDetailText}>
                    {formatTemp(weatherData.main.temp_min)}/{formatTemp(weatherData.main.temp_max)}
                  </Text>
                </View>
              </View>

              <View style={styles.feelsLikeContainer}>
                <MaterialCommunityIcons name="thermometer-lines" size={18} color={iconColor} />
                <Text style={styles.feelsLikeText}>
                  Feels like {formatTemp(weatherData.main.feels_like)}
                </Text>
              </View>
              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>{formatLastUpdated()}</Text>
              )}
            </View>
          </ResponsiveSection>

          {/* Weather Details Section - Right side in landscape */}
          <ResponsiveSection 
            
          >
            {/* Hourly Forecast */}
            <View style={styles.hourlyForecastContainer}>
              <Text style={styles.forecastTitle}>Hourly Forecast</Text>
              <FlatList
                data={hourlyForecastData.slice(0, isLandscape ? 6 : 8)}
                renderItem={renderHourlyItem}
                keyExtractor={(item) => item.dt.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourlyForecastList}
              />
            </View>

            {/* Daily Forecast */}
            <View style={styles.dailyForecastContainer}>
              <Text style={styles.forecastTitle}>5-Day Forecast</Text>
              <FlatList
                data={dailyForecastData.slice(0, 5)}
                renderItem={renderDailyItem}
                keyExtractor={(item) => item.dt.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.dailyForecastList}
              />
            </View>
            
            {/* Refresh button */}
            <TouchableOpacity 
              style={styles.refreshContainer}
              onPress={() => {
                weatherData && handleSelectHistoryItem(weatherData.name);
              }}
            >
              <Feather name="refresh-cw" size={16} color="#0066cc" />
              <Text style={styles.refreshText}>Refresh Weather</Text>
            </TouchableOpacity>
          </ResponsiveSection>
        </ResponsiveLayout>
      ) : (
        // Empty state
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="weather-cloudy" size={80} color="#888" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateText}>No Weather Data</Text>
          <Text style={styles.emptyStateDescription}>
            Search for a location or use your current location to view weather information.
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}