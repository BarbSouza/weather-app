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

  const TabNavigator = () => {
    const { isDarkTheme } = useTheme();

    return (
      <Tabs
        screenOptions={{
          headerRight: () => <HeaderRight />,
          tabBarActiveTintColor: isDarkTheme ? 'white' : 'black',
          tabBarInactiveTintColor: isDarkTheme ? '#cac8c8' : '#474747',
          tabBarStyle: {
            paddingBottom: 5,
            paddingTop: 5,
            height: 65,
            backgroundColor: isDarkTheme ? '#222' : '#fff',
            borderTopColor: isDarkTheme ? '#333' : '#e0e0e0',
          },
          headerStyle: {
            backgroundColor: isDarkTheme ? '#333' : '#0066cc',
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
            title: "Daily Forecast",
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
          name="favorites"
          options={{
            title: "Favorite Cities",
            tabBarLabel: "Favorites",
            tabBarIcon: ({ color }) => (
              <MaterialCommunityIcons name="heart" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
        name="WeatherMaps"
        options={{
          title: "Weather Maps",
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
    );
  };
  
  return (
    <ThemeProvider>
      <TemperatureProvider>
        <WeatherProvider>
          <TabNavigator />
        </WeatherProvider>
      </TemperatureProvider>
    </ThemeProvider>
  );
}