import React, { useState, useEffect } from 'react';
// Import thêm các icon Plus, Edit, Trash2
import { Search, ShieldAlert, UserCheck, Layers, Filter, Lock, CheckCircle2, Loader2, X, Plus, Edit, Trash2 } from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
import { Button } from '@/components/ui/button';
import { toast } from "sonner";

import lecturerService from "@/pages/admin/api/lecturerService.ts";
import { courseOfferingService } from "@/features/course/student/api/courseOfferinService.ts";
import courseService from "@/pages/admin/api/courseService.ts";
import type { CourseOfferingResponse } from "@/pages/admin/api/type.ts";
import type { LecturerOption } from "@/features/course/student/api/type.ts";
import { getLecturerByUser } from "@/api/userApi.ts";
import { subjectService } from "@/api/subjectService.ts";
import {courseOfferingApiService} from "@/api/courseOfferingApi.ts";

export default function CourseOfferingManagement() {
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const userRole = user?.role || "HEAD_OF_DEPARTMENT";

    const [departments, setDepartments] = useState<any[]>([]);
    const [userDept, setUserDept] = useState<string>("");
    const [courses, setCourses] = useState<any[]>([]); // Lưu danh sách môn học để Thêm lớp HP

    const isDean = userRole === 'DEAN';
    const isHOD = userRole === 'HEAD_OF_DEPARTMENT';
    const isAdmin = userRole === 'ADMIN';

    const [offerings, setOfferings] = useState<CourseOfferingResponse[]>([]);
    const [filteredOfferings, setFilteredOfferings] = useState<CourseOfferingResponse[]>([]);
    const [lecturers, setLecturers] = useState<LecturerOption[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [selectedDept, setSelectedDept] = useState<string>("ALL");

    // Modal Phân công
    const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
    const [selectedOffering, setSelectedOffering] = useState<CourseOfferingResponse | null>(null);
    const [selectedLecturerIds, setSelectedLecturerIds] = useState<string[]>([]);

    // Modal Thêm / Sửa
    const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
    const [formData, setFormData] = useState({ offeringName: '', maxStudents: 40, semester: '', courseId: '' });
    const [submitting, setSubmitting] = useState<boolean>(false);

    useEffect(() => {
        if (!isDean && !isAdmin && userDept) {
            setSelectedDept(userDept);
        }
    }, [isDean, isAdmin, userDept]);

    useEffect(() => {
        const fetchInitialData = async () => {
            if (user?.userId) {
                try {
                    const res = await getLecturerByUser(user.userId);
                    setUserDept(res.department?.departmentName || res.department);
                } catch (err) { console.error(err); }
            }
            try {
                const depts = await subjectService.getAll();
                setDepartments(depts);
            } catch (err) { console.error(err); }
        };
        fetchInitialData();
        loadMainData();
    }, [user?.userId]);

    const loadMainData = async () => {
        setLoading(true);
        try {
            // Fetch thêm courses để làm dropdown khi Thêm mới lớp HP
            const [offeringData, lecturerData, coursesData] = await Promise.all([
                courseOfferingService.getOfferings(),
                lecturerService.getAllLecturers(0, 100, ""),
                courseService.getAllCourses(0, 100, "") // Giả định bạn có hàm này
            ]);
            setOfferings(offeringData);
            setLecturers(lecturerData.content || lecturerData);
            setCourses(coursesData.content || coursesData);
        } catch (error) {
            toast.error("Không thể tải dữ liệu từ server!");
        } finally {
            setLoading(false);
        }
    };

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

    // ================= PHÂN CÔNG GIẢNG VIÊN =================
    const handleOpenAssignModal = (offering: CourseOfferingResponse) => {
        setSelectedOffering(offering);
        setSelectedLecturerIds(offering.lecturers ? offering.lecturers.map((l: any) => l.lecturerId) : []);
        setIsAssignModalOpen(true);
    };

    const toggleLecturer = (lecturerId: string) => {
        setSelectedLecturerIds(prev =>
            prev.includes(lecturerId) ? prev.filter(id => id !== lecturerId) : [...prev, lecturerId]
        );
    };

    const handleSaveAssignment = async () => {
        if (!selectedOffering) return;
        if (selectedLecturerIds.length === 0) return toast.error("Chọn ít nhất một giảng viên!");

        try {
            setSubmitting(true);
            await courseService.assignLecturers(selectedOffering.offeringId, selectedLecturerIds);
            toast.success("Phân công thành công!");
            loadMainData();
            setIsAssignModalOpen(false);
        } catch (error) {
            toast.error("Lỗi khi phân công!");
        } finally {
            setSubmitting(false);
        }
    };

    // ================= THÊM / SỬA / XÓA =================
    const handleOpenFormModal = (offering?: CourseOfferingResponse) => {
        if (offering) {
            setSelectedOffering(offering);
            setFormData({
                offeringName: offering.offeringName,
                maxStudents: offering.maxStudents,
                semester: offering.semester,
                courseId: offering.course.courseId // Giữ ID khóa học
            });
        } else {
            setSelectedOffering(null);
            setFormData({ offeringName: '', maxStudents: 40, semester: 'HK1_2024_2025', courseId: '' });
        }
        setIsFormModalOpen(true);
    };

    const handleSubmitForm = async () => {
        if (!formData.courseId || !formData.offeringName || !formData.semester || !formData.maxStudents) {
            return toast.error("Vui lòng điền đủ thông tin bắt buộc!");
        }

        try {
            setSubmitting(true);
            if (selectedOffering) {
                // Sửa
                await courseOfferingApiService.updateOffering(selectedOffering.offeringId, formData);
                toast.success("Cập nhật lớp học phần thành công!");
            } else {
                // Thêm mới
                await courseOfferingApiService.createOffering(formData.courseId, formData);
                toast.success("Tạo lớp học phần thành công!");
            }
            loadMainData();
            setIsFormModalOpen(false);
        } catch (error) {
            toast.error("Có lỗi xảy ra khi lưu thông tin!");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (offeringId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa lớp học phần này? Hành động này không thể hoàn tác!")) return;

        try {
            await courseOfferingApiService.deleteOffering(offeringId);
            toast.success("Đã xóa lớp học phần!");
            setOfferings(prev => prev.filter(o => o.offeringId !== offeringId));
        } catch (error) {
            toast.error("Không thể xóa lớp học phần (có thể đang có dữ liệu ràng buộc)!");
        }
    };

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-emerald-600" /> Quản lý Lớp Học Phần
                    </h2>
                    <p className="text-slate-500 text-sm mt-0.5">Mở lớp, phân công giảng dạy và quản lý thông tin</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-700 text-xs font-semibold">
                        <UserCheck className="w-4 h-4" />
                        <span>{isAdmin ? "Quản trị viên" : isDean ? "Trưởng Khoa" : `Bộ Môn (${userDept})`}</span>
                    </div>
                    {/* Nút Thêm Mới */}
                    {(isDean || isAdmin || isHOD) && (
                        <Button
                            onClick={() => handleOpenFormModal()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm"
                        >
                            <Plus className="w-4 h-4 mr-1" /> Thêm Lớp Mới
                        </Button>
                    )}
                </div>
            </div>

            {/* Filter (Giữ nguyên của bạn) */}
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
                        disabled={!isDean && !isAdmin}
                        className="w-full pl-9 h-11 bg-slate-50 border border-slate-200 text-sm rounded-xl focus:border-emerald-500 outline-none transition-all appearance-none disabled:opacity-70 disabled:cursor-not-allowed text-slate-700 font-medium"
                    >
                        {(isDean || isAdmin) && <option value="ALL">Tất cả Bộ môn trong khoa</option>}
                        {departments.map((dept, i) => (
                            <option key={i} value={dept.departmentName}>{dept.departmentName}</option>
                        ))}
                    </select>
                    {(!isDean && !isAdmin) && <Lock className="absolute right-3 top-3.5 w-4 h-4 text-slate-400" />}
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
                        <th className="px-6 py-4">Giảng viên</th>
                        <th className="px-6 py-4 text-center">Thao tác</th>
                    </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                    {loading ? (
                        <tr><td colSpan={6} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin text-emerald-600 mx-auto" /></td></tr>
                    ) : filteredOfferings.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-12 text-slate-400">Không tìm thấy dữ liệu lớp học phần nào.</td></tr>
                    ) : (
                        filteredOfferings.map((offering) => {
                            const canModify = isDean || isAdmin || (isHOD && offering.course.department === userDept);
                            const hasLecturers = offering.lecturers && offering.lecturers.length > 0;

                            return (
                                <tr key={offering.offeringId} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-6 py-4 font-bold text-slate-900">{offering.offeringId}</td>
                                    <td className="px-6 py-4">
                                        <div className="font-semibold text-slate-800">{offering.offeringName}</div>
                                        <div className="text-xs text-slate-400">{offering.course.courseCode} • {offering.course.courseName}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">
                                            {offering.course.department}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-slate-700 font-medium">{offering.semester}</div>
                                        <div className="text-xs text-slate-400">Tối đa: {offering.maxStudents} SV</div>
                                    </td>
                                    <td className="px-6 py-4 max-w-[200px]">
                                        {hasLecturers ? (
                                            <div className="flex flex-wrap gap-1">
                                                {offering.lecturers.map((l: any) => (
                                                    <span key={l.lecturerId} className="px-1.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-medium rounded border border-emerald-100">
                                                        {l.lecturerName}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : (
                                            <span className="text-amber-600 font-medium text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-100">Chưa có GV</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {canModify ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <Button onClick={() => handleOpenAssignModal(offering)} variant="outline" size="sm" className="h-8 text-xs bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                                                    Phân công
                                                </Button>
                                                <Button onClick={() => handleOpenFormModal(offering)} variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button onClick={() => handleDelete(offering.offeringId)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400 text-xs flex items-center justify-center gap-1 font-medium">
                                                <Lock className="w-3.5 h-3.5" /> Chỉ xem
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

            {/* ================= MODAL THÊM / SỬA LỚP HỌC PHẦN ================= */}
            {isFormModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setIsFormModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>

                        <h3 className="text-lg font-bold text-slate-900 mb-4">
                            {selectedOffering ? "Cập nhật Lớp Học Phần" : "Thêm Lớp Học Phần Mới"}
                        </h3>

                        <div className="space-y-4">
                            {!selectedOffering && (
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Môn học (Course) <span className="text-red-500">*</span></label>
                                    <select
                                        value={formData.courseId}
                                        onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    >
                                        <option value="">-- Chọn môn học --</option>
                                        {courses.map(c => (
                                            <option key={c.courseId} value={c.courseId}>{c.courseCode} - {c.courseName}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1">Tên Lớp (Mã nhóm) <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    placeholder="Vd: NMLT-01, DH22DTC..."
                                    value={formData.offeringName}
                                    onChange={(e) => setFormData({ ...formData, offeringName: e.target.value })}
                                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Học kỳ <span className="text-red-500">*</span></label>
                                    <input
                                        type="text"
                                        placeholder="Vd: HK1_2025"
                                        value={formData.semester}
                                        onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-700 mb-1">Sĩ số tối đa</label>
                                    <input
                                        type="number"
                                        value={formData.maxStudents}
                                        onChange={(e) => setFormData({ ...formData, maxStudents: Number(e.target.value) })}
                                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setIsFormModalOpen(false)} className="rounded-xl">Hủy</Button>
                            <Button onClick={handleSubmitForm} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : "Lưu dữ liệu"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MODAL PHÂN CÔNG GIẢNG VIÊN (Cũ) ================= */}
            {isAssignModalOpen && selectedOffering && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setIsAssignModalOpen(false)} className="absolute right-4 top-4 text-slate-400 hover:text-slate-600">
                            <X className="w-5 h-5" />
                        </button>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">Phân công giảng dạy</h3>
                        <p className="text-xs text-slate-500 mb-4">Lớp HP: <strong>{selectedOffering.offeringName}</strong></p>

                        <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                            {lecturers.filter(l => isHOD ? l.department === userDept : true).map((lecturer) => {
                                const isSelected = selectedLecturerIds.includes(lecturer.lecturerId);
                                return (
                                    <div key={lecturer.lecturerId} onClick={() => toggleLecturer(lecturer.lecturerId)}
                                         className={`flex items-center gap-3 p-3 border rounded-2xl cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/40' : 'border-slate-100 hover:border-emerald-300'}`}>
                                        <input type="checkbox" checked={isSelected} readOnly className="w-4 h-4 text-emerald-600 rounded cursor-pointer pointer-events-none" />
                                        <div className="flex-1">
                                            <div className="font-semibold text-slate-800 text-sm">{lecturer.fullName}</div>
                                            <div className="text-[11px] text-slate-400">{lecturer.department}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className="mt-6 border-t border-slate-100 flex justify-end gap-3 pt-4">
                            <Button variant="outline" onClick={() => setIsAssignModalOpen(false)} className="rounded-xl">Hủy</Button>
                            <Button onClick={handleSaveAssignment} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Lưu Phân Công"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}