    import { useState, useEffect, useMemo } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
    import { toast } from 'sonner';
    import { useParams, useNavigate } from 'react-router-dom';
    import { questionBankApi, type QuestionBankResponse } from '@/api/QuestionBankApi';
    import { assessmentPaperApi, type GenerateExamRequest } from "@/api/assessmentApi.ts";
    import { FileEdit, ArrowLeft } from 'lucide-react';
    import {type Question, questionApi} from "@/api/questionApi.ts";
    import courseService from "@/pages/admin/api/courseService.ts";

    export default function CreateExamPage() {
        const { id } = useParams();
        const navigate = useNavigate();

        const [banks, setBanks] = useState<QuestionBankResponse[]>([]);
        const [bankQuestions, setBankQuestions] = useState<Question[]>([]);
        const [courseLabel, setCourseLabel] = useState("");
        const [isLoadingStats, setIsLoadingStats] = useState(false);
        const [config, setConfig] = useState({
            questionBankId: '',
            easyCount: 0,
            mediumCount: 0,
            hardCount: 0,
            examTitle: '',
            durationMinutes: 60,
            startTime: "",
            endTime: ""
        });
        const [isSubmitting, setIsSubmitting] = useState(false);

        useEffect(() => {
            const loadData = async () => {
                try {
                    if (!id) throw new Error("Thiếu mã lớp học phần");
                    const [bankRes, offering] = await Promise.all([
                        questionBankApi.getMyQuestionBanks(),
                        courseService.getOffering(id),
                    ]);
                    const courseId = offering?.course?.courseId;
                    if (!courseId) throw new Error("Không xác định được học phần của lớp");
                    setBanks((bankRes || []).filter((bank) => bank.offeringId === id));
                    setCourseLabel(`${offering.course.courseCode} - ${offering.course.courseName}`);
                } catch (error) {
                    console.error("Lỗi khi tải dữ liệu cấu hình đề thi:", error);
                    toast.error("Không thể tải học phần và kho câu hỏi của lớp.");
                }
            };
            loadData();
        }, []);
        useEffect(() => {
            const fetchBankQuestions = async () => {
                // Nếu chưa chọn kho nào thì reset lại thống kê
                if (!config.questionBankId) {
                    setBankQuestions([]);
                    return;
                }

                setIsLoadingStats(true);
                try {
                    // Gọi API lấy danh sách câu hỏi
                    const response = await questionApi.getQuestionsByBankId(config.questionBankId);

                    // Tùy cấu trúc axios, thường dữ liệu nằm trong response.data hoặc chính response
                    const questions: Question[] = Array.isArray(response) ? response : [];
                    setBankQuestions(questions.filter((question) => question.type === "MULTIPLE_CHOICE" && question.offeringId === id));
                } catch (error) {
                    console.error("Lỗi khi lấy danh sách câu hỏi của kho:", error);
                    toast.error("Không thể tải thông tin thống kê của kho câu hỏi này.");
                    setBankQuestions([]);
                } finally {
                    setIsLoadingStats(false);
                }
            };

            fetchBankQuestions();
        }, [config.questionBankId, id]);
        const bankStats = useMemo(() => ({
            total: bankQuestions.length,
            easy: bankQuestions.filter((question) => question.difficulty === "EASY").length,
            medium: bankQuestions.filter((question) => question.difficulty === "MEDIUM").length,
            hard: bankQuestions.filter((question) => question.difficulty === "HARD").length,
        }), [bankQuestions]);
        const handleGenerate = async () => {
            if (!id) {
                toast.error("Không tìm thấy mã lớp học phần");
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
            if (config.easyCount > bankStats.easy || config.mediumCount > bankStats.medium || config.hardCount > bankStats.hard) {
                toast.error("Kho câu hỏi không đủ số câu trắc nghiệm theo mức độ đã chọn");
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
            const availableMinutes = Math.floor((end.getTime() - start.getTime()) / 60000);
            if (config.durationMinutes > availableMinutes) {
                toast.error("Thời lượng làm bài không được lớn hơn khoảng thời gian mở đề");
                return;
            }

            const payload: GenerateExamRequest = {
                offeringId: id,
                questionBankId: config.questionBankId,
                easyCount: config.easyCount,
                mediumCount: config.mediumCount,
                hardCount: config.hardCount,
                cloIds: null,
                examTitle: config.examTitle.trim(),
                durationMinutes: config.durationMinutes,
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
                const responseData = error.response?.data;
                const errorMsg = typeof responseData === "string"
                    ? responseData
                    : responseData?.message || "Đã xảy ra lỗi khi tạo đề thi";
                toast.error(errorMsg);
            } finally {
                setIsSubmitting(false);
            }
        };

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
                        {courseLabel ? <p className="mt-2 text-sm font-semibold text-blue-700">{courseLabel} · Lớp {id}</p> : null}
                    </div>
                </div>

                <Card className="shadow-sm border-slate-200">
                    <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-4">
                        <CardTitle className="text-lg text-slate-800">Cấu hình ma trận đề</CardTitle>
                        <CardDescription>Chọn kho câu hỏi và số lượng câu theo độ khó. CLO được kế thừa từ từng câu hỏi trong kho.</CardDescription>
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

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">
                                Thời lượng làm bài (phút) <span className="text-red-500">*</span>
                            </label>
                            <Input type="number" min="1" value={config.durationMinutes} onChange={(e) => setConfig({...config, durationMinutes: Number(e.target.value)})} />
                            <p className="text-xs text-slate-500">Thời lượng làm bài có thể ngắn hơn khoảng thời gian mở đề.</p>
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
                            <Select value={config.questionBankId} onValueChange={(val) => setConfig({...config, questionBankId: val, easyCount: 0, mediumCount: 0, hardCount: 0})}>
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

                            {banks.length === 0 ? <p className="text-xs font-medium text-amber-700">Lớp này chưa có kho câu hỏi. Hãy tạo kho câu hỏi cho đúng lớp trước khi tạo đề.</p> : null}
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
                            Tổng câu trắc nghiệm phù hợp: <span
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
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-slate-700">2. Số lượng câu hỏi theo mức
                                độ <span
                                    className="text-red-500">*</span></label>
                            <div
                                className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 font-medium">Mức độ Dễ</label>
                                    <Input type="number" min="0" placeholder="0" className="bg-white"
                                           value={config.easyCount}
                                           onChange={(e) => setConfig({...config, easyCount: +e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 font-medium">Mức độ Trung bình</label>
                                    <Input type="number" min="0" placeholder="0" className="bg-white"
                                           value={config.mediumCount}
                                           onChange={(e) => setConfig({...config, mediumCount: +e.target.value})}/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-slate-600 font-medium">Mức độ Khó</label>
                                    <Input type="number" min="0" placeholder="0" className="bg-white"
                                           value={config.hardCount}
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
