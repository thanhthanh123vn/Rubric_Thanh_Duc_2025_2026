import React, { useEffect, useState } from 'react';
import { BookOpen, TrendingUp, CheckSquare, Loader2 } from 'lucide-react';
import axios from 'axios';
import {rubricApi} from "@/api/RubricApi.ts";

interface DashboardOverview {
  enrolledCoursesCount: number;
  averageProgress: number;
  rubricsCount: number;
}

const StatCards = () => {
  const [data, setData] = useState<DashboardOverview>({
    enrolledCoursesCount: 0,
    averageProgress: 0,
    rubricsCount: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchDashboardOverview = async () => {
      try {
        setLoading(true);
        const response = await rubricApi.getOverview();
        setData(response);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu tổng quan dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardOverview();
  }, []);

  const stats = [
    {
      label: 'Khóa học đăng ký',
      value: loading ? '...' : `${data.enrolledCoursesCount}`,
      icon: BookOpen,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Tiến độ trung bình',
      value: loading ? '...' : `${data.averageProgress}%`,
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Rubric có sẵn',
      value: loading ? '...' : `${data.rubricsCount}`,
      icon: CheckSquare,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative">
                {loading && index === 0 && (
                    <div className="absolute top-4 right-4">
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    </div>
                )}
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon size={24} className={stat.iconColor} />
                  </div>
                </div>
              </div>
          );
        })}
      </div>
  );
};

export default StatCards;