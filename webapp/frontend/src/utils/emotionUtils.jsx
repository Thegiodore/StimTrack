import React from 'react';
import { Smile, Frown, Meh, Angry } from 'lucide-react';

export const getEmotionDotColor = (emotion) => {
    switch (emotion) {
        case 'Happy': return 'bg-green-500';
        case 'Sad': return 'bg-blue-500';
        case 'Neutral': return 'bg-slate-500';
        case 'Angry': return 'bg-red-500';
        default: return 'bg-slate-500';
    }
};

export const getEmotionTagStyle = (emotion) => {
    switch (emotion) {
        case 'Happy': return 'bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20';
        case 'Sad': return 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-500/20';
        case 'Neutral': return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-500/20';
        case 'Angry': return 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-100 dark:border-red-500/20';
        default: return 'bg-slate-50 dark:bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-100 dark:border-slate-500/20';
    }
};

export const getEmotionBoxStyle = (emotion) => {
    switch (emotion) {
        case 'Happy': return 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400';
        case 'Sad': return 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400';
        case 'Neutral': return 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400';
        case 'Angry': return 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400';
        default: return 'bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400';
    }
};

export const getEmotionIcon = (emotion, size = 28, strokeWidth = 2.5) => {
    switch (emotion) {
        case 'Happy': return <Smile size={size} strokeWidth={strokeWidth} />;
        case 'Sad': return <Frown size={size} strokeWidth={strokeWidth} />;
        case 'Neutral': return <Meh size={size} strokeWidth={strokeWidth} />;
        case 'Angry': return <Angry size={size} strokeWidth={strokeWidth} />;
        default: return <Meh size={size} strokeWidth={strokeWidth} />;
    }
};
