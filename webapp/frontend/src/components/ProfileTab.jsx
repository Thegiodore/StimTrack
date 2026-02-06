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
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Smile size={120} className="text-indigo-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-indigo-100 border-4 border-white shadow-md flex items-center justify-center mb-6 text-2xl">
                        👦
                    </div>
                    <h3 className="text-sm font-bold text-indigo-500 uppercase tracking-widest mb-1">Child Profile</h3>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">Leo</h2>
                    <p className="text-xl text-slate-500 font-medium">8 Years Old</p>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-2">Current Status</h4>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-bold border border-green-100">
                            <Activity size={14} /> Active Monitoring
                        </div>
                    </div>
                </div>
            </div>

            {/* CAREGIVER PROFILE CARD */}
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                    <Heart size={120} className="text-pink-500" />
                </div>

                <div className="relative z-10">
                    <div className="w-24 h-24 rounded-full bg-pink-50 border-4 border-white shadow-md flex items-center justify-center mb-6 text-2xl font-black text-pink-500">
                        JD
                    </div>
                    <h3 className="text-sm font-bold text-pink-500 uppercase tracking-widest mb-1">Caregiver</h3>
                    <h2 className="text-4xl font-black text-slate-900 mb-2">John Doe</h2>
                    <p className="text-xl text-slate-500 font-medium">Father</p>

                    <div className="mt-8 pt-6 border-t border-slate-100">
                        <button className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl transition-colors">
                            Edit Profile
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default ProfileTab;
