import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

const SplashScreen = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-50"
        >
            <div className="flex items-center">
                {/* LOGO - Pops first in center */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{
                        duration: 1.2,
                        ease: "easeInOut",
                        times: [0, 0.6, 1]
                    }}
                    className="text-indigo-600 p-3 md:p-4 bg-indigo-50 rounded-3xl z-10 relative"
                >
                    <Brain className="w-12 h-12 md:w-16 md:h-16" strokeWidth={2.5} />
                </motion.div>

                {/* TEXT CONTAINER - Expands width to reveal text, pushing logo left */}
                <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    transition={{
                        delay: 1.0, // Wait for logo pop to finish
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                    className="overflow-hidden flex items-center"
                >
                    <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight whitespace-nowrap pl-3 md:pl-5">
                        StimTrack
                    </h1>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default SplashScreen;
