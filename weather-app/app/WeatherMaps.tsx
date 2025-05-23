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
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useWeather } from './WeatherContext';
import { getStyles } from './styles';

const WEATHER_API_KEY = 'ddde560ae7ec6510c8d92298fc9da08f';
const MAP_BASE_URL = 'https://tile.openweathermap.org/map';

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
  const [mapType, setMapType] = useState('precipitation_new');
  const [zoom, setZoom] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isDarkTheme] = useState(false);
  const styles = getStyles(isDarkTheme);
  
  // City coordinates from weather data
  const lat = weatherData?.coord?.lat || 0;
  const lon = weatherData?.coord?.lon || 0;
  
  // Map layer options
  const mapLayers: MapLayer[] = [
    { id: 'precipitation_new', name: 'Precipitation', icon: 'cloud-rain' },
    { id: 'temp_new', name: 'Temperature', icon: 'thermometer' },
    { id: 'clouds_new', name: 'Clouds', icon: 'cloud' },
    { id: 'wind_new', name: 'Wind Speed', icon: 'wind' },
    { id: 'pressure_new', name: 'Pressure', icon: 'disc' },
  ];

  // Map zoom options
  const zoomLevels = [
    { level: 3, name: 'Country' },
    { level: 5, name: 'Region' },
    { level: 7, name: 'City' },
    { level: 9, name: 'Local' },
  ];
  
  // Generate OpenWeatherMap tile URL for the current settings
  const generateMapUrl = () => {
    // Format: https://tile.openweathermap.org/map/{layer}/{z}/{x}/{y}.png?appid={API key}
    
    // Calculate tile coordinates based on lat/lon and zoom
    // This is a simplified calculation based on slippy map tile scheme
    const tilesPerSide = Math.pow(2, zoom);
    const x = Math.floor(tilesPerSide * ((lon + 180) / 360));
    const latRad = lat * Math.PI / 180;
    const y = Math.floor(tilesPerSide * (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2);
    
    // Fetch multiple tiles around the center for a better view
    // We'll create a 2x2 grid of tiles
    return [
      `${MAP_BASE_URL}/${mapType}/${zoom}/${x}/${y}.png?appid=${WEATHER_API_KEY}`,
      `${MAP_BASE_URL}/${mapType}/${zoom}/${x+1}/${y}.png?appid=${WEATHER_API_KEY}`,
      `${MAP_BASE_URL}/${mapType}/${zoom}/${x}/${y+1}.png?appid=${WEATHER_API_KEY}`,
      `${MAP_BASE_URL}/${mapType}/${zoom}/${x+1}/${y+1}.png?appid=${WEATHER_API_KEY}`,
    ];
  };

  // Legend information based on map type
  const getLegendInfo = () => {
    switch (mapType) {
      case 'precipitation_new':
        return {
          title: 'Precipitation (mm)',
          colors: [
            { color: '#b3f0ff', label: '0-1' },
            { color: '#66ccff', label: '1-5' },
            { color: '#3399ff', label: '5-10' },
            { color: '#0066ff', label: '10-20' },
            { color: '#006600', label: '20+' },
          ]
        };
      case 'temp_new':
        return {
          title: 'Temperature (°C)',
          colors: [
            { color: '#9c70c7', label: '< -20' },
            { color: '#8b9ff7', label: '-20 to -10' },
            { color: '#66ccff', label: '-10 to 0' },
            { color: '#99ff99', label: '0 to 10' },
            { color: '#ffff99', label: '10 to 20' },
            { color: '#ffcc66', label: '20 to 30' },
            { color: '#ff8c66', label: '30+' },
          ]
        };
      case 'clouds_new':
        return {
          title: 'Cloud Cover (%)',
          colors: [
            { color: '#ffffff', label: '0-10' },
            { color: '#e6e6e6', label: '10-30' },
            { color: '#cccccc', label: '30-50' },
            { color: '#999999', label: '50-70' },
            { color: '#666666', label: '70-100' },
          ]
        };
      case 'wind_new':
        return {
          title: 'Wind Speed (m/s)',
          colors: [
            { color: '#e6f7ff', label: '0-3' },
            { color: '#99ddff', label: '3-6' },
            { color: '#33bbff', label: '6-9' },
            { color: '#0088cc', label: '9-12' },
            { color: '#005580', label: '12+' },
          ]
        };
      case 'pressure_new':
        return {
          title: 'Pressure (hPa)',
          colors: [
            { color: '#99ccff', label: '< 980' },
            { color: '#99ffff', label: '980-1000' },
            { color: '#99ff99', label: '1000-1020' },
            { color: '#ffff99', label: '1020-1040' },
            { color: '#ffcc99', label: '1040+' },
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
      // Simulate a loading delay to ensure images load properly
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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

  const mapUrls = generateMapUrl();
  const legendInfo = getLegendInfo();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={mapStyles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={mapStyles.scrollContent}
      >
        <View style={mapStyles.headerContainer}>
          <Text style={mapStyles.headerTitle}>Weather Maps</Text>
          <Text style={mapStyles.locationText}>
            {weatherData.name}, {weatherData.sys.country}
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
            <View style={mapStyles.mapTilesContainer}>
              <View style={mapStyles.mapRow}>
                <Image 
                  source={{ uri: mapUrls[0] }} 
                  style={mapStyles.mapTile}
                  resizeMode="cover"
                />
                <Image 
                  source={{ uri: mapUrls[1] }} 
                  style={mapStyles.mapTile}
                  resizeMode="cover"
                />
              </View>
              <View style={mapStyles.mapRow}>
                <Image 
                  source={{ uri: mapUrls[2] }} 
                  style={mapStyles.mapTile}
                  resizeMode="cover"
                />
                <Image 
                  source={{ uri: mapUrls[3] }} 
                  style={mapStyles.mapTile}
                  resizeMode="cover"
                />
              </View>
              <View style={mapStyles.mapLocationMarker}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#e91e63" />
              </View>
            </View>
          )}

          {/* Map Legend */}
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
        </View>

        {/* Map Type Descriptions */}
        <View style={mapStyles.descriptionContainer}>
          <Text style={mapStyles.descriptionTitle}>About This Map</Text>
          <Text style={mapStyles.descriptionText}>
            {mapType === 'precipitation_new' && 
              'This map shows precipitation levels over the area. Darker blue indicates heavier rainfall.'}
            {mapType === 'temp_new' && 
              'This map shows temperature distribution. Blue tones indicate cooler temperatures while red/orange indicate warmer areas.'}
            {mapType === 'clouds_new' && 
              'This map shows cloud coverage. Darker areas indicate more cloud cover in percentage.'}
            {mapType === 'wind_new' && 
              'This map shows wind speed. Darker blue indicates higher wind speeds in meters per second.'}
            {mapType === 'pressure_new' && 
              'This map shows atmospheric pressure. Color range indicates different pressure levels in hectopascals.'}
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
  mapTilesContainer: {
    height: MAP_HEIGHT,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  mapRow: {
    flexDirection: 'row',
    height: MAP_HEIGHT / 2,
  },
  mapTile: {
    width: SCREEN_WIDTH / 2 - 30,
    height: '100%',
  },
  mapLocationMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -12,
    marginTop: -24,
    zIndex: 10,
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
  mapCreditText: {
    fontSize: 12,
    color: '#888',
    fontStyle: 'italic',
  },
});

export default WeatherMaps;