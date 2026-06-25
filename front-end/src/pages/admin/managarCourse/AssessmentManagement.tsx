import React, { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash2, FileText, X, AlertCircle, Loader2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
    AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useNavigate } from 'react-router-dom';

import { assessmentService } from '../api/assessmentService';
import courseService from '../api/courseService';
import type { Assessment } from "@/pages/admin/api/assessmentApi.ts";
import {useAppSelector} from "@/hooks/useAppSelector.ts";
import {getLecturerByUser} from "@/api/userApi.ts";

export default function AssessmentManagement() {
    const navigate = useNavigate();

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const user = reduxUser || JSON.parse(localStorage.getItem("user") || "{}");
    const[dep,setDep] = useState<string|null>(null);


    const [courses, setCourses] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>('');
    const [offerings, setOfferings] = useState<any[]>([]);
    const [currentOfferingId, setCurrentOfferingId] = useState<string>('');

    const [searchQuery, setSearchQuery] = useState('');
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Assessment | null>(null);
    const [deletingItem, setDeletingItem] = useState<Assessment | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        assessmentName: '',
        assessmentType: 'EXAM',
        weight: 0,
        endTime: '',
        description: ''
    });
    const [selectedFile, setSelectedFile] = useState<File | undefined>(undefined);


    const fetchDep = async () => {
        try {
            const res = await getLecturerByUser(user?.userId);

            setDep(res.department);

        } catch (err) {
            console.error("Lỗi khi lấy khoa:", err);
        }
    };


// lấy department khi vào trang
    useEffect(() => {

        if(user?.userId){
            fetchDep();
        }

    }, [user?.userId]);



