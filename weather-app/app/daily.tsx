import React from 'react';
import {
  Text,
  View,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatDate, formatPrecipitation } from './components/WeatherUtils';

export default function Daily() {
  const { dailyForecastData, isLoading, errorMsg } = useWeather();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading forecast data...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : dailyForecastData.length > 0 ? (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          <View style={styles.forecastContainer}>
            <Text style={styles.forecastTitle}>5-Day Forecast</Text>
            {dailyForecastData.map((forecast, index) => (
              <View key={index} style={styles.forecastItem}>
                <Text style={styles.forecastDay}>{formatDate(forecast.dt)}</Text>
                <View style={styles.forecastDetails}>
                  <View style={styles.forecastIconTemp}>
                    <WeatherIcon weatherId={forecast.weather[0].id} />
                    <View style={styles.forecastTempContainer}>
                      <Text style={styles.forecastTemp}>
                        {Math.round(forecast.main.temp)}°C
                      </Text>
                      <View style={styles.forecastMinMaxContainer}>
                        <Text style={styles.forecastMinMax}>
                          H: {Math.round(forecast.main.temp_max)}° L: {Math.round(forecast.main.temp_min)}°
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={styles.forecastRightColumn}>
                    <Text style={styles.forecastDescription}>
                      {forecast.weather[0].description}
                    </Text>
                    <View style={styles.forecastPrecipitation}>
                      <Feather name="droplet" size={14} color="#1E90FF" />
                      <Text style={styles.forecastPrecipitationText}>
                        {formatPrecipitation(forecast.pop)}
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
          
          {/* Additional Forecast Information */}
          <View style={[styles.forecastContainer, { marginTop: 16 }]}>
            <Text style={styles.forecastTitle}>What to Expect</Text>
            <Text style={styles.forecastInfoText}>
              This 5-day forecast provides a daily summary of expected weather conditions. 
              The temperature shown is the average daily temperature, with highs and lows indicated.
            </Text>
            <Text style={styles.forecastInfoText}>
              Precipitation percentage indicates the likelihood of rain or snow during the day.
            </Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.noDataContainer}>
          <Text style={styles.noDataText}>No forecast data available</Text>
        </View>
      )}
    </SafeAreaView>
  );
}