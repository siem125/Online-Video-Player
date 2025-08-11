'use client';

import React, { createContext, useState, useEffect, useContext } from 'react';

interface ThemeContextProps {
  theme: string;
  setTheme: (theme: string) => void;
  customTheme: { [key: string]: string };
  setCustomTheme: (customTheme: { [key: string]: string }) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  setTheme: () => {},
  customTheme: {},
  setCustomTheme: () => {},
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<string>('light');
  const [customTheme, setCustomTheme] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    const savedCustomTheme = JSON.parse(localStorage.getItem('customTheme') || '{}');

    setTheme(savedTheme);
    if (Object.keys(savedCustomTheme).length > 0 && savedTheme === 'custom') {
      setCustomTheme(savedCustomTheme);
      applyCustomTheme(savedCustomTheme);
    } else {
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const applyCustomTheme = (theme: { [key: string]: string }) => {
    Object.keys(theme).forEach((key) => {
      document.documentElement.style.setProperty(`--${key}`, theme[key]);
    });
  };

  const changeTheme = (newTheme: string) => {
    // Clear the custom theme styles when a predefined theme is selected
    setCustomTheme({});
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    localStorage.removeItem('customTheme'); // Remove custom theme from localStorage
    document.documentElement.setAttribute('data-theme', newTheme);

    // Clear custom theme styles
    Object.keys(customTheme).forEach((key) => {
      document.documentElement.style.removeProperty(`--${key}`);
    });
  };

  const updateCustomTheme = (newCustomTheme: { [key: string]: string }) => {
    setCustomTheme(newCustomTheme);
    setTheme('custom');
    localStorage.setItem('theme', 'custom');
    localStorage.setItem('customTheme', JSON.stringify(newCustomTheme));
    applyCustomTheme(newCustomTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme: changeTheme, customTheme, setCustomTheme: updateCustomTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
