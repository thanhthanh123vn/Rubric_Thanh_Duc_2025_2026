import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Clock,
    AlertTriangle,
    Info,
    CheckCircle2,
    XCircle,
    RefreshCw,
    MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {logService} from "@/api/logServiceApi.ts";


type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS';

interface SystemLog {
    id: string;
    timestamp: string;
    level: LogLevel;
    message: string;
    user: string;
    ipAddress: string;
}

export default function AdminSystemLogs() {
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLevel, setFilterLevel] = useState<LogLevel | 'ALL'>('ALL');

    const fetchLogs = async () => {
        setIsLoading(true);
        try {

            const data = await logService.getLogs(searchTerm, filterLevel);
            setLogs(data);
            setIsLoading(false);

        } catch (error) {
            console.error("Lỗi khi tải nhật ký:", error);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Helpers cho giao diện
    const getLevelConfig = (level: LogLevel) => {
        switch (level) {
            case 'INFO': return { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', label: 'Thông tin' };
            case 'WARN': return { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', label: 'Cảnh báo' };
            case 'ERROR': return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: 'Lỗi' };
            case 'SUCCESS': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', label: 'Thành công' };
        }
    };

    // Lọc dữ liệu trên Frontend (nếu không gọi API khi search)
    const filteredLogs = logs.filter(log => {
        const matchLevel = filterLevel === 'ALL' || log.level === filterLevel;
        const matchSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
            log.user.toLowerCase().includes(searchTerm.toLowerCase());
        return matchLevel && matchSearch;
    });

    return (
        <div className="p-4 md:p-6 bg-slate-50 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">

                {/* Header - Mobile First: Stack dọc trên mobile, xếp ngang trên tablet/desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">Nhật ký hệ thống (Logs)</h2>
                        <p className="text-sm text-slate-500 mt-1">Theo dõi và kiểm tra các hoạt động trên hệ thống E-learning.</p>
                    </div>
                    <Button onClick={fetchLogs} disabled={isLoading} className="w-full sm:w-auto bg-white border text-slate-700 hover:bg-slate-50" variant="outline">
                        <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                        Làm mới
                    </Button>
                </div>

                {/* Bảng điều khiển bộ lọc - Responsive Flexbox */}
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm theo nội dung hoặc người dùng..."
                            className="pl-9 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
                        <Filter className="w-4 h-4 text-slate-400 shrink-0 hidden md:block" />
                        {(['ALL', 'INFO', 'SUCCESS', 'WARN', 'ERROR'] as const).map((level) => (
                            <button
                                key={level}
                                onClick={() => setFilterLevel(level)}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg whitespace-nowrap transition-colors border ${
                                    filterLevel === level
                                        ? 'bg-slate-800 text-white border-slate-800'
                                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {level === 'ALL' ? 'Tất cả' : getLevelConfig(level as LogLevel).label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danh sách Logs - Thay vì dùng Table, dùng cấu trúc List cho Mobile First */}
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                            <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mb-2" />
                            Đang tải dữ liệu...
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            Không tìm thấy nhật ký nào phù hợp.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100">
                            {filteredLogs.map((log) => {
                                const config = getLevelConfig(log.level);
                                const Icon = config.icon;

                                return (
                                    // Bố cục từng Log: Dọc trên mobile, Ngang trên màn hình sm trở lên
                                    <div key={log.id} className="p-4 hover:bg-slate-50/80 transition-colors flex flex-col sm:flex-row gap-3 sm:items-center">

                                        {/* Level Badge & Time */}
                                        <div className="flex items-center gap-3 sm:w-48 shrink-0">
                                            <div className={`p-2 rounded-lg border ${config.bg} ${config.border}`}>
                                                <Icon className={`w-4 h-4 ${config.color}`} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className={`text-xs font-bold ${config.color}`}>{log.level}</span>
                                                <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {log.timestamp.split(' ')[1]} {/* Chỉ hiện giờ trên mobile */}
                        </span>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-800 leading-snug break-words">
                                                {log.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1 hidden sm:block">
                                                {log.timestamp} {/* Hiện đầy đủ ngày giờ trên desktop */}
                                            </p>
                                        </div>

                                        {/* Meta Info (User, IP) */}
                                        <div className="flex items-center sm:flex-col sm:items-end gap-2 sm:gap-1 sm:w-32 shrink-0 pt-2 sm:pt-0 border-t sm:border-0 border-slate-100 mt-2 sm:mt-0">
                       <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded-md">
                         {log.user}
                       </span>
                                            <span className="text-xs text-slate-400 font-mono">
                         {log.ipAddress}
                       </span>
                                        </div>

                                        {/* Action (Optional) */}
                                        <div className="hidden md:flex justify-end shrink-0 pl-2">
                                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600">
                                                <MoreHorizontal className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Pagination (Tĩnh) */}
                {!isLoading && filteredLogs.length > 0 && (
                    <div className="flex items-center justify-between px-2 pt-2">
                        <span className="text-sm text-slate-500">Hiển thị {filteredLogs.length} kết quả</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" disabled>Trước</Button>
                            <Button variant="outline" size="sm">Sau</Button>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}