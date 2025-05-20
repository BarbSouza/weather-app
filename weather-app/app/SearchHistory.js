import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SearchHistoryService } from './SearchHistoryService';

const SearchHistory = ({ 
  visible, 
  history, 
  onSelectItem, 
  onClearHistory, 
  onDismiss 
}) => {
  if (!visible || history.length === 0) return null;

  const confirmClearHistory = () => {
    Alert.alert(
      "Clear Search History",
      "Are you sure you want to clear all search history?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          onPress: onClearHistory,
          style: "destructive" 
        }
      ]
    );
  };

  const renderHistoryItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyItem} 
      onPress={() => onSelectItem(item)}
    >
      <Feather name="clock" size={16} color="#666" />
      <Text style={styles.historyText}>{item}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Recent Searches</Text>
          <View style={styles.actions}>
            <TouchableOpacity onPress={confirmClearHistory} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Feather name="x" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
        
        <FlatList
          data={history}
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
    top: 56, // Below the search bar
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
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  historyText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default SearchHistory;