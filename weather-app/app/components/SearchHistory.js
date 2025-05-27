import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';
import { FavoritesService } from '../services/FavoritesService';

/**
 * SearchHistory Component
 * Displays a searchable list of cities with recent searches and favorites
 * 
 * @component
 * @param {Object} props - Component properties
 * @param {boolean} props.visible - Controls component visibility
 * @param {string[]} props.history - Array of recent search history
 * @param {Object[]} props.suggestions - Array of city suggestions
 * @param {boolean} props.isLoadingSuggestions - Loading state for suggestions
 * @param {boolean} props.showSuggestions - Controls suggestions visibility
 * @param {Function} props.onSelectItem - Callback when history item is selected
 * @param {Function} props.onSelectSuggestion - Callback when suggestion is selected
 * @param {Function} props.onClearHistory - Callback to clear search history
 * @param {Function} props.onDismiss - Callback to dismiss the component
 */
const SearchHistory = ({
  visible,
  history,
  suggestions,
  isLoadingSuggestions,
  showSuggestions,
  onSelectItem,
  onSelectSuggestion,
  onClearHistory,
  onDismiss
}) => {
  /** @state {string[]} favorites - List of favorite cities */
  const [favorites, setFavorites] = useState([]);

  /**
   * Loads favorite cities from persistent storage
   * @async
   */
  const loadFavorites = async () => {
    try {
      const favoriteCities = await FavoritesService.getFavorites();
      setFavorites(favoriteCities);
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  /**
   * Toggles favorite status for a city
   * @async
   * @param {string} city - City name to toggle
   */
  const toggleFavorite = async (city) => {
    try {
      const newStatus = await FavoritesService.toggleFavorite(city);
      if (newStatus) {
        setFavorites(prev => [city, ...prev.filter(c => c !== city)]);
      } else {
        setFavorites(prev => prev.filter(c => c !== city));
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  /** Load favorites when component becomes visible */
  useEffect(() => {
    if (visible) {
      loadFavorites();
    }
  }, [visible]);

  if (!visible) return null;

  // If showing suggestions
  if (showSuggestions) {
    if (isLoadingSuggestions) {
      return (
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#0066cc" />
              <Text style={styles.loadingText}>Searching cities...</Text>
            </View>
          </View>
        </View>
      );
    }

    if (suggestions.length === 0) {
      return (
        <View style={styles.overlay}>
          <View style={styles.container}>
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>No cities found</Text>
            </View>
          </View>
        </View>
      );
    }

    return (
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>City Suggestions</Text>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={suggestions}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.suggestionItem}
                onPress={() => onSelectSuggestion(item)}
              >
                <Feather name="map-pin" size={16} color="#666" />
                <View style={styles.suggestionTextContainer}>
                  <Text style={styles.suggestionName}>{item.name}</Text>
                  <Text style={styles.suggestionLocation}>
                    {item.state ? `${item.state}, ` : ''}{item.country}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
            keyExtractor={(item, index) => `${item.lat}-${item.lon}-${index}`}
            style={styles.list}
          />
        </View>
      </View>
    );
  }

  // Show history if no suggestions and we have history or favorites
  if (history.length === 0 && favorites.length === 0) return null;
  // Combine history and favorites (de-duplicate)
  const combinedList = [...new Set([...history, ...favorites])];

  /**
   * Renders an individual history item
   * @param {Object} params - Render item parameters
   * @param {string} params.item - City name to render
   */
  const renderHistoryItem = ({ item }) => (
    <View style={styles.historyItem}>
      <TouchableOpacity
        style={styles.itemLeft}
        onPress={() => onSelectItem(item)}
      >
        <Feather name="clock" size={16} color="#666" />
        <Text style={styles.historyText}>{item}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => toggleFavorite(item)}>
        <FontAwesome
          name={favorites.includes(item) ? 'heart' : 'heart-o'}
          size={18}
          color={favorites.includes(item) ? '#e91e63' : '#aaa'}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Searches</Text>
          <View style={styles.actions}>
            <TouchableOpacity
              onPress={onClearHistory}
              style={styles.clearButton}
            >
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          data={combinedList}
          renderItem={renderHistoryItem}
          keyExtractor={(item, index) => index.toString()}
          style={styles.list}
        />
      </View>
    </View>
  );
};

/**
 * Component styles
 * Defines appearance for search history and suggestions
 */
const styles = StyleSheet.create({
  /**
   * Overlay container
   * Positions the component above other content
   */
  overlay: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },

  /**
   * Main container
   * Holds the list and header components
   */
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: 300,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    marginRight: 10,
  },
  clearButtonText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  closeButton: {
    padding: 2,
  },
  list: {
    flexGrow: 0,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  suggestionTextContainer: {
    marginLeft: 10,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  suggestionLocation: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    justifyContent: 'center',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noResultsText: {
    color: '#666',
    fontSize: 16,
  },
});

export default SearchHistory;