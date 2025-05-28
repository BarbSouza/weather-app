import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Image, ScrollView,
  TouchableOpacity, Dimensions, ActivityIndicator, SafeAreaView,
} from 'react-native';
import { WEATHER_API_KEY } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useWeather } from '../contexts/WeatherContext';
import { useTemperature } from '../contexts/TemperatureContext';
import { useTheme } from '../contexts/ThemeContext';

/** Screen dimensions configuration */
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = 280;

/** Map layer configuration interface */
interface MapLayer {
  id: string;
  name: string;
  icon: string;
  weatherKey: string;
  unit: string;
}

/** Weather data structure interfaces */
interface WeatherDataRain {
  '1h'?: number;
  '3h'?: number;
}

interface WeatherDataWind {
  speed?: number;
  deg?: number;
}

interface WeatherDataClouds {
  all?: number;
}

/**
 * WeatherMaps Component
 * Displays interactive weather maps with different layers and zoom levels
 * Features:
 * - Multiple weather layer types (temperature, precipitation, wind, etc.)
 * - Adjustable zoom levels
 * - Current weather value display
 * - Detailed map legend
 * - Theme-aware styling
 */
const WeatherMaps = () => {
  const { weatherData } = useWeather();
  const { formatTemp, unit } = useTemperature();
  const { isDarkTheme } = useTheme();
  const [mapType, setMapType] = useState('TA2');
  const [zoom, setZoom] = useState(4);
  const [isLoading, setIsLoading] = useState(false);

  /** Location coordinates from weather data */
  const lat = weatherData?.coord?.lat || 0;
  const lon = weatherData?.coord?.lon || 0;

  /** Available map layer configurations */
  const mapLayers: MapLayer[] = [
    { id: 'TA2', name: 'Temperature', icon: 'thermometer', weatherKey: 'temp', unit: `°${unit}` },
    { id: 'PR0', name: 'Precipitation', icon: 'cloud-rain', weatherKey: 'rain', unit: 'mm/h' },
    { id: 'WND', name: 'Wind Speed', icon: 'wind', weatherKey: 'wind_speed', unit: 'm/s' },
    { id: 'CL', name: 'Clouds', icon: 'cloud', weatherKey: 'clouds', unit: '%' },
    { id: 'APM', name: 'Pressure', icon: 'activity', weatherKey: 'pressure', unit: 'hPa' },
  ];

  /** Zoom level options */
  const zoomLevels = [
    { level: 2, name: 'Wide' },
    { level: 4, name: 'Regional' },
    { level: 6, name: 'Local' },
    { level: 8, name: 'Close' },
  ];

  /**
   * Generates OpenWeatherMap URL for current map settings
   * Converts coordinates to tile system
   */
  const generateMapUrl = () => {
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const latRad = lat * Math.PI / 180;
    const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `http://maps.openweathermap.org/maps/2.0/weather/${mapType}/${zoom}/${tileX}/${tileY}?appid=${WEATHER_API_KEY}`;
  };

  /**
   * Gets current weather value based on selected map type
   * Handles different data structures for each weather parameter
   */
  const getCurrentWeatherValue = () => {
    if (!weatherData) return null;
    
    const currentLayer = mapLayers.find(layer => layer.id === mapType);
    if (!currentLayer) return null;
    
    switch (mapType) {
      case 'TA2':
        const tempValue = formatTemp(weatherData.main.temp, 'C', false);
        return {
          value: tempValue,
          label: 'Current Temperature',
          icon: 'thermometer',
          unit: `${unit}`
        };
      case 'PR0':
        // Safe access to rain data with proper type checking
        const rainData = (weatherData as any).rain as WeatherDataRain | undefined;
        const rainValue = rainData?.['1h'] || rainData?.['3h'] || 0;
        return {
          value: rainValue,
          label: 'Current Precipitation',
          icon: 'weather-rainy',
          unit: 'mm/h'
        };
      case 'WND':
        const windData = (weatherData as any).wind as WeatherDataWind | undefined;
        return {
          value: windData?.speed || 0,
          label: 'Current Wind Speed',
          icon: 'weather-windy',
          unit: 'm/s'
        };
      case 'CL':
        const cloudsData = (weatherData as any).clouds as WeatherDataClouds | undefined;
        return {
          value: cloudsData?.all || 0,
          label: 'Current Cloud Cover',
          icon: 'weather-cloudy',
          unit: '%'
        };
      case 'APM':
        return {
          value: weatherData.main.pressure,
          label: 'Current Pressure',
          icon: 'gauge',
          unit: 'hPa'
        };
      default:
        return null;
    }
  };

  /**
   * Provides legend information for current map type
   * Includes color scales and value ranges
   */
  const getLegendInfo = () => {
    switch (mapType) {
      case 'PR0':
        return {
          title: 'Precipitation Intensity',
          description: 'Shows rainfall and snowfall rates across the region',
          colors: [
            { color: '#E3F2FD', label: '0 mm/h', description: 'No precipitation' },
            { color: '#BBDEFB', label: '0.1-0.5 mm/h', description: 'Light rain' },
            { color: '#64B5F6', label: '0.5-2 mm/h', description: 'Moderate rain' },
            { color: '#2196F3', label: '2-8 mm/h', description: 'Heavy rain' },
            { color: '#1565C0', label: '8+ mm/h', description: 'Intense rain' },
          ]
        };
      case 'TA2':
        // Adjust temperature ranges based on current unit
        const tempRanges = unit === 'C' 
          ? [
              { color: '#673AB7', label: '< -10°C', description: 'Very cold' },
              { color: '#2196F3', label: '-10 to 0°C', description: 'Cold' },
              { color: '#4CAF50', label: '0 to 10°C', description: 'Cool' },
              { color: '#FFEB3B', label: '10 to 20°C', description: 'Mild' },
              { color: '#FF9800', label: '20 to 30°C', description: 'Warm' },
              { color: '#F44336', label: '30+ °C', description: 'Hot' },
            ]
          : [
              { color: '#673AB7', label: '< 14°F', description: 'Very cold' },
              { color: '#2196F3', label: '14 to 32°F', description: 'Cold' },
              { color: '#4CAF50', label: '32 to 50°F', description: 'Cool' },
              { color: '#FFEB3B', label: '50 to 68°F', description: 'Mild' },
              { color: '#FF9800', label: '68 to 86°F', description: 'Warm' },
              { color: '#F44336', label: '86+ °F', description: 'Hot' },
            ];
        return {
          title: 'Temperature Distribution',
          description: 'Air temperature at 2 meters above ground level',
          colors: tempRanges
        };
      case 'CL':
        return {
          title: 'Cloud Coverage',
          description: 'Percentage of sky covered by clouds',
          colors: [
            { color: '#FFFFFF', label: '0-20%', description: 'Clear sky' },
            { color: '#F5F5F5', label: '20-40%', description: 'Few clouds' },
            { color: '#E0E0E0', label: '40-60%', description: 'Scattered clouds' },
            { color: '#BDBDBD', label: '60-80%', description: 'Broken clouds' },
            { color: '#757575', label: '80-100%', description: 'Overcast' },
          ]
        };
      case 'WND':
        return {
          title: 'Wind Speed',
          description: 'Wind velocity at 10 meters above ground',
          colors: [
            { color: '#F8F9FA', label: '0-2 m/s', description: 'Calm' },
            { color: '#E3F2FD', label: '2-5 m/s', description: 'Light breeze' },
            { color: '#BBDEFB', label: '5-10 m/s', description: 'Moderate breeze' },
            { color: '#64B5F6', label: '10-15 m/s', description: 'Fresh breeze' },
            { color: '#1976D2', label: '15+ m/s', description: 'Strong breeze' },
          ]
        };
      case 'APM':
        return {
          title: 'Atmospheric Pressure',
          description: 'Air pressure at mean sea level',
          colors: [
            { color: '#9C27B0', label: '< 1000 hPa', description: 'Low pressure' },
            { color: '#2196F3', label: '1000-1010 hPa', description: 'Below average' },
            { color: '#4CAF50', label: '1010-1020 hPa', description: 'Average' },
            { color: '#FF9800', label: '1020-1030 hPa', description: 'Above average' },
            { color: '#F44336', label: '1030+ hPa', description: 'High pressure' },
          ]
        };
      default:
        return { title: '', description: '', colors: [] };
    }
  };

  /** Manage map loading state */
  useEffect(() => {
    if (weatherData?.coord) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mapType, zoom, weatherData]);

  /**
   * GradientWrapper Component
   * Provides consistent gradient background based on theme
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

  if (!weatherData?.coord) {
    return (
      <GradientWrapper>
        <SafeAreaView style={styles.container}>
          <View style={styles.emptyStateContainer}>
            <MaterialCommunityIcons 
              name="map-marker-off" 
              size={80} 
              color={isDarkTheme ? '#9CA3AF' : '#555'} 
              style={styles.emptyStateIcon}
            />
            <Text style={[styles.emptyStateText, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
              No Location Selected
            </Text>
            <Text style={[styles.emptyStateDescription, { color: isDarkTheme ? '#E5E7EB' : '#4B5563' }]}>
              Search for a location first to view weather maps.
            </Text>
          </View>
        </SafeAreaView>
      </GradientWrapper>
    );
  }

  const mapUrl = generateMapUrl();
  const legendInfo = getLegendInfo();
  const currentWeatherValue = getCurrentWeatherValue();

  return (
    <GradientWrapper>
      <SafeAreaView style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Header */}
          <View style={styles.locationHeaderContainer}>
            <Text style={[styles.locationHeaderText, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
              {weatherData.name}, {weatherData.sys.country}
            </Text>
            <Text style={[styles.coordinatesText, { color: isDarkTheme ? '#D1D5DB' : '#6B7280' }]}>
              {lat.toFixed(3)}°N, {lon.toFixed(3)}°W
            </Text>
          </View>

          {/* Map Layer Selector */}
          <View style={[
            styles.selectorContainer,
            { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
          ]}>
            <Text style={[styles.selectorTitle, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
              Weather Layer
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalScroll}
            >
              {mapLayers.map((layer) => (
                <TouchableOpacity
                  key={layer.id}
                  style={[
                    styles.layerButton,
                    { 
                      backgroundColor: mapType === layer.id 
                        ? (isDarkTheme ? '#2e6a8a' : '#2e6a8a')
                        : (isDarkTheme ? '#ffffff4d' : '#8abad3')
                    }
                  ]}
                  onPress={() => setMapType(layer.id)}
                >
                  <Feather 
                    name={layer.icon as any}
                    size={16} 
                    color={mapType === layer.id 
                      ? (isDarkTheme ? '#000000' : '#FFFFFF')
                      : (isDarkTheme ? '#FFFFFF' : '#000000')
                    }
                    style={styles.layerIcon}
                  />
                  <Text style={[
                    styles.layerButtonText,
                    { 
                      color: mapType === layer.id 
                        ? (isDarkTheme ? '#000000' : '#FFFFFF')
                        : (isDarkTheme ? '#FFFFFF' : '#000000')
                    }
                  ]}>
                    {layer.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Zoom Selector */}
          <View style={[
            styles.selectorContainer,
            { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
          ]}>
            <Text style={[styles.selectorTitle, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
              Map Zoom
            </Text>
            <View style={styles.zoomContainer}>
              {zoomLevels.map((zoomOption, index) => (
                <TouchableOpacity
                  key={zoomOption.level}
                  style={[
                    styles.zoomButton,
                    { 
                      backgroundColor: zoom === zoomOption.level 
                        ? (isDarkTheme ? '#2e6a8a' : '#2e6a8a')
                        : (isDarkTheme ? '#30586a)' : '#a8e1ff'),
                      borderColor: isDarkTheme ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
                    },
                    index === 0 && styles.zoomButtonFirst,
                    index === zoomLevels.length - 1 && styles.zoomButtonLast
                  ]}
                  onPress={() => setZoom(zoomOption.level)}
                >
                  <Text style={[
                    styles.zoomButtonText,
                    { 
                      color: zoom === zoomOption.level 
                        ? (isDarkTheme ? '#000000' : '#FFFFFF')
                        : (isDarkTheme ? '#FFFFFF' : '#000000')
                    }
                  ]}>
                    {zoomOption.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Current Weather Value for Selected Layer */}
          {currentWeatherValue && (
            <View style={[
              styles.currentValueContainer,
              { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
            ]}>
              <View style={styles.currentValueHeader}>
                <MaterialCommunityIcons 
                  name={currentWeatherValue.icon as any}
                  size={20} 
                  color={isDarkTheme ? '#FFFFFF' : '#000000'}
                />
                <Text style={[styles.currentValueLabel, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
                  {currentWeatherValue.label}
                </Text>
              </View>
              <Text style={[styles.currentValueText, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
                {currentWeatherValue.value}{currentWeatherValue.unit}
              </Text>
            </View>
          )}

          {/* Map Display */}
          <View style={[
            styles.mapContainer,
            { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
          ]}>
            <Text style={[styles.mapTitle, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
              Weather Map
            </Text>
            
            {isLoading ? (
              <View style={[styles.loadingContainer, { height: MAP_HEIGHT }]}>
                <ActivityIndicator size="large" color={isDarkTheme ? '#60A5FA' : '#2563EB'} />
                <Text style={[styles.loadingText, { color: isDarkTheme ? '#D1D5DB' : '#6B7280' }]}>
                  Loading {legendInfo.title.toLowerCase()}...
                </Text>
              </View>
            ) : (
              <View style={styles.mapImageContainer}>
                <Image 
                  source={{ uri: mapUrl }} 
                  style={styles.mapImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.log('Map loading error:', error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('Map loaded successfully');
                  }}
                />
                
                {/* Location Marker */}
                <View style={styles.locationMarkerContainer}>
                  <MaterialCommunityIcons name="map-marker" size={30} color="#e91e63" />
                  <View style={styles.locationMarkerLabel}>
                    <Text style={styles.locationMarkerText}>
                      {weatherData.name}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>

          {/* Enhanced Map Legend */}
          {legendInfo.colors.length > 0 && (
            <View style={[
              styles.legendContainer,
              { backgroundColor: isDarkTheme ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)' }
            ]}>
              <Text style={[styles.legendTitle, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
                {legendInfo.title}
              </Text>
              <Text style={[styles.legendDescription, { color: isDarkTheme ? '#E5E7EB' : '#4B5563' }]}>
                {legendInfo.description}
              </Text>
              
              <View style={styles.legendItems}>
                {legendInfo.colors.map((item, index) => (
                  <View key={index} style={styles.legendItem}>
                    <View style={styles.legendItemLeft}>
                      <View 
                        style={[
                          styles.legendColor,
                          { 
                            backgroundColor: item.color,
                            borderColor: isDarkTheme ? '#6B7280' : '#D1D5DB'
                          }
                        ]} 
                      />
                      <Text style={[styles.legendLabel, { color: isDarkTheme ? '#FFFFFF' : '#000000' }]}>
                        {item.label}
                      </Text>
                    </View>
                    <Text style={[styles.legendValue, { color: isDarkTheme ? '#E5E7EB' : '#4B5563' }]}>
                      {item.description}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </GradientWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 32,
  },
  locationHeaderContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  locationHeaderText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  coordinatesText: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  selectorContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  horizontalScroll: {
    paddingVertical: 4,
  },
  layerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    minWidth: 100,
  },
  layerIcon: {
    marginRight: 6,
  },
  layerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  zoomContainer: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
  },
  zoomButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
  },
  zoomButtonFirst: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8,
  },
  zoomButtonLast: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  zoomButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  currentValueContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currentValueHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  currentValueLabel: {
    fontSize: 16,
    marginLeft: 8,
  },
  currentValueText: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mapContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(128,128,128,0.1)',
    borderRadius: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  mapImageContainer: {
    height: MAP_HEIGHT,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  locationMarkerContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -30,
    zIndex: 10,
    alignItems: 'center',
  },
  locationMarkerLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 5,
  },
  locationMarkerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  legendContainer: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  legendDescription: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  legendItems: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  legendColor: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: 12,
    borderWidth: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  legendValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
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
});

export default WeatherMaps;