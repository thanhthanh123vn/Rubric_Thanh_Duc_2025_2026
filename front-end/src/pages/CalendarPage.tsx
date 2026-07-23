import React, {useEffect, useMemo, useState} from "react";
import LMSLayout from "@/app/lms-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Printer, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import WeeklyCalendar from "./WeeklyCalendar";
import { useAppSelector } from "@/hooks/useAppSelector";
import { courseScheduleApi, type StudentScheduleResponse } from "@/api/courseScheduleApi";
import { toast } from "sonner";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
export default function CalendarPage() {

    const { user: reduxUser } = useAppSelector((state) => state.auth);
    let user = reduxUser;
    if (!user) {
        const localUser = localStorage.getItem("user");
        if (localUser) {
            user = JSON.parse(localUser);
        }
    }
    const studentId = user?.studentId || user?.userId;

    // 2. State quản lý dữ liệu lịch học
    const [schedules, setSchedules] = useState<StudentScheduleResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);



    const semesters = useMemo(() => {
        const currentYear = new Date().getFullYear();
        return [
            { value: `hk1-${currentYear - 1}${currentYear}`, label: `Học kỳ 1 - Năm học ${currentYear - 1}-${currentYear}` },
            { value: `hk2-${currentYear - 1}${currentYear}`, label: `Học kỳ 2 - Năm học ${currentYear - 1}-${currentYear}` },
            { value: `hkh-${currentYear}${currentYear + 1}`, label: `Học kỳ Hè - Năm học ${currentYear}-${currentYear + 1}` },
        ];
    }, []);
    const [selectedSemester, setSelectedSemester] = useState(`hk2-${new Date().getFullYear() - 1}${new Date().getFullYear()}`);
    const weeks = useMemo(() => {
        const result = [];
        // Giả lập mốc bắt đầu học kỳ (Ví dụ: Ngày 01/02 của năm hiện tại)
        const semesterStart = new Date(new Date().getFullYear(), 1, 1);

        // Đưa về ngày Thứ 2 đầu tiên của tuần chứa ngày bắt đầu
        const dayOfWeek = semesterStart.getDay();
        const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        semesterStart.setDate(semesterStart.getDate() + distanceToMonday);

        for (let i = 1; i <= 15; i++) {
            const weekStart = new Date(semesterStart);
            weekStart.setDate(semesterStart.getDate() + (i - 1) * 7);

            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);

            const formatDate = (d: Date) => {
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                return `${dd}/${mm}`;
            };

            result.push({
                value: `w${i}`,
                label: `Tuần ${i} [${formatDate(weekStart)} - ${formatDate(weekEnd)}]`
            });
        }
        return result;
    }, [selectedSemester]);
    const [selectedWeek, setSelectedWeek] = useState("w1");
    // 3. Gọi API khi tải trang
    useEffect(() => {
        const fetchSchedules = async () => {
            if (!studentId) return;

            setIsLoading(true);
            try {
                const data = await courseScheduleApi.getStudentSchedule();
                setSchedules(data);
            } catch (error) {
                toast.error("Không thể tải lịch học lúc này.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchSchedules();
    }, [studentId]);

    const handlePrint = () => {
        window.print();
    };

    return (
        <LMSLayout>
            <div className="flex flex-col p-3 md:p-5 bg-gray-50/30 min-h-screen w-full overflow-x-hidden">

                {/* TIÊU ĐỀ & NÚT IN */}
                <div
                    className="border-b-2 border-emerald-700 pb-2 mb-4 md:mb-5 flex flex-wrap gap-3 justify-between items-end print:hidden">
                    <h1 className="text-lg md:text-xl font-bold text-emerald-800 uppercase tracking-tight">
                        Thời khóa biểu cá nhân
                    </h1>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrint}
                        className="gap-2 text-xs h-8 px-3 shadow-sm bg-white"
                    >
                        <Printer size={14}/> <span className="hidden sm:inline font-medium">In lịch học</span>
                    </Button>
                </div>

                {/* BỘ LỌC - MOBILE: Xếp dọc | DESKTOP: Xếp ngang */}
                <div
                    className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5 bg-white p-3 md:p-4 rounded-xl border border-gray-200 mb-5 md:mb-6 shadow-sm print:hidden">
                    {/* Học kỳ động */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Học kỳ:</span>
                        <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                            <SelectTrigger className="w-full bg-gray-50/50 h-9 border-gray-200">
                                <SelectValue placeholder="Chọn học kỳ"/>
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map(sem => (
                                    <SelectItem key={sem.value} value={sem.value}>
                                        {sem.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tuần học động */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                        <span className="text-sm font-semibold text-gray-700 whitespace-nowrap">Tuần học:</span>
                        <div className="flex items-center w-full gap-1">
                            <Button variant="outline" size="icon"
                                    className="h-9 w-9 shrink-0 bg-gray-50/50 border-gray-200"><ChevronLeft size={16}/></Button>
                            <Select value={selectedWeek} onValueChange={setSelectedWeek}>
                                <SelectTrigger
                                    className="flex-1 bg-gray-50/50 h-9 text-xs md:text-sm border-gray-200 truncate">
                                    <SelectValue placeholder="Chọn tuần"/>
                                </SelectTrigger>

                                <SelectContent>
                                    {weeks.map(w => (
                                        <SelectItem key={w.value} value={w.value}>
                                            {w.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button variant="outline" size="icon"
                                    className="h-9 w-9 shrink-0 bg-gray-50/50 border-gray-200"><ChevronRight size={16}/></Button>
                        </div>
                    </div>
                </div>

                {/* KHUNG LỊCH HỌC */}
                <div
                    className="w-full border border-gray-200 rounded-xl overflow-hidden shadow-sm bg-white mb-5 md:mb-6 relative min-h-[400px]">
                    {isLoading ? (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mb-2"/>
                            <span className="text-sm font-medium text-slate-500">Đang tải lịch học...</span>
                        </div>
                    ) : (
                        /* Chuyền dữ liệu xuống component WeeklyCalendar */
                        <WeeklyCalendar schedules={schedules}/>
                    )}
                </div>

                {/*/!* KHU VỰC THỐNG KÊ (TIẾN TRÌNH & NHIỆM VỤ) *!/*/}
                {/*<div className="flex flex-col lg:flex-row items-start w-full gap-5 md:gap-6 print:hidden">*/}

                {/*    /!* CỘT TRÁI: TIẾN TRÌNH HỌC TẬP *!/*/}
                {/*    <div className="flex flex-col w-full lg:flex-1 bg-white p-4 md:p-6 gap-5 md:gap-6 rounded-xl border border-gray-200 shadow-sm">*/}
                {/*        <div className="flex justify-between items-center w-full">*/}
                {/*            <span className="text-slate-900 text-lg md:text-xl font-bold">Tiến trình học tập</span>*/}
                {/*            <div className="flex items-center gap-2 md:gap-3 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">*/}
                {/*                <span className="text-emerald-700 text-[10px] md:text-xs font-bold hidden sm:block">TỔNG TÍN CHỈ</span>*/}
                {/*                <span className="text-emerald-600 text-sm md:text-lg font-extrabold">84 / 120</span>*/}
                {/*            </div>*/}
                {/*        </div>*/}

                {/*        <div className="flex flex-col w-full gap-5">*/}
                {/*            /!* Môn 1 *!/*/}
                {/*            <div className="flex flex-col w-full gap-2">*/}
                {/*                <div className="flex justify-between items-center w-full">*/}
                {/*                    <span className="text-slate-800 text-sm font-bold truncate pr-2">Advanced Calculus (MAT201)</span>*/}
                {/*                    <span className="text-slate-500 text-xs md:text-sm shrink-0 font-medium">75% Hoàn thành</span>*/}
                {/*                </div>*/}
                {/*                <div className="w-full bg-slate-100 rounded-full h-2 md:h-2.5 overflow-hidden">*/}
                {/*                    <div className="bg-emerald-500 w-[75%] h-full rounded-full transition-all duration-500"></div>*/}
                {/*                </div>*/}
                {/*                <div className="flex items-center flex-wrap gap-3 md:gap-4 mt-1">*/}
                {/*                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs text-slate-600 font-medium border border-gray-100">*/}
                {/*                        <span className="w-2 h-2 rounded-full bg-blue-500"></span> Chuyên cần: 92%*/}
                {/*                    </div>*/}
                {/*                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded text-xs text-slate-600 font-medium border border-gray-100">*/}
                {/*                        <span className="w-2 h-2 rounded-full bg-purple-500"></span> Bài tập: 8/10*/}
                {/*                    </div>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}

                {/*    /!* CỘT PHẢI: NHIỆM VỤ SẮP TỚI *!/*/}
                {/*    <div className="flex flex-col w-full lg:w-[360px] shrink-0 bg-white p-4 md:p-5 gap-4 rounded-xl border border-gray-200 shadow-sm">*/}
                {/*        <div className="flex justify-between items-center w-full mb-1">*/}
                {/*            <span className="text-slate-900 text-lg font-bold">Nhiệm vụ sắp tới</span>*/}
                {/*            <button className="text-emerald-600 text-xs font-bold hover:text-emerald-700 hover:underline transition-all">*/}
                {/*                Xem tất cả*/}
                {/*            </button>*/}
                {/*        </div>*/}

                {/*        <div className="flex flex-col w-full gap-3">*/}
                {/*            /!* Task 1 *!/*/}
                {/*            <div className="flex items-center p-3 gap-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors cursor-pointer group">*/}
                {/*                <div className="flex flex-col shrink-0 items-center justify-center bg-red-50 py-1.5 px-3 rounded-lg border border-red-100 min-w-[54px]">*/}
                {/*                    <span className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Th 3</span>*/}
                {/*                    <span className="text-red-600 text-lg font-black leading-none mt-0.5">15</span>*/}
                {/*                </div>*/}
                {/*                <div className="flex flex-col flex-1 min-w-0">*/}
                {/*                    <span className="text-slate-900 text-sm font-bold truncate group-hover:text-emerald-700 transition-colors">Midterm: Discrete Math</span>*/}
                {/*                    <span className="text-slate-500 text-xs mt-0.5 truncate">09:00 AM • Hall B.301</span>*/}
                {/*                </div>*/}
                {/*            </div>*/}
                {/*        </div>*/}
                {/*    </div>*/}
                {/*</div>*/}

            </div>
        </LMSLayout>
    );
}