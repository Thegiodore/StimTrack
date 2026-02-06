import React from 'react';
import {
    Activity, User, Home, FileText, Brain, Sun, Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { theme, toggleTheme } = useTheme();

    const navItems = [
        { id: 'Home', icon: Home, label: 'Home' },
        { id: 'Detections', icon: Activity, label: 'Detections' },
        { id: 'Reports', icon: FileText, label: 'Reports' },
        { id: 'Profile', icon: User, label: 'Profile' },
    ];

    return (
        <aside className="hidden md:flex md:w-20 lg:w-72 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-r border-slate-200/60 dark:border-slate-800 flex-col p-4 lg:p-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-12 text-indigo-600 dark:text-indigo-400 justify-center lg:justify-start lg:px-2">
                <div className="p-2 bg-indigo-50 dark:bg-slate-800 rounded-xl shrink-0 transition-colors duration-300">
                    <Brain size={28} />
                </div>
                <h1 className="hidden lg:block text-2xl font-black tracking-tight text-slate-900 dark:text-white transition-colors duration-300">StimTrack</h1>
            </div>

            <div className="space-y-2 flex flex-col items-center lg:items-stretch">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group
              ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20 scale-[1.02]'
                                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400'
                            } justify-center lg:justify-start`}
                    >
                        <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                        <span className="hidden lg:block font-semibold">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto flex flex-col gap-4">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group
                    text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-amber-500 dark:hover:text-amber-400 justify-center lg:justify-start"
                >
                    {theme === 'light' ? (
                        <Moon size={22} className="shrink-0 stroke-2" />
                    ) : (
                        <Sun size={22} className="shrink-0 stroke-2" />
                    )}
                    <span className="hidden lg:block font-semibold">
                        {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
                    </span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
