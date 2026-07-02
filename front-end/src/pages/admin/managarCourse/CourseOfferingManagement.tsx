import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, UserCheck, Layers, Filter, Lock, CheckCircle2, Loader2, X } from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

import lecturerService from "@/pages/admin/api/lecturerService.ts";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import courseService from "@/pages/admin/api/courseService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";
import type { LecturerOption } from "@/features/course/student/api/type.ts";
import {type Department, getAllDepartments} from "@/api/lecturerApi.ts";
import {getLecturerByUser} from "@/api/userApi.ts";

const DEPARTMENTS = ["Hệ Thống Thông Tin", "Công Nghệ Phần Mềm", "Khoa Học Máy Tính", "An Toàn Thông Tin"];

export default function CourseOfferingManagement() {
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");

    const userRole = user?.role || "HEAD_OF_DEPARTMENT";
    const [departments, setDepartments] = useState<Department[]>([]);
    const [userDept, setUserDept] = useState<string>("");


    const isDean = userRole === 'DEAN';
    const isHOD = userRole === 'HEAD_OF_DEPARTMENT';


    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [filteredOfferings, setFilteredOfferings] = useState<CourseOfferingResponse[]>([]);
    const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const [selectedDept, setSelectedDept] = useState<string>("ALL");


    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedOffering, setSelectedOffering] = useState<CourseOfferingResponse | null>(null);
    const [submitting, setSubmitting] = useState<boolean>(false);


    const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);
    useEffect(() => {
        if (!isDean && userDept) {
            setSelectedDept(userDept);
        }
    }, [isDean, userDept]);
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


        const fetchAllDepartments = async () => {
            try {
                const res = await getAllDepartments();
                setDepartments(res);
            } catch (err) {
                console.error("Lỗi khi lấy danh sách khoa:", err);
            }
        };

        fetchUserDep();
        fetchAllDepartments();
    }, [user?.userId]);
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [offeringData, lecturerData] = await Promise.all([
                    courseOfferingService.getOfferings(),
                    lecturerService.getAllLecturers(0, 100, "")
                ]);

                setOfferings(offeringData);
                setLecturers(lecturerData.content || lecturerData);
            } catch (error) {
                toast.error("Không thể tải dữ liệu từ server!");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        const currentOfferings = Array.isArray(offerings) ? offerings : [];
        let result = currentOfferings;

        if (selectedDept !== "ALL") {
            result = result.filter(o => o.course?.department === selectedDept);
        }

        if (searchQuery.trim() !== "") {
            const query = searchQuery.toLowerCase();
            result = result.filter(o =>
                o.offeringName?.toLowerCase().includes(query) ||
                o.offeringId?.toLowerCase().includes(query) ||
                o.course?.courseName?.toLowerCase().includes(query)
            );
        }

        setFilteredOfferings(result);
    }, [offerings, selectedDept, searchQuery]);

    // MỞ MODAL: Load danh sách GV đã được phân công vào Checkbox
    const handleOpenAssignModal = (offering: CourseOfferingResponse) => {
        setSelectedOffering(offering);
        // Lấy danh sách ID các giảng viên đang phụ trách môn này
        const currentLecturerIds = offering.lecturers ? offering.lecturers.map((l: any) => l.lecturerId) : [];
        setSelectedLecturerIds(currentLecturerIds);
        setIsModalOpen(true);
    };


    const toggleLecturer = (lecturerId: string) => {
        setSelectedLecturerIds(prev =>
            prev.includes(lecturerId)
                ? prev.filter(id => id !== lecturerId)
                : [...prev, lecturerId]
        );
    };

    // LƯU PHÂN CÔNG XUỐNG API
    const handleSaveAssignment = async () => {
        if (!selectedOffering) return;

        if (selectedLecturerIds.length === 0) {
            toast.error("Vui lòng chọn ít nhất một giảng viên!");
            return;
        }

        try {
            setSubmitting(true);
            console.log(selectedOffering.course.courseId);
            console.log(selectedLecturerIds);

            await courseService.assignLecturers(selectedOffering.offeringId, selectedLecturerIds);


            const updatedLecturers = lecturers
                .filter(l => selectedLecturerIds.includes(l.lecturerId))
                .map(l => ({ lecturerId: l.lecturerId, lecturerName: l.fullName }));


            setOfferings(prev => prev.map(o =>
                o.offeringId === selectedOffering.offeringId
                    ? { ...o, lecturers: updatedLecturers }
                    : o
            ));

            toast.success("Phân công giảng viên thành công!");
            setIsModalOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi phân công!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-emerald-600" /> Quản lý Phân công Học phần
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">Hệ thống mở lớp và điều phối giảng dạy học kỳ hiện tại</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-semibold">
                    <UserCheck className="w-4 h-4" />
                    <span>Quyền hiện tại: {isDean ? "Trưởng Khoa" : `Trưởng Bộ Môn (${userDept})`}</span>
                </div>
            </div>

            {/* Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                <div className="relative">
                    <Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Tìm mã học phần, tên lớp..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-emerald-500 outline-none transition-all"
                    />
                </div>

                <div className="relative">
                    <Filter className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                    <select
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        disabled={!isDean}
                        className="w-full pl-9 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-emerald-500 outline-none transition-all appearance-none disabled:opacity-70 disabled:cursor-not-allowed text-slate-700 font-medium"
                    >
                        {isDean && <option value="ALL">Tất cả Bộ môn trong khoa</option>}
                        {DEPARTMENTS.map((dept, i) => (
                            <option key={i} value={dept}>{dept}</option>
                        ))}
                    </select>
                    {!isDean && <Lock className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />}
                </div>
            </div>

            {/* Bảng Danh sách */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-600 text-xs font-semibold uppercase border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4">Mã lớp HP</th>
                        <th className="px-6 py-4">Thông tin lớp / Môn học</th>
                        <th className="px-6 py-4">Bộ môn quản lý</th>
                        <th className="px-6 py-4">Học kỳ / Sĩ số</th>
                        <th className="px-6 py-4">Giảng viên đảm nhiệm</th>
                        <th className="px-6 py-4 text-right pr-6">Thao tác phân công</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></td>
                        </tr>
                    ) : filteredOfferings.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="text-center py-12 text-slate-400">Không tìm thấy dữ liệu lớp học phần nào phù hợp.</td>
                        </tr>
                    ) : (
                        filteredOfferings.map((offering) => {
                            const canAssign = isDean || (isHOD && offering.course.department === userDept);
                            const hasLecturers = offering.lecturers && offering.lecturers.length > 0;

                            return (
                                <tr key={offering.offeringId} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{offering.offeringId}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{offering.offeringName}</div>
                                        <div className="text-xs text-slate-400">{offering.course.courseCode} • {offering.course.courseName} ({offering.course.credits} TC)</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                            {offering.course.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700">{offering.semester}</div>
                                        <div className="text-xs text-slate-400">Max: {offering.maxStudents} SV</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {/* CẬP NHẬT: Hiển thị mảng nhiều Giảng viên */}
                                        {hasLecturers ? (
                                            <div className="flex flex-wrap gap-1.5">
                                                {offering.lecturers.map((l: any) => (
                                                    <span key={l.lecturerId} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-50 text-emerald-700 text-[11px] font-medium rounded-md border border-emerald-100">
                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                        {l.lecturerName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Chưa phân công</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right pr-6">
                                        {canAssign ? (
                                            <Button
                                                onClick={() => handleOpenAssignModal(offering)}
                                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-9 rounded-xl text-xs font-medium shadow-sm transition-all"
                                            >
                                                {hasLecturers ? "Thay đổi GV" : "Phân công"}
                                            </Button>
                                        ) : (
                                            <div className="text-slate-400 text-xs flex items-center justify-end gap-1 font-medium">
                                                <Lock className="w-3.5 h-3.5" /> Không có quyền
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    )}
                    </tbody>
                </table>
            </div>

            {/* MODAL PHÂN CÔNG GIẢNG VIÊN */}
            {isModalOpen && selectedOffering && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setIsModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">Phân công giảng dạy</h3>
                        <p className="text-xs text-slate-500 mb-4">
                            Lớp HP: <strong className="text-slate-800">{selectedOffering.offeringName}</strong> thuộc bộ môn <strong className="text-indigo-600">{selectedOffering.course.department}</strong>
                        </p>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {lecturers
                                .filter(lecturer => {
                                    if (isHOD) return lecturer.department === userDept;
                                    return true;
                                })
                                .map((lecturer) => {
                                    const isSelected = selectedLecturerIds.includes(lecturer.lecturerId);

                                    return (
                                        <div
                                            key={lecturer.lecturerId}
                                            onClick={() => toggleLecturer(lecturer.lecturerId)}
                                            className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer hover:border-emerald-400 transition-all ${
                                                isSelected ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-100'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                readOnly
                                                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer pointer-events-none"
                                            />
                                            <div className="flex-1">
                                                <div className="font-semibold text-slate-800 text-sm">{lecturer.fullName}</div>
                                                <div className="text-[11px] text-slate-400 mt-0.5">{lecturer.department}</div>
                                            </div>
                                            <div>
                                                {lecturer.role === 'MAIN_LECTURER' ? (
                                                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-[10px] font-bold rounded">GV Chính</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">Giảng viên</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>

                        {/* THÊM MỚI: Modal Footer để Lưu danh sách chọn nhiều */}
                        <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end gap-3">
                            <Button variant="outline" disabled={submitting} onClick={() => setIsModalOpen(false)} className="rounded-xl">
                                Hủy bỏ
                            </Button>
                            <Button onClick={handleSaveAssignment} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl min-w-[120px]">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : `Lưu (${selectedLecturerIds.length} GV)`}
                            </Button>
                        </div>

                    </div>
                </div>
            )}
        </div>
    );
}