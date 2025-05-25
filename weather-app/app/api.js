import axios from 'axios';
// OpenWeatherMap API key and base URLs
export const WEATHER_API_KEY = 'ddde560ae7ec6510c8d92298fc9da08f';
export const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const MAP_BASE_URL = 'https://tile.openweathermap.org/map';

export const fetchCurrentWeather = async (latitude, longitude, units = 'metric') => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchForecast = async (latitude, longitude, units = 'metric') => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

export const fetchHourlyForecast = async (latitude, longitude, units = 'metric') => {
  try {
    // OpenWeatherMap's OneCall API provides hourly forecasts
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

export const fetchAirPollution = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/air_pollution?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching air pollution data:', error);
    throw error;
  }
};

export const fetchMonthlyForecast = async (latitude, longitude, units = 'metric') => {
  try {
    // This uses the Climate Forecast API (requires subscription)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/climate/month?lat=${latitude}&lon=${longitude}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly forecast:', error);
    throw error;
  }
};

export const searchLocation = async (query, units = 'metric') => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?q=${query}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};

// New function for city suggestions using Geocoding API
export const fetchCitySuggestions = async (query) => {
  try {
    if (query.length < 3) return [];
    
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`
    );
    
    // Format the suggestions to include city, state, and country
    return response.data.map(city => ({
      name: city.name,
      country: city.country,
      state: city.state || '',
      displayName: `${city.name}${city.state ? ', ' + city.state : ''}, ${city.country}`,
      lat: city.lat,
      lon: city.lon
    }));
  } catch (error) {
    console.error('Error fetching city suggestions:', error);
    return [];
  }
};