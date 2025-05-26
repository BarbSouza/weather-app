import React, { createContext, useState, useContext, useEffect } from 'react';
import * as Location from 'expo-location';
import { Alert, Platform } from 'react-native';
import { 
  fetchCurrentWeather, 
  fetchForecast,
  fetchHourlyForecast,
  fetchMonthlyForecast,
  searchLocation as apiSearchLocation,
  fetchCitySuggestions
} from '../services/api';
import { SearchHistoryService } from '../services/SearchHistoryService';
import { useTemperature } from './TemperatureContext';


// TypeScript interfaces
export interface WeatherData {
  name: string;
    coord: {
    lat: number;
    lon: number;
  };
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

interface CitySearchSuggestion {
  name: string;
  displayName: string;
  lat: number;
  lon: number;
  country: string;
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

export interface MonthlyForecastItem {
  dt: number;
  temp: {
    average: number;
    min: number;
    max: number;
  };
  humidity: number;
  precipitation: number;
  weather?: {
    id?: number;
    description?: string;
    icon?: string;
  }[];
}

interface WeatherContextType {
  weatherData: WeatherData | null;
  dailyForecastData: ForecastItem[];
  hourlyForecastData: HourlyForecastItem[];
  monthlyForecastData: MonthlyForecastItem[];
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
  citySuggestions: CitySearchSuggestion[];
  isLoadingSuggestions: boolean;
  showSuggestions: boolean;
  handleSearchInputChange: (text: string) => Promise<void>;
  handleSelectSuggestion: (suggestion: CitySearchSuggestion) => Promise<void>;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

export const WeatherProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [dailyForecastData, setDailyForecastData] = useState<ForecastItem[]>([]);
  const [hourlyForecastData, setHourlyForecastData] = useState<HourlyForecastItem[]>([]);
  const [monthlyForecastData, setMonthlyForecastData] = useState<MonthlyForecastItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showSearchHistory, setShowSearchHistory] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [citySuggestions, setCitySuggestions] = useState<CitySearchSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);
  const { unit } = useTemperature();

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
      
      // Always fetch data in metric units from API - we'll handle conversion in the UI
      const weatherResponse = await fetchCurrentWeather(latitude, longitude, 'metric');
      const forecastResponse = await fetchForecast(latitude, longitude, 'metric');
      
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
      
      // Generate hourly data from forecast endpoint - use all available 3-hour intervals
      // to display 24 hours (up to 40 entries in the API response covering 5 days)
      const hourlyForecasts = generateHourlyData(forecastResponse.list);
      setHourlyForecastData(hourlyForecasts);

      // Fetch monthly climate forecast (30 days)
      try {
        const monthlyResponse = await fetchMonthlyForecast(latitude, longitude, 'metric');
        if (monthlyResponse && monthlyResponse.list) {
          const processedMonthlyData = processMonthlyData(monthlyResponse.list);
          setMonthlyForecastData(processedMonthlyData);
        }
      } catch (monthlyError) {
        console.error('Error fetching monthly forecast:', monthlyError);
        // Don't fail the entire operation for monthly forecast error
        // Just set empty monthly data
        setMonthlyForecastData([]);
      }
      
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
    // Use the first 24 hours of data (8 entries with 3-hour intervals)
    const now = new Date().getTime();
    
    // Filter forecast items to only include future forecasts (from current time forward)
    const futureForecasts = forecastList.filter(item => item.dt * 1000 >= now);
    
    // Take the first 8 items (covering 24 hours with 3-hour intervals)
    const next24Hours = futureForecasts.slice(0, 8);
    
    // If we need all 24 hours with hourly resolution, we need to interpolate
    // between the 3-hour intervals to generate hourly data
    const hourlyData: HourlyForecastItem[] = [];
    
