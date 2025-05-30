# Weather App

A modern cross-platform weather application built with Expo and React Native, providing comprehensive weather information with an intuitive interface.

## ✨ Features

### 🎯 Core Features
- Real-time weather data via OpenWeatherMap API
- Location-based weather tracking
- Smart city search with suggestions
- Recent locations history
- Favorites management system
- Dark/Light theme toggle
- Temperature unit switching (°C/°F)
- Animated weather effects
- Cross-platform support (iOS, Android, Web)

### 🌡️ Weather Information
- Current conditions:
  - Real and "feels like" temperatures
  - Dynamic weather icons and descriptions
  - Humidity levels
  - Wind speed and direction
  - Atmospheric pressure readings
  - Visibility range
  - Temperature extremes (min/max)
  - Auto-updating timestamps
  - Air quality index

### 📊 Forecast Types
- Hourly Forecast (24h):
  - Temperature trends
  - Weather conditions
  - Precipitation probability
  - Wind patterns
- Daily Forecast (5 days):
  - High/low temperatures
  - Weather descriptions
  - Precipitation chances
  - Wind conditions
- Monthly Calendar View:
  - Interactive calendar interface
  - Daily weather overview
  - Temperature trends
  - Precipitation forecasts

### 🗺️ Weather Maps
- Multiple visualization layers:
  - Temperature distribution
  - Precipitation intensity
  - Wind speeds
  - Atmospheric pressure
- Interactive controls:
  - Layer toggling
  - Zoom levels
  - Region selection
- Real-time updates
- Legend information

### 🎨 Visual Features
- Dynamic weather backgrounds
- Animated weather effects:
  - Rain animation
  - Snow effects
  - Cloud movements
- Responsive layouts:
  - Portrait/landscape adaptation
  - Tablet optimization
  - Desktop support
- Accessibility features

### ⚙️ Technical Improvements
- Enhanced performance
- Offline capability
- Data caching
- Error handling
- Loading states
- Pull-to-refresh
- Gesture navigation
- Search optimization

## Prerequisites

Before installing, make sure you have the following:
- Node.js (v14 or higher)
- npm or yarn package manager
- Expo CLI (`npm install -g expo-cli`)
- For iOS development: macOS with Xcode installed
- For Android development: Android Studio with SDK installed

## Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/BarbSouza/weather-app.git]
   cd weather-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install required Expo packages:
   ```bash
   npx expo install expo-location
   npx expo install @react-native-async-storage/async-storage
   npx expo install expo-linear-gradient
   npx expo install react-native-maps
   ```

4. Set up environment variables:
   - Add your OpenWeatherMap API key:
     ```
     WEATHER_API_KEY=your_api_key_here
     ```

## Running the App

1. Start the development server:
   ```bash
   npx expo start
   ```

2. Choose your platform:
   - Press `i` for iOS Simulator
   - Press `a` for Android Emulator
   - Press `w` for web browser
   - Scan QR code with Expo Go app for physical devices

## Project Structure

```
app/
├── components/         # Reusable UI components
│   ├── WeatherBackground.tsx
│   ├── TemperatureDisplay.tsx
│   ├── SearchHistory.js
│   └── WeatherUtils.tsx
├── contexts/          # React Context providers
│   ├── TemperatureContext.tsx
│   ├── ThemeContext.js
│   └── WeatherContext.tsx
├── services/          # API and data services
│   ├── api.js
│   ├── FavoritesService.js
│   └── SearchHistoryService.js
├── styles/           # Global styles
└── tabs/             # Tab-based navigation screens
```

## Technologies Used

- **Core**:
  - Expo
  - React Native
  - TypeScript
  - OpenWeatherMap API

- **Navigation & Routing**:
  - React Navigation 6
  - Expo Router

- **UI Components**:
  - React Native Vector Icons
  - Expo Linear Gradient
  - React Native Maps

- **Storage**:
  - AsyncStorage for persistent data

## Development Features

- File-based routing with Expo Router
- TypeScript support
- Environment variable management
- Cross-platform compatibility
- Responsive design principles
- Context-based state management

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Acknowledgments

- Weather data provided by OpenWeatherMap
- Icons by Feather Icons and Material Community Icons
- Expo team for the development platform
- React Native community for components and inspiration


## Authors

-Barbara Souza
[GitHub](https://github.com/BarbSouza)

-Heloisa Eugenio
[GitHub](https://github.com/Heloeugenio)