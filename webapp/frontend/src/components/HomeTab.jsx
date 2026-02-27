import React from 'react';
import { motion } from 'framer-motion';
import { Activity, ImageIcon } from 'lucide-react';
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
            {logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                    <Activity size={48} className="mb-4 opacity-20" />
                    <p className="italic">Waiting for AI detections...</p>
                </div>
            ) : (
                logs.map((log, index) => {
                    // --- SMART IMAGE LOGIC ---
                    let imageSrc = null;
                    if (log.image) {
                        const imgStr = log.image.trim();
                        if (imgStr.startsWith('http')) {
                            // It's a regular link (Unsplash, etc.)
                            imageSrc = imgStr;
                        } else if (imgStr.startsWith('data:image')) {
                            // It's already a formatted Base64 string
                            imageSrc = imgStr;
                        } else {
                            // It's a raw Base64 string from the Mini PC
                            imageSrc = `data:image/jpeg;base64,${imgStr.replace(/\s/g, '')}`;
                        }
                    }

                    return (
                        <motion.div
                            key={log.id || index}
                            layout
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            variants={itemVariants}
                            onClick={() => onLogClick(log)}
                            className={`
                                group relative bg-white dark:bg-slate-900 p-5 rounded-[1.25rem] border border-slate-100 dark:border-slate-800 shadow-[0_2px_20px_-4px_rgba(0,0,0,0.05)] 
                                hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.08)] dark:hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 cursor-pointer
                                ${selectedLogId === log.id ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}
                            `}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-2">
                                    <span className={`w-2 h-2 rounded-full ${getEmotionDotColor(log.emotion || 'neutral')}`} />
                                    <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        {log.time || "Just now"}
                                    </span>
                                </div>
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getEmotionTagStyle(log.emotion || 'neutral')}`}>
                                    {Math.round((log.accuracy || log.confidence || 0) * 100)}% Acc
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {log.type || log.label}
                                    </h3>
                                    <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 leading-relaxed">
                                        {log.details || `AI detected ${log.type || 'activity'} with ${log.emotion || 'neutral'} expression.`}
                                    </p>
                                </div>

                                <div className="w-20 h-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                                    {imageSrc ? (
                                        <img
                                            src={imageSrc}
                                            alt={log.label || log.type}
                                            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                        />
                                    ) : (
                                        <ImageIcon className="text-slate-300 dark:text-slate-600" size={24} />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    );
                })
            )}
        </motion.div>
    );
};

export default HomeTab;