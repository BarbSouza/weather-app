import React, { createContext, useState, useContext } from 'react';
/**
 * Context for managing application theme state
 * Provides theme values and toggle functionality
 */
const ThemeContext = createContext();

/**
 * Theme Provider Component
 * Wraps the application to provide theme context to all children
 * 
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - Child components to receive theme context
 * @returns {JSX.Element} Provider component with theme context
 */
export const ThemeProvider = ({ children }) => {
  // State to track if dark theme is active
  const [isDarkTheme, setIsDarkTheme] = useState(false);
  // Function to toggle between light and dark themes
  const toggleTheme = () => setIsDarkTheme(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDarkTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
/**
 * Custom hook for accessing theme context
 *  Theme context value containing:
 * - isDarkTheme: boolean indicating if dark theme is active
 * - toggleTheme: function to switch between themes
 */
export const useTheme = () => useContext(ThemeContext);
