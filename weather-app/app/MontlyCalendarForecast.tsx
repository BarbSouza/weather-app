import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import { getStyles } from './styles';
import { useWeather } from './WeatherContext';
import { WeatherIcon, formatPrecipitation } from './components/WeatherUtils';
import { useTheme } from './ThemeContext';
import { useNavigation } from 'expo-router';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function MonthlyCalendarForecast() {
  const { monthlyForecastData, isLoading, errorMsg } = useWeather();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarDays, setCalendarDays] = useState<Array<any>>([]);
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedForecast, setSelectedForecast] = useState<any>(null);
    const { isDarkTheme, toggleTheme } = useTheme();
    const navigation = useNavigation();
    useLayoutEffect(() => {
          navigation.setOptions({
              headerRight: () => (
                  <TouchableOpacity onPress={toggleTheme} style={{ marginRight: 16 }}>
                  <FontAwesome5
                      name={isDarkTheme ? 'sun' : 'moon'}
                      size={20}
                      color="#fff"
                  />
                  </TouchableOpacity>
          ),
      });
    }, [navigation, isDarkTheme]);
    
    const styles = getStyles(isDarkTheme); // Dynamic styles
  // Create calendar grid for month view
  useEffect(() => {
    const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1).getDay();
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    
    const days = [];
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push({ day: null, isEmpty: true });
    }
    
    // Add actual days of month
    for (let i = 1; i <= daysInMonth; i++) {
      const currentDate = new Date(selectedYear, selectedMonth, i);
      const timestamp = Math.floor(currentDate.getTime() / 1000);
      
      // Find weather forecast for this day if available
      const forecast = monthlyForecastData.find(f => {
        const forecastDate = new Date(f.dt * 1000);
        return forecastDate.getDate() === i && 
               forecastDate.getMonth() === selectedMonth &&
               forecastDate.getFullYear() === selectedYear;
      });
      
      days.push({
        day: i,
        timestamp,
        isEmpty: false,
        forecast: forecast || null
      });
    }
    
    setCalendarDays(days);
  }, [selectedMonth, selectedYear, monthlyForecastData]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
    setSelectedDate(null);
    setSelectedForecast(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
    setSelectedDate(null);
    setSelectedForecast(null);
  };

  const handleDayPress = (day: any) => {
    if (!day.isEmpty && day.forecast) {
      setSelectedDate(day.day);
      setSelectedForecast(day.forecast);
    }
  };

  const renderCalendarDay = (day: any, index: number) => {
    if (day.isEmpty) {
      return <View key={`empty-${index}`} style={styles.calendarEmptyDay} />;
    }

    const isSelected = selectedDate === day.day;
    const hasForecast = day.forecast !== null;
    const isToday = 
      day.day === new Date().getDate() && 
      selectedMonth === new Date().getMonth() && 
      selectedYear === new Date().getFullYear();

    return (
      <TouchableOpacity
        key={`day-${day.day}`}
        style={[
          styles.calendarDay,
          isToday && styles.calendarToday,
          isSelected && styles.calendarSelectedDay,
          !hasForecast && styles.calendarDayNoData
        ]}
        onPress={() => handleDayPress(day)}
        disabled={!hasForecast}
      >
        <Text style={[
          styles.calendarDayText,
          isSelected && styles.calendarSelectedDayText,
          isToday && styles.calendarTodayText
        ]}>
          {day.day}
        </Text>
        
        {hasForecast && (
          <>
            <Text style={styles.calendarDayTemp}>
              {Math.round(day.forecast.temp.average)}°
            </Text>
            {day.forecast.weather && day.forecast.weather[0]?.id && (
              <View style={styles.calendarDayIcon}>
                <WeatherIcon weatherId={day.forecast.weather[0].id} size={16} />
              </View>
            )}
          </>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Month Navigation */}
      <View style={styles.calendarHeader}>
        <TouchableOpacity 
          onPress={handlePrevMonth}
          style={styles.calendarNavButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        
        <Text style={styles.calendarMonthYear}>
          {MONTHS[selectedMonth]} {selectedYear}
        </Text>
        
        <TouchableOpacity 
          onPress={handleNextMonth}
          style={styles.calendarNavButton}
        >
          <MaterialCommunityIcons name="chevron-right" size={24} color="#333" />
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066cc" />
          <Text style={styles.loadingText}>Loading calendar data...</Text>
        </View>
      ) : errorMsg ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
        >
          {/* Calendar Grid */}
          <View style={styles.calendarContainer}>
            {/* Days of Week Header */}
            <View style={styles.calendarWeekdayHeader}>
              {DAYS_OF_WEEK.map(day => (
                <Text key={day} style={styles.calendarWeekdayText}>
                  {day}
                </Text>
              ))}
            </View>
            
            {/* Calendar Days Grid */}
            <View style={styles.calendarGrid}>
              {calendarDays.map((day, index) => renderCalendarDay(day, index))}
            </View>
            
            {/* Legend */}
            <View style={styles.calendarLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: '#E1F5FE' }]} />
                <Text style={styles.legendText}>Available Forecast</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendColorBox, { backgroundColor: '#f5f5f5' }]} />
                <Text style={styles.legendText}>No Data</Text>
              </View>
            </View>
          </View>

          {/* Selected Day Forecast Details */}
          {selectedForecast && (
            <View style={styles.selectedForecastContainer}>
              <Text style={styles.selectedForecastTitle}>
                Forecast for {MONTHS[selectedMonth]} {selectedDate}, {selectedYear}
              </Text>
              
              <View style={styles.selectedForecastContent}>
                <View style={styles.selectedForecastMainInfo}>
                  {selectedForecast.weather && selectedForecast.weather[0]?.id ? (
                    <WeatherIcon weatherId={selectedForecast.weather[0].id} size={48} />
                  ) : (
                    <MaterialCommunityIcons name="weather-partly-cloudy" size={48} color="#666" />
                  )}
                  
                  <View style={styles.selectedForecastTemp}>
                    <Text style={styles.selectedForecastTempValue}>
                      {Math.round(selectedForecast.temp.average)}°C
                    </Text>
                    <Text style={styles.selectedForecastDescription}>
                      {selectedForecast.weather && selectedForecast.weather[0]?.description ? 
                        selectedForecast.weather[0].description : 'Climate prediction'}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.selectedForecastDetails}>
                  <View style={styles.forecastDetailItem}>
                    <MaterialCommunityIcons name="thermometer" size={18} color="#FF9800" />
                    <Text style={styles.forecastDetailLabel}>High</Text>
                    <Text style={styles.forecastDetailValue}>
                      {Math.round(selectedForecast.temp.max)}°C
                    </Text>
                  </View>
                  
                  <View style={styles.forecastDetailItem}>
                    <MaterialCommunityIcons name="thermometer-low" size={18} color="#2196F3" />
                    <Text style={styles.forecastDetailLabel}>Low</Text>
                    <Text style={styles.forecastDetailValue}>
                      {Math.round(selectedForecast.temp.min)}°C
                    </Text>
                  </View>
                  
                  <View style={styles.forecastDetailItem}>
                    <MaterialCommunityIcons name="water-percent" size={18} color="#1E88E5" />
                    <Text style={styles.forecastDetailLabel}>Humidity</Text>
                    <Text style={styles.forecastDetailValue}>{selectedForecast.humidity}%</Text>
                  </View>
                  
                  {selectedForecast.pop !== undefined && (
                    <View style={styles.forecastDetailItem}>
                      <Feather name="droplet" size={18} color="#1E90FF" />
                      <Text style={styles.forecastDetailLabel}>Precipitation</Text>
                      <Text style={styles.forecastDetailValue}>
                        {formatPrecipitation(selectedForecast.pop)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </View>
          )}
          
          {/* Info Box */}
          <View style={[styles.forecastContainer, { marginTop: 16 }]}>
            <Text style={styles.forecastTitle}>About Monthly Calendar</Text>
            <Text style={styles.forecastInfoText}>
              This calendar view displays a monthly overview of weather forecasts. Days with 
              available forecast data are highlighted and clickable.
            </Text>
            <Text style={styles.forecastInfoText}>
              Select a day to view detailed forecast information for that date. Climate forecasts 
              are most accurate for the near future and become less reliable for dates further ahead.
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}