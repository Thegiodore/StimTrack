import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, ChevronDown, ChevronUp, Download, Calendar, X, Filter } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getEmotionDotColor, getEmotionTagStyle } from '../utils/emotionUtils';

const SORTABLE = ["time", "confidence"];

const TYPE_FILTERS = [
    { id: "all", label: "All" },
    { id: "Head Banging", label: "Head Banging" },
    { id: "Arm Flapping", label: "Arm Flapping" },
    { id: "Pacing", label: "Pacing" },
];

const EMOTION_FILTERS = [
    { id: "all", label: "All" },
    { id: "Happy", label: "Happy" },
    { id: "Sad", label: "Sad" },
    { id: "Neutral", label: "Neutral" },
    { id: "Angry", label: "Angry" },
];

const DATE_RANGES = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom" },
];

export default function ReportsTab({ logs = [], childName = "Child" }) {
    const { theme } = useTheme();
    const [search, setSearch] = useState("");
    const [sortKey, setSortKey] = useState("time");
    const [sortAsc, setSortAsc] = useState(false);
    const [typeFilter, setTypeFilter] = useState("all");
    const [emotionFilter, setEmotionFilter] = useState("all");
    const [dateRange, setDateRange] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    const hasActiveFilters = typeFilter !== "all" || emotionFilter !== "all" || dateRange !== "all" || search.trim();

    const clearAllFilters = () => {
        setTypeFilter("all");
        setEmotionFilter("all");
        setDateRange("all");
        setDateFrom("");
        setDateTo("");
        setSearch("");
    };

    // Helper for date calculations
    const getDateBounds = (rangeId) => {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];
        switch (rangeId) {
            case "today": return { from: todayStr, to: todayStr };
            case "week": {
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                return { from: start.toISOString().split("T")[0], to: todayStr };
            }
            case "month": {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                return { from: start.toISOString().split("T")[0], to: todayStr };
            }
            default: return { from: "", to: "" };
        }
    };

    const handleSort = (key) => {
        if (!SORTABLE.includes(key)) return;
        sortKey === key ? setSortAsc(!sortAsc) : (setSortKey(key), setSortAsc(true));
    };

    const filteredLogs = useMemo(() => {
        let result = [...logs];

        if (typeFilter !== "all") {
            result = result.filter((log) => (log.type || "").toLowerCase().includes(typeFilter.toLowerCase()));
        }
        if (emotionFilter !== "all") {
            result = result.filter((log) => (log.emotion || "") === emotionFilter);
        }
        if (dateRange !== "all") {
            const { from, to } = dateRange === "custom" ? { from: dateFrom, to: dateTo } : getDateBounds(dateRange);
            if (from) result = result.filter(l => (l.date || l.time || "").slice(0, 10) >= from);
            if (to) result = result.filter(l => (l.date || l.time || "").slice(0, 10) <= to);
        }
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(l => 
                (l.type || "").toLowerCase().includes(q) || 
                (l.details || "").toLowerCase().includes(q) ||
                (l.time || "").toLowerCase().includes(q)
            );
        }

        return result.sort((a, b) => {
            let aVal = a[sortKey] || "";
            let bVal = b[sortKey] || "";
            if (sortKey === "confidence") { aVal = Number(aVal); bVal = Number(bVal); }
            return sortAsc ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1);
        });
    }, [logs, search, sortKey, sortAsc, typeFilter, emotionFilter, dateRange, dateFrom, dateTo]);

    const handleDownloadPDF = () => {
        // Philippine Long Bond Paper (8.5in x 13in converted to mm)
        const doc = new jsPDF({ orientation: "p", unit: "mm", format: [215.9, 330.2] });
        const pageWidth = 215.9;
        
        doc.setFontSize(22);
        doc.setTextColor(79, 70, 229); // Indigo 600
        doc.text("StimTrack AI Report", 14, 20);
        
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Patient Name: ${childName}`, 14, 28);
        doc.text(`Report Period: ${dateRange.toUpperCase()}`, 14, 33);
        doc.text(`Total Observations: ${filteredLogs.length}`, 14, 38);

        const tableData = filteredLogs.map(l => [
            l.time || "—",
            l.type || "—",
            l.emotion || "—",
            `${((l.confidence || 0) * 100).toFixed(0)}%`,
            l.details || "—"
        ]);

        autoTable(doc, {
            startY: 45,
            head: [["Timestamp", "Stim Type", "Emotion", "Accuracy", "Notes"]],
            body: tableData,
            headStyles: { fillColor: [79, 70, 229], fontSize: 10 },
            styles: { fontSize: 9, cellPadding: 4 },
            alternateRowStyles: { fillColor: [245, 247, 250] },
        });

        doc.save(`StimTrack_${childName}_Report.pdf`);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Main Container */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
                
                {/* Search & Action Header */}
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl">
                            <FileText className="text-indigo-600 dark:text-indigo-400" size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Activity Logs</h2>
                            <p className="text-xs text-slate-500 font-medium">Export and filter detection history</p>
                        </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Search history..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <button 
                            onClick={handleDownloadPDF}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
                        >
                            <Download size={16} /> PDF
                        </button>
                    </div>
                </div>

                {/* Advanced Filter Bar */}
                <div className="px-6 py-4 bg-slate-50/50 dark:bg-slate-800/30 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <Filter size={14} className="text-slate-400" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase">Filters</span>
                        </div>
                        
                        {/* Type Quick-Toggle */}
                        <div className="flex gap-1">
                            {TYPE_FILTERS.map(f => (
                                <button 
                                    key={f.id}
                                    onClick={() => setTypeFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${typeFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {/* Emotion Quick-Toggle */}
                        <div className="flex gap-1 border-l border-slate-200 dark:border-slate-700 pl-4">
                             {EMOTION_FILTERS.slice(0, 3).map(f => (
                                <button 
                                    key={f.id}
                                    onClick={() => setEmotionFilter(f.id)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${emotionFilter === f.id ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-500'}`}
                                >
                                    {f.label}
                                </button>
                            ))}
                        </div>

                        {hasActiveFilters && (
                            <button onClick={clearAllFilters} className="text-xs font-bold text-red-500 flex items-center gap-1 hover:underline">
                                <X size={14} /> Reset
                            </button>
                        )}
                    </div>
                </div>

                {/* Data Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase cursor-pointer hover:text-indigo-600" onClick={() => handleSort('time')}>Timestamp</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Stim Type</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Emotion</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase cursor-pointer" onClick={() => handleSort('confidence')}>Accuracy</th>
                                <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase">Observations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLogs.map((log, i) => (
                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">{log.time}</td>
                                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-slate-200">{log.type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${getEmotionTagStyle(log.emotion)}`}>
                                            {log.emotion}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-12 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div 
                                                    className={`h-full rounded-full ${log.confidence > 0.8 ? 'bg-green-500' : 'bg-amber-500'}`}
                                                    style={{ width: `${(log.confidence * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-500">{(log.confidence * 100).toFixed(0)}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500 max-w-[250px] truncate">{log.details}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {filteredLogs.length === 0 && (
                    <div className="py-20 text-center">
                        <p className="text-slate-400 font-medium">No records found matching your criteria.</p>
                    </div>
                )}
            </div>
        </motion.div>
    );
}