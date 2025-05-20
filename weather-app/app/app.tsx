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
  TouchableWithoutFeedback,
  FlatList
} from 'react-native';
import * as Location from 'expo-location';
import { Feather } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { 
  fetchCurrentWeather, 
  fetchForecast, 
  fetchHourlyForecast,
  searchLocation as apiSearchLocation 
} from './api';

// TypeScript interfaces
interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
    temp_min: number;
    temp_max: number;
    feels_like: number;
    pressure: number;
  };
  weather: {
    id: number;
    description: string;
    icon: string;
  }[];
  wind: {
    speed: number;
  };
  sys: {
    country: string;
    sunrise: number;
    sunset: number;
  };
}

interface ForecastItem {
  dt: number;
  main: {
    temp: number;
    temp_min: number;
    temp_max: number;
    humidity: number;
    feels_like: number;
  };
  weather: {
    id: number;
    description: string;
    icon: string;
  }[];
  pop?: number; // probability of precipitation
}

interface HourlyForecastItem {
  dt: number;
  temp: number;
  weather: {
    id: number;
    description: string;
    icon: string;
  }[];
  pop: number; // probability of precipitation
}

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [dailyForecastData, setDailyForecastData] = useState<ForecastItem[]>([]);
  const [hourlyForecastData, setHourlyForecastData] = useState<HourlyForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [forecastView, setForecastView] = useState<'hourly' | 'daily'>('daily');

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
      
      // Use API functions to fetch data
      const weatherResponse = await fetchCurrentWeather(latitude, longitude);
      const forecastResponse = await fetchForecast(latitude, longitude);
      
      setWeatherData(weatherResponse);
      
      // Process forecast data for daily view
      const dailyForecasts = processForecastData(forecastResponse.list);
      setDailyForecastData(dailyForecasts);
      
      // Add precipitation probability from forecast data if available
        const forecastWithPrecip = dailyForecasts.map(item => {
        const forecast = forecastResponse.list.find((f: any) => 
            new Date(f.dt * 1000).toDateString() === new Date(item.dt * 1000).toDateString()
        );
        
        return {
            ...item,
            pop: forecast?.pop || 0
        };
        });
        setDailyForecastData(forecastWithPrecip);
      
      // Generate hourly data from regular forecast endpoints
      // Since OneCall API might require a subscription or have other issues
      const hourlyForecasts = generateHourlyData(forecastResponse.list);
      setHourlyForecastData(hourlyForecasts);
      
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

  const processHourlyData = (hourlyList: HourlyForecastItem[]): HourlyForecastItem[] => {
    // Return the next 24 hours of forecast data
    return hourlyList.slice(0, 24);
  };

  const generateHourlyData = (forecastList: ForecastItem[]): HourlyForecastItem[] => {
    // Extract the next 24 hours from the 3-hourly forecast data
    const next24Hours = forecastList.slice(0, 8); // 8 items * 3 hours = 24 hours

    // Convert to the expected hourly data format
    return next24Hours.map(item => ({
      dt: item.dt,
      temp: item.main.temp,
      weather: item.weather,
      pop: item.pop || 0
    }));
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      setIsLoading(true);
      Keyboard.dismiss();
      
      // Use API function
      const response = await apiSearchLocation(searchQuery);
      
      const { lat, lon } = response.coord;
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

  const getSmallWeatherIcon = (weatherId: number) => {
    if (weatherId >= 200 && weatherId < 300) {
      return <MaterialCommunityIcons name="weather-lightning" size={22} color="#FFD700" />;
    } else if (weatherId >= 300 && weatherId < 400) {
      return <MaterialCommunityIcons name="weather-pouring" size={22} color="#87CEFA" />;
    } else if (weatherId >= 500 && weatherId < 600) {
      return <MaterialCommunityIcons name="weather-rainy" size={22} color="#1E90FF" />;
    } else if (weatherId >= 600 && weatherId < 700) {
      return <MaterialCommunityIcons name="weather-snowy" size={22} color="#FFFFFF" />;
    } else if (weatherId >= 700 && weatherId < 800) {
      return <MaterialCommunityIcons name="weather-fog" size={22} color="#778899" />;
    } else if (weatherId === 800) {
      return <MaterialCommunityIcons name="weather-sunny" size={22} color="#FFD700" />;
    } else if (weatherId >= 801 && weatherId < 900) {
      return <MaterialCommunityIcons name="weather-cloudy" size={22} color="#D3D3D3" />;
    } else {
      return <MaterialCommunityIcons name="weather-cloudy" size={22} color="#D3D3D3" />;
    }
  };

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatHour = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
  };

  const formatPrecipitation = (pop?: number): string => {
    if (pop === undefined) return '0%';
    return `${Math.round(pop * 100)}%`;
  };

  const renderHourlyItem = ({ item }: { item: HourlyForecastItem }) => (
    <View style={styles.hourlyItem}>
      <Text style={styles.hourlyTime}>{formatHour(item.dt)}</Text>
      {getSmallWeatherIcon(item.weather[0].id)}
      <Text style={styles.hourlyTemp}>{Math.round(item.temp)}°C</Text>
      <View style={styles.precipContainer}>
        <Feather name="droplet" size={12} color="#1E90FF" />
        <Text style={styles.precipText}>{formatPrecipitation(item.pop)}</Text>
      </View>
    </View>
  );

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

            {/* Hourly Forecast */}
            <View style={styles.hourlyForecastContainer}>
              <Text style={styles.forecastTitle}>24-Hour Forecast</Text>
              <FlatList
                data={hourlyForecastData}
                renderItem={renderHourlyItem}
                keyExtractor={(item) => item.dt.toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.hourlyForecastList}
              />
            </View>

            {/* Toggle Buttons */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  forecastView === 'daily' && styles.toggleButtonActive
                ]}
                onPress={() => setForecastView('daily')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  forecastView === 'daily' && styles.toggleButtonTextActive
                ]}>
                  Daily
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  forecastView === 'hourly' && styles.toggleButtonActive
                ]}
                onPress={() => setForecastView('hourly')}
              >
                <Text style={[
                  styles.toggleButtonText,
                  forecastView === 'hourly' && styles.toggleButtonTextActive
                ]}>
                  Hourly
                </Text>
              </TouchableOpacity>
            </View>

            {/* Forecast */}
            {forecastView === 'daily' ? (
              <View style={styles.forecastContainer}>
                <Text style={styles.forecastTitle}>5-Day Forecast</Text>
                {dailyForecastData.map((forecast, index) => (
                  <View key={index} style={styles.forecastItem}>
                    <Text style={styles.forecastDay}>{formatDate(forecast.dt)}</Text>
                    <View style={styles.forecastDetails}>
                      <View style={styles.forecastIconTemp}>
                        {getWeatherIcon(forecast.weather[0].id)}
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
            ) : (
              <View style={styles.forecastContainer}>
                <Text style={styles.forecastTitle}>Detailed Hourly Forecast</Text>
                {hourlyForecastData.slice(0, 8).map((hour, index) => (
                  <View key={index} style={styles.hourlyDetailItem}>
                    <View style={styles.hourlyDetailLeft}>
                      <Text style={styles.hourlyDetailTime}>{formatHour(hour.dt)}</Text>
                      {getSmallWeatherIcon(hour.weather[0].id)}
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
                <TouchableOpacity style={styles.showMoreButton}>
                  <Text style={styles.showMoreText}>Show More</Text>
                </TouchableOpacity>
              </View>
            )}
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
  feelsLikeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
  },
  feelsLikeText: {
    fontSize: 14,
    color: '#555',
    marginLeft: 5,
  },
  hourlyForecastContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hourlyForecastList: {
    paddingVertical: 10,
  },
  hourlyItem: {
    alignItems: 'center',
    marginHorizontal: 12,
    width: 60,
  },
  hourlyTime: {
    fontSize: 14,
    color: '#333',
    marginBottom: 8,
  },
  hourlyTemp: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginTop: 6,
    marginBottom: 4,
  },
  precipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  precipText: {
    fontSize: 12,
    color: '#1E90FF',
    marginLeft: 2,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  toggleButtonActive: {
    backgroundColor: '#0066cc',
  },
  toggleButtonText: {
    fontSize: 16,
    color: '#333',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '500',
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
  forecastTempContainer: {
    marginLeft: 8,
  },
  forecastTemp: {
    fontSize: 18,
    fontWeight: '500',
    color: '#333',
  },
  forecastMinMaxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastMinMax: {
    fontSize: 12,
    color: '#666',
  },
  forecastRightColumn: {
    alignItems: 'flex-end',
  },
  forecastDescription: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  forecastPrecipitation: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forecastPrecipitationText: {
    fontSize: 12,
    color: '#1E90FF',
    marginLeft: 4,
  },
  hourlyDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  hourlyDetailLeft: {
    width: '25%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourlyDetailTime: {
    marginRight: 8,
    fontSize: 14,
    color: '#333',
  },
  hourlyDetailCenter: {
    width: '40%',
  },
  hourlyDetailDescription: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  hourlyDetailRight: {
    width: '30%',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  hourlyDetailTemp: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginRight: 10,
  },
  hourlyDetailPrecip: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourlyDetailPrecipText: {
    fontSize: 12,
    color: '#1E90FF',
    marginLeft: 2,
  },
  showMoreButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 10,
  },
  showMoreText: {
    fontSize: 16,
    color: '#0066cc',
    fontWeight: '500',
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