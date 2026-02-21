import React, { useState, useEffect } from "react";
import { Activity, Home, FileText, User } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Brain, Sun, Moon, LogOut } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

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

  // ✅ logs now come from backend (per-user)
  const [logs, setLogs] = useState([]);

  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState("Home");
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [logoutExpanded, setLogoutExpanded] = useState(false);

  const navigate = useNavigate();

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

  // ✅ Auth check + load user info + load per-user logs
  useEffect(() => {
    const init = async () => {
      try {
        // 1) check auth + get user
        const res = await fetch("/api/auth/status", {
          credentials: "include",
        });

        if (!res.ok) {
          navigate("/Login");
          return;
        }

        const data = await res.json().catch(() => null);
        if (!data?.authenticated) {
          navigate("/Login");
          return;
        }

        setMe(data.user);

        // 2) load logs for this user (seeded with mock AI logs on backend)
        const logsRes = await fetch("/api/Logs", {
          credentials: "include",
        });

        const logsData = await logsRes.json().catch(() => null);
        setLogs(logsData?.logs || []);
      } catch (err) {
        navigate("/Login");
      }
    };

    init();
  }, [navigate]);

  // ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Mobile Nav Items
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

      <Sidebar activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* MOBILE HEADER */}
      <div className="md:hidden sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800 transition-colors duration-300">
        <div className="px-5 sm:px-6 py-5 flex items-center justify-between">
          {/* Left: Branding */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl text-indigo-600 dark:text-indigo-400 transition-colors duration-300">
              <Brain size={24} />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 dark:text-white transition-colors duration-300">
              StimTrack
            </h1>
          </div>

          {/* Right: Dark Mode + Logout */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
            </button>

            <motion.button
              layout
              onClick={() => {
                if (logoutExpanded) {
                  handleLogout();
                } else {
                  setLogoutExpanded(true);
                  setTimeout(() => setLogoutExpanded(false), 3000);
                }
              }}
              className="flex items-center px-2.5 py-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 font-semibold text-sm hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-300 overflow-hidden"
              transition={{ layout: { duration: 0.25, ease: "easeInOut" } }}
            >
              <motion.span layout="position"><LogOut size={16} className="shrink-0" /></motion.span>
              <AnimatePresence>
                {logoutExpanded && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    animate={{ width: "auto", opacity: 1, paddingLeft: 8 }}
                    exit={{ width: 0, opacity: 0, paddingLeft: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="whitespace-nowrap overflow-hidden"
                  >
                    Logout
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 relative overflow-hidden flex flex-col md:flex-row">
        {/* LOG FEED / CONTENT AREA */}
        <div className="flex-1 flex flex-col relative h-full overflow-hidden">
          {/* MOBILE TAB BAR SPACER */}
          <div className="md:hidden absolute bottom-0 w-full h-20 bg-gradient-to-t from-white via-white/80 to-transparent dark:from-slate-950 dark:via-slate-950/80 pointer-events-none z-10 transition-colors duration-300" />

          <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 md:pb-8 scroll-smooth">
            <header className="mb-8 md:mb-10 px-2 flex justify-between items-end">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors duration-300">
                  {activeTab === "Home"
                    ? `Hello, ${me?.username || "User"} 👋`
                    : activeTab}
                </h2>

                {/* ✅ Sub heading: Unique ID under username (only on Home) */}
                {activeTab === "Home" && me?.id && (
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    ID: {me.id}
                  </p>
                )}

                {/* Keep existing captions */}
                {activeTab === "Home" && (
                  <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    Here's today's activity summary.
                  </p>
                )}
                {activeTab === "Detections" && (
                  <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    Track stimming patterns and frequency.
                  </p>
                )}
                {activeTab === "Reports" && (
                  <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    Detailed log of all detections.
                  </p>
                )}
                {activeTab === "Profile" && (
                  <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">
                    Manage child and caregiver profile.
                  </p>
                )}
              </div>
            </header>

            <AnimatePresence mode="wait">
              {activeTab === "Home" && (
                <HomeTab
                  logs={logs}
                  selectedLogId={selectedLog?.id}
                  onLogClick={setSelectedLog}
                  containerVariants={containerVariants}
                  itemVariants={itemVariants}
                />
              )}

              {activeTab === "Detections" && <DetectionsTab logs={logs} />}

              {activeTab === "Reports" && <ReportsTab logs={logs} />}

              {activeTab === "Profile" && <ProfileTab me={me} />}
            </AnimatePresence>
          </div>
        </div>

        {/* DETAIL VIEW & BACKDROP */}
        <AnimatePresence>
          {selectedLog && (
            <>
              {/* BACKDROP FOR DESKTOP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedLog(null)}
                className="hidden lg:block absolute inset-0 bg-slate-900/30 dark:bg-black/50 z-30 backdrop-blur-[1px]"
              />

              <DetailView
                log={selectedLog}
                onClose={() => setSelectedLog(null)}
              />
            </>
          )}
        </AnimatePresence>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/60 dark:border-slate-800 pb-safe pt-2 px-6 z-50 flex justify-between items-center shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.05)] transition-colors duration-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setSelectedLog(null);
            }}
            className="flex flex-col items-center gap-1 p-3 relative group"
          >
            <div
              className={`
                p-1.5 rounded-xl transition-all duration-300
                ${activeTab === item.id
                  ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 -translate-y-1"
                  : "text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400"
                }
              `}
            >
              <item.icon
                size={24}
                className={activeTab === item.id ? "stroke-[2.5px]" : "stroke-2"}
              />
            </div>

            {activeTab === item.id && (
              <motion.span
                layoutId="nav-dot"
                className="absolute -bottom-1 w-1 h-1 bg-indigo-600 dark:bg-indigo-400 rounded-full"
              />
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default Dashboard;