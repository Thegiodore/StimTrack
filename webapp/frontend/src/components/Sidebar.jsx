import React from 'react';
import {
    Activity, User, Home, FileText, Brain
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'Home', icon: Home, label: 'Home' },
        { id: 'Detections', icon: Activity, label: 'Detections' },
        { id: 'Reports', icon: FileText, label: 'Reports' },
        { id: 'Profile', icon: User, label: 'Profile' },
    ];

    return (
        <aside className="hidden md:flex md:w-20 lg:w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200/60 flex-col p-4 lg:p-6 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] z-20 transition-all duration-300">
            <div className="flex items-center gap-3 mb-12 text-indigo-600 justify-center lg:justify-start lg:px-2">
                <div className="p-2 bg-indigo-50 rounded-xl shrink-0">
                    <Brain size={28} />
                </div>
                <h1 className="hidden lg:block text-2xl font-black tracking-tight text-slate-900">StimTrack</h1>
            </div>

            <div className="space-y-2 flex flex-col items-center lg:items-stretch">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300 group
              ${activeTab === item.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 scale-[1.02]'
                                : 'text-slate-500 hover:bg-slate-50 hover:text-indigo-600'
                            } justify-center lg:justify-start`}
                    >
                        <item.icon size={22} className={`shrink-0 ${activeTab === item.id ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                        <span className="hidden lg:block font-semibold">{item.label}</span>
                    </button>
                ))}
            </div>

            <div className="mt-auto p-4 bg-slate-50 rounded-2xl border border-slate-100 hidden lg:block">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">JD</div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">John Doe</p>
                        <p className="text-xs text-slate-500">Caregiver</p>
                    </div>
                </div>
            </div>
            {/* TABLET PROFILE AVATAR ONLY */}
            <div className="mt-auto flex justify-center lg:hidden">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm">JD</div>
            </div>
        </aside>
    );
};

export default Sidebar;
