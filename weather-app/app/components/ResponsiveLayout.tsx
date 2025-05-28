import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useOrientation } from './OrientationHandler';

/**
 * Props for the ResponsiveLayout component
 */
interface ResponsiveLayoutProps {
  children: React.ReactNode;
  style?: any;
  scrollable?: boolean;
  avoidNestedScrolling?: boolean;
}

/**
 * A responsive layout container that adapts to screen orientation
 * Handles both scrollable and non-scrollable content
 * Supports landscape and portrait modes with different layouts
 */
export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  style, 
  scrollable = true,
  avoidNestedScrolling = false
}) => {
  const { isLandscape } = useOrientation();

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

/**
 * Props for the ResponsiveSection component
 */
interface ResponsiveSectionProps {
  children: React.ReactNode;
  landscapeWidth?: string | number;
  style?: any;
}

/**
 * A responsive section component that adjusts its width based on orientation
 * Used within ResponsiveLayout to create responsive grid layouts
 */
export const ResponsiveSection: React.FC<ResponsiveSectionProps> = ({ 
  children, 
  landscapeWidth = '48%', 
  style 
}) => {
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

/**
 * Styles for responsive layout components
 */
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