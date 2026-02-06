import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" />
        ) : (
          <Dashboard key="dashboard" />
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;