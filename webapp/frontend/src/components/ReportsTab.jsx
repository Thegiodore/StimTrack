import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Search, ChevronDown, ChevronUp, Download, Calendar, X } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SORTABLE = ["time", "confidence"];

const TYPE_FILTERS = [
    { id: "all", label: "All" },
    { id: "Head Banging", label: "Head Banging" },
    { id: "Arm Flapping", label: "Arm Flapping" },
    { id: "Spinning", label: "Spinning" },
];

const EMOTION_FILTERS = [
    { id: "all", label: "All" },
    { id: "Happy", label: "Happy" },
    { id: "Stressed", label: "Stressed" },
];

const DATE_RANGES = [
    { id: "all", label: "All Time" },
    { id: "today", label: "Today" },
    { id: "week", label: "This Week" },
    { id: "month", label: "This Month" },
    { id: "custom", label: "Custom" },
];

export default function ReportsTab({ logs }) {
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

    // Compute date boundaries for quick-select ranges
    const getDateBounds = (rangeId) => {
        const now = new Date();
        const todayStr = now.toISOString().split("T")[0];

        switch (rangeId) {
            case "today":
                return { from: todayStr, to: todayStr };
            case "week": {
                const start = new Date(now);
                start.setDate(now.getDate() - now.getDay());
                return { from: start.toISOString().split("T")[0], to: todayStr };
            }
            case "month": {
                const start = new Date(now.getFullYear(), now.getMonth(), 1);
                return { from: start.toISOString().split("T")[0], to: todayStr };
            }
            default:
                return { from: "", to: "" };
        }
    };

    const handleSort = (key) => {
        if (!SORTABLE.includes(key)) return;
        if (sortKey === key) {
            setSortAsc(!sortAsc);
        } else {
            setSortKey(key);
            setSortAsc(true);
        }
    };

    const filteredLogs = useMemo(() => {
        let result = [...logs];

        // Type filter
        if (typeFilter !== "all") {
            result = result.filter((log) => (log.type || "") === typeFilter);
        }

        // Emotion filter
        if (emotionFilter !== "all") {
            result = result.filter((log) => (log.emotion || "") === emotionFilter);
        }

        // Date filter
        if (dateRange !== "all") {
            let from, to;
            if (dateRange === "custom") {
                from = dateFrom;
                to = dateTo;
            } else {
                const bounds = getDateBounds(dateRange);
                from = bounds.from;
                to = bounds.to;
            }
            if (from) {
                result = result.filter((log) => {
                    const logDate = (log.date || log.time || "").slice(0, 10);
                    return logDate >= from;
                });
            }
            if (to) {
                result = result.filter((log) => {
                    const logDate = (log.date || log.time || "").slice(0, 10);
                    return logDate <= to;
                });
            }
        }

        // Search filter
        if (search.trim()) {
            const q = search.toLowerCase();
            result = result.filter(
                (log) =>
                    (log.type || "").toLowerCase().includes(q) ||
                    (log.details || "").toLowerCase().includes(q) ||
                    (log.emotion || "").toLowerCase().includes(q) ||
                    (log.time || "").toLowerCase().includes(q)
            );
        }

        result.sort((a, b) => {
            let aVal = a[sortKey] || "";
            let bVal = b[sortKey] || "";

            if (sortKey === "confidence") {
                aVal = Number(aVal) || 0;
                bVal = Number(bVal) || 0;
            } else {
                aVal = String(aVal).toLowerCase();
                bVal = String(bVal).toLowerCase();
            }

            if (aVal < bVal) return sortAsc ? -1 : 1;
            if (aVal > bVal) return sortAsc ? 1 : -1;
            return 0;
        });

        return result;
    }, [logs, search, sortKey, sortAsc, typeFilter, emotionFilter, dateRange, dateFrom, dateTo]);

    // ── PDF Export (Long Bond Paper: 8.5" x 13") ──
    const handleDownloadPDF = () => {
        // Long bond paper in mm: 215.9 x 330.2
        const doc = new jsPDF({
            orientation: "portrait",
            unit: "mm",
            format: [215.9, 330.2],
        });

        const pageWidth = 215.9;
        const marginLeft = 14;
        const marginRight = 14;
        const contentWidth = pageWidth - marginLeft - marginRight;

        // Header
        doc.setFontSize(20);
        doc.setFont("helvetica", "bold");
        doc.text("StimTrack", marginLeft, 20);

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text("Stimming Activity Report", marginLeft, 27);

        doc.setFontSize(9);
        doc.text(
            `Generated: ${new Date().toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            })}`,
            marginLeft,
            33
        );
        doc.text(`Total Entries: ${filteredLogs.length}`, marginLeft, 38);

        // Divider
        doc.setDrawColor(200);
        doc.line(marginLeft, 42, pageWidth - marginRight, 42);

        // Table
        const tableData = filteredLogs.map((log) => [
            log.time || "—",
            log.type || "—",
            log.emotion || "—",
            `${((log.confidence || 0) * 100).toFixed(0)}%`,
            log.details || "—",
        ]);

        autoTable(doc, {
            startY: 46,
            head: [["Timestamp", "Stim Type", "Emotion", "Accuracy", "Details"]],
            body: tableData,
            margin: { left: marginLeft, right: marginRight },
            styles: {
                fontSize: 9,
                cellPadding: 3,
                lineColor: [220, 220, 220],
                lineWidth: 0.3,
            },
            headStyles: {
                fillColor: [79, 70, 229], // indigo-600
                textColor: 255,
                fontStyle: "bold",
                fontSize: 9,
            },
            alternateRowStyles: {
                fillColor: [248, 250, 252], // slate-50
            },
            columnStyles: {
                0: { cellWidth: 30 },
                1: { cellWidth: 30 },
                2: { cellWidth: 22 },
                3: { cellWidth: 22 },
                4: { cellWidth: contentWidth - 30 - 30 - 22 - 22 },
            },
            didDrawPage: (data) => {
                // Footer on every page
                const pageHeight = doc.internal.pageSize.height;
                doc.setFontSize(8);
                doc.setTextColor(150);
                doc.text(
                    `StimTrack Report — Page ${doc.internal.getCurrentPageInfo().pageNumber}`,
                    pageWidth / 2,
                    pageHeight - 10,
                    { align: "center" }
                );
            },
        });

        doc.save("StimTrack_Report.pdf");
    };

    const SortIcon = ({ column }) => {
        if (!SORTABLE.includes(column)) return null;
        const isActive = sortKey === column;
        const Icon = isActive && sortAsc ? ChevronUp : ChevronDown;
        return (
            <Icon
                size={14}
                className={`inline ml-1 transition-opacity ${isActive ? "opacity-100" : "opacity-30"}`}
            />
        );
    };

    const columns = [
        { key: "time", label: "Timestamp", sortable: true },
        { key: "type", label: "Stim Type", sortable: false },
        { key: "emotion", label: "Emotion", sortable: false },
        { key: "confidence", label: "Accuracy", sortable: true },
        { key: "details", label: "Details", sortable: false },
    ];

    return (
        <motion.div
            key="reports"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            {/* Table Card */}
            <div className="bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden transition-colors duration-300">
                {/* Header */}
                <div className="px-5 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg">
                            <FileText size={18} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white transition-colors">
                                Activity Log
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                {filteredLogs.length} {filteredLogs.length === 1 ? "entry" : "entries"}
                            </p>
                        </div>
                    </div>

                    {/* Search + Download */}
                    <div className="flex items-center gap-2">
                        <div className="relative flex-1 sm:flex-none">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                            />
                            <input
                                type="text"
                                placeholder="Search logs..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2.5 w-full sm:w-[200px] bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 dark:focus:border-indigo-400 transition-all duration-200 font-medium"
                            />
                        </div>

                        <button
                            onClick={handleDownloadPDF}
                            disabled={filteredLogs.length === 0}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
                        >
                            <Download size={16} />
                            <span className="hidden sm:inline">Download PDF</span>
                            <span className="sm:hidden">PDF</span>
                        </button>
                    </div>
                </div>

                {/* Filter Bar */}
                <div className="px-5 sm:px-8 py-4 border-b border-slate-100 dark:border-slate-800">
                    {/* Row 1: Date Range Quick Select */}
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5 mr-2">
                            <Calendar size={14} className="text-slate-400 dark:text-slate-500" />
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Date</span>
                        </div>
                        {DATE_RANGES.map((r) => (
                            <button
                                key={r.id}
                                onClick={() => {
                                    if (r.id === "custom" && dateRange === "custom") {
                                        setDateRange("all");
                                        setDateFrom(""); setDateTo("");
                                    } else {
                                        setDateRange(r.id);
                                        if (r.id !== "custom") { setDateFrom(""); setDateTo(""); }
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${dateRange === r.id
                                    ? "bg-indigo-600 text-white shadow-sm"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                    }`}
                            >
                                {r.label}
                            </button>
                        ))}

                        {/* Desktop: Custom Date Pickers inline */}
                        <AnimatePresence mode="popLayout">
                            {dateRange === "custom" && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0, marginLeft: -8, filter: "blur(8px)" }}
                                    animate={{
                                        opacity: 1, width: "auto", marginLeft: 0, filter: "blur(0px)",
                                        transition: { type: "spring", stiffness: 300, damping: 25 }
                                    }}
                                    exit={{
                                        opacity: 0, width: 0, marginLeft: -8, filter: "blur(8px)",
                                        transition: { duration: 0.15, ease: "easeIn" }
                                    }}
                                    className="hidden sm:flex items-center gap-2 overflow-hidden"
                                >
                                    <span className="text-slate-300 dark:text-slate-600 mx-1">|</span>
                                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    />
                                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Mobile: Custom Date Pickers below */}
                    <AnimatePresence>
                        {dateRange === "custom" && (
                            <motion.div
                                initial={{ height: 0, opacity: 0, marginTop: 0, filter: "blur(6px)" }}
                                animate={{
                                    height: "auto", opacity: 1, marginTop: 12, filter: "blur(0px)",
                                    transition: { type: "spring", stiffness: 300, damping: 28 }
                                }}
                                exit={{
                                    height: 0, opacity: 0, marginTop: 0, filter: "blur(6px)",
                                    transition: { duration: 0.15, ease: "easeIn" }
                                }}
                                className="sm:hidden overflow-hidden"
                            >
                                <div className="flex items-center gap-2">
                                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">From</label>
                                    <input
                                        type="date"
                                        value={dateFrom}
                                        onChange={(e) => setDateFrom(e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    />
                                    <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To</label>
                                    <input
                                        type="date"
                                        value={dateTo}
                                        onChange={(e) => setDateTo(e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Row 2: Type + Emotion Filters + Clear */}
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap mt-3">
                        {/* Type Filter */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Type</span>
                            <div className="flex items-center gap-1">
                                {TYPE_FILTERS.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setTypeFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${typeFilter === f.id
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Emotion Filter + Clear */}
                        <div className="flex items-center gap-2">
                            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Emotion</span>
                            <div className="flex items-center gap-1">
                                {EMOTION_FILTERS.map((f) => (
                                    <button
                                        key={f.id}
                                        onClick={() => setEmotionFilter(f.id)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 ${emotionFilter === f.id
                                            ? "bg-indigo-600 text-white shadow-sm"
                                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                                            }`}
                                    >
                                        {f.label}
                                    </button>
                                ))}
                            </div>

                            {/* Clear All (right of Stressed) */}
                            <AnimatePresence mode="popLayout">
                                {hasActiveFilters && (
                                    <motion.div
                                        initial={{ width: 0, opacity: 0, marginLeft: 0 }}
                                        animate={{
                                            width: "auto", opacity: 1, marginLeft: 4,
                                            transition: { type: "spring", stiffness: 400, damping: 25 }
                                        }}
                                        exit={{
                                            width: 0, opacity: 0, marginLeft: 0,
                                            transition: { duration: 0.15, ease: "easeIn" }
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <button
                                            onClick={clearAllFilters}
                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors duration-200 whitespace-nowrap"
                                        >
                                            <X size={12} />
                                            <span className="hidden sm:inline">Clear All Filters</span>
                                            <span className="sm:hidden">Clear</span>
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                {/* No Data */}
                {filteredLogs.length === 0 ? (
                    <div className="px-8 py-16 text-center">
                        <p className="text-slate-400 dark:text-slate-500 font-medium">
                            {logs.length === 0 ? "No detections yet." : "No results match your search."}
                        </p>
                    </div>
                ) : (
                    <>
                        {/* MOBILE: Card Layout */}
                        <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                            {filteredLogs.map((log, index) => (
                                <motion.div
                                    key={log.id || index}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    className="px-5 py-4"
                                >
                                    <div className="flex items-start justify-between gap-3 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`w-2 h-2 rounded-full shrink-0 ${log.emotion === "Happy" ? "bg-green-500" : "bg-orange-500"}`}
                                            />
                                            <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                                {log.time}
                                            </span>
                                        </div>
                                        <span
                                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border shrink-0 ${log.emotion === "Happy"
                                                ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20"
                                                : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
                                                }`}
                                        >
                                            {(log.confidence * 100).toFixed(0)}%
                                        </span>
                                    </div>
                                    <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 mb-0.5">
                                        {log.type}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                                        {log.details}
                                    </p>
                                </motion.div>
                            ))}
                        </div>

                        {/* DESKTOP: Table Layout */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-slate-100 dark:border-slate-800 text-left">
                                        {columns.map((col) => (
                                            <th
                                                key={col.key}
                                                onClick={() => handleSort(col.key)}
                                                className={`px-6 py-3.5 text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider select-none transition-colors ${col.sortable ? "cursor-pointer hover:text-slate-600 dark:hover:text-slate-300" : ""}`}
                                            >
                                                {col.label}
                                                <SortIcon column={col.key} />
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredLogs.map((log, index) => (
                                        <motion.tr
                                            key={log.id || index}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                                        >
                                            <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                {log.time}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                                                    {log.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${log.emotion === "Happy"
                                                        ? "bg-green-50 dark:bg-green-500/10 text-green-600 dark:text-green-400 border-green-100 dark:border-green-500/20"
                                                        : "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-500/20"
                                                        }`}
                                                >
                                                    <span
                                                        className={`w-1.5 h-1.5 rounded-full ${log.emotion === "Happy" ? "bg-green-500" : "bg-orange-500"}`}
                                                    />
                                                    {log.emotion}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-16 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${log.confidence >= 0.8
                                                                ? "bg-green-500"
                                                                : log.confidence >= 0.5
                                                                    ? "bg-amber-500"
                                                                    : "bg-red-500"
                                                                }`}
                                                            style={{ width: `${(log.confidence * 100).toFixed(0)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                                                        {(log.confidence * 100).toFixed(0)}%
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400 max-w-[300px] truncate">
                                                {log.details}
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </motion.div>
    );
}
