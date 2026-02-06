import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Smile, Heart } from 'lucide-react';

const ProfileTab = () => {
    return (
        <motion.div
            key="profile"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl"
        >
            {/* CHILD PROFILE CARD */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Smile size={120} className="text-indigo-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 dark:bg-indigo-900/30 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl">
                        👦
                    </div>
                    <h3 className="text-sm font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-widest mb-1">Child Profile</h3>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">Leo</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium transition-colors">8 Years Old</p>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <h4 className="font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors">Current Status</h4>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 rounded-full text-sm font-bold border border-green-100 dark:border-green-500/20">
                            <Activity size={14} /> Active Monitoring
                        </div>
                    </div>
                </div>
            </div>

            {/* CAREGIVER PROFILE CARD */}
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl relative overflow-hidden group transition-colors duration-300">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Heart size={120} className="text-pink-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-pink-50 dark:bg-pink-500/10 border-4 border-white dark:border-slate-800 shadow-md flex items-center justify-center mb-6 text-2xl font-black text-pink-500">
                        JD
                    </div>
                    <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-1">Caregiver</h3>
                    <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-2 transition-colors">John Doe</h2>
                    <p className="text-xl text-slate-500 dark:text-slate-400 font-medium transition-colors">Father</p>

                    <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileTab;
