import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog.tsx";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select.tsx";
import { Button } from "@/components/ui/button.tsx";
import lecturerService  from "../api/lecturerService.ts";
import courseService from "@/pages/admin/api/courseService.ts"; // Import courseService của bạn

interface AssignLecturerModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    courseName: string;
    courseDepartment: string;
    onSuccess: () => void;
}
export default function AssignLecturerModal({ isOpen, onClose, courseId, courseName,courseDepartment, onSuccess }: AssignLecturerModalProps) {
    const [lecturers, setLecturers] = useState<any[]>([]);
    const [selectedLecturerId, setSelectedLecturerId] = useState<string>("");
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        if (isOpen) {
            fetchLecturers();
            setSelectedLecturerId("");
        }
    }, [isOpen]);

    const fetchLecturers = async () => {
        try {

            const data = await lecturerService.getAllLecturers(0, 100, "");


            const allLecturers = data.content || data || [];
            const filtered = allLecturers.filter((lec: any) =>
                lec.department === courseDepartment
            );
            setLecturers(filtered);
        } catch (error) {
            console.error("Lỗi khi tải danh sách Giảng viên:", error);
        }
    };

    const handleAssign = async () => {
        if (!selectedLecturerId) {
            alert("Vui lòng chọn một giảng viên!");
            return;
        }

        setLoading(true);
        try {
            await courseService.assignLecturer(courseId, selectedLecturerId);
            alert("Phân công giảng viên thành công!");
            onSuccess();
            onClose();
        } catch (error: any) {
            console.error("Lỗi phân công:", error);
            alert(error.response?.data?.message || "Có lỗi xảy ra khi phân công!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose} >
            <DialogContent className="sm:max-w-md rounded-2xl bg-white text-black">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Phân công giảng viên</DialogTitle>
                    <p className="text-sm text-slate-500 mt-2">
                        Môn học: <span className="font-semibold text-blue-600">{courseName}</span>
                    </p>
                </DialogHeader>

                <div className="py-6">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Chọn Giảng viên phụ trách <span className="text-red-500">*</span></label>
                    <Select onValueChange={setSelectedLecturerId} value={selectedLecturerId}>
                        <SelectTrigger className="w-full h-11 rounded-xl bg-slate-50 border-slate-200 text-black">
                            <SelectValue placeholder="-- Bấm để chọn giảng viên --" />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-50 border-slate-200 text-black">
                            {lecturers.length > 0 ? (
                                lecturers.map((lec) => (
                                    <SelectItem key={lec.lecturerId} value={lec.lecturerId}>
                                        {lec.fullName} ({lec.lecturerId})
                                    </SelectItem>
                                ))
                            ) : (
                                <div className="p-2 text-sm text-slate-500 text-center">Không có dữ liệu giảng viên</div>
                            )}
                        </SelectContent>
                    </Select>
                </div>

                <DialogFooter className="flex gap-3 sm:justify-end">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="rounded-xl h-11">
                        Hủy
                    </Button>
                    <Button onClick={handleAssign} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11">
                        {loading ? "Đang xử lý..." : "Lưu phân công"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}