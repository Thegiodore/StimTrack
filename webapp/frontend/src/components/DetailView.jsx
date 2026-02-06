import React from 'react';
import { motion } from 'framer-motion';
import {
    Smile, Frown, Activity, FileText, ArrowLeft, ShieldCheck
} from 'lucide-react';

const DetailView = ({ log, onClose }) => {
    if (!log) return null;

    return (
        <motion.div
            layoutId="detail-view"
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            // INCREASED WIDTH FOR PC/LAPTOP HERE (xl:w-[600px] instead of 450px)
            className="fixed inset-0 z-40 md:absolute md:inset-0 lg:absolute lg:inset-y-0 lg:right-0 lg:left-auto lg:w-[500px] lg:border-l lg:border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col transition-colors duration-300"
        >
            {/* BACK BUTTON (VISIBLE ON MOBILE/TABLET, OPTIONAL ON XL) */}
            <div className="p-4 md:p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md sticky top-0 z-10 transition-colors duration-300">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-600 dark:text-slate-400 transition-colors flex items-center gap-2 group"
                >
                    <div className="bg-slate-100 dark:bg-slate-800 p-1.5 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900/50 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        <ArrowLeft size={18} />
                    </div>
                    <span className="font-bold text-sm text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white">Back</span>
                </button>
                <div className="flex gap-2">
                    <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 transition-colors">
                        <ShieldCheck size={20} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 pb-24 md:pb-8">
                <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800 relative group"
                >
                    <img src={log.image} alt="Detail" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                    <div className="absolute bottom-6 left-6 right-6 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-xs font-bold border border-white/10 uppercase tracking-widest">{log.time}</span>
                            <span className="px-2 py-0.5 bg-indigo-500/80 backdrop-blur-md rounded-md text-xs font-bold border border-indigo-400/30 uppercase tracking-widest">{log.date}</span>
                        </div>
                        <h2 className="text-3xl font-black leading-tight">{log.type}</h2>
                    </div>
                </motion.div>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-3 transition-colors duration-300">
                            <div className={`p-3 rounded-2xl ${log.emotion === 'Happy' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400'}`}>
                                {log.emotion === 'Happy' ? <Smile size={28} strokeWidth={2.5} /> : <Frown size={28} strokeWidth={2.5} />}
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Emotion</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">{log.emotion}</p>
                            </div>
                        </div>
                        <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-3 transition-colors duration-300">
                            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
                                <Activity size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Intensity</p>
                                <p className="text-lg font-black text-slate-800 dark:text-white">High</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-[2rem] bg-indigo-50/50 dark:bg-indigo-500/10 border border-indigo-100/50 dark:border-indigo-500/20 transition-colors duration-300">
                        <h4 className="flex items-center gap-2 text-sm font-bold text-indigo-900/40 dark:text-indigo-300/60 uppercase mb-4">
                            <FileText size={16} /> Analysis Notes
                        </h4>
                        <p className="text-indigo-900/80 dark:text-indigo-200 leading-7 font-medium">
                            {log.details}
                            <br /><br />
                            The AI suggests this behavior might be triggered by external auditory stimuli appearing around 14:00.
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default DetailView;
