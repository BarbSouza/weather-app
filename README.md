# Weather App Documentation
**Assignment Documentation for Cross-Platform Development**  
**Authors:** Barbara Souza & Heloisa Eugenio

## Project Overview
A cross-platform weather application developed using Expo and React Native that provides comprehensive weather information through a modern, user-friendly interface. The app integrates with OpenWeatherMap API to deliver real-time weather data and forecasts.

## Key Features

### 1. Core Functionality
- **Real-time Weather Updates:**
  - Current temperature and conditions
  - "Feels like" temperature
  - Humidity levels
  - Wind speed and direction
  - Atmospheric pressure
  - Visibility conditions

- **Location Services:**
  - Current location detection
  - City search with autocomplete
  - Search history tracking
  - Favorite locations management

- **User Preferences:**
  - Temperature unit toggle (°C/°F)
  - Dark/Light theme options
  - Customizable display settings

### 2. Weather Forecasts
- **Hourly Forecast:**
  - 24-hour prediction
  - Temperature trends
  - Precipitation probability
  - Weather condition icons

- **Daily Forecast:**
  - 5-day weather outlook
  - High/low temperatures
  - Precipitation chances
  - Wind conditions

- **Monthly Calendar:**
  - Extended forecast view
  - Temperature trends
  - Historical data access

### 3. Interactive Maps
- **Weather Layer Visualization:**
  - Temperature distribution
  - Precipitation patterns
  - Wind speed variations
  - Pressure systems

## Technical Implementation

### Architecture
```
app/
├── components/         # UI Components
├── contexts/          # State Management
├── services/          # API Services
├── styles/           # Styling
└── tabs/             # Navigation
```

### Core Technologies
- **Frontend Framework:**
  - Expo
  - React Native
  - TypeScript

- **State Management:**
  - React Context API
  - AsyncStorage

- **UI Components:**
  - React Native Vector Icons
  - Expo Linear Gradient
  - React Native Maps

### API Integration
```javascript
const fetchCurrentWeather = async (latitude, longitude, units = 'metric') => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    throw error;
  }
};
```

## Setup Instructions

1. **Prerequisites:**
```bash
# Install Node.js (v14+)
# Install Expo CLI
npm install -g expo-cli
```

2. **Installation:**
```bash
# Clone repository
git clone [repository-url]
cd weather-app

# Install dependencies
npm install

# Install Expo packages
npx expo install expo-location
npx expo install @react-native-async-storage/async-storage
npx expo install expo-linear-gradient
npx expo install react-native-maps
```

3. **Configuration:**
```bash
# Change to your API Key on api.js
WEATHER_API_KEY=your_api_key_here
```

4. **Running the App:**
```bash
# Start development server
npx expo start

# Platform options
i # iOS
a # Android
w # Web
```

## Features Implementation Details

### 1. Weather Data Display
- Real-time data fetching using OpenWeatherMap API
- Custom weather icons based on conditions
- Animated weather backgrounds
- Responsive design for all screen sizes

### 2. Navigation System
- Tab-based navigation
- Stack navigation for detailed views
- Gesture handling
- Screen transitions

### 3. State Management
- Context providers for global state
- Local storage for user preferences
- Cache management for API responses

## Testing and Quality Assurance
- Unit testing for core components
- Integration testing for API services
- User interface testing
- Cross-platform compatibility verification

## Future Enhancements
1. Weather alerts and notifications
2. Widget support
3. Extended forecast data
4. Weather maps customization
5. Multiple location comparison

## References
- OpenWeatherMap API Documentation
- React Native Documentation
- Expo Documentation
- Material Design Guidelines

## Project Contributors
- Barbara Souza ([@BarbSouza](https://github.com/BarbSouza))
- Heloisa Eugenio ([@Heloeugenio](https://github.com/Heloeugenio))

---
*This documentation was created for educational purposes as part of a assignment in Cross-Platform Development for CCT College.*