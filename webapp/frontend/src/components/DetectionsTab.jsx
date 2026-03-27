import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, TrendingUp } from "lucide-react";
import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// Configuration for your 3 YOLO classes
const LINES = [
    { key: "Hand Flapping", color: "#f59e0b", darkColor: "#fbbf24" },
    { key: "Pacing", color: "#6366f1", darkColor: "#818cf8" },
    { key: "Head Banging", color: "#ef4444", darkColor: "#f87171" },
];

const RANGES = [
    { id: "week", label: "Week", days: 7 },
    { id: "month", label: "Month", days: 30 },
    { id: "all", label: "All", days: null },
];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    
    // Format the date label for the tooltip
    const displayDate = new Date(label).toLocaleDateString("en-US", { 
        month: 'short', day: 'numeric', year: 'numeric' 
    });

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{displayDate}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm mt-1">
                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">{entry.dataKey}</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">{entry.value}</span>
                </div>
            ))}
        </div>
    );
}

export default function DetectionsTab({ logs = [], childName = "Child" }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";
    const [range, setRange] = useState("all");

    const chartData = useMemo(() => {
        const byDate = {};
        
        // 1. Process all logs
        logs.forEach((log) => {
            // Standardize the date key (YYYY-MM-DD)
            let dateKey = log.date;
            
            // If the date is in "Feb 28, 2026" format from old logs, convert it
            if (dateKey && dateKey.includes(',')) {
                const d = new Date(dateKey);
                if (!isNaN(d.getTime())) {
                    dateKey = d.toISOString().split('T')[0];
                }
            }

            if (!dateKey) return;

            // Initialize the date entry if it doesn't exist
            if (!byDate[dateKey]) {
                byDate[dateKey] = { date: dateKey, "Hand Flapping": 0, "Pacing": 0, "Head Banging": 0 };
            }

            // Normalize type for matching
            const type = (log.type || "").toLowerCase();
            
            if (type.includes("flap")) {
                byDate[dateKey]["Hand Flapping"]++;
            } else if (type.includes("pace")) {
                byDate[dateKey]["Pacing"]++;
            } else if (type.includes("head") || type.includes("bang")) {
                byDate[dateKey]["Head Banging"]++;
            }
        });

        // 2. Sort dates chronologically
        let result = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

        // 3. Apply Time Range Filtering
        const selectedRange = RANGES.find(r => r.id === range);
        if (selectedRange && selectedRange.days) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - selectedRange.days);
            const cutoffStr = cutoffDate.toISOString().split('T')[0];
            result = result.filter(item => item.date >= cutoffStr);
        }

        return result;
    }, [logs, range]);

    // Format X-axis dates (e.g., "Feb 28")
    const formatXAxis = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    };

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Main Chart Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{childName}'s Activity</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Behavioral Frequency Trends</p>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {RANGES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                                    range === r.id 
                                        ? "bg-indigo-600 text-white shadow-md" 
                                        : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-3 sm:px-6 py-8">
                    <div className="h-[320px] w-full">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid 
                                        strokeDasharray="3 3" 
                                        stroke={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"} 
                                        vertical={false} 
                                    />
                                    <XAxis 
                                        dataKey="date" 
                                        tickFormatter={formatXAxis} 
                                        tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} 
                                        axisLine={false} 
                                        tickLine={false}
                                        minTickGap={30}
                                    />
                                    <YAxis 
                                        tick={{ fontSize: 11, fill: isDark ? "#64748b" : "#94a3b8" }} 
                                        axisLine={false} 
                                        tickLine={false} 
                                        allowDecimals={false} 
                                    />
                                    <Tooltip content={<ChartTooltip />} />
                                    {LINES.map((line) => (
                                        <Line 
                                            key={line.key} 
                                            type="monotone" 
                                            dataKey={line.key} 
                                            stroke={isDark ? line.darkColor : line.color} 
                                            strokeWidth={3} 
                                            dot={{ r: 4, strokeWidth: 2, fill: isDark ? '#0f172a' : '#fff' }} 
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                            animationDuration={1000}
                                        />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                                <Activity size={48} className="mb-2 opacity-20 text-indigo-500" />
                                No behavior data recorded yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Summary Section */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LINES.map((line) => {
                    const totalCount = chartData.reduce((acc, curr) => acc + (curr[line.key] || 0), 0);
                    return (
                        <div key={line.key} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 shadow-lg flex flex-col items-center text-center transition-transform hover:scale-[1.02]">
                            <span className="w-4 h-4 rounded-full mb-3" style={{ backgroundColor: isDark ? line.darkColor : line.color }} />
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{line.key}</p>
                            <p className="text-3xl font-black text-slate-900 dark:text-white">{totalCount}</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}