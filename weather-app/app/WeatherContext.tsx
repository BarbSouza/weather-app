import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { 
  fetchCurrentWeather, 
  fetchForecast,
  searchLocation as apiSearchLocation
} from './api';
import { SearchHistoryService } from './SearchHistoryService';


// TypeScript interfaces
export interface WeatherData {
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

interface ApiError {
  response?: {
    status: number;
    data?: any;
  };
  isAxiosError?: boolean;
}

export interface ForecastItem {
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

export interface HourlyForecastItem {
  dt: number;
  temp: number;
  weather: {
    id: number;
    description: string;
    icon: string;
  }[];
  pop: number; // probability of precipitation
}

interface WeatherContextType {
  weatherData: WeatherData | null;
  dailyForecastData: ForecastItem[];
  hourlyForecastData: HourlyForecastItem[];
  isLoading: boolean;
  errorMsg: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearchLocation: () => Promise<void>;
  handleGetCurrentLocation: () => Promise<void>;
  searchHistory: string[];
  showSearchHistory: boolean;
  setShowSearchHistory: (show: boolean) => void;
  handleSelectHistoryItem: (query: string) => Promise<void>;
  handleClearSearchHistory: () => Promise<void>;
  lastUpdated: Date | null;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [dailyForecastData, setDailyForecastData] = useState<ForecastItem[]>([]);
  const [hourlyForecastData, setHourlyForecastData] = useState<HourlyForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Load search history on initial mount
  useEffect(() => {
    loadSearchHistory();
  }, []);

  const loadSearchHistory = async () => {
    const history = await SearchHistoryService.getSearchHistory();
    setSearchHistory(history);
  };

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
      const hourlyForecasts = generateHourlyData(forecastResponse.list);
      setHourlyForecastData(hourlyForecasts);
      
      setErrorMsg(null);
      setLastUpdated(new Date());
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
    if (!searchQuery.trim()) {
      setShowSearchHistory(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setShowSearchHistory(false);
      
      // Use API function
      const response = await apiSearchLocation(searchQuery);
      
      const { lat, lon } = response.coord;
      await fetchWeatherData(lat, lon);
      
      // Save to search history
      await SearchHistoryService.saveSearchQuery(searchQuery);
      
      // Reload search history
      await loadSearchHistory();
      
      setSearchQuery('');
    } catch (error: unknown) {
      console.error('Error searching location:', error);
      
      let errorMessage = 'Location not found. Please check spelling and try again.';
      
      // Type guard for API errors
      const isApiError = (err: unknown): err is ApiError => {
        return err !== null && typeof err === 'object' && 'response' in err;
      };

      // Check for network connectivity
      const isOffline = () => {
        if (Platform.OS === 'web') {
          return typeof window !== 'undefined' && !window.navigator.onLine;
        }
        // For React Native, you might want to use NetInfo here
        return false;
      };

      if (isApiError(error)) {
        switch (error.response?.status) {
          case 404:
            errorMessage = `"${searchQuery}" not found. Please check spelling and try again.`;
            break;
          case 429:
            errorMessage = 'Too many requests. Please try again later.';
            break;
          case 500:
          case 502:
          case 503:
          case 504:
            errorMessage = 'Weather service is currently unavailable. Please try again later.';
            break;
          default:
            errorMessage = 'An unexpected error occurred. Please try again.';
        }
      } else if (isOffline()) {
        errorMessage = 'No internet connection. Please check your connection and try again.';
      }

      Alert.alert('Search Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectHistoryItem = async (query: string) => {
    setSearchQuery(query);
    setShowSearchHistory(false);
    
    try {
      setIsLoading(true);
      
      // Use API function
      const response = await apiSearchLocation(query);
      
      const { lat, lon } = response.coord;
      await fetchWeatherData(lat, lon);
      
      // Move this item to the top of history
      await SearchHistoryService.saveSearchQuery(query);
      
      // Reload search history
      await loadSearchHistory();
      
      setSearchQuery('');
    } catch (error) {
      console.error('Error searching location from history:', error);
      Alert.alert('Error', `Unable to load weather for "${query}". The location may no longer be valid.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearSearchHistory = async () => {
    await SearchHistoryService.clearSearchHistory();
    setSearchHistory([]);
    setShowSearchHistory(false);
  };

  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    setShowSearchHistory(false);
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

  return (
    <WeatherContext.Provider
      value={{
        weatherData,
        dailyForecastData,
        hourlyForecastData,
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
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
};

export const useWeather = () => {
  const context = useContext(WeatherContext);
  if (context === undefined) {
    throw new Error('useWeather must be used within a WeatherProvider');
  }
  return context;
};