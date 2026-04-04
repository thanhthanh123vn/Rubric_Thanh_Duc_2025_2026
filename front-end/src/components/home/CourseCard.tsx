import React from 'react';
import { FileCheck, TrendingUp } from 'lucide-react';

interface CourseCardProps {
  courseTitle: string;
  lecturerName: string;
  obeProgress: number;
  semester: string;

  colorClass?: string;
}

const CourseCard: React.FC<CourseCardProps> = ({
                                                 courseTitle,
                                                 lecturerName,
                                                 obeProgress,
                                                 semester,
                                                 colorClass = "from-emerald-600 to-emerald-500" // Mặc định là xanh Nông Lâm
                                               }) => {
  return (
      // Thêm Shadow nhẹ và bo góc tròn hơn (rounded-xl)
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 group">

        {/* Header với Gradient tùy chỉnh */}
        <div className={`h-24 bg-gradient-to-r ${colorClass} relative`}>
          <div className="absolute top-4 right-4 bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
            <FileCheck className="w-5 h-5 text-white" />
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5">
          <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-emerald-700 transition-colors">
            {courseTitle}
          </h3>
          <p className="text-sm text-gray-500 mb-4">{semester}</p>

          <div className="space-y-4">
            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Tiến độ OBE</span>
                <span className="font-bold text-gray-900">{obeProgress}%</span>
              </div>
              {/* Thanh Progress dùng Tailwind thuần cho nhanh */}
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                    className={`h-2 rounded-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                    style={{ width: `${obeProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-sm">
              <span className="text-gray-500 italic">{lecturerName}</span>
              <button className="text-emerald-700 font-semibold hover:underline">
                Chi tiết
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CourseCard;