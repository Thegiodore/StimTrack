import React from 'react';
import { motion } from 'framer-motion';
import { Download, AlertCircle, FileText, Activity } from 'lucide-react';
import { getEmotionDotColor, getEmotionTagStyle } from '../utils/emotionUtils';

const HomeTab = ({ logs, selectedLogId, onLogClick, containerVariants, itemVariants }) => {
    return (
        <motion.div
            key="home"
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0 }}
            className="space-y-4"
        >
            {logs.map((log, index) => (
                <motion.div
                    key={log.id || log.timestamp} // ✨ Use timestamp as a backup key
                    layout
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    variants={itemVariants}
                    onClick={() => onLogClick(log)}
                    className={`
                        ${index === 0 ? 'tour-home-content' : ''}
                        group relative bg-white dark:bg-slate-900 p-5 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] 
                        hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-pointer
                        ${selectedLogId === log.id ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-950' : ''}
                    `}
                >
                    <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                            {/* ✨ Default emotion to 'neutral' if the AI doesn't send one */}
                            <span className={`w-2 h-2 rounded-full ${getEmotionDotColor(log.emotion || 'neutral')}`} />
                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                {log.time || new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getEmotionTagStyle(log.emotion || 'neutral')}`}>
                            {/* ✨ Updated to use 'accuracy' from your AI */}
                            {((log.accuracy || log.confidence || 0) * 100).toFixed(0)}% Acc
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="flex-1">
                            {/* ✨ Updated to use 'label' from your AI */}
                            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                {log.label || log.type}
                            </h3>
                            {/* ✨ Default details if AI only sends the label */}
                            <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                {log.details || `Detection of ${log.label || log.type} behavior observed in real-time.`}
                            </p>
                        </div>
                        <div className="w-16 h-16 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700">
                            <img
                                src={log.image}
                                alt={log.label || log.type}
                                className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                            />
                        </div>
                    </div>
                </motion.div>
            ))}
        </motion.div>
    );
};

export default HomeTab;