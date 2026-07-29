import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useNavigate, useParams } from 'react-router-dom';
import { assessmentPaperApi } from '@/api/assessmentApi.ts';
import Sidebar from '@/features/course/student/components/Sidebar.tsx';
import Header from '@/components/home/Header.tsx';
import { Clock, FileText, Calendar, Search, PlayCircle, Lock, Eye, BellRing } from 'lucide-react';
import { useAppSelector } from "@/hooks/useAppSelector.ts";
// Import thư viện WebSocket
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

export type StudentAssignedExamResponse = {
    assignmentId: string;
    assessmentPaperId: string;
    examTitle: string;
    durationMinutes: number;
    questionCount: number;
    startTime: string;
    endTime: string;
    status: string;
};

const cardColors = [
    "from-blue-400 to-blue-600",
    "from-emerald-400 to-emerald-600",
    "from-amber-400 to-amber-600",
    "from-rose-400 to-rose-600",
    "from-violet-400 to-violet-600",
    "from-cyan-400 to-cyan-600",
];

export default function StudentExamListPage() {
    const { id } = useParams();
    const [rows, setRows] = useState<StudentAssignedExamResponse[]>([]);
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');

    // THÊM: Biến lưu thời gian hiện tại để tự động render lại giao diện mỗi giây
    const [currentTime, setCurrentTime] = useState(Date.now());

    const navigate = useNavigate();

    // Lấy thông tin sinh viên từ Redux để kết nối WebSocket
    const { user: reduxUser } = useAppSelector((state) => state.auth);
    const studentId = reduxUser?.studentId || reduxUser?.userId || JSON.parse(localStorage.getItem("user") || '{}').studentId;

    const loadData = async () => {
        try {
            setLoading(true);
            const data = await assessmentPaperApi.getStudentAssignedExams(id);
            setRows(Array.isArray(data) ? data : []);
        } catch (error) {
            toast.error('Không thể tải danh sách bài thi');
            setRows([]);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        // Cập nhật currentTime mỗi 1 giây (1000ms)
        const timer = setInterval(() => {
            setCurrentTime(Date.now());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    useEffect(() => {
        if (!studentId || !id) return;

        const token = localStorage.getItem('token');
        const wsBaseUrl = (import.meta.env.VITE_WS_URL || 'ws://localhost:8080').replace(/^http/, 'ws')
        const socketUrl = `${wsBaseUrl}/api/v1/course-service/ws?token=${token}`;

        const stompClient = new Client({

            brokerURL: socketUrl,
            reconnectDelay: 5000,

            onConnect: () => {
                console.log('Đã kết nối Native WebSocket thành công');

                const topicUrl = `/topic/course/${id}/student/${studentId}/exams`;
                stompClient.subscribe(topicUrl, (message) => {
                    if (message.body) {
                        const newExam: StudentAssignedExamResponse = JSON.parse(message.body);


                        setRows((prevRows) => [newExam, ...prevRows]);


                        toast.info("Có bài thi mới!", {
                            icon: <BellRing className="w-5 h-5 text-blue-500" />,
                            description: `Giảng viên vừa giao bài: ${newExam.examTitle}`,
                            duration: 6000
                        });
                    }
                });
            },
            onStompError: (frame) => {
                console.error('Lỗi STOMP: ' + frame.headers['message']);
            }
        });

        stompClient.activate();


        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [id, studentId]);

    useEffect(() => {
        loadData();
    }, [id]);

    const filtered = useMemo(
        () => rows.filter(x => (x.examTitle || '').toLowerCase().includes(keyword.toLowerCase())),
        [rows, keyword]
    );

    const fmt = (iso?: string) =>
        iso ? new Date(iso).toLocaleString('vi-VN', { hour12: false, timeZone: 'Asia/Ho_Chi_Minh' }) : '--';


    const canStart = (x: StudentAssignedExamResponse) => {
        const st = new Date(x.startTime).getTime();
        const et = new Date(x.endTime).getTime();
        return currentTime >= st && currentTime <= et && (x.status === 'NOT_STARTED' || x.status === 'IN_PROGRESS');
    };

    const isExpired = (x: StudentAssignedExamResponse) => {
        return currentTime > new Date(x.endTime).getTime();
    };

    const canViewResult = (x: StudentAssignedExamResponse) => {
        const hasSubmitted = x.status === "COMPLETED" || x.status === "GRADED";
        const isTimeOver = currentTime > new Date(x.endTime).getTime();
        return hasSubmitted && isTimeOver;
    };

    const takeExam = async (paperId: string) => {
        try {
            await assessmentPaperApi.getStudentExamToTake(paperId);
            navigate(`/course/${id}/my-exams/${paperId}`);
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.message;
            if (errorMessage.includes('Tài khoản của bạn đang làm bài thi này')) {
                toast.error("Cảnh báo bảo mật", {
                    description: "Tài khoản của bạn đang làm bài thi trên một thiết bị hoặc trình duyệt khác!",
                    duration: 5000,
                });
            } else {
                toast.error("Không thể tải đề thi: " + errorMessage);
            }
        }
    };

    const viewAnswers = (paperId: string) => {
        navigate(`/course/${id}/my-exams/${paperId}/result`);
    };

    const handleNavigate = (x: StudentAssignedExamResponse) => {
        if (canStart(x)) {
            takeExam(x.assessmentPaperId);
            return;
        }

        if (canViewResult(x)) {
            navigate(`/course/${id}/my-exams/${x.assessmentPaperId}/result`);
            return;
        }

        if ((x.status === "COMPLETED" || x.status === "GRADED") && !isExpired(x)) {
            toast.info("Vui lòng đợi đến khi kỳ thi kết thúc để xem đáp án.");
            return;
        }

        if (isExpired(x)) {
            toast.error("Đã hết thời gian làm bài hoặc chưa hoàn thành.");
        }
    };

    const getCardColor = (id: string) => {
        let hash = 0;
        for (let i = 0; i < id.length; i++) {
            hash = id.charCodeAt(i) + ((hash << 5) - hash);
        }
        const index = Math.abs(hash) % cardColors.length;
        return cardColors[index];
    };

    const renderStatusBadge = (
        status: string,
        isAvailable: boolean,
        expired: boolean
    ) => {
        if (status === "COMPLETED" || status === "GRADED") {
            if (!expired) {
                return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Đã nộp bài (Đang chờ)</span>;
            }
            return <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Đã hoàn thành</span>;
        }

        if (status === "IN_PROGRESS") return <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Đang làm</span>;

        if (expired) return <span className="bg-rose-100 text-rose-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Chưa làm bài</span>;

        if (!isAvailable) return <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Chưa mở</span>;

        return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold shadow-sm">Sẵn sàng</span>;
    };
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
            <aside className="hidden md:block w-64 shrink-0 border-r bg-white h-screen sticky top-0 overflow-y-auto">
                <Sidebar />
            </aside>

            <main className="flex-1 min-w-0 flex flex-col w-full">
                <Header />

                <div className="p-4 md:p-6 space-y-6 flex-1 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Bài thi của tôi</h1>
                            <p className="text-sm text-slate-500 mt-1">Danh sách các bài thi và kiểm tra được giao cho bạn</p>
                        </div>
                    </div>

                    <Card className="shadow-sm border-slate-200 bg-white/50 backdrop-blur-sm">
                        <CardHeader className="pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <CardTitle className="text-lg text-slate-700">Tất cả bài thi ({filtered.length})</CardTitle>
                            <div className="relative w-full sm:w-72">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input
                                    placeholder="Tìm theo tên bài thi..."
                                    value={keyword}
                                    onChange={(e) => setKeyword(e.target.value)}
                                    className="pl-9 w-full bg-white border-slate-200 focus-visible:ring-blue-500"
                                />
                            </div>
                        </CardHeader>

                        <CardContent className="p-6">
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                                    <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                    <p>Đang tải danh sách bài thi...</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-20 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                                    <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                    <h3 className="text-lg font-medium text-slate-700">Không có bài thi nào</h3>
                                    <p className="text-slate-500 text-sm mt-1">Bạn hiện không có bài thi nào hoặc không tìm thấy kết quả phù hợp.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {filtered.map((x) => {
                                        const isAvailable = canStart(x);
                                        const expired = isExpired(x);
                                        const isViewable = canViewResult(x);
                                        const hasSubmittedButWaiting = (x.status === "COMPLETED" || x.status === "GRADED") && !expired;

                                        return (
                                            <div
                                                key={x.assignmentId}
                                                // Điều kiện chuôt: Cho click khi Available hoặc Viewable hoặc Đang chờ
                                                className={`group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition-all duration-300 ${isAvailable || isViewable || hasSubmittedButWaiting ? 'cursor-pointer hover:shadow-xl hover:-translate-y-1.5 hover:border-blue-300' : 'opacity-80 cursor-not-allowed grayscale-[15%]'}`}
                                                onClick={() => handleNavigate(x)}
                                            >
                                                <div className={`h-24 w-full p-4 flex items-start justify-between bg-gradient-to-br ${getCardColor(x.assignmentId)}`}>
                                                    {renderStatusBadge(x.status, isAvailable, expired)}

                                                    {isAvailable ? <PlayCircle className="text-white/80 h-6 w-6" />
                                                        : isViewable ? <Eye className="text-white/80 h-5 w-5" />
                                                            : hasSubmittedButWaiting ? <Clock className="text-white/80 h-5 w-5" />
                                                                : <Lock className="text-white/80 h-5 w-5" />}
                                                </div>

                                                <div className="p-5 flex-1 flex flex-col">
                                                    <h3 className="font-bold text-lg text-slate-800 line-clamp-2 mb-4 group-hover:text-blue-600 transition-colors" title={x.examTitle}>
                                                        {x.examTitle}
                                                    </h3>

                                                    <div className="space-y-3 mt-auto">
                                                        <div className="flex items-center text-sm text-slate-600 gap-2.5">
                                                            <div className="p-1.5 bg-slate-100 rounded-md text-slate-500"><FileText className="w-3.5 h-3.5"/></div>
                                                            <span className="font-medium">{x.questionCount} <span className="font-normal text-slate-500">câu hỏi</span></span>
                                                        </div>
                                                        <div className="flex items-center text-sm text-slate-600 gap-2.5">
                                                            <div className="p-1.5 bg-slate-100 rounded-md text-slate-500"><Clock className="w-3.5 h-3.5"/></div>
                                                            <span className="font-medium">{x.durationMinutes} <span className="font-normal text-slate-500">phút</span></span>
                                                        </div>
                                                        <div className="flex items-start text-sm text-slate-600 gap-2.5">
                                                            <div className="p-1.5 bg-slate-100 rounded-md text-slate-500 mt-0.5"><Calendar className="w-3.5 h-3.5"/></div>
                                                            <div className="flex flex-col text-xs space-y-1">
                                                                <span className="text-slate-500">Mở: <span className="font-medium text-slate-700">{fmt(x.startTime)}</span></span>
                                                                <span className="text-slate-500">Đóng: <span className="font-medium text-rose-600">{fmt(x.endTime)}</span></span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="mt-5 pt-4 border-t border-slate-100">
                                                        <Button
                                                            className={`w-full font-medium
                                                                ${
                                                                isAvailable
                                                                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                                                                    : isViewable
                                                                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                                                        : hasSubmittedButWaiting
                                                                            ? "bg-amber-500 hover:bg-amber-600 text-white"
                                                                            : expired
                                                                                ? "bg-red-600 hover:bg-red-700 text-white"
                                                                                : "bg-gray-300 text-gray-500 pointer-events-none"
                                                            }`}
                                                            variant="default"
                                                            onClick={(e) => {
                                                                e.stopPropagation();

                                                                if (isAvailable) {
                                                                    takeExam(x.assessmentPaperId);
                                                                } else if (isViewable) {
                                                                    viewAnswers(x.assessmentPaperId);
                                                                } else if (hasSubmittedButWaiting) {
                                                                    toast.info("Vui lòng đợi đến khi kỳ thi kết thúc để xem đáp án.");
                                                                } else if (expired) {
                                                                    toast.error("Bạn đã bỏ lỡ bài thi.");
                                                                }
                                                            }}
                                                        >
                                                            {
                                                                isAvailable
                                                                    ? "Vào làm bài"
                                                                    : isViewable
                                                                        ? "Xem đáp án"
                                                                        : hasSubmittedButWaiting
                                                                            ? "Đang chờ kết thúc..."
                                                                            : expired
                                                                                ? "Chưa làm bài"
                                                                                : "Chưa thể làm bài"
                                                            }
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}