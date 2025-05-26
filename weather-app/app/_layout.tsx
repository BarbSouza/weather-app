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
import { useOrientation } from './components/OrientationHandler';

export default function AppLayout() {
  const HeaderRight = () => {
    const { unit, toggleUnit } = useTemperature();
    const { isDarkTheme, toggleTheme } = useTheme();
    const { toggleOrientation, isLandscape } = useOrientation();
    
    return (
      <View style={{ flexDirection: 'row', marginRight: 16 }}>
        <TouchableOpacity onPress={toggleUnit} style={{ marginRight: 12 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
            °{unit}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 12 }}>
          <FontAwesome5
            name={isDarkTheme ? 'sun' : 'moon'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={toggleOrientation}
        >
          <MaterialCommunityIcons
            name={isLandscape ? "phone-rotate-portrait" : "phone-rotate-landscape"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    );
  };

  const TabNavigator = () => {
    const { isDarkTheme } = useTheme();
    const { isLandscape } = useOrientation();
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
        const minSwipeDistance = 100; // Increased threshold to avoid accidental triggers
        const minVelocity = 800; // Increased velocity threshold
        
        if (Math.abs(translationX) > minSwipeDistance && Math.abs(velocityX) > minVelocity) {
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
        <PanGestureHandler 
          onHandlerStateChange={handleSwipe}
          activeOffsetX={[-50, 50]} // Only activate for significant horizontal movement
          failOffsetY={[-20, 20]}   // Fail if vertical movement is detected first
          shouldCancelWhenOutside={true}
        >
          <View style={{ flex: 1 }}>
            <Tabs
              screenOptions={{
                headerRight: () => <HeaderRight />,
                tabBarActiveTintColor: 'white',
                tabBarInactiveTintColor: isDarkTheme ? 'grey' : 'black',
                tabBarStyle: {
                  paddingBottom: 5,
                  paddingTop: 5,
                  height: isLandscape ? 50 : 65, // Smaller tab bar in landscape
                  backgroundColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                  borderTopColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                },
                headerStyle: {
                  backgroundColor: isDarkTheme ? '#0e1114' :'#2e6a8a',
                  height: Platform.select({
                    ios: isLandscape ? 70 : 100,
                    android: isLandscape ? 60 : 80,
                    default: isLandscape ? 40 : 50,
                  }),
                },
                headerTintColor: '#fff',
                headerTitleStyle: {
                  fontWeight: 'bold',
                  fontSize: isLandscape ? 16 : 18, // Smaller header text in landscape
                }
              }}
            >
              <Tabs.Screen
                name="index"
                options={{
                  title: "Current Weather",
                  tabBarLabel: "Current",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons 
                      name="weather-partly-cloudy" 
                      size={isLandscape ? 24 : 28} 
                      color={color} 
                    />
                  )
                }}
              />
              <Tabs.Screen
                name="tabs/daily"
                options={{
                  title: "Daily Forecast",
                  tabBarLabel: "Daily",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons 
                      name="calendar-week" 
                      size={isLandscape ? 24 : 28} 
                      color={color} 
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/hourly"
                options={{
                  title: "Hourly Forecast",
                  tabBarLabel: "Hourly",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons 
                      name="clock-outline" 
                      size={isLandscape ? 24 : 28} 
                      color={color} 
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/favorites"
                options={{
                  title: "Favorite Cities",
                  tabBarLabel: "Favorites",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons 
                      name="heart" 
                      size={isLandscape ? 24 : 28} 
                      color={color} 
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="tabs/WeatherMaps"
                options={{
                  title: "Weather Maps",
                  tabBarLabel: "Maps",
                  tabBarIcon: ({ color }) => (
                    <MaterialCommunityIcons 
                      name="map" 
                      size={isLandscape ? 24 : 28} 
                      color={color} 
                    />
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