import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

const Toast = ({ message, type = 'warning', onClose, isVisible }) => {
    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000); // Auto close after 4 seconds
            return () => clearTimeout(timer);
        }
    }, [isVisible, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: -100, opacity: 0, x: '-50%' }}
                    animate={{ y: 0, opacity: 1, x: '-50%' }}
                    exit={{ y: -100, opacity: 0, x: '-50%' }}
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    className="fixed top-6 left-1/2 z-50 flex items-center gap-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md px-6 py-4 rounded-2xl shadow-2xl border border-orange-100 dark:border-orange-900/50 min-w-[320px] md:min-w-[400px] transition-colors duration-300"
                >
                    <div className="p-2 bg-orange-100 dark:bg-orange-500/20 rounded-full text-orange-600 dark:text-orange-400 shrink-0">
                        <AlertTriangle size={24} strokeWidth={2.5} />
                    </div>

                    <div className="flex-1">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm uppercase tracking-wider mb-0.5">Alert detected</h4>
                        <p className="font-bold text-lg text-slate-900 dark:text-white">{message}</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Toast;
