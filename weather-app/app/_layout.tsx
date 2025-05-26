import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, Text } from 'react-native'; 
import { FontAwesome5 } from '@expo/vector-icons';
import { WeatherProvider } from './contexts/WeatherContext';
import { TemperatureProvider, useTemperature } from './contexts/TemperatureContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import * as ScreenOrientation from 'expo-screen-orientation';

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
        <TouchableOpacity 
          onPress={() => ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE)}
          style={{ marginLeft: 12 }}
        >
          <MaterialCommunityIcons
            name="screen-rotation"
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const TabNavigator = () => {
    const { isDarkTheme } = useTheme();
    const router = useRouter();
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    
    const tabs = [
      { name: 'index', route: '/' },
      { name: 'tabs/daily', route: '/tabs/daily' },
      { name: 'tabs/hourly', route: '/tabs/hourly' },
      { name: 'tabs/favorites', route: '/tabs/favorites' },
      { name: 'tabs/WeatherMaps', route: '/tabs/WeatherMaps' }
    ];

    const handleSwipe = ({ nativeEvent }: any) => {
      if (nativeEvent.state === State.END) {
        const { translationX, velocityX } = nativeEvent;
        
        // Minimum swipe distance and velocity thresholds
        const minSwipeDistance = 50;
        const minVelocity = 500;
        
        if (Math.abs(translationX) > minSwipeDistance || Math.abs(velocityX) > minVelocity) {
          if (translationX > 0 && velocityX > 0) {
            // Swipe right - go to previous tab
            if (currentTabIndex > 0) {
              const newIndex = currentTabIndex - 1;
              setCurrentTabIndex(newIndex);
              router.push(tabs[newIndex].route);
            }
          } else if (translationX < 0 && velocityX < 0) {
            // Swipe left - go to next tab
            if (currentTabIndex < tabs.length - 1) {
              const newIndex = currentTabIndex + 1;
              setCurrentTabIndex(newIndex);
              router.push(tabs[newIndex].route);
            }
          }
        }
      }
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler onHandlerStateChange={handleSwipe}>
          <View style={{ flex: 1 }}>
            <Tabs
              screenOptions={{
                headerRight: () => <HeaderRight />,
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: isDarkTheme ? 'grey' : 'black',
                tabBarStyle: {
                  paddingBottom: 5,
                  paddingTop: 5,
                  height: 65,
                  backgroundColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                  borderTopColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                },
                headerStyle: {
                  backgroundColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                  height: Platform.select({
                    ios: 100,
                    android: 80,
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
                name="tabs/daily"
                options={{
                  title: "Daily Forecast",
                  tabBarLabel: "Daily",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="calendar-week" size={28} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/hourly"
                options={{
                  title: "Hourly Forecast",
                  tabBarLabel: "Hourly",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="clock-outline" size={28} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/favorites"
                options={{
                  title: "Favorite Cities",
                  tabBarLabel: "Favorites",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="heart" size={28} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/WeatherMaps"
                options={{
                  title: "Weather Maps",
                  tabBarLabel: "Maps",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons name="map" size={28} color={color} />
                  ),
                }}
              />
              <Tabs.Screen
                name="components/SearchHistory"
                options={{
                  href: null, 
                }}
              />
              <Tabs.Screen
                name="tabs/MontlyCalendarForecast"
                options={{
                  href: null, 
                }}
              />
            </Tabs>
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
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