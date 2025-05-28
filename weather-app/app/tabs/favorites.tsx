import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, ActivityIndicator,
  Alert, RefreshControl, StyleSheet,
} from 'react-native';
import { MaterialCommunityIcons, FontAwesome } from '@expo/vector-icons';
import { FavoritesService } from '../services/FavoritesService';
import { searchLocation } from '../services/api';
import { useFocusEffect } from '@react-navigation/native';
import { useTemperature } from '../contexts/TemperatureContext';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Weather data structure for favorite cities
 */
interface WeatherData {
  city: string;
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

/**
 * Favorites Screen Component
 * Displays a list of favorite cities with their current weather information
 * Features:
 * - Pull to refresh
 * - Remove favorites
 * - Auto-refresh on screen focus
 * - Fallback states for loading and errors
 */
const Favorites: React.FC = () => {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [weatherData, setWeatherData] = useState<Record<string, WeatherData>>({});
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { isDarkTheme } = useTheme();
  const { unit } = useTemperature();

  /**
   * Loads favorite cities from persistent storage
   */
  const loadFavorites = useCallback(async () => {
    try {
      const favoriteCities = await FavoritesService.getFavorites();
      setFavorites(favoriteCities);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  }, []);

  /**
   * Fetches current weather data for a single city
   * @param city - City name to fetch weather for
   */
  const fetchCityWeather = async (city: string): Promise<WeatherData | null> => {
    try {
      const unitParam = unit === 'C' ? 'metric' : 'imperial';
      const data = await searchLocation(city, unitParam);
      
      return {
        city: data.name,
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        feelsLike: Math.round(data.main.feels_like),
      };
    } catch (error) {
      console.error(`Error fetching weather for ${city}:`, error);
      return {
        city,
        temperature: 0,
        description: 'data unavailable',
        icon: '01d',
        humidity: 0,
        windSpeed: 0,
        feelsLike: 0,
      };
    }
  };

  /**
   * Fetches weather data for all favorite cities
   * Implements rate limiting to avoid API throttling
   */
  const fetchAllWeatherData = useCallback(async () => {
    if (favorites.length === 0) {
      setWeatherData({});
      return;
    }

    setLoading(true);
    
    try {
      const weatherMap: Record<string, WeatherData> = {};
      for (const city of favorites) {
        const result = await fetchCityWeather(city);
        if (result) {
          weatherMap[city] = result;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      setWeatherData(weatherMap);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    } finally {
      setLoading(false);
    }
  }, [favorites, unit]);

  // Remove from favorites
  const removeFavorite = async (city: string) => {
    Alert.alert('Remove Favorite', `Remove ${city} from favorites?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await FavoritesService.removeFavorite(city);
            setFavorites(prev => prev.filter(fav => fav !== city));
            setWeatherData(prev => {
              const newData = { ...prev };
              delete newData[city];
              return newData;
            });
          } catch (error) {
            Alert.alert('Error', 'Failed to remove favorite');
          }
        },
      },
    ]);
  };

  // Get weather icon name
  const getWeatherIcon = (iconCode: string): keyof typeof MaterialCommunityIcons.glyphMap => {
    const iconMap: Record<string, keyof typeof MaterialCommunityIcons.glyphMap> = {
      '01d': 'weather-sunny',
      '01n': 'weather-night',
      '02d': 'weather-partly-cloudy',
      '02n': 'weather-night-partly-cloudy',
      '03d': 'weather-cloudy',
      '03n': 'weather-cloudy',
      '04d': 'weather-cloudy',
      '04n': 'weather-cloudy',
      '09d': 'weather-rainy',
      '09n': 'weather-rainy',
      '10d': 'weather-rainy',
      '10n': 'weather-rainy',
      '11d': 'weather-lightning',
      '11n': 'weather-lightning',
      '13d': 'weather-snowy',
      '13n': 'weather-snowy',
      '50d': 'weather-fog',
      '50n': 'weather-fog',
    };
    return iconMap[iconCode] || 'weather-cloudy';
  };

  // Refresh data
  const onRefresh = async () => {
    console.log('Refreshing favorites...');
    setRefreshing(true);
    await loadFavorites();
    setRefreshing(false);
  };

  // Load favorites when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Screen focused, loading favorites...');
      loadFavorites();
    }, [loadFavorites])
  );

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  // Fetch weather data when favorites change or unit changes
  useEffect(() => {
    console.log('Favorites or unit changed:', favorites, unit);
    if (favorites.length > 0) {
      fetchAllWeatherData();
    } else {
      setWeatherData({});
    }
  }, [fetchAllWeatherData]);

  /**
   * Renders an individual favorite city item with weather data
   */
  const renderFavoriteItem = ({ item }: { item: string }) => {
    const weather = weatherData[item];
    
    return (
      <View style={[
      styles.favoriteItem,
      { backgroundColor: isDarkTheme ? '#1e293b57' : '#ffffff59' }
    ]}>
        <View style={styles.favoriteLeft}>
         <Text style={[styles.favoriteCityName, { color: isDarkTheme ? 'white' : 'black' }]}>
            {weather ? weather.city : item}
          </Text>
          {weather ? (
            <View style={styles.favoriteWeatherInfo}>
              <View style={styles.favoriteMainInfo}>
                <MaterialCommunityIcons
                  name={getWeatherIcon(weather.icon)}
                  size={40}
                  color={isDarkTheme ? '#71aaac' : '#71aaac'} 
                />
                <View style={styles.favoriteTempContainer}>
                  <Text style={[styles.favoriteTemp, { color: isDarkTheme ? 'white' : 'black' }]}>
                    {weather.temperature}°{unit}
                  </Text>
                  <Text style={[styles.favoriteDescription, { color: isDarkTheme ? 'white' : 'black' }]}>
                    {weather.description}
                  </Text>
                </View>
              </View>
              <View style={styles.favoriteDetails}>
                <Text style={[styles.favoriteDetailText, { color: isDarkTheme ? 'white' : 'black' }]}>
                  Feels like {weather.feelsLike}°{unit}
                </Text>
                <Text style={[styles.favoriteDetailText, { color: isDarkTheme ? 'white' : 'black' }]}>
                  Humidity: {weather.humidity}%
                </Text>
                <Text style={[styles.favoriteDetailText, { color: isDarkTheme ? 'white' : 'black' }]}>
                  Wind: {weather.windSpeed} {unit === 'C' ? 'm/s' : 'mph'}
                </Text>
              </View>
            </View>
          ) : (
           <Text style={[styles.favoriteNoData, { color: isDarkTheme ? 'white' : 'black' }]}>
              {loading ? 'Loading weather...' : 'Weather data unavailable'}
            </Text>
          )}
        </View>
        
        <TouchableOpacity
          onPress={() => removeFavorite(item)}
          style={styles.favoriteRemoveButton}
          activeOpacity={0.7}
        >
          <FontAwesome name="heart" size={24} color="#e91e63" />
        </TouchableOpacity>
      </View>
    );
  };

  /**
   * Wrapper component for consistent gradient background
   */
  const GradientWrapper = ({ children }: { children: React.ReactNode }) => (
    <LinearGradient
      colors={isDarkTheme ? ['#277ea5', '#0d0f12'] : ['#7fd7ff', '#fff']}
      start={{ x: 0.4, y: 0 }}
      end={{ x: 0.4, y: 1 }}
      style={styles.container}
    >
      {children}
    </LinearGradient>
  );

  if (loading && favorites.length > 0 && Object.keys(weatherData).length === 0) {
    return (
      <GradientWrapper>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading favorite cities...</Text>
        </View>
      </GradientWrapper>
    );
  }

  // Empty state
  if (favorites.length === 0) {
    return (
      <GradientWrapper>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons
            name="heart-outline"
            size={80}
            color={isDarkTheme ? '#9CA3AF' : '#ccc'}
            style={styles.emptyStateIcon}
          />
          <Text style={styles.emptyStateText}>No Favorite Cities</Text>
          <Text style={styles.emptyStateDescription}>
            Add cities to your favorites from search history to see their weather here
          </Text>
        </View>
      </GradientWrapper>
    );
  }

  // Main render
  return (
    <GradientWrapper>
      <FlatList
        data={favorites}
        renderItem={renderFavoriteItem}
        keyExtractor={(item) => item}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#0066cc']}
            tintColor="#0066cc"
          />
        }
        contentContainerStyle={styles.favoritesList}
        showsVerticalScrollIndicator={false}
      />
    </GradientWrapper>
  );
};

/**
 * Styles for the Favorites component
 * Supports both light and dark themes
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyStateIcon: {
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 24,
    fontWeight: 'bold',
    
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateDescription: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  favoritesList: {
    padding: 16,
  },
  favoriteItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  favoriteLeft: {
    flex: 1,
  },
  favoriteCityName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  favoriteWeatherInfo: {
    marginTop: 4,
  },
  favoriteMainInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  favoriteTempContainer: {
    marginLeft: 12,
  },
  favoriteTemp: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  favoriteDescription: {
    fontSize: 14,
    textTransform: 'capitalize',
    marginTop: 2,
  },
  favoriteDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  favoriteDetailText: {
    fontSize: 12,
  },
  favoriteNoData: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  favoriteRemoveButton: {
    padding: 8,
  },
});

export default Favorites;
