import React from "react";
import { cn } from "@/components/ui/utils"; // Hàm gộp class của shadcn (nếu có)

// --- MOCK DATA (Thay thế bằng data từ API của bạn) ---
// day: 0 (Thứ 2) -> 6 (Chủ nhật)
// startHour: Tính theo định dạng số thập phân (ví dụ: 8.5 là 8:30 AM, 13.0 là 1:00 PM)
// duration: Thời lượng học tính bằng giờ (ví dụ: 1.5 là 1 tiếng rưỡi)
const mockClasses = [
    { id: 1, title: "COMP 101", room: "Room 302", type: "lecture", day: 0, startHour: 9, duration: 1.5, color: "bg-blue-50 border-blue-500 text-blue-700 hover:bg-blue-100" },
    { id: 2, title: "MATH 202", room: "Room 105", type: "seminar", day: 1, startHour: 10, duration: 2, color: "bg-orange-50 border-orange-500 text-orange-700 hover:bg-orange-100" },
    { id: 3, title: "PHYS 301", room: "Lab 2", type: "lab", day: 2, startHour: 13, duration: 3, color: "bg-emerald-50 border-emerald-500 text-emerald-700 hover:bg-emerald-100" },
    { id: 4, title: "ENG 105", room: "Room 201", type: "lecture", day: 3, startHour: 8.5, duration: 1.5, color: "bg-purple-50 border-purple-500 text-purple-700 hover:bg-purple-100" },
    { id: 5, title: "HIST 201", room: "Room 404", type: "seminar", day: 4, startHour: 11, duration: 1.5, color: "bg-rose-50 border-rose-500 text-rose-700 hover:bg-rose-100" },
];

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM"
];

const daysOfWeek = [
    { name: "MON", date: "15" },
    { name: "TUE", date: "16" },
    { name: "WED", date: "17" },
    { name: "THU", date: "18", isToday: true }, // Giả lập hôm nay là thứ 5
    { name: "FRI", date: "19" },
    { name: "SAT", date: "20" },
    { name: "SUN", date: "21" },
];

export default function WeeklyCalendar() {
    // Cấu hình chiều cao cho mỗi 1 giờ học (pixel)
    // Nếu bạn muốn lịch giãn ra hoặc thu lại, chỉ cần đổi số này
    const PIXELS_PER_HOUR = 80;
    const START_HOUR_OF_DAY = 8; // Bắt đầu từ 8:00 AM

    return (
        <div className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm font-sans min-h-[600px]">

            {/* --- PHẦN HEADER: CÁC NGÀY TRONG TUẦN --- */}
            <div className="flex border-b border-gray-200 shrink-0 bg-white z-20 sticky top-0">
                {/* Góc trống bên trái cho cột thời gian */}
                <div className="w-16 md:w-20 shrink-0 border-r border-gray-200"></div>

                {/* Cột các ngày */}
                <div className="flex flex-1 grid grid-cols-7">
                    {daysOfWeek.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center justify-center py-3 border-r border-gray-200 last:border-r-0">
              <span className={cn(
                  "text-xs font-semibold mb-1 tracking-wider",
                  day.isToday ? "text-emerald-600" : "text-gray-400"
              )}>
                {day.name}
              </span>
                            <span className={cn(
                                "text-lg font-bold w-8 h-8 flex items-center justify-center rounded-full transition-colors",
                                day.isToday ? "bg-emerald-600 text-white shadow-sm" : "text-gray-700"
                            )}>
                {day.date}
              </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- PHẦN BODY: LƯỚI THỜI GIAN VÀ SỰ KIỆN (SCROLLABLE) --- */}
            <div className="flex flex-1 overflow-y-auto relative bg-white min-h-0">

                {/* 1. Cột thời gian cố định bên trái (8:00 AM - 5:00 PM) */}
                <div className="w-16 md:w-20 shrink-0 flex flex-col border-r border-gray-200 bg-white sticky left-0 z-10">
                    {timeSlots.map((time, idx) => (
                        <div
                            key={idx}
                            className="border-b border-transparent relative"
                            style={{ height: `${PIXELS_PER_HOUR}px` }}
                        >
                            {/* Kéo label giờ lên một chút để nằm ngay đường kẻ ngang */}
                            <span className="absolute -top-3 right-3 text-[11px] font-medium text-gray-400">
                {time}
              </span>
                        </div>
                    ))}
                </div>

                {/* 2. Lưới Background (Đường kẻ ngang và dọc) */}
                <div className="flex-1 relative">

                    {/* Đường kẻ ngang (Tương ứng với mỗi giờ) */}
                    <div className="absolute inset-0 flex flex-col pointer-events-none">
                        {timeSlots.map((_, idx) => (
                            <div
                                key={`hline-${idx}`}
                                className="border-b border-gray-100 w-full"
                                style={{ height: `${PIXELS_PER_HOUR}px` }}
                            />
                        ))}
                    </div>

                    {/* Đường kẻ dọc (Chia 7 ngày) và Vùng chứa Sự kiện */}
                    <div className="absolute inset-0 grid grid-cols-7 h-full">

                        {/* Các đường kẻ dọc mờ */}
                        {daysOfWeek.map((_, idx) => (
                            <div key={`vline-${idx}`} className="border-r border-gray-100 h-full w-full last:border-r-0" />
                        ))}

                        {/* --- 3. RENDER CÁC KHỐI SỰ KIỆN --- */}
                        {mockClasses.map((cls) => {

                            const topPosition = (cls.startHour - START_HOUR_OF_DAY) * PIXELS_PER_HOUR;
                            // Công thức tính Chiều cao của khối
                            const height = cls.duration * PIXELS_PER_HOUR;

                            return (
                                <div
                                    key={cls.id}
                                    className={cn(
                                        "absolute rounded-lg border-l-4 p-2 mx-1 flex flex-col shadow-sm cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] z-20 overflow-hidden",
                                        cls.color
                                    )}
                                    style={{
                                        // Tính cột ngày (0 -> 6)
                                        left: `calc(${(cls.day * 100) / 7}%)`,
                                        width: `calc(100% / 7 - 8px)`, // Trừ hao 8px lề (mx-1)
                                        top: `${topPosition}px`,
                                        height: `${height}px`,
                                    }}
                                >
                  <span className="font-bold text-xs md:text-sm leading-tight mb-0.5 truncate">
                    {cls.title}
                  </span>
                                    <span className="text-[10px] md:text-xs opacity-80 leading-tight flex-1 truncate">
                    {cls.room}
                  </span>
                                    <span className="text-[9px] md:text-[10px] font-semibold opacity-90 uppercase mt-auto truncate">
                    {cls.type}
                  </span>
                                </div>
                            );
                        })}

                    </div>
                </div>
            </div>
        </div>
    );
}