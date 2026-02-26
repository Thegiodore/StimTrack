import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle, Info, XCircle } from "lucide-react";

export default function Popup({ isOpen, type = "info", title, message, onConfirm, onCancel, confirmText = "OK", cancelText = "Cancel", showCancel = false }) {
    if (!isOpen) return null;

    const icons = {
        info: <Info className="text-blue-500" size={36} />,
        success: <CheckCircle className="text-green-500" size={36} />,
        warning: <AlertCircle className="text-amber-500" size={36} />,
        error: <XCircle className="text-red-500" size={36} />
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onCancel || onConfirm}
                />
                {/* Modal */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl p-8 w-full max-w-sm border border-slate-100 dark:border-slate-800 overflow-hidden"
                >
                    <div className={`absolute top-0 left-0 w-full h-1.5 ${type === 'error' ? 'bg-red-500' : type === 'warning' ? 'bg-amber-500' : type === 'success' ? 'bg-green-500' : 'bg-blue-500'}`} />
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-4 rounded-full bg-slate-50 dark:bg-slate-800/50">
                            {icons[type]}
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 font-medium">{message}</p>

                        <div className="flex gap-3 w-full">
                            {showCancel && (
                                <button
                                    onClick={onCancel}
                                    className="flex-1 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={onConfirm}
                                className={`flex-1 py-3 rounded-xl font-bold text-white transition-colors ${type === 'error' ? 'bg-red-500 hover:bg-red-600' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
