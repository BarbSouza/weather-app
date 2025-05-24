import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'weather_favorites';
const MAX_FAVORITES = 10;

export const FavoritesService = {
  /**
   * Get all favorite cities
   * @returns {Promise<Array<string>>} Array of favorite city names
   */
  getFavorites: async () => {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error retrieving favorites:', error);
      return [];
    }
  },

  /**
   * Add a city to favorites
   * @param {string} city - The city name to add
   */
  addFavorite: async (city) => {
    try {
      if (!city || city.trim() === '') return;
      
      const normalizedCity = city.trim();
      const existingFavorites = await FavoritesService.getFavorites();
      
      // Check if already exists (case-insensitive)
      const alreadyExists = existingFavorites.some(
        fav => fav.toLowerCase() === normalizedCity.toLowerCase()
      );
      
      if (alreadyExists) return;
      
      // Add to beginning of array
      const newFavorites = [normalizedCity, ...existingFavorites];
      
      // Limit to maximum number of favorites
      const limitedFavorites = newFavorites.slice(0, MAX_FAVORITES);
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(limitedFavorites));
    } catch (error) {
      console.error('Error adding favorite:', error);
    }
  },

  /**
   * Remove a city from favorites
   * @param {string} city - The city name to remove
   */
  removeFavorite: async (city) => {
    try {
      const existingFavorites = await FavoritesService.getFavorites();
      const filteredFavorites = existingFavorites.filter(
        fav => fav.toLowerCase() !== city.toLowerCase()
      );
      
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filteredFavorites));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  },

  /**
   * Check if a city is in favorites
   * @param {string} city - The city name to check
   * @returns {Promise<boolean>} True if city is in favorites
   */
  isFavorite: async (city) => {
    try {
      const favorites = await FavoritesService.getFavorites();
      return favorites.some(fav => fav.toLowerCase() === city.toLowerCase());
    } catch (error) {
      console.error('Error checking favorite status:', error);
      return false;
    }
  },

  /**
   * Toggle favorite status of a city
   * @param {string} city - The city name to toggle
   * @returns {Promise<boolean>} New favorite status
   */
  toggleFavorite: async (city) => {
    try {
      const isCurrentlyFavorite = await FavoritesService.isFavorite(city);
      
      if (isCurrentlyFavorite) {
        await FavoritesService.removeFavorite(city);
        return false;
      } else {
        await FavoritesService.addFavorite(city);
        return true;
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  /**
   * Clear all favorites
   */
  clearAllFavorites: async () => {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
    } catch (error) {
      console.error('Error clearing favorites:', error);
    }
  }
};