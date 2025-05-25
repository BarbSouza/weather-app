import { StyleSheet, Platform, useWindowDimensions  } from 'react-native';


export const getStyles = (isDarkTheme:boolean) =>{

  const {width} = useWindowDimensions();
  const isDesktop = Platform.OS === 'web' && width >= 1200;
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkTheme ? '#0F172A' : '#E0F2FE',
      padding: 16,
      ...( isDesktop && {
          width: '60%',
          marginLeft: 'auto',
          marginRight: 'auto'         
        }),
    },
        locationHeaderContainer: {
      alignItems: 'center',
      marginBottom: 16,
      paddingTop: 8,
    },
    locationHeaderText: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkTheme ? '#F1F5F9' : '#333',
      textAlign: 'center',
    },
    searchContainer: {
      flexDirection: 'row',
      marginTop: 10,
    },
    searchInput: {
      flex: 1,
      height: 46,
      backgroundColor: isDarkTheme ? 'white' : 'white',
      borderRadius: 8,
      paddingHorizontal: 15,
      fontSize: 16,
      color: isDarkTheme ? '#F1F5F9' : '#333',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    searchButton: {
      width: 46,
      height: 46,
      backgroundColor: isDarkTheme ? '#0066cc' :'#0066cc',
      borderRadius: 8,
      marginLeft: 10,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 0,
    },
    locationButton: {
      flexDirection: 'row',
      backgroundColor: '#4CAF50',
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
      marginTop:10,
    },
    locationButtonText: {
      color: '#fff',
      fontSize: 15,
      fontWeight: '500',
      marginLeft: 8,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      //backgroundColor: isDarkTheme ? '#000' :'#0066cc',
    },
    loadingText: {
      marginTop: 10,
      fontSize: 16,
      color: isDarkTheme ? '#F1F5F9' : '#555',
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
    },
    errorText: {
      fontSize: 16,
      color: '#d32f2f',
      textAlign: 'center',
    },
    scrollViewContent: {
      paddingBottom: 20,
    },
    currentWeatherContainer: {
    backgroundColor: 'transparent',
    padding: 0,
    marginBottom: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  //DATE/TIME //TOP
    currentDateTime: {
      fontSize: 18,
      color: isDarkTheme ? '#F1F5F9' : '1a1919',
      textAlign: 'center',
      marginBottom: 6,
  },
  //LOCATION NAME
    locationName: {
      fontSize: 25,
      fontWeight: 'bold',
      marginBottom: 12,
      color: isDarkTheme ? '#F1F5F9' : '#333',
      textAlign: 'center',
    },
    currentWeatherContent: {
      alignItems: 'center',
      //experimental_backgroundImage:'x/assets/images/NO8hx.png',
    },
    temperatureContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      marginBottom: 5,
    },
    temperature: {
      fontSize: 48,
      fontWeight: 'bold',
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginLeft: 10,
    },
    //WEATHER DESCRIPTION
    weatherDescription: {
      fontSize: 19,
      color: isDarkTheme ? '#F1F5F9' : 'black',
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
      color: isDarkTheme ? 'white' : 'black',
      marginLeft: 5,
    },
    feelsLikeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 15,
      color: isDarkTheme ? 'white' : 'black',
    },
    feelsLikeText: {
      fontSize: 14,
      color: isDarkTheme ? '#F1F5F9' : '#555',
      marginLeft: 5,
    },

    hourlyForecastContainer: {
    backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
    borderRadius: 20,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
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
    backgroundColor: isDarkTheme ? '#334155' : '#f0f0f0',
  },
  pillText: {
    color: isDarkTheme ? '#F1F5F9' : '#333',
    fontWeight: '500',
    fontSize: 14,
  },
  
    hourlyForecastList: {
      paddingVertical: 10,
      
    },
    hourlyItem: {
    backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
    borderRadius: 20,
    padding: 10,
    alignItems: 'center',
    marginHorizontal: 6,
    width: 70,
  },

    hourlyTime: {
      fontSize: 14,
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginBottom: 8,
    },
    hourlyTemp: {
      fontSize: 16,
      fontWeight: '500',
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginTop: 6,
      marginBottom: 4,
    },
    precipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    precipText: {
      fontSize: 12,
      color: '#1E90FF',
      marginLeft: 2,
    },
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: 16,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      backgroundColor: isDarkTheme ? '#374151' : '#e0e0e0',
      borderWidth: 1,
      borderColor: isDarkTheme ? '#4B5563' : '#ccc',
    },
    toggleButtonActive: {
      backgroundColor: '#0066cc',
    },
    toggleButtonText: {
      fontSize: 16,
      color: isDarkTheme ? '#F1F5F9' : '#333',
    },
    toggleButtonTextActive: {
      color: '#fff',
      fontWeight: '500',
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
      color: isDarkTheme ? 'white' : 'black',
    },
    forecastItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: isDarkTheme ? '#374151' : '#eee',
    },
    forecastDay: {
      fontSize: 16,
      color: isDarkTheme ? '#F1F5F9' : '#333',
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
      color: isDarkTheme ? '#F1F5F9' : '#333',
    },
    forecastMinMaxContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    forecastMinMax: {
      fontSize: 13,
      color: isDarkTheme ? 'white' : 'black',
    },
    forecastRightColumn: {
      alignItems: 'flex-end',
    },
    forecastDescription: {
      fontSize: 14,
      color: isDarkTheme ? 'white' : 'black',
      textTransform: 'capitalize',
      marginBottom: 4,
    },
    forecastPrecipitation: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    forecastPrecipitationText: {
      fontSize: 12,
      color: '#1E90FF',
      marginLeft: 4,
    },
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
      color: isDarkTheme ? 'white' : 'black',
    },
    hourlyDetailCenter: {
      width: '40%',
    },
    hourlyDetailDescription: {
      fontSize: 15,
      color: isDarkTheme ? '#D1D5DB' : '#666',
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
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginRight: 10,
    },
    hourlyDetailPrecip: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    hourlyDetailPrecipText: {
      fontSize: 14,
      color: '#1E90FF',
      marginLeft: 2,
    },
    showMoreButton: {
      paddingVertical: 12,
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: isDarkTheme ? '#374151' : '#eee',
      marginTop: 10,
    },
    showMoreText: {
      fontSize: 16,
      color: '#0066cc',
      fontWeight: '500',
    },
    noDataContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: 25,
    },
    noDataText: {
      fontSize: 16,
      color: isDarkTheme ? '#F1F5F9' : '#666',
      textAlign: 'center',
    },
    // Tab styles
    tabContainer: {
      backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
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
      color: '#0066cc',
    },
    tabBarInactive: {
      color: isDarkTheme ? '#9CA3AF' : '#888',
    },
    // Additional styles for WeatherContext and components
    forecastInfoText: {
      fontSize: 14,
      color: isDarkTheme ? '#D1D5DB' : '#666',
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
      color: isDarkTheme ? '#D1D5DB' : '#666',
    },
    detailValue: {
      fontSize: 14,
      color: isDarkTheme ? '#F1F5F9' : '#333',
      fontWeight: '500',
    },
    airQualityContainer: {
      backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
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
      color: isDarkTheme ? '#F1F5F9' : '#333',
    },
    airQualityIndex: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginVertical: 5,
    },
    airQualityDescription: {
      fontSize: 16,
      color: isDarkTheme ? '#D1D5DB' : '#666',
      marginBottom: 10,
    },
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
      color: isDarkTheme ? '#9CA3AF' : '#888',
      textAlign: 'center',
    },
    refreshContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 10,
    },
    refreshText: {
      fontSize: 14,
      color: '#0066cc',
      marginLeft: 5,
    },
    lastUpdatedText: {
      fontSize: 12,
      color: isDarkTheme ? '#9CA3AF' : '#888',
      textAlign: 'center',
      marginTop: 5,
    },
    settingsButton: {
      position: 'absolute',
      top: 10,
      right: 16,
      zIndex: 10,
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
      backgroundColor: isDarkTheme ? '#374151' : 'transparent',
    },
    unitToggleButtonActive: {
      backgroundColor: '#0066cc',
    },
    unitToggleText: {
      fontSize: 14,
      color: isDarkTheme ? '#F1F5F9' : '#333',
    },
    unitToggleTextActive: {
      color: '#fff',
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
      color: isDarkTheme ? '#F1F5F9' : '#666',
      textAlign: 'center',
      marginBottom: 10,
    },
    emptyStateDescription: {
      fontSize: 14,
      color: isDarkTheme ? '#9CA3AF' : '#888',
      textAlign: 'center',
      marginBottom: 20,
    },
    dailyForecastContainer: {
      backgroundColor: isDarkTheme ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
      padding: 12,
      marginBottom: 6,
      borderRadius: 20,
      marginTop: 10,
    
      elevation: 0,
      alignItems: 'center',
  },
    dailyForecastList: {
      paddingVertical: 10,
      paddingHorizontal: 12,
  },
    dailyItem: {
    backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
    borderRadius: 20,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 6,
    width: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
    dailyDay: {
    fontSize: 13,
    color: isDarkTheme ? '#F1F5F9' : '#333',
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
      color: isDarkTheme ? '#F1F5F9' : '#333',
      marginBottom: 4,
    },
    // Calendar styles
  calendarContainer: {
    backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    color: isDarkTheme ? '#F1F5F9' : '#333',
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
    color: isDarkTheme ? '#D1D5DB' : '#666',
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
    backgroundColor: isDarkTheme ? '#374151' : '#E1F5FE',
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
    color: isDarkTheme ? '#F1F5F9' : '#0288D1',
  },
  calendarSelectedDay: {
    backgroundColor: '#0066cc',
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
    color: isDarkTheme ? '#F1F5F9' : '#333',
  },
  calendarDayTemp: {
    fontSize: 12,
    color: isDarkTheme ? '#D1D5DB' : '#444',
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
    color: isDarkTheme ? '#D1D5DB' : '#666',
  },
  selectedForecastContainer: {
    backgroundColor: isDarkTheme ? '#1E293B' : '#fff',
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
    color: isDarkTheme ? '#F1F5F9' : '#333',
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
    color: isDarkTheme ? '#F1F5F9' : '#333',
  },
  selectedForecastDescription: {
    fontSize: 16,
    color: isDarkTheme ? '#D1D5DB' : '#666',
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
    color: isDarkTheme ? '#D1D5DB' : '#666',
    marginLeft: 10,
    width: 100,
  },
  forecastDetailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: isDarkTheme ? '#F1F5F9' : '#333',
  }
  });
}