import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Props for the WeatherIcon component
 * @property weatherId - OpenWeather API weather condition code
 * @property size - Icon size in pixels (default: 75)
 */
interface WeatherIconProps {
  weatherId: number;
  size?: number;
}

/**
 * Weather Icon Component
 * Renders appropriate weather icon based on OpenWeather API condition codes:
 * - 200-299: Thunderstorm (lightning)
 * - 300-399: Drizzle (pouring)
 * - 500-599: Rain (rainy)
 * - 600-699: Snow (snowy)
 * - 700-799: Atmosphere (fog)
 * - 800: Clear sky (sunny)
 * - 801-899: Clouds (cloudy)
 */
export const WeatherIcon: React.FC<WeatherIconProps> = ({ weatherId, size = 75 }) => {
  if (weatherId >= 200 && weatherId < 300) {
    return <MaterialCommunityIcons name="weather-lightning" size={size} color="#FFD700" />;
  } else if (weatherId >= 300 && weatherId < 400) {
    return <MaterialCommunityIcons name="weather-pouring" size={size} color="#87CEFA" />;
  } else if (weatherId >= 500 && weatherId < 600) {
    return <MaterialCommunityIcons name="weather-rainy" size={size} color="#1E90FF" />;
  } else if (weatherId >= 600 && weatherId < 700) {
    return <MaterialCommunityIcons name="weather-snowy" size={size} color="#FFFFFF" />;
  } else if (weatherId >= 700 && weatherId < 800) {
    return <MaterialCommunityIcons name="weather-fog" size={size} color="#778899" />;
  } else if (weatherId === 800) {
    return <MaterialCommunityIcons name="weather-sunny" size={size} color="#FFD700" />;
  } else if (weatherId >= 801 && weatherId < 900) {
    return <MaterialCommunityIcons name="weather-cloudy" size={size} color="#71aaac" />;
  } else {
    return <MaterialCommunityIcons name="weather-cloudy" size={size} color="#71aaac" />;
  }
};

/**
 * Formats a Unix timestamp into a short date string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date string (e.g., "Mon, Jan 1")
 */
export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a Unix timestamp into a 12-hour time string
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted time string (e.g., "3 PM")
 */
export const formatHour = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

/**
 * Formats precipitation probability as a percentage
 * @param pop - Probability of precipitation (0-1)
 * @returns Formatted percentage string (e.g., "75%")
 */
export const formatPrecipitation = (pop?: number): string => {
  if (pop === undefined) return '0%';
  return `${Math.round(pop * 100)}%`;
};