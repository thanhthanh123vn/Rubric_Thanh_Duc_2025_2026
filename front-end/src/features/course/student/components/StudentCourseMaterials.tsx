import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { FileText, Download, Eye, X, Search, File, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';

import courseService from "@/pages/admin/api/courseService.ts";
import type { SyllabusFile } from "@/api/type.ts";
import Header from "@/components/home/Header.tsx";
import Sidebar from "@/features/course/student/components/Sidebar.tsx";

export default function StudentCourseMaterials() {
    const { id } = useParams<{ id: string }>();
    const [files, setFiles] = useState<SyllabusFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // State quản lý xem trước
    const [previewFile, setPreviewFile] = useState<SyllabusFile | null>(null);

    useEffect(() => {
        if (id) {
            loadMaterials();
        }
    }, [id]);

    const loadMaterials = async () => {
        try {
            setIsLoading(true);
            const data = await courseService.getSyllabusFiles(id!);
            setFiles(data);
        } catch (error) {
            console.error("Lỗi tải tài liệu:", error);
            toast.error("Không thể tải danh sách tài liệu!");
        } finally {
            setIsLoading(false);
        }
    };

    const getPreviewUrl = (url: string, fileName: string) => {
        const lowerName = fileName.toLowerCase();
        if (lowerName.endsWith('.pdf') || lowerName.match(/\.(jpeg|jpg|gif|png)$/)) {
            return url;
        }
        return `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    };

    const getFileIcon = (fileName: string) => {
        const lowerName = fileName.toLowerCase();
        if (lowerName.match(/\.(jpeg|jpg|gif|png)$/)) return <ImageIcon className="w-6 h-6 text-blue-500" />;
        if (lowerName.endsWith('.pdf')) return <FileText className="w-6 h-6 text-red-500" />;
        return <File className="w-6 h-6 text-emerald-500" />;
    };

    const filteredFiles = files.filter(file =>
        file.fileName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
                <Sidebar />
                <div className="flex-1 flex flex-col min-w-0">
                    <Header />
                    <main className="flex-1 flex flex-col items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
                        <p className="text-slate-500 font-medium animate-pulse text-sm sm:text-base">Đang tải tài liệu học tập...</p>
                    </main>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row overflow-hidden">
            {/* --- SIDEBAR BÊN TRÁI --- */}
            <Sidebar />

            {/* --- KHU VỰC NỘI DUNG CHÍNH BÊN PHẢI --- */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* HEADER NẰM TRÊN CÙNG */}
                <Header />

                {/* CONTENT CÓ THỂ CUỘN (SCROLL) ĐƯỢC */}
                <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-7xl mx-auto space-y-6">

                        {/* HEADER & THANH TÌM KIẾM */}
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
                            <div>
                                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Tài liệu môn học</h2>
                                <p className="text-sm text-slate-500 mt-1">Danh sách bài giảng, giáo trình từ Giảng viên.</p>
                            </div>

                            <div className="relative w-full sm:w-72">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-5 w-5 text-slate-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm tài liệu..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        {/* DANH SÁCH FILE */}
                        {filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-16 px-4 bg-white rounded-2xl border border-dashed border-slate-300 text-center">
                                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                <h3 className="text-lg font-semibold text-slate-900">Không tìm thấy tài liệu</h3>
                                <p className="text-sm text-slate-500 mt-1 max-w-sm">
                                    {searchTerm ? "Không có tài liệu nào khớp với từ khóa tìm kiếm của bạn." : "Giảng viên chưa tải lên tài liệu nào cho môn học này."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                {filteredFiles.map((file) => (
                                    <div
                                        key={file.id}
                                        onClick={() => setPreviewFile(file)}
                                        className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer"
                                    >
                                        <div className="p-4 sm:p-5 flex-1 flex items-start gap-4">
                                            <div className="p-3 bg-slate-50 rounded-xl group-hover:scale-110 transition-transform">
                                                {getFileIcon(file.fileName)}
                                            </div>
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm sm:text-base font-semibold text-slate-800 line-clamp-2 group-hover:text-emerald-700 transition-colors"
                                                    title={file.fileName}>
                                                    {file.fileName}
                                                </h4>
                                                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                                                    <Eye className="w-3 h-3" /> Chạm để xem trước
                                                </p>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 px-4 py-3 border-t border-slate-100 flex justify-end">
                                            <a
                                                href={file.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                onClick={(e) => e.stopPropagation()}
                                                className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-emerald-700 bg-emerald-100/50 hover:bg-emerald-100 rounded-lg transition-colors"
                                            >
                                                <Download className="w-4 h-4" /> Tải về
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- MODAL XEM TRƯỚC NẰM NGOÀI CÙNG --- */}
            {previewFile && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-slate-900/60  sm:p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full sm:w-auto sm:min-w-[800px] h-[95vh] sm:h-[85vh] rounded-t-2xl sm:rounded-2xl flex flex-col overflow-hidden shadow-2xl animate-in slide-in-from-bottom-10 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-100 bg-white">
                            <div className="flex items-center gap-3 pr-4 overflow-hidden">
                                {getFileIcon(previewFile.fileName)}
                                <h3 className="font-semibold text-slate-900 text-sm sm:text-base truncate">
                                    {previewFile.fileName}
                                </h3>
                            </div>

                            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                                <a
                                    href={previewFile.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 sm:px-4 sm:py-2 flex items-center gap-2 bg-emerald-50 text-emerald-700 font-medium rounded-lg hover:bg-emerald-100 transition-colors"
                                >
                                    <Download className="w-5 h-5 sm:w-4 sm:h-4" />
                                    <span className="hidden sm:inline">Tải về</span>
                                </a>
                                <button
                                    onClick={() => setPreviewFile(null)}
                                    className="p-2 sm:p-2.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6 sm:w-5 sm:h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-100 w-full h-full relative overflow-auto">
                            {previewFile.fileName.toLowerCase().match(/\.(jpeg|jpg|gif|png)$/) ? (
                                <div className="w-full h-full flex items-center justify-center p-4">
                                    <img
                                        src={previewFile.fileUrl}
                                        alt={previewFile.fileName}
                                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                                    />
                                </div>
                            ) : (
                                <iframe
                                    src={getPreviewUrl(previewFile.fileUrl, previewFile.fileName)}
                                    className="w-full h-full border-none"
                                    title="Document Preview"
                                    loading="lazy"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}