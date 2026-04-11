import React from 'react';
import { BookOpen, TrendingUp, CheckSquare } from 'lucide-react';

const StatCards = () => {
  const stats = [
    {
      label: 'Khóa học đăng ký',
      value: '6',
      icon: BookOpen,
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      label: 'Tiến độ trung bình',
      value: '73%',
      icon: TrendingUp,
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
    },
    {
      label: 'Rubric có sẵn',
      value: '24',
      icon: CheckSquare,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
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
