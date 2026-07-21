import React, { useEffect, useState } from "react";
import { Search, Loader2, AlertCircle, Info, AlertTriangle, Calendar } from "lucide-react";
import { toast } from "sonner";
// Thay đường dẫn API service tương ứng trong dự án của bạn
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

    useEffect(() => {
        fetchLogs();
    }, [levelFilter]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const response = await logService.getLogs(levelFilter === "ALL" ? "" : levelFilter, searchQuery);
            setLogs(response.content);
        } catch (error) {
            toast.error("Không thể tải log hệ thống");
        } finally {

            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs();
    };

    // Helper render UI cho từng mức độ log
    const renderLevelBadge = (level: string) => {
        switch (level) {
            case "ERROR":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-semibold border border-red-100"><AlertCircle className="w-3 h-3"/> ERROR</span>;
            case "WARN":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md text-xs font-semibold border border-amber-100"><AlertTriangle className="w-3 h-3"/> WARN</span>;
            case "INFO":
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-semibold border border-blue-100"><Info className="w-3 h-3"/> INFO</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-semibold border border-slate-200">{level}</span>;
        }
    };

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-2xl font-bold text-slate-800">Nhật ký hệ thống (System Logs)</h2>
                    <p className="text-slate-500 text-sm mt-1">Giám sát các hoạt động và lỗi phát sinh trong hệ thống</p>
                </div>

                {/* Filters & Search */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                        {["ALL", "INFO", "WARN", "ERROR"].map(level => (
                            <button
                                key={level}
                                onClick={() => setLevelFilter(level)}
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    levelFilter === level
                                        ? "bg-slate-800 text-white"
                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                }`}
                            >
                                {level === "ALL" ? "Tất cả" : level}
                            </button>
                        ))}
                    </div>

                    <form onSubmit={handleSearch} className="relative w-full md:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm nội dung log..."
                            className="w-full pl-9 pr-4 h-10 bg-slate-50 border border-slate-200 text-sm rounded-lg focus:border-emerald-500 focus:bg-white outline-none transition-all"
                        />
                    </form>
                </div>

                {/* Log Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left whitespace-nowrap">
                            <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4">Thời gian</th>
                                <th className="px-6 py-4">Mức độ</th>
                                <th className="px-6 py-4">Hành động</th>
                                <th className="px-6 py-4">Chi tiết (Message)</th>
                                <th className="px-6 py-4">Người dùng</th>
                                <th className="px-6 py-4">IP Address</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-700">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12">
                                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" />
                                        <p className="text-slate-500 mt-2 text-sm">Đang tải dữ liệu...</p>
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center py-12 text-slate-400">
                                        Không tìm thấy log nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-slate-50 font-mono text-sm transition-colors">
                                        <td className="px-6 py-4 flex items-center gap-2 text-slate-500">
                                            <Calendar className="w-4 h-4"/>
                                            {new Date(log.timestamp).toLocaleString("vi-VN")}
                                        </td>
                                        <td className="px-6 py-4">
                                            {renderLevelBadge(log.level)}
                                        </td>
                                        <td className="px-6 py-4 font-semibold text-slate-800">
                                            {log.action}
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 max-w-xs truncate" title={log.message}>
                                            {log.message}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.username || "System"}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {log.ipAddress}
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Phân trang (Mock) */}
                    <div className="p-4 border-t border-slate-100 flex justify-between items-center text-sm text-slate-500">
                        <span>Hiển thị 1 - {logs.length} của {logs.length} kết quả</span>
                        <div className="flex gap-2">
                            <button className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Trước</button>
                            <button className="px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 disabled:opacity-50">Sau</button>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}