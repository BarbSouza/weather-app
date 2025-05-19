import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TextInput, 
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Keyboard,
  TouchableWithoutFeedback
} from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// TypeScript interfaces
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
  };
  weather: {
    id: number;
    description: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
  };
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
  };
  weather: {
    id: number;
    description: string;
  }[];
}

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [forecastData, setForecastData] = useState<ForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Replace with your actual API key from OpenWeatherMap
  const WEATHER_API_KEY = 'ddde560ae7ec6510c8d92298fc9da08f';
  const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      setIsLoading(true);
      try {
        const location = await Location.getCurrentPositionAsync({});
        setLocation(location);
        await fetchWeatherData(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        setErrorMsg('Could not fetch weather data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const fetchWeatherData = async (latitude: number, longitude: number) => {
    try {
      setIsLoading(true);
      
      // Fetch current weather
      const weatherResponse = await axios.get<WeatherData>(
        `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      // Fetch 5-day forecast
      const forecastResponse = await axios.get(
        `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      setWeatherData(weatherResponse.data);
      
      // Process forecast data to get one forecast per day
      const dailyForecasts = processForecastData(forecastResponse.data.list);
      setForecastData(dailyForecasts);
      
      setErrorMsg(null);
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setErrorMsg('Failed to fetch weather data');
    } finally {
      setIsLoading(false);
    }
  };

  const processForecastData = (forecastList: ForecastItem[]): ForecastItem[] => {
    const dailyData: Record<string, ForecastItem> = {};
    
    forecastList.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      // Only keep one forecast per day (noon)
      if (!dailyData[date] || 
          Math.abs(new Date(item.dt * 1000).getHours() - 12) < 
          Math.abs(new Date(dailyData[date].dt * 1000).getHours() - 12)) {
        dailyData[date] = item;
      }
    });
    
    return Object.values(dailyData).slice(0, 5);
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      
      const response = await axios.get(
        `${WEATHER_BASE_URL}/weather?q=${searchQuery}&units=metric&appid=${WEATHER_API_KEY}`
      );
      
      const { lat, lon } = response.data.coord;
      await fetchWeatherData(lat, lon);
      setSearchQuery('');
    } catch (error) {
      console.error('Error searching location:', error);
      Alert.alert('Error', 'Location not found. Please try another search.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      await fetchWeatherData(location.coords.latitude, location.coords.longitude);
    } catch (error) {
      setErrorMsg('Could not fetch current location');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const getWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) {
      return <MaterialCommunityIcons name="weather-lightning" size={42} color="#FFD700" />;
    } else if (weatherId >= 300 && weatherId < 400) {
      return <MaterialCommunityIcons name="weather-pouring" size={42} color="#87CEFA" />;
    } else if (weatherId >= 500 && weatherId < 600) {
      return <MaterialCommunityIcons name="weather-rainy" size={42} color="#1E90FF" />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <MaterialCommunityIcons name="weather-snowy" size={42} color="#FFFFFF" />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <MaterialCommunityIcons name="weather-fog" size={42} color="#778899" />;
    } else if (weatherId === 800) {
      return <MaterialCommunityIcons name="weather-sunny" size={42} color="#FFD700" />;
    } else if (weatherId >= 801 && weatherId < 900) {
      return <MaterialCommunityIcons name="weather-cloudy" size={42} color="#D3D3D3" />;
    } else {
      return <MaterialCommunityIcons name="weather-cloudy" size={42} color="#D3D3D3" />;
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search for a city"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#888"
            onSubmitEditing={searchLocation}
          />
          <TouchableOpacity style={styles.searchButton} onPress={searchLocation}>
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
                  {getWeatherIcon(weatherData.weather[0].id)}
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
                    <Feather name="thermometer" size={18} color="#555" />
                    <Text style={styles.weatherDetailText}>
                      {Math.round(weatherData.main.temp_min)}°/{Math.round(weatherData.main.temp_max)}°
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Forecast */}
            <View style={styles.forecastContainer}>
              <Text style={styles.forecastTitle}>Next 5-Day Forecast</Text>
              {forecastData.map((forecast, index) => (
                <View key={index} style={styles.forecastItem}>
                  <Text style={styles.forecastDay}>{formatDate(forecast.dt)}</Text>
                  <View style={styles.forecastDetails}>
                    <View style={styles.forecastIconTemp}>
                      {getWeatherIcon(forecast.weather[0].id)}
                      <Text style={styles.forecastTemp}>
                        {Math.round(forecast.main.temp)}°C
                      </Text>
                    </View>
                    <Text style={styles.forecastDescription}>
                      {forecast.weather[0].description}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        ) : (
          <View style={styles.noDataContainer}>
            <Text style={styles.noDataText}>Search for a location or allow location access to see weather data</Text>
          </View>
        )}
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 10,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchButton: {
    width: 46,
    height: 46,
    backgroundColor: '#0066cc',
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  locationButton: {
    flexDirection: 'row',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  locationButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#d32f2f',
    textAlign: 'center',
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  currentWeatherContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  locationName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  currentWeatherContent: {
    alignItems: 'center',
  },
  temperatureContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  temperature: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
  },
  weatherDescription: {
    fontSize: 18,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 15,
  },
  weatherDetailsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 10,
  },
  weatherDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  weatherDetailText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  forecastContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  forecastTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  forecastItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  forecastDay: {
    fontSize: 16,
    color: '#333',
    width: '30%',
  },
  forecastDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '68%',
  },
  forecastIconTemp: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 5,
    width: 50,
  },
  forecastDescription: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    textAlign: 'right',
    width: '50%',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});