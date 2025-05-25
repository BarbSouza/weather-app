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
import { WEATHER_API_KEY } from './api';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from './WeatherContext';
import { getStyles } from './styles';

// Screen dimensions for the map
const SCREEN_WIDTH = Dimensions.get('window').width;
const MAP_HEIGHT = 300;

interface MapLayer {
  id: string;
  name: string;
  icon: keyof typeof Feather.glyphMap;
}

const WeatherMaps = () => {
  const { weatherData } = useWeather();
  const [mapType, setMapType] = useState('TA2'); 
  const [zoom, setZoom] = useState(4);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme] = useState(false);
  const styles = getStyles(isDarkTheme);
  
  // City coordinates from weather data
  const lat = weatherData?.coord?.lat || 0;
  const lon = weatherData?.coord?.lon || 0;
  
  // Map layer options - Updated with correct OpenWeatherMap layer names
  const mapLayers: MapLayer[] = [
    { id: 'TA2', name: 'Temperature', icon: 'thermometer' },
    { id: 'PR0', name: 'Precipitation', icon: 'cloud-rain' },
    { id: 'WND', name: 'Wind Speed', icon: 'wind' },
    { id: 'CL', name: 'Clouds', icon: 'cloud' },
    { id: 'APM', name: 'Pressure', icon: 'disc' },
  ];

  // Map zoom options
  const zoomLevels = [
    { level: 2, name: 'Wide' },
    { level: 4, name: 'Regional' },
    { level: 6, name: 'Local' },
    { level: 8, name: 'Close' },
  ];
  
  
  const generateMapUrl = () => {
    
    // Format: http://maps.openweathermap.org/maps/2.0/weather/{layer}/{z}/{x}/{y}?appid={API key}
    
    // Convert lat/lon to tile coordinates
    const tileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const latRad = lat * Math.PI / 180;
    const tileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    return `http://maps.openweathermap.org/maps/2.0/weather/${mapType}/${zoom}/${tileX}/${tileY}?appid=${WEATHER_API_KEY}`;
  };

  // Generate a multi-tile view for better coverage
  const generateTileGrid = () => {
    const centerTileX = Math.floor((lon + 180) / 360 * Math.pow(2, zoom));
    const latRad = lat * Math.PI / 180;
    const centerTileY = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * Math.pow(2, zoom));
    
    // Create a 3x3 grid of tiles centered on the location
    const tiles = [];
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        const tileX = centerTileX + x;
        const tileY = centerTileY + y;
        tiles.push({
          x: tileX,
          y: tileY,
          url: `http://maps.openweathermap.org/maps/2.0/weather/${mapType}/${zoom}/${tileX}/${tileY}?appid=${WEATHER_API_KEY}`,
          gridX: x + 1,
          gridY: y + 1
        });
      }
    }
    return tiles;
  };

  // Legend information based on map type
  const getLegendInfo = () => {
    switch (mapType) {
      case 'PR0':
        return {
          title: 'Precipitation (mm/h)',
          colors: [
            { color: '#b3f0ff', label: '0-0.1' },
            { color: '#66ccff', label: '0.1-0.5' },
            { color: '#3399ff', label: '0.5-2' },
            { color: '#0066ff', label: '2-8' },
            { color: '#003399', label: '8+' },
          ]
        };
      case 'TA2':
        return {
          title: 'Temperature (°C)',
          colors: [
            { color: '#9c70c7', label: '< -10' },
            { color: '#66ccff', label: '-10 to 0' },
            { color: '#99ff99', label: '0 to 10' },
            { color: '#ffff99', label: '10 to 20' },
            { color: '#ffcc66', label: '20 to 30' },
            { color: '#ff8c66', label: '30+' },
          ]
        };
      case 'CL':
        return {
          title: 'Cloud Cover (%)',
          colors: [
            { color: '#ffffff', label: '0-20' },
            { color: '#e6e6e6', label: '20-40' },
            { color: '#cccccc', label: '40-60' },
            { color: '#999999', label: '60-80' },
            { color: '#666666', label: '80-100' },
          ]
        };
      case 'WND':
        return {
          title: 'Wind Speed (m/s)',
          colors: [
            { color: '#ffffff', label: '0-2' },
            { color: '#b3f0ff', label: '2-5' },
            { color: '#66ccff', label: '5-10' },
            { color: '#3399ff', label: '10-15' },
            { color: '#0066ff', label: '15+' },
          ]
        };
      case 'APM':
        return {
          title: 'Pressure (hPa)',
          colors: [
            { color: '#9c70c7', label: 'Low' },
            { color: '#66ccff', label: 'Below Avg' },
            { color: '#99ff99', label: 'Average' },
            { color: '#ffff99', label: 'Above Avg' },
            { color: '#ff8c66', label: 'High' },
          ]
        };
      default:
        return { title: '', colors: [] };
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
  const tileGrid = generateTileGrid();
  const legendInfo = getLegendInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={mapStyles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mapStyles.scrollContent}
      >
        <View style={mapStyles.headerContainer}>
          <Text style={mapStyles.headerTitle}>
            {weatherData.name}, {weatherData.sys.country}
          </Text>
          <Text style={mapStyles.locationText}>
            Lat: {lat.toFixed(2)}°, Lon: {lon.toFixed(2)}°
          </Text>
        </View>

        {/* Map Layer Selector */}
        <View style={mapStyles.selectorContainer}>
          <Text style={mapStyles.selectorLabel}>Map Layer:</Text>
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
                  name={layer.icon} 
                  size={16} 
                  color={mapType === layer.id ? '#fff' : '#333'} 
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
          <Text style={mapStyles.selectorLabel}>Zoom Level:</Text>
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

        {/* Map Display */}
        <View style={mapStyles.mapContainer}>
          {isLoading ? (
            <View style={mapStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#0066cc" />
              <Text style={mapStyles.loadingText}>Loading map...</Text>
            </View>
          ) : (
            <View style={mapStyles.mapImageContainer}>
              {/* Single tile approach */}
              <Image 
                source={{ uri: mapUrl }} 
                style={mapStyles.mapImage}
                resizeMode="cover"
                onError={(error) => {
                  console.log('Map loading error:', error.nativeEvent.error);
                  console.log('Attempted URL:', mapUrl);
                }}
                onLoad={() => {
                  console.log('Map loaded successfully');
                  console.log('Loaded URL:', mapUrl);
                }}
              />

              <View style={mapStyles.mapLocationMarker}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#e91e63" />
              </View>
            </View>
          )}

          {/* Map Legend */}
          {legendInfo.colors.length > 0 && (
            <View style={mapStyles.legendContainer}>
              <Text style={mapStyles.legendTitle}>{legendInfo.title}</Text>
              <View style={mapStyles.legendColors}>
                {legendInfo.colors.map((item, index) => (
                  <View key={index} style={mapStyles.legendItem}>
                    <View 
                      style={[
                        mapStyles.legendColorBox, 
                        { backgroundColor: item.color }
                      ]} 
                    />
                    <Text style={mapStyles.legendLabel}>{item.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Current Weather Info */}
        <View style={mapStyles.weatherInfoContainer}>
          <Text style={mapStyles.weatherInfoTitle}>Current Weather</Text>
          <View style={mapStyles.weatherInfoGrid}>
            <View style={mapStyles.weatherInfoItem}>
              <MaterialCommunityIcons name="thermometer" size={20} color="#0066cc" />
              <Text style={mapStyles.weatherInfoLabel}>Temperature</Text>
              <Text style={mapStyles.weatherInfoValue}>{Math.round(weatherData.main.temp)}°C</Text>
            </View>
            <View style={mapStyles.weatherInfoItem}>
              <MaterialCommunityIcons name="water-percent" size={20} color="#0066cc" />
              <Text style={mapStyles.weatherInfoLabel}>Humidity</Text>
              <Text style={mapStyles.weatherInfoValue}>{weatherData.main.humidity}%</Text>
            </View>
            <View style={mapStyles.weatherInfoItem}>
              <MaterialCommunityIcons name="weather-windy" size={20} color="#0066cc" />
              <Text style={mapStyles.weatherInfoLabel}>Wind Speed</Text>
              <Text style={mapStyles.weatherInfoValue}>{weatherData.wind?.speed || 0} m/s</Text>
            </View>
            <View style={mapStyles.weatherInfoItem}>
              <MaterialCommunityIcons name="gauge" size={20} color="#0066cc" />
              <Text style={mapStyles.weatherInfoLabel}>Pressure</Text>
              <Text style={mapStyles.weatherInfoValue}>{weatherData.main.pressure} hPa</Text>
            </View>
          </View>
        </View>

        {/* Map Description */}
        <View style={mapStyles.descriptionContainer}>
          <Text style={mapStyles.descriptionTitle}>About This Map</Text>
          <Text style={mapStyles.descriptionText}>
            {mapType === 'PR0' && 
              'Shows current precipitation levels. Blue areas indicate rainfall intensity.'}
            {mapType === 'TA2' && 
              'Shows temperature distribution at 2 meters height. Colors range from cold (blue/purple) to hot (red/orange).'}
            {mapType === 'CL' && 
              'Shows cloud coverage percentage. Darker areas have more cloud cover.'}
            {mapType === 'WND' && 
              'Shows wind speed patterns across the region.'}
            {mapType === 'APM' && 
              'Shows atmospheric pressure variations in the area.'}
          </Text>
          <Text style={mapStyles.debugText}>
            Map URL: {mapUrl}
          </Text>
          <Text style={mapStyles.mapCreditText}>
            Maps provided by OpenWeatherMap
          </Text>
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
    paddingBottom: 20,
  },
  headerContainer: {
    marginVertical: 15,
    paddingHorizontal: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  locationText: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  selectorContainer: {
    marginBottom: 15,
    paddingHorizontal: 15,
  },
  selectorLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  layerButtonsContainer: {
    paddingVertical: 5,
  },
  layerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 10,
  },
  layerButtonActive: {
    backgroundColor: '#0066cc',
  },
  layerButtonText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 5,
  },
  layerButtonTextActive: {
    color: '#fff',
  },
  zoomButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  zoomButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    marginHorizontal: 5,
    borderRadius: 8,
  },
  zoomButtonActive: {
    backgroundColor: '#0066cc',
  },
  zoomButtonText: {
    fontSize: 14,
    color: '#333',
  },
  zoomButtonTextActive: {
    color: '#fff',
  },
  mapContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    height: MAP_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#555',
  },
  mapImageContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  tileGrid: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  tileImage: {
    position: 'absolute',
    width: (SCREEN_WIDTH - 60) / 3,
    height: MAP_HEIGHT / 3,
  },
  mapLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
    zIndex: 10,
  },
  weatherInfoContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  weatherInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  weatherInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  weatherInfoItem: {
    width: '48%',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  weatherInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  weatherInfoValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  legendContainer: {
    marginTop: 15,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#333',
  },
  legendColors: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '45%',
    marginVertical: 3,
  },
  legendColorBox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    marginRight: 5,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  legendLabel: {
    fontSize: 12,
    color: '#666',
  },
  descriptionContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginHorizontal: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 10,
  },
  debugText: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'monospace',
    marginBottom: 10,
  },
  mapCreditText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default WeatherMaps;