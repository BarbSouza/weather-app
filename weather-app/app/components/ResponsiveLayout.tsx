import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useOrientation } from './OrientationHandler';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: any;
  scrollable?: boolean;
  // Add option to disable scrolling when you know you'll have FlatLists
  avoidNestedScrolling?: boolean;
}

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  style, 
  scrollable = true,
  avoidNestedScrolling = false
}) => {
  const { isLandscape } = useOrientation();

  // If avoiding nested scrolling, always return a View
  if (avoidNestedScrolling || !scrollable) {
    return (
      <View style={[
        { flex: 1 }, 
        style,
        isLandscape ? styles.landscapeContent : styles.portraitContent
      ]}>
        {children}
      </View>
    );
  }

  return (
    <ScrollView 
      style={[{ flex: 1 }, style]}
      contentContainerStyle={[
        styles.scrollContent,
        isLandscape ? styles.landscapeContent : styles.portraitContent
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  landscapeContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  portraitContent: {
    flexDirection: 'column',
    paddingHorizontal: 16,
  },
});

// Responsive components for different sections
export const ResponsiveSection: React.FC<{
  children: React.ReactNode;
  landscapeWidth?: string | number;
  style?: any;
}> = ({ children, landscapeWidth = '48%', style }) => {
  const { isLandscape } = useOrientation();

  return (
    <View style={[
      style,
      isLandscape && { 
        width: landscapeWidth, 
        marginBottom: 20,
        marginHorizontal: 10 
      }
    ]}>
      {children}
    </View>
  );
};