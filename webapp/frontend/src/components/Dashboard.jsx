import React, { useState, useEffect } from "react";
import { Activity, Home, FileText, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

// ✨ NEW: Import socket.io-client (Make sure to run 'npm install socket.io-client')
import io from "socket.io-client";

import Sidebar from "./Sidebar";
import HomeTab from "./HomeTab";
import ProfileTab from "./ProfileTab";
import DetectionsTab from "./DetectionsTab";
import ReportsTab from "./ReportsTab";
import DetailView from "./DetailView";
import Toast from "./Toast";

import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [me, setMe] = useState(null);
  const [childName, setChildName] = useState("Child");
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [logoutExpanded, setLogoutExpanded] = useState(false);

  const navigate = useNavigate();

  // ✨ NEW: REAL-TIME SOCKET CONNECTION
  useEffect(() => {
    // We use the laptop's IP here
    const socket = io("http://192.168.1.9:5000");

    socket.on("connect", () => {
      console.log("✅ Connected to AI Server via Socket");
    });

    // Listen for the AI detection signal
    socket.on("NEW_DETECTION", (newLog) => {
      console.log("🚀 Real-time AI Event Received:", newLog);

      // 1. Add the new log to the top of the list
      setLogs((prevLogs) => [newLog, ...prevLogs]);

      // 2. Show a notification toast
      setToast({
        visible: true,
        message: `New Detection: ${newLog.label} (${(newLog.accuracy * 100).toFixed(0)}%)`
      });
    });

    return () => {
      socket.disconnect(); // Cleanup connection when closing the app
    };
  }, []);

  // Close detail view when switching tabs
  useEffect(() => {
    setSelectedLog(null);
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      await fetch("/api/Logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/Login");
    }
  };

  // Auth check + load user info
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        if (!res.ok) { navigate("/Login"); return; }

        const data = await res.json().catch(() => null);
        if (!data?.authenticated) { navigate("/Login"); return; }
        setMe(data.user);

        // Load existing logs from Database
        const logsRes = await fetch("/api/Logs", { credentials: "include" });
        const logsData = await logsRes.json().catch(() => null);
        setLogs(logsData?.logs || []);

        const profileRes = await fetch("/api/Profile", { credentials: "include" });
        const profileData = await profileRes.json().catch(() => null);
        if (profileData?.profile?.child?.name) {
          setChildName(profileData.profile.child.name);
        }
      } catch (err) {
        navigate("/Login");
      }
    };
    init();
  }, [navigate]);

  // ... (Keep all your existing Animation Variants and Nav Items the same)
  const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };
  const navItems = [
    { id: "Home", icon: Home, label: "Home" },
    { id: "Detections", icon: Activity, label: "Detections" },
    { id: "Reports", icon: FileText, label: "Reports" },
    { id: "Profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800">
        <div className="px-5 sm:px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400">
              <Brain size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white">StimTrack</h1>
          </div>
          {/* ... Rest of mobile header icons ... */}
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 text-slate-500 dark:text-slate-400">
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </div>

      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
            <header className="mb-8 md:mb-10 px-2 flex justify-between items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                  {activeTab === "Home" ? `Hello, ${me?.username || "User"} 👋` : activeTab}
                </h2>
                {activeTab === "Home" && me?.id && <p className="text-sm text-slate-500 font-medium">ID: {me.id}</p>}
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {activeTab === "Home" && "Here's today's activity summary."}
                  {activeTab === "Detections" && "Track stimming patterns and frequency."}
                  {activeTab === "Reports" && "Detailed log of all detections."}
                  {activeTab === "Profile" && "Manage child and caregiver profile."}
                </p>
              </div>

              {/* Desktop Theme Toggle */}
              <button onClick={toggleTheme} className="hidden md:block relative w-16 h-8 rounded-full p-0.5 bg-slate-200 dark:bg-indigo-900 transition-colors">
                <motion.div layout className={`w-7 h-7 rounded-full shadow-md flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500 ml-auto' : 'bg-white'}`}>
                  {theme === 'light' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-white" />}
                </motion.div>
              </button>
            </header>

            <AnimatePresence mode="wait">
              {activeTab === "Home" && (
                <HomeTab logs={logs} selectedLogId={selectedLog?.id} onLogClick={setSelectedLog} containerVariants={containerVariants} itemVariants={itemVariants} />
              )}
              {activeTab === "Detections" && <DetectionsTab logs={logs} childName={childName} />}
              {activeTab === "Reports" && <ReportsTab logs={logs} childName={childName} />}
              {activeTab === "Profile" && <ProfileTab me={me} />}
            </AnimatePresence>
          </div>
        </div>

        {/* DETAIL VIEW */}
        <AnimatePresence>
          {selectedLog && (
            <>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedLog(null)} className="hidden lg:block absolute inset-0 bg-slate-900/30 dark:bg-black/50 z-30 backdrop-blur-[1px]" />
              <DetailView log={selectedLog} onClose={() => setSelectedLog(null)} childName={childName} />
            </>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE NAV (Keep as is) */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 border-t pb-safe pt-2 px-6 z-50 flex justify-between items-center">
        {navItems.map((item) => (
          <button key={item.id} onClick={() => { setActiveTab(item.id); setSelectedLog(null); }} className="flex flex-col items-center gap-1 p-3">
             <item.icon size={24} className={activeTab === item.id ? "text-indigo-600" : "text-slate-400"} />
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;