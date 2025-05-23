import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet
} from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';

const SearchHistory = ({
  visible,
  history,
  onSelectItem,
  onClearHistory,
  onDismiss
}) => {
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (city) => {
    setFavorites((prev) =>
      prev.includes(city)
        ? prev.filter((c) => c !== city)
        : [...prev, city]
    );
  };

  // Show if visible OR any favorites exist
  if (!visible || (history.length === 0 && favorites.length === 0)) return null;

  // Combine history and favorites (de-duplicate)
  const combinedList = [...new Set([...history, ...favorites])];

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

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 56,
    left: 16,
    right: 16,
    zIndex: 100,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
  },
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
});

export default SearchHistory;