    for (let i = 0; i < next24Hours.length; i++) {
      const currentForecast = next24Hours[i];
      
      // Add the current 3-hour point
      hourlyData.push({
        dt: currentForecast.dt,
        temp: currentForecast.main.temp,
        weather: currentForecast.weather,
        pop: currentForecast.pop || 0
      });
      
      // If there's a next forecast, interpolate between current and next
      if (i < next24Hours.length - 1) {
        const nextForecast = next24Hours[i + 1];
        
        // Calculate hours between forecasts (normally 3)
        const hoursBetween = (nextForecast.dt - currentForecast.dt) / 3600;
        
        // Generate hourly points between 3-hour intervals (typically 2 more points)
        for (let h = 1; h < hoursBetween; h++) {
          const ratio = h / hoursBetween;
          const interpolatedTime = currentForecast.dt + (h * 3600);
          const interpolatedTemp = currentForecast.main.temp + 
            ratio * (nextForecast.main.temp - currentForecast.main.temp);
          
          // For precipitation and weather condition, just use the nearest forecast
          const useNextForecast = ratio >= 0.5;
          const weatherData = useNextForecast ? nextForecast.weather : currentForecast.weather;
          const popValue = useNextForecast ? 
            (nextForecast.pop || 0) : (currentForecast.pop || 0);
          
          hourlyData.push({
            dt: interpolatedTime,
            temp: interpolatedTemp,
            weather: weatherData,
            pop: popValue
          });
        }
      }
    }
    
    // Ensure we have 24 data points (hours)
    return hourlyData.slice(0, 24);
  };

  const handleSearchLocation = async () => {
    if (!searchQuery.trim()) {
      setShowSearchHistory(false);
      return;
    }
    
    try {
      setIsLoading(true);
      setShowSearchHistory(false);
      
      // Always use metric units for API calls
      const response = await apiSearchLocation(searchQuery, 'metric');
      
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
      
      // Always use metric units for API calls
      const response = await apiSearchLocation(query, 'metric');
      
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

    const processMonthlyData = (monthlyList: any[]): MonthlyForecastItem[] => {
    if (!monthlyList || !Array.isArray(monthlyList)) {
      return [];
    }
    
    // Process monthly data to match our interface
    return monthlyList.map(item => ({
      dt: item.dt,
      temp: {
        average: item.temp.average || item.temp.day,
        min: item.temp.min,
        max: item.temp.max
      },
      humidity: item.humidity || 0,
      precipitation: item.precipitation || 0,
      // Some monthly APIs might not include detailed weather conditions
      weather: item.weather ? [{
        id: item.weather[0]?.id,
        description: item.weather[0]?.description || '',
        icon: item.weather[0]?.icon || ''
      }] : undefined
    })).slice(0, 30); // Ensure we only return 30 days
  };

  const handleSearchInputChange = async (text: string) => {
    setSearchQuery(text);
    
    if (text.length >= 1) {
      setShowSuggestions(true);
      setShowSearchHistory(true);
      setIsLoadingSuggestions(true);
      
      try {
        const suggestions = await fetchCitySuggestions(text);
        setCitySuggestions(suggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setCitySuggestions([]);
      } finally {
        setIsLoadingSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
      setCitySuggestions([]);
      if (text.length === 0) {
        setShowSearchHistory(false);
      }
    }
  };

  const handleSelectSuggestion = async (suggestion: CitySearchSuggestion) => {
    setSearchQuery(suggestion.displayName);
    setShowSearchHistory(false);
    setShowSuggestions(false);
    
    try {
      setIsLoading(true);
      setErrorMsg(null);
      
      await fetchWeatherData(suggestion.lat, suggestion.lon);
      await SearchHistoryService.saveSearchQuery(suggestion.name);
      const updatedHistory = await SearchHistoryService.getSearchHistory();
      setSearchHistory(updatedHistory);
    } catch (error) {
      setErrorMsg('Failed to fetch weather data for selected city');
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
        monthlyForecastData,
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
        handleSelectSuggestion,
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