// lấy course khi đã có dep
    useEffect(() => {

        const fetchCourses = async () => {

            if(!dep) return;

            try {

                const res = await courseService.getCoursesByDepartment(dep);

                const courseList =
                    res.content ||
                    res.data?.content ||
                    res.data ||
                    res;

                setCourses(courseList);

            } catch(err){

                console.error("Lỗi khi tải môn học:", err);

            }
        };


        fetchCourses();

    }, [dep]);

    useEffect(() => {
        if (!selectedCourseId) {
            setOfferings([]);
            setCurrentOfferingId('');
            return;
        }
        const fetchOfferings = async () => {
            try {
                const res = await courseService.geOfferingForDTeacherDeap(selectedCourseId);
                const offeringList = res.data || res;
                console.log(res)
                setOfferings(offeringList);
            } catch (err) {
                console.error("Lỗi khi tải học phần:", err);
            }
        };
        fetchOfferings();
    }, [selectedCourseId]);

    // 3. Fetch danh sách bài tập khi chọn học phần
    useEffect(() => {
        if (!currentOfferingId) {
            setAssessments([]);
            return;
        }

        const fetchAssessments = async () => {
            setIsLoading(true);
            try {
                const data = await assessmentService.getAssessmentsByOffering(currentOfferingId);
                const filtered = data.filter((a: Assessment) =>
                    a.assessmentName?.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setAssessments(filtered || []);
            } catch (err) {
                console.error("Lỗi khi tải danh sách bài tập:", err);
                setAssessments([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounceTimer = setTimeout(() => fetchAssessments(), 500);
        return () => clearTimeout(debounceTimer);
    }, [currentOfferingId, searchQuery, refreshTrigger]);

    const resetForm = () => {
        setFormData({ assessmentName: '', assessmentType: 'EXAM', weight: 0, endTime: '', description: '' });
        setSelectedFile(undefined);
        setFormError(null);
    };

    const closeAllModals = () => {
        setIsCreateModalOpen(false);
        setEditingItem(null);
        setDeletingItem(null);
        resetForm();
    };

    const handleOpenEdit = (item: Assessment) => {
        resetForm();
        setFormData({
            assessmentName: item.assessmentName || '',
            assessmentType: item.assessmentType || 'EXAM',
            weight: item.weight || 0,
            endTime: item.endTime ? item.endTime.substring(0, 16) : '',
            description: item.description || ''
        });
        setEditingItem(item);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentOfferingId) {
            setFormError("Vui lòng chọn Học Phần trước khi tạo bài tập.");
            return;
        }

        setIsSubmitting(true);
        setFormError(null);


        const data = new FormData();


        data.append('assessmentName', formData.assessmentName);
        data.append('assessmentType', formData.assessmentType);
        data.append('weight', String(formData.weight));
        data.append('endTime', formData.endTime);

        if (formData.description) {
            data.append('description', formData.description);
        }



        if (selectedFile) {
            data.append('file', selectedFile);
        }



        try {
            if (editingItem) {

                await assessmentService.updateAssessmentWithFormData(editingItem.assessmentId, data);
            } else {

                await assessmentService.createAssessmentForOffering(currentOfferingId, data);
            }
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            setFormError(err.response?.data?.message || err.response?.data || "Vui lòng kiểm tra lại thông tin!");
        } finally {
            setIsSubmitting(false);
        }
    };
    const confirmDelete = async () => {
        if (!deletingItem) return;
        setIsSubmitting(true);
        try {
            await assessmentService.deleteAssessment(deletingItem.assessmentId);
            closeAllModals();
            setRefreshTrigger(prev => prev + 1);
        } catch (err: any) {
            alert("Lỗi khi xóa: " + (err.response?.data?.message || ""));
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeBadge = (type: string) => {
        const types: Record<string, { label: string, color: string }> = {
            'EXAM': { label: 'Thi Cuối Kỳ', color: 'bg-rose-50 text-rose-700 border-rose-200' },
            'QUIZ': { label: 'Kiểm Tra', color: 'bg-sky-50 text-sky-700 border-sky-200' },
            'ASSIGNMENT': { label: 'Bài Tập', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
            'PROJECT': { label: 'Đồ Án', color: 'bg-purple-50 text-purple-700 border-purple-200' },
        };
        const config = types[type] || { label: type, color: 'bg-slate-50 text-slate-700 border-slate-200' };
        return <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${config.color}`}>{config.label}</span>;
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
            {/* HEADER */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                            <FileText className="w-6 h-6 text-indigo-600" /> Quản lý Đề Thi / Bài Tập
                        </h2>
                        <p className="text-sm text-slate-500">
                            Quản lý ngân hàng đề và các bài kiểm tra của môn học.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            onClick={() => { resetForm(); setIsCreateModalOpen(true); }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
                            disabled={!currentOfferingId}
                        >
                            <Plus className="w-4 h-4 mr-2" /> Tạo Đề thi mới
                        </Button>
                    </div>
                </div>
            </div>

            {/* MAIN CARD (TABLE & TOOLBAR) */}
            <Card className="rounded-2xl border-slate-200 shadow-sm bg-white overflow-hidden flex flex-col flex-1">

                {/* TOOLBAR */}
                <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col md:flex-row gap-4">
                    <div className="w-full md:w-1/4">
                        <select
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all"
                            value={selectedCourseId}
                            onChange={(e) => {
                                setSelectedCourseId(e.target.value);
                                setCurrentOfferingId(''); // Reset offering khi đổi môn
                            }}
                        >
                            <option value="">-- Chọn Môn Học --</option>
                            {courses.map(c => (
                                <option key={c.courseId} value={c.courseId}>
                                    {c.courseCode} - {c.courseName}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="w-full md:w-1/4">
                        <select
                            className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500 transition-all disabled:opacity-50"
                            value={currentOfferingId}
                            onChange={(e) => setCurrentOfferingId(e.target.value)}
                            disabled={!selectedCourseId}
                        >
                            <option value="">-- Chọn Học Phần --</option>
                            {offerings.map(o => (
                                <option key={o.offeringId} value={o.offeringId}>
                                    {o.offeringName || o.classCode} {/* Hiển thị tên hoặc mã lớp */}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Tìm kiếm bài tập..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 h-10 w-full bg-slate-50 border-slate-200 focus-visible:ring-indigo-100 focus-visible:border-indigo-500 transition-all"
                            disabled={!currentOfferingId}
                        />
                    </div>
                </div>

                {/* TABLE */}
                <div className="overflow-x-auto w-full relative min-h-[300px]">
                    {isLoading && (
                        <div className="absolute inset-0 bg-white/60 z-10 flex items-center justify-center backdrop-blur-[1px]">
                            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                        </div>
                    )}
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow className="hover:bg-transparent border-slate-100">
                                <TableHead className="pl-6 font-semibold text-slate-600 w-[350px]">Tên Đề / Bài Tập</TableHead>
                                <TableHead className="font-semibold text-slate-600">Loại Hình</TableHead>
                                <TableHead className="font-semibold text-slate-600">Trọng số (%)</TableHead>
                                <TableHead className="font-semibold text-slate-600">Hạn Nộp</TableHead>
                                <TableHead className="text-right pr-6 font-semibold text-slate-600">Thao tác</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-slate-100">
                            {!currentOfferingId ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[220px] text-center text-slate-500">
                                        Vui lòng chọn Môn học và Học phần để xem danh sách bài đánh giá.
                                    </TableCell>
                                </TableRow>
                            ) : (!isLoading && assessments.length === 0) ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-[220px] text-center text-slate-500">
                                        Không tìm thấy bài tập nào cho Lớp học phần này.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                assessments.map((item) => (
                                    <TableRow key={item.assessmentId} className="hover:bg-slate-50 border-slate-100 transition-colors">
                                        <TableCell className="font-medium text-slate-800 pl-6">
                                            {item.assessmentName}
                                        </TableCell>
                                        <TableCell>
                                            {getTypeBadge(item.assessmentType)}
                                        </TableCell>
                                        <TableCell className="text-slate-600 font-medium">
                                            {item.weight}%
                                        </TableCell>
                                        <TableCell className="text-slate-500 text-sm">
                                            {item.endTime ? new Date(item.endTime).toLocaleString('vi-VN') : '--'}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <div className="flex justify-end gap-1">
                                                {/* NÚT CHUYỂN TRANG CHI TIẾT */}
                                                <button
                                                    onClick={() => navigate(`/admin/assessments/${item.assessmentId}`)}
                                                    className="rounded-md p-2 text-indigo-600 transition-colors hover:bg-indigo-50"
                                                    title="Xem chi tiết & Quản lý câu hỏi"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleOpenEdit(item)}
                                                    className="rounded-md p-2 text-blue-600 transition-colors hover:bg-blue-50"
                                                    title="Sửa thông tin"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setDeletingItem(item)}
                                                    className="rounded-md p-2 text-rose-600 transition-colors hover:bg-rose-50"
                                                    title="Xóa bài tập"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* MODAL TẠO / SỬA */}
            {(isCreateModalOpen || editingItem) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-[95vw] max-w-[600px] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-5 shrink-0">
                            <h3 className="text-lg font-bold text-slate-800">
                                {editingItem ? "Sửa Đề Thi / Bài Tập" : "Tạo Đề Thi / Bài Tập Mới"}
                            </h3>
                            <button onClick={closeAllModals} className="text-slate-400 hover:text-slate-600 transition-colors">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto shrink space-y-5">
                            {formError && (
                                <div className="p-3 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-sm font-medium">
                                    {formError}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Tên Đề / Bài tập <span className="text-rose-500">*</span></label>
                                <Input required name="assessmentName" value={formData.assessmentName} onChange={handleInputChange} placeholder="VD: Thi Giữa Kỳ..." className="h-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-500" />
                            </div>

                            <div className="grid grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Loại Đánh Giá</label>
                                    <select name="assessmentType" value={formData.assessmentType} onChange={handleInputChange} className="w-full h-10 px-3 bg-slate-50 border border-slate-200 rounded-md text-sm outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500">
                                        <option value="EXAM">Thi Cuối Kỳ (EXAM)</option>
                                        <option value="QUIZ">Kiểm Tra (QUIZ)</option>
                                        <option value="ASSIGNMENT">Bài Tập (ASSIGNMENT)</option>
                                        <option value="PROJECT">Đồ Án (PROJECT)</option>
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold text-slate-700">Trọng số (%)</label>
                                    <Input type="number" min="1" max="100" required name="weight" value={formData.weight} onChange={handleInputChange} className="h-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-500" />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Thời gian kết thúc <span className="text-rose-500">*</span></label>
                                <Input type="datetime-local" required name="endTime" value={formData.endTime} onChange={handleInputChange} className="h-10 bg-slate-50 border-slate-200 text-sm focus-visible:ring-indigo-100 focus-visible:border-indigo-500" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">File đính kèm đề thi</label>
                                <Input type="file" onChange={handleFileChange} className="h-10 bg-slate-50 border-slate-200 text-sm file:border-0 file:bg-indigo-50 file:text-indigo-700 file:font-semibold file:mr-4 file:px-3 file:py-1 file:rounded-md cursor-pointer hover:file:bg-indigo-100" />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-slate-700">Ghi chú / Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={3} className="w-full p-3 text-sm bg-slate-50 border border-slate-200 rounded-md resize-none outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-500" placeholder="Mô tả chi tiết bài kiểm tra này..." />
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 border-t border-slate-100 bg-slate-50 p-4 shrink-0">
                            <button type="button" onClick={closeAllModals} className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors">
                                Hủy
                            </button>
                            <button onClick={handleSave} disabled={isSubmitting} className="flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors disabled:opacity-70 min-w-[120px]">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? 'Lưu thay đổi' : 'Tạo mới')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ALERT XÓA */}
            <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <AlertDialogContent className="max-w-sm rounded-2xl p-6">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-rose-600" />
                        </div>
                        <div className="space-y-2">
                            <AlertDialogTitle className="text-lg font-bold">Xác nhận xóa?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                                Bạn có chắc muốn xóa bài tập <strong className="text-slate-700">{deletingItem?.assessmentName}</strong> không? Hành động này không thể hoàn tác.
                            </AlertDialogDescription>
                        </div>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <AlertDialogCancel disabled={isSubmitting} onClick={closeAllModals} className="flex-1 mt-0 rounded-lg">Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} disabled={isSubmitting} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Xóa bài tập"}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}