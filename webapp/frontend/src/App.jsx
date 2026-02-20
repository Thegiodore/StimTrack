import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminDashboard from "./components/AdminDashboard";
import Dashboard from "./components/Dashboard";
import SplashScreen from "./components/SplashScreen";
import Login from "./components/Login";
import Register from "./components/Register";
import { ThemeProvider } from "./context/ThemeContext";
import AuthGate from "./components/AuthGate";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <SplashScreen key="splash" />
        ) : (
          <BrowserRouter key="router">
            <Routes>
              <Route path="/" element={<Navigate to="/Login" replace />} />
              <Route path="/Login" element={<AuthGate><Login /></AuthGate>} />
              <Route path="/Register" element={<Register />} />
              <Route path="/Admin" element={<AdminDashboard />} />
              <Route path="/Dashboard" element={<Dashboard />} />
              <Route path="*" element={<Navigate to="/Login" replace />} />
            </Routes>
          </BrowserRouter>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
