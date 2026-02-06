import React, { useState } from 'react';
import {
  Activity, Home, FileText, User // Icons used in Mobile Nav
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Brain, Settings } from 'lucide-react';

// Import New Components
import Sidebar from './Sidebar';
import HomeTab from './HomeTab';
import ProfileTab from './ProfileTab';
import DetailView from './DetailView';
import Toast from './Toast';

const Dashboard = () => {
  // MOCK INITIAL DATA
  const initialLogs = [
    {
      id: 1,
      time: '14:08',
      date: 'Feb 3, 2026',
      type: 'Hand Flapping',
      emotion: 'Happy',
      confidence: 0.94,
      image: 'https://images.unsplash.com/photo-1620121692029-d088224efc74?q=80&w=400',
      details: 'Repetitive hand movement detected for 15 seconds.'
    },
    {
      id: 2,
      time: '09:16',
      date: 'Feb 3, 2026',
      type: 'Rocking',
      emotion: 'Anxious',
      confidence: 0.88,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400',
      details: 'Rhythmic swaying detected while sitting near the window.'
    },
    {
      id: 3,
      time: '08:45',
      date: 'Feb 3, 2026',
      type: 'Pacing',
      emotion: 'Neutral',
      confidence: 0.92,
      image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=400',
      details: 'Continuous walking back and forth in the living room.'
    }
  ];

  const [logs, setLogs] = useState(initialLogs);
  const [selectedLog, setSelectedLog] = useState(null);
  const [activeTab, setActiveTab] = useState('Home');
  const [toast, setToast] = useState({ visible: false, message: '' });



  // ANIMATION VARIANTS
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Mobile Nav Items (duplicated logic from Sidebar for mobile bottom bar)
  const navItems = [
    { id: 'Home', icon: Home, label: 'Home' },
    { id: 'Detections', icon: Activity, label: 'Detections' },
    { id: 'Reports', icon: FileText, label: 'Reports' },
    { id: 'Profile', icon: User, label: 'Profile' },
  ];

  return (
    <div className="flex flex-col md:flex-row h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-hidden transition-colors duration-300">

      <Toast
        isVisible={toast.visible}
        message={toast.message}
        onClose={() => setToast({ ...toast, visible: false })}
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* MOBILE HEADER */}
      <div className="md:hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-6 py-4 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <Brain size={26} className="text-indigo-600 dark:text-indigo-400" />
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">StimTrack</h1>
        </div>
        <button className="p-2 -mr-2 text-slate-500 dark:text-slate-400 active:bg-slate-100 dark:active:bg-slate-800 rounded-full transition-colors">
          <Settings size={22} />
        </button>
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
                  {activeTab === 'Home' ? 'Hello, John 👋' : activeTab}
                </h2>
                {activeTab === 'Home' && <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Here's today's activity summary.</p>}
                {activeTab === 'Profile' && <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Manage child and caregiver profile.</p>}
              </div>
            </header>

            <AnimatePresence mode="wait">
              {activeTab === 'Home' && (
                <HomeTab
                  logs={logs}
                  selectedLogId={selectedLog?.id}
                  onLogClick={setSelectedLog}
                  containerVariants={containerVariants}
                  itemVariants={itemVariants}
                />
              )}

              {activeTab === 'Profile' && (
                <ProfileTab />
              )}
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
              setSelectedLog(null); // Reset detail view on tab switch
            }}
            className="flex flex-col items-center gap-1 p-3 relative group"
          >
            <div className={`
               p-1.5 rounded-xl transition-all duration-300
               ${activeTab === item.id ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 -translate-y-1' : 'text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400'}
            `}>
              <item.icon size={24} className={activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'} />
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