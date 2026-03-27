import React, { useState, useEffect } from "react";
import { Activity, Home, FileText, User, Brain, Sun, Moon } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "../context/ThemeContext";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

// Component Imports
import Sidebar from "./Sidebar";
import HomeTab from "./HomeTab";
import ProfileTab from "./ProfileTab";
import DetectionsTab from "./DetectionsTab";
import ReportsTab from "./ReportsTab";
import DetailView from "./DetailView";
import Toast from "./Toast";
import TutorialWalkthrough from "./TutorialWalkthrough";
import ChildSetupWalkthrough from "./ChildSetupWalkthrough";

const Dashboard = () => {
  const { theme, toggleTheme } = useTheme();
  const [me, setMe] = useState(null);
  const [childName, setChildName] = useState("Child");
  const [caregiverRole, setCaregiverRole] = useState("Parent/Caregiver");
  const [caregiverName, setCaregiverName] = useState("");
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [profileLoaded, setProfileLoaded] = useState(false);

  const navigate = useNavigate();

  // ✨ FINAL SOCKET LISTENER WITH DIAGNOSTICS
  useEffect(() => {
    // Replace with your laptop's actual IP
    const socket = io("http://10.98.218.151:5000");

    socket.on("connect", () => {
      console.log("✅ Dashboard connected to Socket.io");
    });

    socket.on("NEW_DETECTION", (incomingData) => {
      // 🔍 DIAGNOSTIC LOG
      console.log("🚀 Incoming Data Packet:", incomingData);
      console.log("📸 Image Data Status:", incomingData.image ? `Received (${incomingData.image.length} chars)` : "MISSING/EMPTY");

      // Find the movement label (Support action, type, or label)
      const movementType = incomingData.type || incomingData.action || incomingData.label;

      if (movementType) {
        const newLog = {
          id: incomingData.id || Date.now().toString(),
          time: incomingData.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          date: incomingData.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
          type: movementType,
          emotion: incomingData.emotion || "Neutral", 
          confidence: incomingData.accuracy || incomingData.confidence || 0,
          // Support 'image' or 'frame' from Python
          image: incomingData.image || incomingData.frame || null, 
          details: incomingData.details || `AI detected ${movementType} with ${incomingData.emotion || 'neutral'} expression.`
        };

        setLogs((prevLogs) => [newLog, ...prevLogs]);

        setToast({
          visible: true,
          message: `🚨 ${newLog.type} detected!`
        });
      }
    });

    return () => socket.disconnect();
  }, []);

  // Auth & Profile Initial Load
  useEffect(() => {
    const init = async () => {
      try {
        const res = await fetch("/api/auth/status", { credentials: "include" });
        if (!res.ok) { navigate("/Login"); return; }
        const data = await res.json();
        if (!data?.authenticated) { navigate("/Login"); return; }
        setMe(data.user);

        const logsRes = await fetch("/api/Logs", { credentials: "include" });
        const logsData = await logsRes.json();
        setLogs(logsData?.logs || []);

        const profileRes = await fetch("/api/Profile", { credentials: "include" });
        const profileData = await profileRes.json();
        if (profileData?.profile?.child?.name) setChildName(profileData.profile.child.name);
        
        setProfileLoaded(true);
      } catch (err) { 
        console.error("Auth init error:", err);
        navigate("/Login"); 
      }
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    try { await fetch("/api/Logout", { method: "POST", credentials: "include" }); }
    finally { navigate("/Login"); }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">
      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={handleLogout} />

      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
            <header className="mb-8 md:mb-10 px-2 flex justify-between items-start">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2">
                  {activeTab === "Home" ? `Hello, ${me?.username || "User"} 👋` : activeTab}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium">
                  {activeTab === "Home" && "Real-time AI monitoring active."}
                  {activeTab === "Detections" && "Visualizing behavioral patterns."}
                  {activeTab === "Reports" && "Exportable activity history."}
                </p>
              </div>

              <button onClick={toggleTheme} className="hidden md:block relative w-16 h-8 rounded-full p-0.5 bg-slate-200 dark:bg-indigo-900 transition-colors">
                <motion.div layout className={`w-7 h-7 rounded-full shadow-md flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500 ml-auto' : 'bg-white'}`}>
                  {theme === 'light' ? <Sun size={16} className="text-amber-500" /> : <Moon size={16} className="text-white" />}
                </motion.div>
              </button>
            </header>

            <AnimatePresence mode="wait">
              {activeTab === "Home" && (
                <HomeTab logs={logs} onLogClick={setSelectedLog} selectedLogId={selectedLog?.id} />
              )}
              {activeTab === "Detections" && <DetectionsTab logs={logs} childName={childName} />}
              {activeTab === "Reports" && <ReportsTab logs={logs} childName={childName} />}
              {activeTab === "Profile" && <ProfileTab me={me} onChildUpdated={setChildName} />}
            </AnimatePresence>
          </div>
        </div>

        <AnimatePresence>
          {selectedLog && (
            <DetailView log={selectedLog} onClose={() => setSelectedLog(null)} childName={childName} />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Dashboard;