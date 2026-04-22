import React from "react";
import { cn } from "@/components/ui/utils";

// Mock Data
const mockClasses = [
    { id: 1, title: "Lập trình Java", room: "RD306-Khu Rạng Đông", type: "LT", day: 0, startHour: 7.5, duration: 2, color: "bg-emerald-50 border-emerald-500 text-emerald-800" },
    { id: 2, title: "Cơ sở dữ liệu", room: "PV322-Nhà C", type: "LT", day: 1, startHour: 13, duration: 2, color: "bg-blue-50 border-blue-500 text-blue-800" },
    { id: 3, title: "Thương mại điện tử", room: "Lab 02-Khu D", type: "TH", day: 3, startHour: 9.5, duration: 2, color: "bg-orange-50 border-orange-500 text-orange-800" },
];

const timeSlots = ["06:00","07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"];

const daysOfWeek = [
    { name: "Thứ 2", date: "(20/04)" }, { name: "Thứ 3", date: "(21/04)" },
    { name: "Thứ 4", date: "(22/04)" }, { name: "Thứ 5", date: "(23/04)", isToday: true },
    { name: "Thứ 6", date: "(24/04)" }, { name: "Thứ 7", date: "(25/04)" },
    { name: "Chủ nhật", date: "(26/04)" },
];

export default function WeeklyCalendar() {
    // Đã giảm từ 85 xuống 60 để khung lịch ngắn lại, vừa vặn màn hình hơn
    const PIXELS_PER_HOUR = 50;
    const START_HOUR_OF_DAY = 7;

    return (
        // Thêm overflow-auto để khung lịch tự cuộn cả ngang lẫn dọc nếu tràn
        <div className="flex flex-col h-full bg-white font-sans w-full overflow-auto custom-scrollbar">

            {/* Vẫn giữ min-w-[750px] để không bị bóp méo chữ trên điện thoại */}
            <div className="min-w-[750px] flex flex-col h-full relative">

                {/* Header Lịch (Dòng hiển thị Thứ/Ngày) */}
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

                {/* Khung Body Lưới (Không còn ép cứng min-h nữa) */}
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
                            {/* Đường kẻ ngang */}
                            <div className="absolute inset-0 flex flex-col pointer-events-none z-0">
                                {timeSlots.map((_, idx) => (
                                    <div key={idx} className="border-b border-gray-100 w-full" style={{ height: `${PIXELS_PER_HOUR}px` }}></div>
                                ))}
                            </div>

                            {/* Đường kẻ dọc */}
                            <div className="absolute inset-0 grid grid-cols-7 pointer-events-none z-0 h-full">
                                {daysOfWeek.map((_, idx) => (
                                    <div key={idx} className="border-r border-gray-100 h-full w-full last:border-r-0 border-dashed" />
                                ))}
                            </div>

                            {/* Render Môn Học */}
                            <div className="absolute inset-0 grid grid-cols-7 h-full z-10 pointer-events-none">
                                {daysOfWeek.map((_, colIdx) => (
                                    <div key={colIdx} className="relative w-full h-full">
                                        {mockClasses.filter(c => c.day === colIdx).map(cls => {
                                            const top = (cls.startHour - START_HOUR_OF_DAY) * PIXELS_PER_HOUR;
                                            const height = cls.duration * PIXELS_PER_HOUR;
                                            return (
                                                <div
                                                    key={cls.id}
                                                    className={cn(
                                                        "absolute left-1 right-1 rounded-md border-l-4 p-1.5 shadow-sm cursor-pointer pointer-events-auto transition-all hover:shadow-md hover:scale-[1.01] z-20 flex flex-col overflow-hidden",
                                                        cls.color
                                                    )}
                                                    style={{ top: `${top + 1}px`, height: `${height - 2}px` }}
                                                >
                                                    <span className="font-bold text-[10px] md:text-xs leading-tight mb-1 text-gray-900 line-clamp-2">
                                                        {cls.title}
                                                    </span>
                                                    <span className="text-[9px] md:text-[10px] font-medium text-gray-700 leading-tight line-clamp-2">
                                                        {cls.room}
                                                    </span>
                                                    <span className="text-[8px] md:text-[9px] font-bold opacity-80 mt-auto uppercase w-fit bg-white/50 px-1 rounded">
                                                        {cls.type}
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