import React, { useEffect, useState } from "react";
import LMSLayout from "@/app/lms-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight, Search, Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/components/ui/utils";
import { vi } from "date-fns/locale";
import { format, addMonths, subMonths } from "date-fns";

// IMPORT SERVICE VÀ TYPE
import sinhVienService from "@/pages/admin/api/sinhVienService";
import type { ScheduleResponse } from "@/pages/admin/api/type";

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const daysOfWeek = [
    { name: "MON", date: "15" },
    { name: "TUE", date: "16" },
    { name: "WED", date: "17" },
    { name: "THU", date: "18", isToday: true },
    { name: "FRI", date: "19" },
    { name: "SAT", date: "20" },
    { name: "SUN", date: "21" },
];

const PIXELS_PER_HOUR = 80;

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState<Date | undefined>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [showSidebar, setShowSidebar] = useState(false);

    // STATE LƯU DỮ LIỆU TỪ API
    const [classes, setClasses] = useState<ScheduleResponse[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    const nextMonth = () => setCurrentDate(currentDate ? addMonths(currentDate, 1) : new Date());
    const prevMonth = () => setCurrentDate(currentDate ? subMonths(currentDate, 1) : new Date());

    const today = new Date();
    const formattedDate = `ngày ${today.getDate()} tháng ${today.getMonth() + 1} năm ${today.getFullYear()}`;

    const goToToday = () => {
        const today = new Date();
        setSelectedDate(today);
        setCurrentMonth(today);
    };

    // --- GỌI API KHI COMPONENT MOUNT ---
    useEffect(() => {
        const fetchSchedules = async () => {
            try {
                setLoading(true);
                const data = await sinhVienService.getSchedules();
                // Nếu Backend trả về object có bọc { data: [...] } thì dùng response.data,
                // ở service bạn đã map thẳng response.data nên ta set trực tiếp
                setClasses(data || []);
            } catch (error) {
                console.error("Lỗi khi tải lịch học:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSchedules();
    }, []);

    // Tạo danh sách môn học duy nhất cho Sidebar (My Courses) từ dữ liệu thật
    const uniqueCourses = Array.from(new Set(classes.map(c => c.title))).map(title => {
        const course = classes.find(c => c.title === title);
        // Lấy class màu border từ color theme (vd: "border-blue-500" từ "bg-blue-100 border-blue-500 text-blue-700")
        const borderColor = course?.color?.split(' ').find(c => c.startsWith('border-')) || 'border-gray-500';
        const bgColor = course?.color?.split(' ').find(c => c.startsWith('bg-')) || 'bg-gray-500';
        // Đổi "bg-" thành "data-[state=checked]:bg-" để tô màu checkbox
        const checkedBgColor = bgColor.replace('bg-', 'data-[state=checked]:bg-');

        return { title, checkboxColor: `${borderColor} ${checkedBgColor}` };
    });

    return (
        <LMSLayout>
            <div className="h-[calc(100dvh-theme(spacing.16))] flex flex-col p-2 md:p-4 gap-3 md:gap-4 animate-in fade-in duration-500 overflow-hidden bg-gray-50/50">

                {/* --- HEADER CONTROLS --- */}
                <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white p-2 md:p-3 rounded-xl border shadow-sm">
                    {/* Left Actions */}
                    <div className="flex items-center gap-2 md:gap-4 w-full md:w-auto justify-between md:justify-start">
                        <div className="flex items-center border rounded-md shadow-sm w-full md:w-auto justify-between">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={prevMonth}><ChevronLeft className="w-4 h-4"/></Button>
                            <div className="px-2 md:px-4 font-bold text-sm min-w-[140px] text-center text-blue-700">
                                {formattedDate}
                            </div>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={nextMonth}><ChevronRight className="w-4 h-4"/></Button>
                        </div>

                        {/* Nút bật/tắt Filter trên Mobile */}
                        <Button
                            variant={showSidebar ? "secondary" : "outline"}
                            className="lg:hidden h-9 w-9 p-0 shrink-0"
                            onClick={() => setShowSidebar(!showSidebar)}
                        >
                            <Filter className="w-4 h-4" />
                        </Button>
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
                        <Button variant="outline" className="hidden md:flex h-9 font-medium shadow-sm shrink-0" onClick={goToToday}>Today</Button>
                        <div className="relative hidden xl:block shrink-0">
                            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search event..." className="w-[180px] pl-9 h-9 bg-gray-50 border-gray-200 focus-visible:ring-emerald-500" />
                        </div>
                        <Select defaultValue="week">
                            <SelectTrigger className="w-[90px] md:w-[100px] h-9 bg-white font-medium shadow-sm shrink-0">
                                <SelectValue placeholder="View" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="month">Month</SelectItem>
                                <SelectItem value="week">Week</SelectItem>
                                <SelectItem value="day">Day</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button className="h-9 bg-emerald-600 hover:bg-emerald-700 shadow-sm text-white gap-2 shrink-0">
                            <Plus className="w-4 h-4" />
                            <span className="hidden sm:inline">Add</span>
                        </Button>
                    </div>
                </div>

                {/* --- MAIN CONTENT --- */}
                <div className="flex flex-col lg:flex-row gap-4 flex-1 overflow-hidden relative">

                    {/* CỘT TRÁI: SIDEBAR FILTER */}
                    <div className={cn(
                        "w-full lg:w-[280px] shrink-0 flex-col gap-4 overflow-y-auto lg:overflow-visible transition-all absolute lg:relative z-40 lg:z-0 bg-gray-50/95 lg:bg-transparent p-1 lg:p-0 h-full lg:h-auto backdrop-blur-sm lg:backdrop-blur-none",
                        showSidebar ? "flex animate-in slide-in-from-left-4" : "hidden lg:flex"
                    )}>

                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={(date) => date && setSelectedDate(date)}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            locale={vi}
                            className="w-full bg-white rounded-xl shadow-sm border p-3"
                            classNames={{
                                months: "relative",
                                month_caption: "flex justify-center pt-1 pb-4 relative items-center w-full",
                                caption_label: "text-[15px] font-semibold capitalize text-gray-900",
                                nav: "flex items-center justify-between absolute w-full z-10 px-1 top-1",
                                button_previous: "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 flex items-center justify-center transition-opacity",
                                button_next: "h-7 w-7 bg-transparent p-0 opacity-60 hover:opacity-100 flex items-center justify-center transition-opacity",
                                selected: "!bg-[#0b7a39] !text-white hover:!bg-[#0b7a39] hover:!text-white focus:!bg-[#0b7a39] focus:!text-white font-semibold rounded-lg",                                today: "text-[#0b7a39] bg-green-50 font-bold rounded-lg",
                                month_grid: "w-full border-collapse",
                                weekdays: "flex justify-between w-full mb-2",
                                weekday: "text-gray-500 w-9 font-medium text-[13px] capitalize text-center",
                                week: "flex justify-between w-full mt-1",
                                day: "h-9 w-9 p-0 font-medium text-gray-700 flex items-center justify-center hover:bg-gray-100 rounded-lg transition-colors cursor-pointer",
                            }}
                        />

                        {/* DYNAMIC My Courses Filter */}
                        <div className="bg-white rounded-xl shadow-sm border p-4 mt-4">
                            <h3 className="font-bold mb-4 text-sm text-gray-900 uppercase tracking-wider flex items-center justify-between">
                                My Courses
                                <Button variant="ghost" size="icon" className="h-6 w-6"><Plus className="w-4 h-4" /></Button>
                            </h3>
                            <div className="space-y-3">
                                {loading ? (
                                    <div className="text-sm text-gray-500 italic">Đang tải...</div>
                                ) : uniqueCourses.length > 0 ? (
                                    uniqueCourses.map((course, idx) => (
                                        <div key={idx} className="flex items-center space-x-3 group cursor-pointer p-1.5 hover:bg-gray-50 rounded-md">
                                            <Checkbox id={`course-${idx}`} defaultChecked className={cn("rounded-[4px]", course.checkboxColor)} />
                                            <Label htmlFor={`course-${idx}`} className="cursor-pointer text-sm font-medium">{course.title}</Label>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-sm text-gray-500 italic">Không có môn học</div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* CỘT PHẢI: TIMELINE GRID LỚN */}
                    <Card className="flex-1 shadow-sm border rounded-xl bg-white overflow-hidden flex flex-col relative z-10">
                        <div className="flex-1 overflow-x-auto overflow-y-auto w-full custom-scrollbar">
                            <div className="min-w-[700px] lg:min-w-0 flex flex-col h-full relative">

                                {/* Header ngày trong tuần */}
                                <div className="flex border-b border-gray-200 shrink-0 bg-white sticky top-0 z-30 shadow-sm">
                                    <div className="w-[60px] md:w-[70px] shrink-0 border-r border-gray-200 bg-white sticky left-0 z-40"></div>
                                    <div className="flex flex-1 grid grid-cols-7">
                                        {daysOfWeek.map((day, idx) => (
                                            <div key={idx} className="flex flex-col items-center justify-center py-2 border-r border-gray-100 last:border-r-0 bg-white">
                                                <span className={cn(
                                                    "text-[10px] md:text-xs font-semibold mb-1",
                                                    day.isToday ? "text-emerald-600" : "text-gray-400"
                                                )}>{day.name}</span>
                                                <span className={cn(
                                                    "text-sm md:text-lg font-bold w-7 h-7 md:w-8 md:h-8 flex items-center justify-center rounded-full",
                                                    day.isToday ? "bg-emerald-600 text-white shadow-sm" : "text-gray-700"
                                                )}>{day.date}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Lưới thời gian */}
                                <div className="flex flex-1 relative bg-white">
                                    {/* Cột giờ */}
                                    <div className="w-[60px] md:w-[70px] shrink-0 flex flex-col border-r border-gray-200 bg-white sticky left-0 z-20 shadow-[1px_0_5px_rgba(0,0,0,0.02)]">
                                        {timeSlots.map((time, idx) => (
                                            <div key={idx} style={{ height: `${PIXELS_PER_HOUR}px` }} className="border-b border-transparent relative">
                                                <span className="absolute -top-[10px] right-2 text-[10px] font-medium text-gray-400 bg-white px-1">{time}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Khu vực Sự kiện & Lưới */}
                                    <div className="flex-1 relative">
                                        <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                                            {timeSlots.map((_, idx) => (
                                                <div key={`h-line-${idx}`} style={{ height: `${PIXELS_PER_HOUR}px` }} className="border-b border-gray-100 w-full" />
                                            ))}
                                        </div>

                                        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0">
                                            {daysOfWeek.map((_, idx) => (
                                                <div key={`v-line-${idx}`} className="border-r border-gray-50 h-full w-full last:border-r-0" />
                                            ))}
                                        </div>

                                        {/* VẼ SỰ KIỆN TỪ STATE 'classes' (Thay vì mockClasses) */}
                                        <div className="absolute inset-0 grid grid-cols-7 z-10">
                                            {!loading && classes.map(cls => {
                                                // Tính vị trí dựa trên mốc 8 giờ sáng (startHour = 8 -> top = 0)
                                                const topPosition = (cls.startHour - 8) * PIXELS_PER_HOUR;
                                                const height = cls.duration * PIXELS_PER_HOUR;

                                                return (
                                                    <div
                                                        key={cls.id}
                                                        className={cn(
                                                            "absolute rounded-lg border-l-4 p-1.5 md:p-2 mx-[2px] md:mx-1 flex flex-col shadow-sm cursor-pointer transition-all hover:brightness-95 hover:scale-[1.02] overflow-hidden",
                                                            cls.color || "bg-gray-100 border-gray-500 text-gray-700" // Fallback màu
                                                        )}
                                                        style={{
                                                            left: `calc(${(cls.day * 100) / 7}%)`,
                                                            width: `calc(100% / 7 - 4px)`,
                                                            top: `${topPosition}px`,
                                                            height: `${height}px`,
                                                        }}
                                                    >
                                                        <span className="font-bold text-[10px] md:text-xs leading-tight mb-0.5 truncate">{cls.title}</span>
                                                        <span className="text-[9px] md:text-[10px] opacity-80 leading-tight flex-1 truncate">{cls.room}</span>
                                                        <span className="hidden md:block text-[9px] md:text-[10px] font-medium opacity-90 capitalize mt-auto">{cls.type}</span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            </div>
        </LMSLayout>
    );
}