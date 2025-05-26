import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { WEATHER_API_KEY } from '../services/api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from '../contexts/WeatherContext';
import { useTemperature } from '../contexts/TemperatureContext'; // Import the temperature context
import { getStyles } from '../styles/styles';

// Screen dimensions for the map
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = 300;

interface MapLayer {
  id: string;
  name: string;
  icon: string; // Changed from keyof typeof Feather.glyphMap to string
  weatherKey: string;
  unit: string;
}

// Add interface for weather data structure to handle optional properties
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

const WeatherMaps = () => {
  const { weatherData } = useWeather();
  const { formatTemp, unit } = useTemperature(); // Use the temperature context
  const [mapType, setMapType] = useState('TA2');
  const [zoom, setZoom] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme] = useState(false);
  const styles = getStyles(isDarkTheme);
  
  // City coordinates from weather data
  const lat = weatherData?.coord?.lat || 0;
  const lon = weatherData?.coord?.lon || 0;
  
  // Map layer options with corresponding weather data keys - update temperature unit dynamically
  const mapLayers: MapLayer[] = [
    { id: 'TA2', name: 'Temperature', icon: 'thermometer', weatherKey: 'temp', unit: `°${unit}` },
    { id: 'PR0', name: 'Precipitation', icon: 'cloud-rain', weatherKey: 'rain', unit: 'mm/h' },
    { id: 'WND', name: 'Wind Speed', icon: 'wind', weatherKey: 'wind_speed', unit: 'm/s' },
    { id: 'CL', name: 'Clouds', icon: 'cloud', weatherKey: 'clouds', unit: '%' },
    { id: 'APM', name: 'Pressure', icon: 'activity', weatherKey: 'pressure', unit: 'hPa' },
  ];

  // Map zoom options
  const zoomLevels = [
    { level: 2, name: 'Wide' },
    { level: 4, name: 'Regional' },
    { level: 6, name: 'Local' },
    { level: 8, name: 'Close' },
  ];
  
  // Generate correct OpenWeatherMap URL using Maps API 2.0
  const generateMapUrl = () => {
    // Convert lat/lon to tile coordinates
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const latRad = lat * Math.PI / 180;
    const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `http://maps.openweathermap.org/maps/2.0/weather/${mapType}/${zoom}/${tileX}/${tileY}?appid=${WEATHER_API_KEY}`;
  };

  // Get current weather value for selected map type
  const getCurrentWeatherValue = () => {
    if (!weatherData) return null;
    
    const currentLayer = mapLayers.find(layer => layer.id === mapType);
    if (!currentLayer) return null;
    
    switch (mapType) {
      case 'TA2':
        // Use formatTemp to convert and format temperature according to user preference
        const tempValue = formatTemp(weatherData.main.temp, 'C', false); // Remove unit from formatTemp since we add it below
        return {
          value: tempValue,
          label: 'Current Temperature',
          icon: 'thermometer',
          unit: `${unit}` // Use the current unit from context
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

  // Enhanced legend information based on map type - update temperature ranges based on current unit
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

  // Load new map when type or zoom changes
  useEffect(() => {
    if (weatherData?.coord) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [mapType, zoom, weatherData]);

  if (!weatherData?.coord) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyStateContainer}>
          <MaterialCommunityIcons name="map-marker-off" size={80} color="#888" />
          <Text style={styles.emptyStateText}>No Location Selected</Text>
          <Text style={styles.emptyStateDescription}>
            Search for a location first to view weather maps.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const mapUrl = generateMapUrl();
  const legendInfo = getLegendInfo();
  const currentWeatherValue = getCurrentWeatherValue();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={mapStyles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mapStyles.scrollContent}
      >
        {/* Header */}
        <View style={mapStyles.headerContainer}>
          <Text style={mapStyles.headerTitle}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>
          <Text style={mapStyles.locationText}>
            {lat.toFixed(3)}°N, {lon.toFixed(3)}°W
          </Text>
        </View>

        {/* Map Layer Selector */}
        <View style={mapStyles.selectorContainer}>
          <Text style={mapStyles.selectorLabel}>Select Weather Layer:</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={mapStyles.layerButtonsContainer}
          >
            {mapLayers.map((layer) => (
              <TouchableOpacity
                key={layer.id}
                style={[
                  mapStyles.layerButton,
                  mapType === layer.id && mapStyles.layerButtonActive
                ]}
                onPress={() => setMapType(layer.id)}
              >
                <Feather 
                  name={layer.icon as any} // Type assertion to handle icon names
                  size={18} 
                  color={mapType === layer.id ? '#fff' : '#0066cc'} 
                />
                <Text style={[
                  mapStyles.layerButtonText,
                  mapType === layer.id && mapStyles.layerButtonTextActive
                ]}>
                  {layer.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Zoom Selector */}
        <View style={mapStyles.selectorContainer}>
          <Text style={mapStyles.selectorLabel}>Map Zoom:</Text>
          <View style={mapStyles.zoomButtonsContainer}>
            {zoomLevels.map((zoomOption) => (
              <TouchableOpacity
                key={zoomOption.level}
                style={[
                  mapStyles.zoomButton,
                  zoom === zoomOption.level && mapStyles.zoomButtonActive
                ]}
                onPress={() => setZoom(zoomOption.level)}
              >
                <Text style={[
                  mapStyles.zoomButtonText,
                  zoom === zoomOption.level && mapStyles.zoomButtonTextActive
                ]}>
                  {zoomOption.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Current Weather Value for Selected Layer */}
        {currentWeatherValue && (
          <View style={mapStyles.currentValueContainer}>
            <View style={mapStyles.currentValueContent}>
              <MaterialCommunityIcons 
                name={currentWeatherValue.icon as any} // Type assertion for MaterialCommunityIcons
                size={24} 
                color="#0066cc" 
              />
              <View style={mapStyles.currentValueText}>
                <Text style={mapStyles.currentValueLabel}>
                  {currentWeatherValue.label}
                </Text>
                <Text style={mapStyles.currentValueNumber}>
                  {currentWeatherValue.value}{currentWeatherValue.unit}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Map Display */}
        <View style={mapStyles.mapContainer}>
          {isLoading ? (
            <View style={mapStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={mapStyles.loadingText}>Loading {legendInfo.title.toLowerCase()}...</Text>
            </View>
          ) : (
            <View style={mapStyles.mapImageContainer}>
              <Image 
                source={{ uri: mapUrl }} 
                style={mapStyles.mapImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Map loading error:', error.nativeEvent.error);
                }}
                onLoad={() => {
                  console.log('Map loaded successfully');
                }}
              />
              
              {/* Location Marker */}
              <View style={mapStyles.mapLocationMarker}>
                <MaterialCommunityIcons name="map-marker" size={30} color="#e91e63" />
                <View style={mapStyles.locationLabel}>
                  <Text style={mapStyles.locationLabelText}>
                    {weatherData.name}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Enhanced Map Legend */}
        {legendInfo.colors.length > 0 && (
          <View style={mapStyles.legendContainer}>
            <View style={mapStyles.legendHeader}>
              <Text style={mapStyles.legendTitle}>{legendInfo.title}</Text>
              <Text style={mapStyles.legendDescription}>{legendInfo.description}</Text>
            </View>
            <View style={mapStyles.legendGrid}>
              {legendInfo.colors.map((item, index) => (
                <View key={index} style={mapStyles.legendItem}>
                  <View 
                    style={[
                      mapStyles.legendColorBox, 
                      { backgroundColor: item.color }
                    ]} 
                  />
                  <View style={mapStyles.legendTextContainer}>
                    <Text style={mapStyles.legendLabel}>{item.label}</Text>
                    <Text style={mapStyles.legendSubtext}>{item.description}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Map Information */}
        <View style={mapStyles.infoContainer}>
          <Text style={mapStyles.infoTitle}>Map Information</Text>
          <Text style={mapStyles.infoText}>
            This weather map shows real-time {legendInfo.title.toLowerCase()} data from OpenWeatherMap. 
            The colors represent different intensity levels, with the legend above showing the scale. 
            Your current location is marked with a red pin.
          </Text>
          <View style={mapStyles.infoDetails}>
            <Text style={mapStyles.infoDetailText}>
              • Data updates every 10 minutes
            </Text>
            <Text style={mapStyles.infoDetailText}>
              • Resolution: {zoom <= 4 ? 'Regional' : zoom <= 6 ? 'Local' : 'High detail'}
            </Text>
            <Text style={mapStyles.infoDetailText}>
              • Source: OpenWeatherMap API
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const mapStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 30,
  },
  headerContainer: {
    marginVertical: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  selectorContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  selectorLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  layerButtonsContainer: {
    paddingVertical: 5,
  },
  layerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 25,
    marginRight: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  layerButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  layerButtonText: {
    fontSize: 15,
    color: '#0066cc',
    marginLeft: 8,
    fontWeight: '500',
  },
  layerButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  zoomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoomButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
    paddingVertical: 12,
    marginHorizontal: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  zoomButtonActive: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  zoomButtonText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '500',
  },
  zoomButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  currentValueContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  currentValueContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentValueText: {
    marginLeft: 15,
    flex: 1,
  },
  currentValueLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  currentValueNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0066cc',
  },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  loadingContainer: {
    height: MAP_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#555',
  },
  mapImageContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  mapLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -15,
    marginTop: -30,
    zIndex: 10,
    alignItems: 'center',
  },
  locationLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginTop: 5,
  },
  locationLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '500',
  },
  legendContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  legendHeader: {
    marginBottom: 15,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  legendDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  legendGrid: {
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  legendColorBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendTextContainer: {
    flex: 1,
  },
  legendLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  legendSubtext: {
    fontSize: 12,
    color: '#666',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
    marginBottom: 15,
  },
  infoDetails: {
    marginTop: 5,
  },
  infoDetailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
});

export default WeatherMaps;