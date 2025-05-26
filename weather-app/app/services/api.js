import axios from 'axios';

/** @constant OpenWeatherMap API configuration */
export const WEATHER_API_KEY = 'ddde560ae7ec6510c8d92298fc9da08f';
export const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
export const MAP_BASE_URL = 'https://tile.openweathermap.org/map';

/**
 * Fetches current weather data for given coordinates
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} units - Units of measurement ('metric' or 'imperial')
 */
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

/**
 * Fetches 5-day weather forecast for given coordinates
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} units - Units of measurement ('metric' or 'imperial')
 */
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

/**
 * Fetches hourly weather forecast using OneCall API
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} units - Units of measurement ('metric' or 'imperial')
 */
export const fetchHourlyForecast = async (latitude, longitude, units = 'metric') => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching hourly forecast:', error);
    throw error;
  }
};

/**
 * Fetches air pollution data for given coordinates
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 */
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

/**
 * Fetches monthly climate forecast (requires subscription)
 * @param {number} latitude - Location latitude
 * @param {number} longitude - Location longitude
 * @param {string} units - Units of measurement ('metric' or 'imperial')
 */
export const fetchMonthlyForecast = async (latitude, longitude, units = 'metric') => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/climate/month?lat=${latitude}&lon=${longitude}&units=${units}&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly forecast:', error);
    throw error;
  }
};

/**
 * Searches weather data for a location by name
 * @param {string} query - Location name to search
 * @param {string} units - Units of measurement ('metric' or 'imperial')
 */
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

/**
 * Fetches city suggestions based on search query
 * @param {string} query - Search query for city name
 */
export const fetchCitySuggestions = async (query) => {
  try {
    if (query.length < 1) return [];
    
    const response = await axios.get(
      `http://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${WEATHER_API_KEY}`
    );
    
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