import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { useParams, useNavigate } from 'react-router-dom';
import { questionBankApi, type QuestionBankResponse } from '@/api/QuestionBankApi';
import { getAllClo } from '@/features/rubric/rubricApi';
import { assessmentPaperApi, type GenerateExamRequest } from "@/api/assessmentApi.ts";
import { FileEdit, ArrowLeft } from 'lucide-react';

export default function CreateExamPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [banks, setBanks] = useState<QuestionBankResponse[]>([]);
    const [cloItems, setCloItems] = useState<any[]>([]);

    const [config, setConfig] = useState({
        offeringId:'',
        questionBankId: '',
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        cloId: 'all',
        examTitle: '',
        durationMinutes: 60,
        startTime: "",
        endTime: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [bankRes, cloRes] = await Promise.all([
                    questionBankApi.getMyQuestionBanks(),
                    getAllClo()
                ]);

                setBanks(bankRes || []);
                setCloItems(cloRes?.data || cloRes || []);
            } catch (error) {
                toast.error("Lỗi khi tải dữ liệu cấu hình đề thi");
            }
        };
        loadData();
    }, []);

    const handleGenerate = async () => {
        if (!id) {
            toast.error("Không tìm thấy ID bài đánh giá (Assessment)");
            return;
        }
        if (!config.examTitle.trim()) {
            toast.error("Vui lòng nhập tên đề thi");
            return;
        }
        if (!config.durationMinutes || config.durationMinutes <= 0) {
            toast.error("Vui lòng nhập thời gian làm bài hợp lệ (phút)");
            return;
        }
        if (!config.questionBankId) {
            toast.error("Vui lòng chọn Kho câu hỏi");
            return;
        }
        if (config.easyCount === 0 && config.mediumCount === 0 && config.hardCount === 0) {
            toast.error("Vui lòng nhập số lượng câu hỏi cần tạo");
            return;
        }
        if (!config.startTime) {
            toast.error("Vui lòng chọn thời gian bắt đầu");
            return;
        }
        if (!config.endTime) {
            toast.error("Vui lòng chọn thời gian kết thúc");
            return;
        }

        const start = new Date(config.startTime);
        const end = new Date(config.endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            toast.error("Thời gian không hợp lệ");
            return;
        }
        if (end <= start) {
            toast.error("Thời gian kết thúc phải sau thời gian bắt đầu");
            return;
        }

        const payload: GenerateExamRequest = {
            offeringId: id,
            questionBankId: config.questionBankId,
            easyCount: config.easyCount,
            mediumCount: config.mediumCount,
            hardCount: config.hardCount,
            cloId: config.cloId === 'all' ? null : config.cloId,
            examTitle: config.examTitle.trim(),
            durationMinutes,
            startTime: new Date(config.startTime).toISOString(),
            endTime: new Date(config.endTime).toISOString()
        };

        setIsSubmitting(true);
        try {
            await assessmentPaperApi.generateExamPaper(payload);
            toast.success("Tạo đề thi thành công!");
            navigate(-1);
        } catch (error: any) {
            console.error("Lỗi tạo đề:", error);
            const errorMsg = error.response?.data || "Đã xảy ra lỗi khi tạo đề thi";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };
    const getDurationMinutes = (startTime: string, endTime: string) => {
        if (!startTime || !endTime) return 0;
        const start = new Date(startTime).getTime();
        const end = new Date(endTime).getTime();
        if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;
        return Math.floor((end - start) / 60000);
    };
    const durationMinutes = getDurationMinutes(config.startTime, config.endTime);
    return (
        <div className="w-full max-w-3xl mx-auto p-4 md:p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="shrink-0">
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <FileEdit className="w-6 h-6 text-blue-600" />
                        Ra Đề Thi Tự Động
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Cấu hình ma trận đề thi để hệ thống tự động bốc câu hỏi từ kho.
                    </p>
                </div>
            </div>

            <Card className="shadow-sm border-slate-200">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                    <CardTitle className="text-lg text-slate-800">Cấu hình ma trận đề</CardTitle>
                    <CardDescription>Vui lòng chọn kho câu hỏi, chuẩn đầu ra và cấu trúc điểm.</CardDescription>
                </CardHeader>

                <CardContent className="p-4 md:p-6 space-y-6">
                    {/* ✅ Tên đề thi */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Tên đề thi <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="Ví dụ: Đề thi giữa kỳ OOP - Mã đề 01"
                            value={config.examTitle}
                            onChange={(e) => setConfig({...config, examTitle: e.target.value})}
                        />
                    </div>

                    {/* ✅ Thời gian làm bài */}

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Thời gian bắt đầu <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="datetime-local"
                            value={config.startTime}
                            onChange={(e) => setConfig({...config, startTime: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">
                            Thời gian kết thúc <span className="text-red-500">*</span>
                        </label>
                        <Input
                            type="datetime-local"
                            value={config.endTime}
                            onChange={(e) => setConfig({...config, endTime: e.target.value})}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">1. Chọn Kho câu hỏi <span
                            className="text-red-500">*</span></label>
                        <Select onValueChange={(val) => setConfig({...config, questionBankId: val})}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="-- Nhấn để chọn kho câu hỏi --"/>
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-lg z-50">
                                {banks.map(bank => (
                                    <SelectItem key={bank.id} value={bank.id}>
                                        {bank.name} {bank.courseName ? `(${bank.courseName})` : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">2. Lọc theo Chuẩn đầu ra (CLO)</label>
                        <Select onValueChange={(val) => setConfig({...config, cloId: val})}>
                            <SelectTrigger  className="w-full">
                                <SelectValue placeholder="Tất cả CLO"/>
                            </SelectTrigger>
                            <SelectContent className="bg-white border shadow-lg z-50">
                                <SelectItem value="all">Tất cả (Không lọc)</SelectItem>
                                {cloItems.map(c => <SelectItem key={c.cloId}
                                                               value={c.cloCode}>{c.cloCode}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-slate-700">3. Số lượng câu hỏi theo mức độ <span
                            className="text-red-500">*</span></label>
                        <div
                            className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 font-medium">Mức độ Dễ</label>
                                <Input type="number" min="0" placeholder="0" className="bg-white"
                                       onChange={(e) => setConfig({...config, easyCount: +e.target.value})}/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 font-medium">Mức độ Trung bình</label>
                                <Input type="number" min="0" placeholder="0" className="bg-white"
                                       onChange={(e) => setConfig({...config, mediumCount: +e.target.value})}/>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm text-slate-600 font-medium">Mức độ Khó</label>
                                <Input type="number" min="0" placeholder="0" className="bg-white"
                                       onChange={(e) => setConfig({...config, hardCount: +e.target.value})}/>
                            </div>
                        </div>
                    </div>
                </CardContent>

                <CardFooter
                    className="flex flex-col-reverse sm:flex-row justify-end gap-3 p-4 md:p-6 border-t border-slate-100 bg-slate-50/50">
                    <Button variant="outline" className="w-full sm:w-auto" onClick={() => navigate(-1)}>
                        Hủy bỏ
                    </Button>
                    <Button onClick={handleGenerate} disabled={isSubmitting}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                        {isSubmitting ? "Đang xử lý..." : "Xác nhận tạo đề"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}