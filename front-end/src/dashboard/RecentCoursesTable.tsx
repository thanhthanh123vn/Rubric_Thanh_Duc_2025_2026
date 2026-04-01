import React from 'react';
import { ChevronRight } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  name: string;
  instructor: string;
  progress: number;
  status: 'In Progress' | 'Completed' | 'Not Started';
}

interface RecentCoursesTableProps {
  courses: Course[];
}

const RecentCoursesTable: React.FC<RecentCoursesTableProps> = ({ courses }) => {
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress === 100) return 'bg-green-500';
    if (progress >= 75) return 'bg-emerald-500';
    if (progress >= 50) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-900">Recent Courses</h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Course Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Instructor</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Progress</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700"></th>
            </tr>
          </thead>
          <tbody>
            {courses.map((course) => (
              <tr key={course.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-emerald-600">{course.code}</td>
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">{course.name}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{course.instructor}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${getProgressColor(course.progress)} transition-all`}
                        style={{ width: `${course.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{course.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(course.status)}`}>
                    {course.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                    <ChevronRight size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentCoursesTable;
