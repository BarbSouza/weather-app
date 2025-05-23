import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, Text } from 'react-native'; 
import { FontAwesome5 } from '@expo/vector-icons';
import { WeatherProvider } from './WeatherContext';
import { TemperatureProvider, useTemperature } from './TemperatureContext';
import { ThemeProvider, useTheme } from './ThemeContext'; 


export default function AppLayout() {
  const HeaderRight = () => {
    const { unit, toggleUnit } = useTemperature();
    const { isDarkTheme, toggleTheme } = useTheme();
    
    return (
      <View style={{ flexDirection: 'row', marginRight: 16 }}>
        <TouchableOpacity onPress={toggleUnit} style={{ marginRight: 12 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            °{unit}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme}>
          <FontAwesome5
            name={isDarkTheme ? 'sun' : 'moon'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };
  
  return (
    <ThemeProvider>
      <TemperatureProvider>
        <WeatherProvider>
          <Tabs
            screenOptions={{
              headerRight: () => <HeaderRight />,
              tabBarActiveTintColor: '#0066cc',
              tabBarInactiveTintColor: '#888',
              tabBarStyle: {
                paddingBottom: 5,
                paddingTop: 5,
                height: 60,
              },
              headerStyle: {
                backgroundColor: '#0066cc',
                height: Platform.select({
                  ios: 100,
                  android: 60,
                  default: 50,
                }),
              },
              
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
              }
            }}
          >
            <Tabs.Screen
              name="index"
              options={{
                title: "Current Weather",
                tabBarLabel: "Current",
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="weather-partly-cloudy" size={28} color={color} />
                )
              }}
            />
            <Tabs.Screen
              name="daily"
              options={{
                title: "5-Day Forecast",
                tabBarLabel: "Daily",
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="calendar-week" size={28} color={color} />
                ),
              }}
            />
            <Tabs.Screen
              name="hourly"
              options={{
                title: "Hourly Forecast",
                tabBarLabel: "Hourly",
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons name="clock-outline" size={28} color={color} />
                ),
              }}
            />
            <Tabs.Screen
            name="WeatherMaps"
            options={{
              title: "Weather Map",
              tabBarLabel: "Maps",
              tabBarIcon: ({ color }) => (
                <MaterialCommunityIcons name="map" size={28} color={color} />
              ),
            }}
          />
          <Tabs.Screen
            name="SearchHistory"
            options={{
              href: null, 
            }}
          />
                <Tabs.Screen
            name="MontlyCalendarForecast"
            options={{
              href: null, 
            }}
          />
        </Tabs>
      </WeatherProvider>
    </TemperatureProvider>
    </ThemeProvider>
  );
}