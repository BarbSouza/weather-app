import React from 'react';
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
import { styles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatHour, formatPrecipitation } from './components/WeatherUtils';

export default function Home() {
  const { 
    weatherData, 
    hourlyForecastData, 
    isLoading, 
    errorMsg, 
    searchQuery, 
    setSearchQuery, 
    handleSearchLocation, 
    handleGetCurrentLocation 
  } = useWeather();

  const renderHourlyItem = ({ item }: { item: any }) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{formatHour(item.dt)}</Text>
      <WeatherIcon weatherId={item.weather[0].id} size={22} />
      <Text style={styles.hourlyTemp}>{Math.round(item.temp)}°C</Text>
      <View style={styles.precipContainer}>
        <Feather name="droplet" size={12} color="#1E90FF" />
        <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
      </View>
    </View>
  );

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
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearchLocation}>
          <Feather name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.locationButton} onPress={handleGetCurrentLocation}>
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
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : weatherData ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Current Weather */}
          <View style={styles.currentWeatherContainer}>
            <Text style={styles.locationName}>{weatherData.name}, {weatherData.sys.country}</Text>
            <View style={styles.currentWeatherContent}>
              <View style={styles.temperatureContainer}>
                <WeatherIcon weatherId={weatherData.weather[0].id} />
                <Text style={styles.temperature}>{Math.round(weatherData.main.temp)}°C</Text>
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
                    {Math.round(weatherData.main.temp_min)}°/{Math.round(weatherData.main.temp_max)}°
                  </Text>
                </View>
              </View>
              <View style={styles.feelsLikeContainer}>
                <MaterialCommunityIcons name="thermometer-lines" size={18} color="#555" />
                <Text style={styles.feelsLikeText}>
                  Feels like {Math.round(weatherData.main.feels_like)}°C
                </Text>
              </View>
            </View>
          </View>

          {/* Hourly Forecast Preview */}
          <View style={styles.hourlyForecastContainer}>
            <Text style={styles.forecastTitle}>24-Hour Forecast</Text>
            <FlatList
              data={hourlyForecastData.slice(0, 8)}
              renderItem={renderHourlyItem}
              keyExtractor={(item) => item.dt.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hourlyForecastList}
            />
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>Search for a location or allow location access to see weather data</Text>
        </View>
      )}
    </SafeAreaView>
  );
}