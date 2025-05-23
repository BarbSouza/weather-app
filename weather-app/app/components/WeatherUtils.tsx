import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface WeatherIconProps {
  weatherId: number;
  size?: number;
}

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

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
};

export const formatHour = (timestamp: number): string => {
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString('en-US', { hour: 'numeric', hour12: true });
};

export const formatPrecipitation = (pop?: number): string => {
  if (pop === undefined) return '0%';
  return `${Math.round(pop * 100)}%`;
};