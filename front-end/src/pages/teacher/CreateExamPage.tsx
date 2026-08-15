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
    import {type Question, questionApi} from "@/api/questionApi.ts";

    export default function CreateExamPage() {
        const { id } = useParams();
        const navigate = useNavigate();

        const [banks, setBanks] = useState<QuestionBankResponse[]>([]);
        const [cloItems, setCloItems] = useState<any[]>([]);
        const isEditMode = !!id;
        const [bankStats, setBankStats] = useState({
            total: 0,
            easy: 0,
            medium: 0,
            hard: 0
        });
        const [isLoadingStats, setIsLoadingStats] = useState(false);
        const [config, setConfig] = useState({
            offeringId:'',
            questionBankId: '',
            easyCount: 0,
            mediumCount: 0,
            hardCount: 0,
            cloIds: [] as string[],
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
                    setCloItems(cloRes.data || []);
                } catch (error) {
                    toast.error("Lỗi khi tải dữ liệu cấu hình đề thi");
                }
            };
            loadData();
        }, []);
        useEffect(() => {
            const fetchBankQuestions = async () => {
                // Nếu chưa chọn kho nào thì reset lại thống kê
                if (!config.questionBankId) {
                    setBankStats({ total: 0, easy: 0, medium: 0, hard: 0 });
                    return;
                }

                setIsLoadingStats(true);
                try {
                    // Gọi API lấy danh sách câu hỏi
                    const response = await questionApi.getQuestionsByBankId(config.questionBankId);

                    // Tùy cấu trúc axios, thường dữ liệu nằm trong response.data hoặc chính response
                    const questions: Question[] = response || response || [];

                    // Đếm số lượng bằng filter
                    const easyCount = questions.filter(q => q.difficulty === "EASY").length;
                    const mediumCount = questions.filter(q => q.difficulty === "MEDIUM").length;
                    const hardCount = questions.filter(q => q.difficulty === "HARD").length;

                    setBankStats({
                        total: questions.length,
                        easy: easyCount,
                        medium: mediumCount,
                        hard: hardCount
                    });
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách câu hỏi của kho:", error);
                    toast.error("Không thể tải thông tin thống kê của kho câu hỏi này.");
                    setBankStats({ total: 0, easy: 0, medium: 0, hard: 0 });
                } finally {
                    setIsLoadingStats(false);
                }
            };

            fetchBankQuestions();
        }, [config.questionBankId]);
        const toggleClo = (cloCode: string) => {
            setConfig(prev => {
                const isSelected = prev.cloIds.includes(cloCode);
                if (isSelected) {
                    // Bỏ chọn nếu đã có
                    return { ...prev, cloIds: prev.cloIds.filter(id => id !== cloCode) };
                } else {
                    // Thêm vào mảng nếu chưa có
                    return { ...prev, cloIds: [...prev.cloIds, cloCode] };
                }
            });
        };
        const handleToggleAllClo = () => {
            setConfig(prev => {

                if (prev.cloIds.length === cloItems.length && cloItems.length > 0) {
                    return { ...prev, cloIds: [] };
                }

                const allCloCodes = cloItems.map(c => c.cloCode);
                return { ...prev, cloIds: allCloCodes };
            });
        };
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
                cloIds: config.cloIds.length > 0 ? config.cloIds : null,
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
        console.log(banks);
        const selectedBank = banks.find(bank => bank.id === config.questionBankId);
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

                        {/*  Thời gian làm bài */}

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
                            <label className="text-sm font-semibold text-slate-700">
                                1. Chọn Kho câu hỏi <span className="text-red-500">*</span>
                            </label>
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

                            {/* Block hiển thị thống kê câu hỏi sau khi chọn kho */}
                            {config.questionBankId && (
                                <div
                                    className="mt-3 p-3 bg-indigo-50 border border-indigo-100 rounded-md flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-2 transition-all min-h-[50px]">
                                    {isLoadingStats ? (
                                        <span className="text-slate-500 italic animate-pulse">
                                Đang tải dữ liệu câu hỏi từ kho...
                            </span>
                                                ) : (
                                                    <>
                        <span className="text-slate-700 font-medium">
                            Tổng số câu hỏi có sẵn: <span
                            className="text-indigo-700 font-bold text-base ml-1">{bankStats.total}</span>
                        </span>
                                            <div
                                                className="flex gap-4 text-slate-600 bg-white px-3 py-1.5 rounded border border-indigo-50 shadow-sm">
                                <span className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                    Dễ: <span className="text-green-600 font-bold">{bankStats.easy}</span>
                                </span>
                                                    <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                                TB: <span className="text-yellow-600 font-bold">{bankStats.medium}</span>
                            </span>
                                                    <span className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                Khó: <span className="text-red-600 font-bold">{bankStats.hard}</span>
                            </span>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-semibold text-slate-700">
                                    2. Chọn các Chuẩn đầu ra (CLO)
                                </label>
                                {/* Nút Chọn tất cả / Bỏ chọn tất cả */}
                                {cloItems.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleToggleAllClo}
                                        className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        {config.cloIds.length === cloItems.length ? "Bỏ chọn tất cả" : "Chọn tất cả"}
                                    </button>
                                )}
                            </div>

                            <div
                                className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-md max-h-48 overflow-y-auto">
                                {cloItems.length > 0 ? (
                                    cloItems.map(c => (
                                        <label
                                            key={c.cloId}
                                            className="flex items-center space-x-2 cursor-pointer group"
                                        >
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-colors"
                                                checked={config.cloIds.includes(c.cloCode)}
                                                onChange={() => toggleClo(c.cloCode)}
                                            />
                                            <span
                                                className="text-sm text-slate-700 group-hover:text-blue-600 transition-colors">
                                            {c.cloCode}
                                        </span>
                                        </label>
                                    ))
                                ) : (
                                    <span className="text-sm text-slate-500 italic col-span-full">
                                        Chưa có chuẩn đầu ra nào được tải.
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500">
                                * Bỏ trống nếu muốn lấy câu hỏi từ tất cả các chuẩn đầu ra. Đã chọn:
                                <span className="font-semibold text-blue-600 ml-1">
                                    {config.cloIds.length} / {cloItems.length}
                                </span>
                            </p>
                        </div>

                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">3. Số lượng câu hỏi theo mức
                                độ <span
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
