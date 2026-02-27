import { useState, useMemo } from "react";
import { motion } from "framer-motion"; // ✨ Fixed this import
import { Activity, TrendingUp, Target } from "lucide-react";
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

// ... the rest of the file remains exactly the same as the previous version I gave you

const RANGES = [
    { id: "week", label: "Week", days: 7 },
    { id: "month", label: "Month", days: 30 },
    { id: "all", label: "All", days: null },
];

const LINES = [
    { key: "Head Banging", color: "#ef4444", darkColor: "#f87171" },
    { key: "Hand Flapping", color: "#f59e0b", darkColor: "#fbbf24" },
    { key: "Pacing", color: "#6366f1", darkColor: "#818cf8" },
];

function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">{label}</p>
            {payload.map((entry) => (
                <div key={entry.dataKey} className="flex items-center justify-between gap-4 text-sm">
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
        
        if (!logs || logs.length === 0) return [];

        logs.forEach((log) => {
            // ✨ FIX: Fallback to today's date if log.date or log.timestamp is missing
            let rawDate = log.date || log.timestamp || new Date();
            let dateStr;
            
            try {
                dateStr = new Date(rawDate).toISOString().split("T")[0];
            } catch (e) {
                dateStr = new Date().toISOString().split("T")[0];
            }
            
            if (!byDate[dateStr]) {
                byDate[dateStr] = { date: dateStr, "Head Banging": 0, "Hand Flapping": 0, "Pacing": 0 };
            }

            const type = (log.type || log.label || "").toLowerCase();
            if (type.includes("head")) byDate[dateStr]["Head Banging"]++;
            else if (type.includes("flap")) byDate[dateStr]["Hand Flapping"]++;
            else if (type.includes("pace")) byDate[dateStr]["Pacing"]++;
        });

        let result = Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));

        const selected = RANGES.find((r) => r.id === range);
        if (selected?.days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - selected.days);
            const cutoffStr = cutoff.toISOString().split("T")[0];
            result = result.filter((d) => d.date >= cutoffStr);
        }

        return result;
    }, [logs, range]);

    const formatDate = (dateStr) => {
        try {
            const d = new Date(dateStr);
            return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
        } catch (e) {
            return dateStr;
        }
    };

    const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(148, 163, 184, 0.2)";
    const axisColor = isDark ? "#64748b" : "#94a3b8";

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors">
                <div className="px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">{childName}'s Activity</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">YOLOv11 Behavioral Analysis</p>
                        </div>
                    </div>

                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {RANGES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${range === r.id ? "bg-indigo-600 text-white shadow-md" : "text-slate-500"}`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="px-3 sm:px-6 py-8">
                    <div className="h-[300px]">
                        {chartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                    <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: axisColor }} axisLine={false} tickLine={false} allowDecimals={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    {LINES.map((line) => (
                                        <Line key={line.key} type="monotone" dataKey={line.key} stroke={isDark ? line.darkColor : line.color} strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                    ))}
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                                <Activity size={48} className="mb-2 opacity-20" />
                                No detections recorded yet for this period.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LINES.map((line) => {
                    const total = chartData.reduce((sum, d) => sum + (d[line.key] || 0), 0);
                    return (
                        <div key={line.key} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: isDark ? line.darkColor : line.color }} />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{line.key}</span>
                            </div>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{total}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Instances</p>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}