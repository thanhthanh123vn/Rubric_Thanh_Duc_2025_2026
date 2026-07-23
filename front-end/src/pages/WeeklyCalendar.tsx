import React, { useMemo } from "react";
import { cn } from "@/components/ui/utils";
import type { StudentScheduleResponse } from "@/api/courseScheduleApi";

interface WeeklyCalendarProps {
    schedules?: StudentScheduleResponse[];
}

const timeSlots = ["06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

// HÀM TẠO DỮ LIỆU TUẦN HIỆN TẠI
const generateCurrentWeek = () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + distanceToMonday);

    const days = [];
    const dayNames = ["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(startOfWeek);
        currentDay.setDate(startOfWeek.getDate() + i);
        const dd = String(currentDay.getDate()).padStart(2, '0');
        const mm = String(currentDay.getMonth() + 1).padStart(2, '0');

        days.push({
            name: dayNames[i],
            date: `(${dd}/${mm})`,
            isToday: currentDay.toDateString() === today.toDateString()
        });
    }

    return days;
};

export default function WeeklyCalendar({ schedules = [] }: WeeklyCalendarProps) {
    const PIXELS_PER_HOUR = 50;
    const START_HOUR_OF_DAY = 6;

    const daysOfWeek = useMemo(() => generateCurrentWeek(), []);

    const parseTimeToDecimal = (timeStr: string) => {
        if (!timeStr) return 0;
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours + (minutes / 60);
    };


    const getColumnIndex = (dayOfWeek: number) => {

        return dayOfWeek;
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans w-full overflow-auto custom-scrollbar">
            <div className="min-w-[750px] flex flex-col h-full relative">

                {/* Header Lịch */}
                <div className="flex border-b border-gray-200 shrink-0 bg-[#f9fafb] sticky top-0 z-40 shadow-sm">
                    <div className="w-[60px] md:w-[70px] shrink-0 border-r border-gray-200 bg-[#f9fafb] sticky left-0 z-50"></div>
                    <div className="flex flex-1 grid grid-cols-7">
                        {daysOfWeek.map((day, idx) => (
                            <div key={idx} className="flex flex-col items-center justify-center py-2 border-r border-gray-200 last:border-r-0">
                                <span className="text-[11px] md:text-xs font-bold text-gray-600 uppercase tracking-tight">{day.name}</span>
                                <span className={cn(
                                    "text-[10px] md:text-[11px] mt-0.5",
                                    day.isToday ? "text-white bg-emerald-600 px-1.5 rounded font-bold shadow-sm" : "text-emerald-700 font-medium"
                                )}>
                                    {day.date}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Khung Body Lưới */}
                <div className="flex-1 relative bg-white">
                    <div className="flex h-full relative">
                        {/* Cột thời gian bên trái */}
                        <div className="w-[60px] md:w-[70px] shrink-0 flex flex-col border-r border-gray-200 bg-[#fbfbfb] sticky left-0 z-30">
                            {timeSlots.map((time, idx) => (
                                <div key={idx} className="relative border-b border-transparent" style={{ height: `${PIXELS_PER_HOUR}px` }}>
                                    <span className="absolute -top-[9px] right-2 text-[10px] font-medium text-gray-500 bg-[#fbfbfb] px-0.5">
                                        {time}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Vùng Lưới và Sự Kiện */}
                        <div className="flex-1 relative">
                            <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                                {timeSlots.map((_, idx) => (
                                    <div key={idx} className="border-b border-gray-100 w-full" style={{ height: `${PIXELS_PER_HOUR}px` }}></div>
                                ))}
                            </div>

                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0 h-full">
                                {daysOfWeek.map((_, idx) => (
                                    <div key={idx} className="border-r border-gray-100 h-full w-full last:border-r-0 border-dashed" />
                                ))}
                            </div>

                            {/* Render Môn Học */}
                            <div className="absolute inset-0 grid grid-cols-7 h-full z-10 pointer-events-none">
                                {daysOfWeek.map((_, colIdx) => (
                                    <div key={colIdx} className="relative w-full h-full">
                                        {schedules
                                            .filter(c => getColumnIndex(c.dayOfWeek) === colIdx)
                                            .map(cls => {
                                                const startHour = parseTimeToDecimal(cls.startTime);
                                                const endHour = parseTimeToDecimal(cls.endTime);
                                                const duration = endHour - startHour;

                                                const top = (startHour - START_HOUR_OF_DAY) * PIXELS_PER_HOUR;
                                                const height = duration * PIXELS_PER_HOUR;

                                                const themeColor = cls.colorTheme || "bg-emerald-50 border-emerald-500 text-emerald-800";

                                                return (
                                                    <div
                                                        key={cls.scheduleId}
                                                        className={cn(
                                                            "absolute left-1 right-1 rounded-md border-l-4 p-1.5 shadow-sm cursor-pointer pointer-events-auto transition-all hover:shadow-md hover:scale-[1.01] z-20 flex flex-col overflow-hidden",
                                                            themeColor
                                                        )}
                                                        style={{top: `${top + 1}px`, height: `${height - 2}px`}}
                                                    >
                                                        <span
                                                            className="font-bold text-[10px] md:text-xs leading-tight mb-1 text-gray-900 line-clamp-2"
                                                            title={cls.courseName || cls.offeringName}>
                                                            {cls.courseName || cls.offeringName}
                                                        </span>
                                                        <span
                                                            className="text-[9px] md:text-[10px] font-medium text-gray-700 leading-tight line-clamp-2">
                                                            {cls.room}
                                                        </span>
                                                        <span
                                                            className="text-[9px] md:text-[10px] font-medium text-gray-700 leading-tight line-clamp-2">
                                                                giờ bắt đầu {cls.startTime ? cls.startTime.slice(0, 5) : ''}h
                                                            </span>
                                                        <span
                                                            className="text-[9px] md:text-[10px] font-medium text-gray-700 leading-tight line-clamp-2">
                                                                giờ kết thúc {cls.endTime ? cls.endTime.slice(0, 5) : ''}h
                                                            </span>
                                                        <span
                                                            className="text-[8px] md:text-[9px] font-bold opacity-80 mt-auto uppercase w-fit bg-white/50 px-1 rounded">
                                                            {cls.classType}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}