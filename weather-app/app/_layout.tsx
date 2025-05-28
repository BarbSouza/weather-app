import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Platform, View, TouchableOpacity, Text } from 'react-native'; 
import { FontAwesome5 } from '@expo/vector-icons';
import { WeatherProvider } from './contexts/WeatherContext';
import { TemperatureProvider, useTemperature } from './contexts/TemperatureContext';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { GestureHandlerRootView, PanGestureHandler, State } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useState, createContext, useContext } from 'react';
import { useOrientation } from './components/OrientationHandler';

type TabRoute = {
  name: string;
  route: string;
};

// Create Animation Context
interface AnimationContextType {
  animationsEnabled: boolean;
  toggleAnimations: () => void;
}

const AnimationContext = createContext<AnimationContextType | undefined>(undefined);

export const useAnimations = () => {
  const context = useContext(AnimationContext);
  if (!context) {
    throw new Error('useAnimations must be used within an AnimationProvider');
  }
  return context;
};

const AnimationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  const toggleAnimations = () => {
    setAnimationsEnabled(prev => !prev);
  };

  return (
    <AnimationContext.Provider value={{ animationsEnabled, toggleAnimations }}>
      {children}
    </AnimationContext.Provider>
  );
};

/**
 * Root layout component for the weather application.
 * Provides theme, temperature, weather context providers, and animation toggle.
 * Implements tab-based navigation with gesture support.
 */
export default function AppLayout() {
  /**
   * Renders the header right component containing app controls
   * - Temperature unit toggle (°C/°F)
   * - Theme toggle (light/dark)
   * - Animation toggle (on/off)
   * - Orientation toggle (portrait/landscape)
   */
  const HeaderRight = () => {
    const { unit, toggleUnit } = useTemperature();
    const { isDarkTheme, toggleTheme } = useTheme();
    const { animationsEnabled, toggleAnimations } = useAnimations();
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
        <TouchableOpacity onPress={toggleAnimations} style={{ marginRight: 12 }}>
          <MaterialCommunityIcons
            name={animationsEnabled ? 'weather-lightning-rainy' : 'weather-cloudy'}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        {Platform.OS !== 'web' && (
        <TouchableOpacity onPress={toggleOrientation}>
          <MaterialCommunityIcons
            name={isLandscape ? "phone-rotate-portrait" : "phone-rotate-landscape"}
            size={20}
            color="#fff"
          />
        </TouchableOpacity>
        )}
      </View>
    );
  };

  /**
   * Main tab navigation component with gesture-based navigation support
   * Handles tab switching, screen options, and responsive layout
   */
  const TabNavigator = () => {
    const { isDarkTheme } = useTheme();
    const { isLandscape } = useOrientation();
    const router = useRouter();
    const [currentTabIndex, setCurrentTabIndex] = useState(0);
    
    const tabs: TabRoute[] = [
      { name: 'index', route: '/' },
      { name: 'tabs/daily', route: '/tabs/daily' },
      { name: 'tabs/hourly', route: '/tabs/hourly' },
      { name: 'tabs/favorites', route: '/tabs/favorites' },
      { name: 'tabs/WeatherMaps', route: '/tabs/WeatherMaps' }
    ];

    /**
     * Handles horizontal swipe gestures for tab navigation
     * Requires minimum distance and velocity thresholds
     */
    const handleSwipe = ({ nativeEvent }: any) => {
      if (nativeEvent.state === State.END) {
        const { translationX, velocityX } = nativeEvent;
        const minSwipeDistance = 100;
        const minVelocity = 800;
        
        if (Math.abs(translationX) > minSwipeDistance && Math.abs(velocityX) > minVelocity) {
          if (translationX > 0 && velocityX > 0 && currentTabIndex > 0) {
            const newIndex = currentTabIndex - 1;
            setCurrentTabIndex(newIndex);
            router.push(tabs[newIndex].route);
          } else if (translationX < 0 && velocityX < 0 && currentTabIndex < tabs.length - 1) {
            const newIndex = currentTabIndex + 1;
            setCurrentTabIndex(newIndex);
            router.push(tabs[newIndex].route);
          }
        }
      }
    };

    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler 
          onHandlerStateChange={handleSwipe}
          activeOffsetX={[-50, 50]}
          failOffsetY={[-20, 20]}
          shouldCancelWhenOutside={true}
        >
          <View style={{ flex: 1 }}>
            <Tabs screenOptions={{
              headerRight: () => <HeaderRight />,
              tabBarActiveTintColor: 'white',
              tabBarInactiveTintColor: isDarkTheme ? 'grey' : 'light-grey',
              tabBarStyle: {
                paddingVertical: 5,
                height: isLandscape ? 37 : 65,
                backgroundColor: isDarkTheme ? '#0e1114' : '#2e6a8a',
                borderTopColor: isDarkTheme ? '#0e1114' : '#2e6a8a',
              },
              headerStyle: {
                backgroundColor: isDarkTheme ? '#0e1114' : '#2e6a8a',
                height: Platform.select({
                  ios: isLandscape ? 70 : 100,
                  android: isLandscape ? 60 : 90,
                  default: isLandscape ? 40 : 50,
                }),
              },
              headerTintColor: '#fff',
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: isLandscape ? 16 : 18,
              }
            }}>
              {/* Main navigation tabs */}
              <Tabs.Screen name="index" options={{
                title: "Current Weather",
                tabBarLabel: "Current",
                tabBarIcon: ({ color }) => (
                  <MaterialCommunityIcons 
                    name="weather-partly-cloudy" 
                    size={isLandscape ? 24 : 28} 
                    color={color} 
                  />
                )
              }}/>
              
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
              
              {/* Hidden utility screens */}
              <Tabs.Screen name="components/SearchHistory" options={{ href: null }}/>
              <Tabs.Screen name="tabs/MontlyCalendarForecast" options={{ href: null }}/>
            </Tabs>
          </View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    );
  };
  
  return (
    <ThemeProvider>
      <TemperatureProvider>
        <AnimationProvider>
          <WeatherProvider>
            <TabNavigator />
          </WeatherProvider>
        </AnimationProvider>
      </TemperatureProvider>
    </ThemeProvider>
  );
}