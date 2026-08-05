import React, { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, Info, AlertTriangle, Calendar, RefreshCw, X, ShieldAlert, Eye, User, Globe, Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { logService } from "@/api/logServiceApi.ts";

interface SystemLog {
    id: string;
    level: "INFO" | "WARN" | "ERROR" | "DEBUG";
    action: string;
    message: string;
    username: string;
    ipAddress: string;
    timestamp: string;
}

export default function SystemLogPage() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [levelFilter, setLevelFilter] = useState("ALL");
    const [selectedLog, setSelectedLog] = useState<SystemLog | null>(null);

    // --- State Phân Trang ---
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);


    useEffect(() => {
        fetchLogs();
    }, [levelFilter, page, size]);

    const fetchLogs = async (overrideSearch?: string) => {
        setLoading(true);
        try {
            const query = overrideSearch !== undefined ? overrideSearch : searchQuery;
            const level = levelFilter === "ALL" ? "" : levelFilter;

            // Gọi API có kèm tham số phân trang
            const response = await logService.getLogs(level, query, page, size);

            setLogs(response.content || []);
            setTotalPages(response.totalPages || 1);
            setTotalElements(response.totalElements || 0);
        } catch (error) {
            console.error("Fetch logs error:", error);
            toast.error("Không thể tải nhật ký hệ thống");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0); // Reset về trang 1 khi search
        fetchLogs();
    };

    const handleClearSearch = () => {
        setSearchQuery("");
        setPage(0);
        fetchLogs("");
    };

    const handleLevelChange = (level: string) => {
        setLevelFilter(level);
        setPage(0);
    };


    const handlePrevPage = () => {
        if (page > 0) setPage(prev => prev - 1);
    };

    const handleNextPage = () => {
        if (page < totalPages - 1) setPage(prev => prev + 1);
    };

    const renderLevelBadge = (level: string) => {
        switch (level) {
            case "ERROR":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold border border-red-200"><AlertCircle className="w-3.5 h-3.5"/> ERROR</span>;
            case "WARN":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-bold border border-amber-200"><AlertTriangle className="w-3.5 h-3.5"/> WARN</span>;
            case "INFO":
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-bold border border-blue-200"><Info className="w-3.5 h-3.5"/> INFO</span>;
            default:
                return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-bold border border-slate-200">{level}</span>;
        }
    };

    const getRowStyle = (level: string) => {
        switch (level) {
            case "ERROR": return "bg-red-50/40 hover:bg-red-50/80";
            case "WARN": return "bg-amber-50/40 hover:bg-amber-50/80";
            default: return "hover:bg-slate-50";
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <ShieldAlert className="w-6 h-6 text-indigo-600" />
                            Nhật ký hệ thống (System Logs)
                        </h2>
                        <p className="text-slate-500 text-sm mt-1">Giám sát các hoạt động, cảnh báo và lỗi phát sinh từ máy chủ</p>
                    </div>
                    <button
                        onClick={() => fetchLogs()}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 hover:text-indigo-600 transition-colors shadow-sm disabled:opacity-50 text-sm font-medium"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
                        {["ALL", "INFO", "WARN", "ERROR"].map(level => (
                            <button
                                key={level}
                                onClick={() => handleLevelChange(level)}
                                className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all whitespace-nowrap ${
                                    levelFilter === level
                                        ? "bg-slate-800 text-white shadow-md"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {level === "ALL" ? "Tất cả mức độ" : level}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-96 flex items-center">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm nội dung, action, user..."
                            className="w-full pl-9 pr-10 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white outline-none transition-all"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={handleClearSearch}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        )}
                    </form>
                </div>

                {/* Log Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-slate-50/80 text-slate-500 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap">Thời gian</th>
                                <th className="px-6 py-4 whitespace-nowrap">Mức độ</th>
                                <th className="px-6 py-4 whitespace-nowrap">Hành động</th>
                                <th className="px-6 py-4 min-w-[250px]">Nội dung rút gọn</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Chi tiết</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                                        <p className="text-slate-500 mt-3 font-medium">Đang tải dữ liệu log...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-16">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <Search className="w-8 h-8 text-slate-300" />
                                        </div>
                                        <p className="text-slate-500 font-medium">Không tìm thấy nhật ký hệ thống nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className={`transition-colors ${getRowStyle(log.level)}`}>
                                        <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-slate-400"/>
                                                {new Date(log.timestamp).toLocaleString("vi-VN", {
                                                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                                                    day: '2-digit', month: '2-digit', year: 'numeric'
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {renderLevelBadge(log.level)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="font-mono text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded">
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-700 font-mono text-xs truncate max-w-xs">
                                            {log.message}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                onClick={() => setSelectedLog(log)}
                                                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50 transition-colors shadow-sm"
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang (Pagination) */}
                    <div className="p-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-sm text-slate-500 gap-4 mt-auto">
                        <div className="flex items-center gap-4">
                            <span className="font-medium">
                                Hiển thị <strong className="text-slate-700">{totalElements === 0 ? 0 : page * size + 1}</strong> - <strong className="text-slate-700">{Math.min((page + 1) * size, totalElements)}</strong> của <strong className="text-slate-700">{totalElements}</strong> kết quả
                            </span>

                            <select
                                value={size}
                                onChange={(e) => {
                                    setSize(Number(e.target.value));
                                    setPage(0);
                                }}
                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none focus:border-indigo-500 cursor-pointer"
                            >
                                <option value={10}>10 dòng / trang</option>
                                <option value={20}>20 dòng / trang</option>
                                <option value={50}>50 dòng / trang</option>
                            </select>
                        </div>

                        <div className="flex gap-2 items-center">
                            <button
                                onClick={handlePrevPage}
                                disabled={page === 0 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                            >
                                <ChevronLeft className="w-4 h-4"/> Trước
                            </button>
                            <span className="px-2 font-medium">Trang {totalPages > 0 ? page + 1 : 0} / {totalPages}</span>
                            <button
                                onClick={handleNextPage}
                                disabled={page >= totalPages - 1 || loading}
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium shadow-sm"
                            >
                                Sau <ChevronRight className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= MODAL CHI TIẾT LOG (Giữ nguyên như phần trước) ================= */}
            {selectedLog && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
                        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <Activity className="w-5 h-5 text-indigo-600" />
                                Chi tiết bản ghi Log
                            </h3>
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Mức độ (Level)</p>
                                        <div>{renderLevelBadge(selectedLog.level)}</div>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Thời gian (Timestamp)</p>
                                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-slate-400" />
                                            {new Date(selectedLog.timestamp).toLocaleString("vi-VN")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Hành động (Action)</p>
                                        <p className="text-sm font-mono font-semibold text-indigo-700 bg-indigo-50 px-2 py-1 rounded inline-block">
                                            {selectedLog.action}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4 md:border-l border-slate-100 md:pl-4">
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Tài khoản (User)</p>
                                        <p className="text-sm font-medium text-slate-800 flex items-center gap-2">
                                            <User className="w-4 h-4 text-slate-400" />
                                            {selectedLog.username || <span className="text-slate-400 italic">System Auto</span>}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Địa chỉ IP</p>
                                        <p className="text-sm font-mono text-slate-700 flex items-center gap-2 bg-slate-100 px-2 py-1 rounded inline-block">
                                            <Globe className="w-4 h-4 text-slate-400 inline" /> {selectedLog.ipAddress}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Log ID</p>
                                        <p className="text-xs font-mono text-slate-500">{selectedLog.id}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Chi tiết thông điệp (Message Payload)</p>
                                <div className="bg-[#1e1e1e] rounded-xl p-4 overflow-x-auto">
                                    <pre className="text-xs font-mono text-green-400 whitespace-pre-wrap break-all leading-relaxed">
                                        {selectedLog.message}
                                    </pre>
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                            <button
                                onClick={() => setSelectedLog(null)}
                                className="px-6 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 transition-colors shadow-sm"
                            >
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}