import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { WeatherProvider } from './WeatherContext';


import { ThemeProvider } from './ThemeContext'; // adjust path as needed


export default function AppLayout() {
  
  return (
    <ThemeProvider>
      <WeatherProvider>
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#0066cc',
            tabBarInactiveTintColor: '#888',
            tabBarStyle: {
              paddingBottom: 5,
              paddingTop: 5,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#0066cc',
              height: 60,
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
            name="SearchHistory"
            options={{
              href: null, // This will hide the tab
            }}
          />
        </Tabs>
      </WeatherProvider>
    </ThemeProvider>
  );
}