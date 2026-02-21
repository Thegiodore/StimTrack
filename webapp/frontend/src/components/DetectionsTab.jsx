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
    Legend,
} from "recharts";
import { useTheme } from "../context/ThemeContext";

// ── Sample data generator (replace with real backend data later) ──
function generateSampleData() {
    const types = ["Head Banging", "Arm Flapping", "Spinning"];
    const data = [];
    const now = new Date();

    for (let i = 90; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

        data.push({
            date: dateStr,
            "Head Banging": Math.floor(Math.random() * 8) + (i % 7 === 0 ? 3 : 0),
            "Arm Flapping": Math.floor(Math.random() * 12) + 1,
            Spinning: Math.floor(Math.random() * 6),
        });
    }
    return data;
}

const SAMPLE_DATA = generateSampleData();

const RANGES = [
    { id: "week", label: "Week", days: 7 },
    { id: "month", label: "Month", days: 30 },
    { id: "all", label: "All", days: null },
];

const LINES = [
    { key: "Head Banging", color: "#ef4444", darkColor: "#f87171" },
    { key: "Arm Flapping", color: "#f59e0b", darkColor: "#fbbf24" },
    { key: "Spinning", color: "#6366f1", darkColor: "#818cf8" },
];

// ── Custom Tooltip ──
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload?.length) return null;

    return (
        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3 min-w-[160px]">
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                {label}
            </p>
            {payload.map((entry) => (
                <div
                    key={entry.dataKey}
                    className="flex items-center justify-between gap-4 text-sm"
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-slate-600 dark:text-slate-300 font-medium">
                            {entry.dataKey}
                        </span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-white">
                        {entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
}

export default function DetectionsTab({ logs }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    const [range, setRange] = useState("all");

    // Use real logs if available, fallback to sample data
    const allData = useMemo(() => {
        if (!logs || logs.length === 0) return SAMPLE_DATA;

        // Aggregate real logs by date and stim type
        const byDate = {};
        logs.forEach((log) => {
            const dateStr = new Date(log.timestamp || log.date)
                .toISOString()
                .split("T")[0];
            if (!byDate[dateStr]) {
                byDate[dateStr] = { date: dateStr, "Head Banging": 0, "Arm Flapping": 0, Spinning: 0 };
            }
            const type = log.stim_type || log.type || "";
            if (type.toLowerCase().includes("head")) byDate[dateStr]["Head Banging"]++;
            else if (type.toLowerCase().includes("flap") || type.toLowerCase().includes("arm"))
                byDate[dateStr]["Arm Flapping"]++;
            else if (type.toLowerCase().includes("spin")) byDate[dateStr]["Spinning"]++;
        });

        return Object.values(byDate).sort((a, b) => a.date.localeCompare(b.date));
    }, [logs]);

    // Filter by date range
    const chartData = useMemo(() => {
        const selected = RANGES.find((r) => r.id === range);
        if (!selected?.days) return allData;

        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - selected.days);
        const cutoffStr = cutoff.toISOString().split("T")[0];

        return allData.filter((d) => d.date >= cutoffStr);
    }, [allData, range]);

    // Format date for X axis
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        if (range === "week") return d.toLocaleDateString("en-US", { weekday: "short" });
        if (range === "month") return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    };

    // Chart colors
    const gridColor = isDark ? "rgba(148, 163, 184, 0.08)" : "rgba(148, 163, 184, 0.2)";
    const axisColor = isDark ? "#64748b" : "#94a3b8";

    return (
        <motion.div
            key="detections"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Chart Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
                {/* Card Header */}
                <div className="px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <TrendingUp size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white transition-colors">
                                Stimming Activity
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                Frequency over time
                            </p>
                        </div>
                    </div>

                    {/* Range Buttons */}
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 self-start sm:self-auto">
                        {RANGES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => setRange(r.id)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${range === r.id
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/30"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chart */}
                <div className="px-3 sm:px-6 py-6 sm:py-8">
                    <div className="h-[300px] sm:h-[360px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={formatDate}
                                    tick={{ fontSize: 11, fill: axisColor, fontWeight: 500 }}
                                    axisLine={{ stroke: gridColor }}
                                    tickLine={false}
                                    interval="preserveStartEnd"
                                    minTickGap={40}
                                />
                                <YAxis
                                    tick={{ fontSize: 11, fill: axisColor, fontWeight: 500 }}
                                    axisLine={false}
                                    tickLine={false}
                                    allowDecimals={false}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ stroke: axisColor, strokeDasharray: "4 4" }} />
                                {LINES.map((line) => (
                                    <Line
                                        key={line.key}
                                        type="monotone"
                                        dataKey={line.key}
                                        stroke={isDark ? line.darkColor : line.color}
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{ r: 5, strokeWidth: 2, fill: isDark ? "#0f172a" : "#ffffff" }}
                                    />
                                ))}
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Legend */}
                <div className="px-5 sm:px-8 pb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {LINES.map((line) => (
                        <div key={line.key} className="flex items-center gap-2">
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: isDark ? line.darkColor : line.color }}
                            />
                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                {line.key}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {LINES.map((line) => {
                    const total = chartData.reduce((sum, d) => sum + (d[line.key] || 0), 0);
                    const avg = chartData.length ? (total / chartData.length).toFixed(1) : 0;

                    return (
                        <motion.div
                            key={line.key}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-lg p-5 transition-colors duration-300"
                        >
                            <div className="flex items-center gap-2 mb-3">
                                <span
                                    className="w-2.5 h-2.5 rounded-full"
                                    style={{ backgroundColor: isDark ? line.darkColor : line.color }}
                                />
                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                    {line.key}
                                </span>
                            </div>
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-2xl font-black text-slate-900 dark:text-white">{total}</p>
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                        Total
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-slate-700 dark:text-slate-300">{avg}</p>
                                    <p className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wide">
                                        Avg/Day
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
