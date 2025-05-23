import React, { useState } from 'react';
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Keyboard,
  FlatList
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getStyles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatHour, formatDate, formatPrecipitation } from './components/WeatherUtils';
import SearchHistory from './SearchHistory';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from './ThemeContext';
import { TemperatureDisplay } from './components/TemperatureDisplay';
import { useTemperature } from './TemperatureContext';

export default function Home() {
  const { isDarkTheme, toggleTheme } = useTheme();
  const { unit, toggleUnit, formatTemp } = useTemperature();
  const navigation = useNavigation();

  const styles = getStyles(isDarkTheme);
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
    lastUpdated
  } = useWeather();

  // Updated renderHourlyItem with temperature formatting
  const renderHourlyItem = ({ item }: { item: any }) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{formatHour(item.dt)}</Text>
      <WeatherIcon weatherId={item.weather[0].id} size={22} />
      <Text style={styles.hourlyTemp}>{formatTemp(item.temp)}</Text>
      <View style={styles.precipContainer}>
        <Feather name="droplet" size={12} color="#1E90FF" />
        <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
      </View>
    </View>
  );

  // Updated renderDailyItem with temperature formatting
  const renderDailyItem = ({ item }: { item: any }) => (
    <View style={styles.dailyItem}>
      <Text style={styles.dailyDay}>{formatDate(item.dt)}</Text>
      <WeatherIcon weatherId={item.weather[0].id} size={22} />
      <View style={styles.dailyTempContainer}>
        <Text style={styles.dailyTemp}>{formatTemp(item.main.temp)}</Text>
        <View style={styles.precipContainer}>
          <Feather name="droplet" size={12} color="#1E90FF" />
          <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
        </View>
      </View>
    </View>
  );

  // Format the last updated time
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
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for a city"
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#888"
          onSubmitEditing={handleSearchLocation}
          onFocus={() => setShowSearchHistory(true)}
        />
        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={handleSearchLocation}
        >
          <Feather name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      {/* Search History Popup */}
      <SearchHistory
        visible={showSearchHistory}
        history={searchHistory}
        onSelectItem={handleSelectHistoryItem}
        onClearHistory={handleClearSearchHistory}
        onDismiss={() => setShowSearchHistory(false)}
      />
      
      <TouchableOpacity 
        style={styles.locationButton} 
        onPress={handleGetCurrentLocation}
      >
        <Feather name="map-pin" size={18} color="#fff" />
        <Text style={styles.locationButtonText}>Current Location</Text>
      </TouchableOpacity>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading weather data...</Text>
        </View>
      ) : errorMsg ? (
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
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          onScrollBeginDrag={Keyboard.dismiss}
        >
          {/* Current Weather */}
          <View style={styles.currentWeatherContainer}>
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
                  <Feather name="wind" size={18} color="#555" />
                  <Text style={styles.weatherDetailText}>{weatherData.wind.speed} m/s</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <Feather name="droplet" size={18} color="#555" />
                  <Text style={styles.weatherDetailText}>{weatherData.main.humidity}%</Text>
                </View>
                <View style={styles.weatherDetail}>
                  <MaterialCommunityIcons name="thermometer" size={18} color="#555" />
                  <Text style={styles.weatherDetailText}>
                    {formatTemp(weatherData.main.temp_min)}/{formatTemp(weatherData.main.temp_max)}
                  </Text>
                </View>
              </View>
              <View style={styles.feelsLikeContainer}>
                <MaterialCommunityIcons name="thermometer-lines" size={18} color="#555" />
                <Text style={styles.feelsLikeText}>
                  Feels like {formatTemp(weatherData.main.feels_like)}
                </Text>
              </View>
              {lastUpdated && (
                <Text style={styles.lastUpdatedText}>{formatLastUpdated()}</Text>
              )}
            </View>
          </View>

          {/* Hourly Forecast Preview */}
          <View style={styles.hourlyForecastContainer}>
            <Text style={styles.forecastTitle}>Hourly Forecast</Text>
            <FlatList
              data={hourlyForecastData.slice(0, 8)}
              renderItem={renderHourlyItem}
              keyExtractor={(item) => item.dt.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyForecastList}
            />
          </View>

          {/* Daily Forecast Preview */}
          <View style={styles.dailyForecastContainer}>
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
            <FlatList
              data={dailyForecastData.slice(0, 5)}
              renderItem={renderDailyItem}
              keyExtractor={(item) => item.dt.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.dailyForecastList}
            />
          </View>
          
          {/* Refresh button at the bottom */}
          <TouchableOpacity 
            style={styles.refreshContainer}
            onPress={() => {
              weatherData && handleSelectHistoryItem(weatherData.name);
            }}
          >
            <Feather name="refresh-cw" size={16} color="#0066cc" />
            <Text style={styles.refreshText}>Refresh Weather</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="weather-cloudy" size={80} color="#888" style={styles.emptyStateIcon} />
          <Text style={styles.emptyStateText}>No Weather Data</Text>
          <Text style={styles.emptyStateDescription}>
            Search for a location or use your current location to view weather information.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}