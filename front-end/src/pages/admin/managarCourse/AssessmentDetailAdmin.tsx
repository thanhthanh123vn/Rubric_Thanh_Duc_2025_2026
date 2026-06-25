import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Plus, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';


import { assessmentService } from "@/pages/admin/api/assessmentService";

export default function AssessmentDetailAdmin() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [assessmentDetail, setAssessmentDetail] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchAssessmentDetail = async () => {
            if (!id) return;

            setIsLoading(true);
            try {

                const data = await assessmentService.getAssessmentById(id);

                setAssessmentDetail(data);
            } catch (error) {
                console.error("Lỗi khi tải chi tiết bài đánh giá:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAssessmentDetail();
    }, [id]);


    if (isLoading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center text-indigo-600">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="ml-2 font-medium">Đang tải dữ liệu...</span>
            </div>
        );
    }


    if (!assessmentDetail) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-500 gap-4">
                <p>Không tìm thấy thông tin bài đánh giá.</p>
                <Button variant="outline" onClick={() => navigate(-1)}>Quay lại</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] p-4 sm:p-6 lg:p-8 flex flex-col gap-6 animate-in fade-in duration-300">
            {/* Toolbar */}
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => navigate(-1)} className="text-slate-600 hover:bg-slate-200">
                    <ArrowLeft className="w-4 h-4 mr-2" /> Trở lại danh sách
                </Button>
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm">
                    <Plus className="w-4 h-4 mr-2"/> Thêm câu hỏi / Rubric
                </Button>
            </div>

            {/* Thông tin bài tập */}
            <Card className="p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-indigo-600" />
                    {/* Dùng thuộc tính trả về từ API của bạn, ví dụ: assessmentName hoặc title */}
                    {assessmentDetail.assessmentName || assessmentDetail.title}
                </h1>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-slate-500 font-medium">Loại Đánh Giá</p>
                        <p className="font-bold text-slate-800 mt-1 text-base">
                            {assessmentDetail.assessmentType || assessmentDetail.type}
                        </p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <p className="text-slate-500 font-medium">Trọng số</p>
                        <p className="font-bold text-slate-800 mt-1 text-base">{assessmentDetail.weight}%</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 col-span-2">
                        <p className="text-slate-500 font-medium">Hạn nộp</p>
                        <p className="font-bold text-slate-800 mt-1 text-base">
                            {assessmentDetail.endTime ? new Date(assessmentDetail.endTime).toLocaleString('vi-VN') : 'Không giới hạn thời gian'}
                        </p>
                    </div>
                </div>

                {assessmentDetail.description && (
                    <div className="mt-6 pt-5 border-t border-slate-100">
                        <p className="text-slate-500 font-medium mb-2">Mô tả chi tiết:</p>
                        <p className="text-slate-700 bg-slate-50 p-4 rounded-xl leading-relaxed">
                            {assessmentDetail.description}
                        </p>
                    </div>
                )}
            </Card>

            {/* Nơi hiển thị danh sách câu hỏi/rubric */}
            <Card className="flex-1 p-6 border-slate-200 shadow-sm bg-white rounded-2xl">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Danh sách câu hỏi / Rubric đánh giá</h3>
                <div className="text-center text-slate-500 py-16 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    <p>Chưa có câu hỏi hoặc Rubric nào được gán cho bài đánh giá này.</p>
                </div>
            </Card>
        </div>
    );
}