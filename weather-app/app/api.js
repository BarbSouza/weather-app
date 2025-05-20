import axios from 'axios';
// OpenWeatherMap API key and base URL
const WEATHER_API_KEY = 'ddde560ae7ec6510c8d92298fc9da08f';
const WEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';

export const fetchCurrentWeather = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching current weather:', error);
    throw error;
  }
};

export const fetchForecast = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching forecast:', error);
    throw error;
  }
};

export const fetchHourlyForecast = async (latitude, longitude) => {
  try {
    // OpenWeatherMap's OneCall API provides hourly forecasts
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${latitude}&lon=${longitude}&exclude=minutely&units=metric&appid=${WEATHER_API_KEY}`
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

export const fetchMonthlyForecast = async (latitude, longitude) => {
  try {
    // This uses the Climate Forecast API (requires subscription)
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/climate/month?lat=${latitude}&lon=${longitude}&units=metric&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching monthly forecast:', error);
    throw error;
  }
};

export const searchLocation = async (query) => {
  try {
    const response = await axios.get(
      `${WEATHER_BASE_URL}/weather?q=${query}&units=metric&appid=${WEATHER_API_KEY}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching location:', error);
    throw error;
  }
};