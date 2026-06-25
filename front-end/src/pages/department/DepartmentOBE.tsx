import React, { useState, useEffect } from 'react';
import { Search, BarChart3, Loader2, BookOpen, ChevronRight, Layers } from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { useNavigate } from 'react-router-dom';

import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import { getLecturerByUser } from "@/api/userApi.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";

export default function DepartmentOBE() {
    const navigate = useNavigate();


    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

    const [userDept, setUserDept] = useState<string>("");
    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [filteredOfferings, setFilteredOfferings] = useState<CourseOfferingResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const userRole = user?.role || "HEAD_OF_DEPARTMENT";
    const isDean = userRole === 'DEAN';


    useEffect(() => {
        const fetchUserDep = async () => {
            if (!user?.userId) return;
            try {
                const res = await getLecturerByUser(user.userId);
                setUserDept(res.department?.departmentName || res.department);
            } catch (err) {
                console.error("Lỗi khi lấy thông tin khoa của user:", err);
            }
        };
        fetchUserDep();
    }, [user?.userId]);


    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const data = await courseOfferingService.getOfferings();
                setOfferings(data);
            } catch (error) {
                console.error("Lỗi khi tải danh sách học phần:", error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // 4. Lọc danh sách lớp học phần theo bộ môn và từ khóa tìm kiếm
    useEffect(() => {
        let result = Array.isArray(offerings) ? offerings : [];

        // Lọc theo bộ môn (Nếu không phải Trưởng khoa)
        if (!isDean && userDept) {
            result = result.filter(o => o.course?.department === userDept);
        }

        // Lọc theo từ khóa
        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.offeringName?.toLowerCase().includes(query) ||
                o.offeringId?.toLowerCase().includes(query) ||
                o.course?.courseName?.toLowerCase().includes(query)
            );
        }

        setFilteredOfferings(result);
    }, [offerings, userDept, searchQuery, isDean]);


    const handleViewOBE = (offeringId: string) => {

        navigate(`/department/obe/${offeringId}/analytics`);
    };
console.log(offerings);
    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-indigo-600" /> Phân tích Tiến độ OBE
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">
                        Theo dõi mức độ đạt chuẩn đầu ra (CLO/PLO) của các học phần thuộc {isDean ? "Khoa" : `bộ môn ${userDept}`}
                    </p>
                </div>
            </div>

            {/* Thanh tìm kiếm */}
            <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-6 max-w-md">
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm theo mã lớp, tên môn học..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-indigo-500 outline-none transition-all"
                    />
                </div>
            </div>

            {/* Danh sách Grid Học Phần */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-indigo-600 mb-4" />
                    <p className="text-slate-500 font-medium">Đang tải danh sách học phần...</p>
                </div>
            ) : filteredOfferings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
                    <Layers className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">Không tìm thấy học phần nào phù hợp.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredOfferings.map((offering) => (
                        <div
                            key={offering.offeringId}
                            onClick={() => handleViewOBE(offering.offeringId)}
                            className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group flex flex-col h-full"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[11px] font-semibold rounded-lg border border-slate-200">
                                    Học kỳ {offering.semester}
                                </span>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-bold text-slate-800 text-lg leading-tight mb-1 group-hover:text-indigo-600 transition-colors">
                                    {offering.offeringName}
                                </h3>
                                <p className="text-sm text-slate-500 font-medium mb-3">
                                    Mã lớp: {offering.offeringId}
                                </p>

                                <div className="space-y-1.5 text-xs text-slate-600">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Môn học:</span>
                                        <span className="font-medium text-right line-clamp-1 truncate ml-2" title={offering.course?.courseName}>
                                            {offering.course?.courseCode} - {offering.course?.courseName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Số tín chỉ:</span>
                                        <span className="font-medium">{offering.course?.credits} TC</span>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-indigo-600 font-semibold text-sm">
                                Xem phân tích OBE
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}