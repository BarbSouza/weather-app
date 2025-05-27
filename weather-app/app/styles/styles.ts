import { StyleSheet, Platform, useWindowDimensions } from 'react-native';

/**
 * Generates responsive styles for the weather app
 * @param isDarkTheme - Current theme state (dark/light)
 * @returns React Native StyleSheet object
 */
export const getStyles = (isDarkTheme: boolean) => {
  const { width } = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1200;

  // Color constants
  const colors = {
    primary: isDarkTheme ? '#1b3848' : '#2e6a8a',
    background: isDarkTheme ? '#0F172A' : '#E0F2FE',
    surface: isDarkTheme ? '#1E293B' : '#fff',
    surfaceVariant: isDarkTheme ? '#334155' : '#f0f0f0',
    text: isDarkTheme ? '#F1F5F9' : '#333',
    textSecondary: isDarkTheme ? '#D1D5DB' : '#666',
    textMuted: isDarkTheme ? '#9CA3AF' : '#888',
    error: '#d32f2f',
    accent: '#0066cc',
    precipitation: '#1E90FF',
  };

  return StyleSheet.create({
    // Layout & Container Styles
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 16,
      ...(isDesktop && {
        width: '100%',
        marginLeft: 'auto',
        marginRight: 'auto'
      }),
    },
    
    scrollViewContent: {
      paddingBottom: 20,
    },

    // Header Styles
    locationHeaderContainer: {
      alignItems: 'center',
      marginBottom: 16,
      paddingTop: 8,
    },
    
    locationHeaderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      textAlign: 'center',
    },

    // Search & Location Styles
    searchContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    
    searchInput: {
      flex: 1,
      height: 46,
      backgroundColor: '#fff',
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      color: '#333',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    
    searchButton: {
      width: 46,
      height: 46,
      backgroundColor: colors.primary,
      borderRadius: 8,
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    locationButton: {
      flexDirection: 'row',
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginBottom: 20,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
      marginTop: 10,
    },
    
    locationButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 8,
    },

    // State Styles (Loading, Error, Empty)
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: colors.textSecondary,
    },
    
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    
    errorText: {
      fontSize: 16,
      color: colors.error,
      textAlign: 'center',
    },

    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    
    emptyStateIcon: {
      marginBottom: 20,
      opacity: 0.7,
    },
    
    emptyStateText: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 10,
    },
    
    emptyStateDescription: {
      fontSize: 14,
      color: colors.textMuted,
      textAlign: 'center',
      marginBottom: 20,
    },

    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
    },
    
    noDataText: {
      fontSize: 16,
      color: colors.text,
      textAlign: 'center',
    },

    // Current Weather Styles
    currentWeatherContainer: {
      backgroundColor: 'transparent',
      padding: 0,
      marginBottom: 0,
      ...(Platform.OS === 'web' && width >= 1070 && {
        padding: 100,
      }),
    },
    
    currentDateTime: {
      fontSize: 18,
      color: colors.text,
      textAlign: 'center',
      marginBottom: 6,
    },
    
    locationName: {
      fontSize: 25,
      fontWeight: 'bold',
      marginBottom: 12,
      color: colors.text,
      textAlign: 'center',
    },
    
    currentWeatherContent: {
      alignItems: 'center',
    },
    
    temperatureContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 5,
    },
    
    temperature: {
      fontSize: 48,
      fontWeight: 'bold',
      color: colors.text,
      marginLeft: 10,
    },
    
    weatherDescription: {
      fontSize: 19,
      color: colors.text,
      textTransform: 'capitalize',
      marginBottom: 15,
    },
    
    weatherDetailsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 10,
    },
    
    weatherDetail: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 5,
    },
    
    weatherDetailText: {
      fontSize: 14,
      color: colors.text,
      marginLeft: 5,
    },
    
    feelsLikeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
    },
    
    feelsLikeText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 5,
    },

    // Forecast Container Styles
    hourlyForecastContainer: {
      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      borderRadius: 20,
      padding: Platform.select({ web: 20, default: 12 }),
      marginTop: Platform.select({ web: 20, default: 16 }),
      marginBottom: Platform.select({ web: 20, default: 16 }),
      alignItems: 'center',
      ...(Platform.OS === 'web' && {
        width: '100%', 
        maxWidth: 800, 
        alignSelf: 'center',
        ...(Platform.OS === 'web' && width >= 1070 && {
        padding: 40,
      }),
      }),
    },

    dailyForecastContainer: {
      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      padding: Platform.select({ web: 20, default: 12 }),
      marginBottom: Platform.select({ web: 20, default: 6 }),
      borderRadius: 20,
      marginTop: Platform.select({ web: 20, default: 10 }),
      alignItems: 'center',
      ...(Platform.OS === 'web' && {
        width: '100%', 
        maxWidth: 800, 
        alignSelf: 'center',
        padding: 30,
      }),
      ...(Platform.OS === 'web' && width >= 1070 && {
        padding: 40,
      }),
    },

    forecastContainer: {
      backgroundColor: isDarkTheme ? '#1e293b57' : '#ffffff59',
      borderRadius: 12,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    forecastTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 15,
      color: colors.text,
    },

    // Hourly Forecast Styles
    hourlyForecastList: {
      paddingVertical: 10,
      ...(Platform.OS === 'web' && {
        flexWrap: 'wrap',
        justifyContent: 'center',
        flexDirection: 'row',
      }),
    },
    
    hourlyItem: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 10,
      alignItems: 'center',
      marginHorizontal: 6,
      marginVertical: Platform.OS === 'web' ? 6 : 0,
      width: 80,
    },
    
    hourlyTime: {
      fontSize: 14,
      color: colors.text,
      marginBottom: 8,
    },
    
    hourlyTemp: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginTop: 6,
      marginBottom: 4,
    },

    // Daily Forecast Styles
    dailyForecastList: {
      paddingVertical: 10,
      paddingHorizontal: 12,
      ...(Platform.OS === 'web' && {
        flexWrap: 'wrap',
        justifyContent: 'center',
        flexDirection: 'row',
      }),
    },
    
    dailyItem: {
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 12,
      alignItems: 'center',
      marginHorizontal: 6,
      marginVertical: Platform.OS === 'web' ? 6 : 0,
      width: 80,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
      elevation: 2,
    },
    
    dailyDay: {
      fontSize: 13,
      color: colors.text,
      marginBottom: 4,
      textAlign: 'center',
    },
    
    dailyTempContainer: {
      alignItems: 'center',
      marginTop: 4,
    },
    
    dailyTemp: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },

    // Detailed Forecast Styles
    forecastItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? '#374151' : '#eee',
    },
    
    forecastDay: {
      fontSize: 16,
      color: colors.text,
      width: '30%',
    },
    
    forecastDetails: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '68%',
    },
    
    forecastIconTemp: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    forecastTempContainer: {
      marginLeft: 8,
    },
    
    forecastTemp: {
      fontSize: 18,
      fontWeight: '500',
      color: colors.text,
    },
    
    forecastMinMaxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    forecastMinMax: {
      fontSize: 11,
      color: colors.text,
    },
    
    forecastRightColumn: {
      alignItems: 'flex-end',
    },
    
    forecastDescription: {
      fontSize: 14,
      color: colors.text,
      textTransform: 'capitalize',
      marginBottom: 4,
    },

    // Precipitation Styles
    precipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    precipText: {
      fontSize: 12,
      color: colors.precipitation,
      marginLeft: 2,
    },
    
    forecastPrecipitation: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    forecastPrecipitationText: {
      fontSize: 12,
      color: colors.precipitation,
      marginLeft: 4,
    },

    // Hourly Detail Styles
    hourlyDetailItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? '#374151' : '#eee',
    },
    
    hourlyDetailLeft: {
      width: '28%',
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    hourlyDetailTime: {
      marginRight: 8,
      fontSize: 14,
      color: colors.text,
    },
    
    hourlyDetailCenter: {
      width: '40%',
    },
    
    hourlyDetailDescription: {
      fontSize: 15,
      color: colors.textSecondary,
      textTransform: 'capitalize',
    },
    
    hourlyDetailRight: {
      width: '30%',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
    },
    
    hourlyDetailTemp: {
      fontSize: 16,
      fontWeight: '500',
      color: colors.text,
      marginRight: 10,
    },
    
    hourlyDetailPrecip: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    
    hourlyDetailPrecipText: {
      fontSize: 14,
      color: colors.precipitation,
      marginLeft: 2,
    },

    // Toggle & Control Styles
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: colors.surfaceVariant,
      borderWidth: 1,
      borderColor: isDarkTheme ? '#4B5563' : '#ccc',
    },
    
    toggleButtonActive: {
      backgroundColor: colors.primary,
    },
    
    toggleButtonText: {
      fontSize: 16,
      color: colors.text,
    },
    
    toggleButtonTextActive: {
      color: '#fff',
      fontWeight: '500',
    },

    unitToggleContainer: {
      flexDirection: 'row',
      borderWidth: 1,
      borderColor: isDarkTheme ? '#4B5563' : '#ddd',
      borderRadius: 4,
      overflow: 'hidden',
      alignSelf: 'center',
      marginVertical: 10,
    },
    
    unitToggleButton: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceVariant,
    },
    
    unitToggleButtonActive: {
      backgroundColor: colors.primary,
    },
    
    unitToggleText: {
      fontSize: 14,
      color: colors.text,
    },
    
    unitToggleTextActive: {
      color: '#fff',
    },

    // Utility Styles
    showMoreButton: {
      paddingVertical: 12,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? '#374151' : '#eee',
      marginTop: 10,
    },
    
    showMoreText: {
      fontSize: 16,
      color: colors.accent,
      fontWeight: '500',
    },
    
    refreshContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
      ...(Platform.OS === 'web' && width >= 1070 &&{
        
        justifyContent: 'flex-end',
      }),
    },
    
    refreshText: {
      fontSize: 14,
      color: colors.accent,
      marginLeft: 5,
    },
    
    lastUpdatedText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: 5,
    },

    // Info & Text Styles
    forecastInfoText: {
      fontSize: 14,
      color: colors.textSecondary,
      marginBottom: 10,
      lineHeight: 20,
    },
    
    additionalInfoContainer: {
      marginTop: 16,
    },
    
    detailsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginVertical: 5,
    },
    
    detailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    
    detailValue: {
      fontSize: 14,
      color: colors.text,
      fontWeight: '500',
    },

    // Air Quality Styles
    airQualityContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 15,
      marginTop: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    airQualityTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: colors.text,
    },
    
    airQualityIndex: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
      marginVertical: 5,
    },
    
    airQualityDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      marginBottom: 10,
    },

    // Calendar Styles
    calendarContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 15,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
            ...(Platform.OS === 'web' && {
        width: '50%', 
        maxWidth: 500,
        alignSelf: 'center',
      }),
    },
    
    calendarHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 5,
      marginBottom: 10,
    },
    
    calendarMonthYear: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
    },
    
    calendarNavButton: {
      padding: 8,
      borderRadius: 20,
      backgroundColor: isDarkTheme ? '#adabab' : '#b4b4b4',
    },
    
    calendarWeekdayHeader: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 10,
    },
    
    calendarWeekdayText: {
      width: '14.28%',
      textAlign: 'center',
      fontWeight: '500',
      color: colors.text,
      fontSize: 14,
    },
    
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    
    calendarDay: {
      width: '14.28%',
      aspectRatio: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 6,
      backgroundColor: isDarkTheme ? '#475469' : '#c2e7f8',
      borderRadius: 8,
      padding: 4,
    },
    
    calendarToday: {
      backgroundColor: isDarkTheme ? '#1D4ED8' : '#B3E5FC',
      borderWidth: 2,
      borderColor: '#0288D1',
    },
    
    calendarTodayText: {
      fontWeight: 'bold',
      color: colors.text,
    },
    
    calendarSelectedDay: {
      backgroundColor: '#063f9ecf',
      elevation: 2,
    },
    
    calendarSelectedDayText: {
      color: '#fff',
      fontWeight: 'bold',
    },
    
    calendarDayNoData: {
      backgroundColor: isDarkTheme ? '#2D3748' : '#f5f5f5',
    },
    
    calendarEmptyDay: {
      width: '14.28%',
      aspectRatio: 1,
    },
    
    calendarDayText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },
    
    calendarDayTemp: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    
    calendarDayIcon: {
      marginTop: 2,
      opacity: 0.8,
    },
    
    calendarLegend: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginHorizontal: 8,
    },
    
    legendColorBox: {
      width: 12,
      height: 12,
      borderRadius: 3,
      marginRight: 6,
    },
    
    legendText: {
      fontSize: 12,
      color: colors.textSecondary,
    },

    // Selected Forecast Styles
    selectedForecastContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: 20,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    
    selectedForecastTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 15,
    },
    
    selectedForecastContent: {
      alignItems: 'stretch',
    },
    
    selectedForecastMainInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 20,
      paddingBottom: 15,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? '#374151' : '#eee',
    },
    
    selectedForecastTemp: {
      marginLeft: 15,
    },
    
    selectedForecastTempValue: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text,
    },
    
    selectedForecastDescription: {
      fontSize: 16,
      color: colors.textSecondary,
      textTransform: 'capitalize',
      marginTop: 5,
    },
    
    selectedForecastDetails: {
      marginTop: 5,
    },
    
    forecastDetailItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    
    forecastDetailLabel: {
      fontSize: 14,
      color: colors.textSecondary,
      marginLeft: 10,
      width: 100,
    },
    
    forecastDetailValue: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text,
    },

    // Tab Styles
    tabContainer: {
      backgroundColor: colors.surface,
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? '#374151' : '#e0e0e0',
    },
    
    tabBar: {
      height: 60,
      paddingBottom: 5,
      paddingTop: 5,
    },
    
    tabBarLabel: {
      fontSize: 12,
      textAlign: 'center',
      marginBottom: 4,
    },
    
    tabBarIcon: {
      marginTop: 4,
    },
    
    tabBarActive: {
      color: colors.accent,
    },
    
    tabBarInactive: {
      color: colors.textMuted,
    },

    // Styles
    divider: {
      height: 1,
      backgroundColor: isDarkTheme ? '#374151' : '#eee',
      marginVertical: 10,
      width: '100%',
    },
    
    footerContainer: {
      marginTop: 20,
      alignItems: 'center',
      paddingBottom: 20,
    },
    
    footerText: {
      fontSize: 12,
      color: colors.textMuted,
      textAlign: 'center',
    },
    
    settingsButton: {
      position: 'absolute',
      top: 10,
      right: 16,
      zIndex: 10,
    },

    // Pills for compact displays
    pillContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      width: '100%',
      marginTop: 12,
      marginBottom: 20,
    },
    
    pillItem: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      marginHorizontal: 5,
      borderRadius: 30,
      backgroundColor: colors.surfaceVariant,
    },
    
    pillText: {
      color: colors.text,
      fontWeight: '500',
      fontSize: 14,
    },
  });
};