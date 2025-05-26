import AsyncStorage from '@react-native-async-storage/async-storage';

const SEARCH_HISTORY_KEY = 'weather_search_history';
const MAX_HISTORY_ITEMS = 10;

export const SearchHistoryService = {
  /**
   * Save a new search query to history
   * @param {string} query - The search query to save
   */
  saveSearchQuery: async (query) => {
    try {
      // Don't save empty queries
      if (!query || query.trim() === '') return;
      
      const normalizedQuery = query.trim();
      
      // Get existing history
      const existingHistory = await SearchHistoryService.getSearchHistory();
      
      // Remove the query if it already exists (to avoid duplicates)
      const filteredHistory = existingHistory.filter(
        item => item.toLowerCase() !== normalizedQuery.toLowerCase()
      );
      
      // Add the new query to the beginning of the array
      const newHistory = [normalizedQuery, ...filteredHistory];
      
      // Limit to maximum number of items
      const limitedHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(limitedHistory));
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  },
  
  /**
   * Get the search history
   * @returns {Promise<Array<string>>} Array of search queries
   */
  getSearchHistory: async () => {
    try {
      const history = await AsyncStorage.getItem(SEARCH_HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error retrieving search history:', error);
      return [];
    }
  },
  
  /**
   * Clear the entire search history
   */
  clearSearchHistory: async () => {
    try {
      await AsyncStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error('Error clearing search history:', error);
    }
  }
};