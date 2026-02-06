import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import Dashboard from './components/Dashboard';
import SplashScreen from './components/SplashScreen';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time (e.g., initial data fetch)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence mode="wait">
      {isLoading ? (
        <SplashScreen key="splash" />
      ) : (
        <Dashboard key="dashboard" />
      )}
    </AnimatePresence>
  );
}

export default App;