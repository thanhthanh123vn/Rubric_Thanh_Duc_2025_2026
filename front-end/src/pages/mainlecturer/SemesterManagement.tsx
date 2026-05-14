import { ChevronRight, Users, BookOpen, Clock } from 'lucide-react';
import { useState } from 'react';

interface Semester {
  id: string;
  code: string;
  name: string;
  year: number;
  status: 'active' | 'pending' | 'completed';
  startDate: string;
  endDate: string;
  courseCount: number;
  assignedTeachers: number;
  totalTeachers: number;
}

const semesters: Semester[] = [
  {
    id: '1',
    code: 'HK2',
    name: 'Học kỳ 2',
    year: 2026,
    status: 'active',
    startDate: '2026-02-15',
    endDate: '2026-05-30',
    courseCount: 24,
    assignedTeachers: 18,
    totalTeachers: 20,
  },
  {
    id: '2',
    code: 'HK1',
    name: 'Học kỳ 1',
    year: 2026,
    status: 'pending',
    startDate: '2026-09-01',
    endDate: '2026-12-20',
    courseCount: 28,
    assignedTeachers: 0,
    totalTeachers: 20,
  },
  {
    id: '3',
    code: 'HK3',
    name: 'Học kỳ 3',
    year: 2025,
    status: 'completed',
    startDate: '2025-06-01',
    endDate: '2025-08-31',
    courseCount: 12,
    assignedTeachers: 12,
    totalTeachers: 12,
  },
];

interface CourseAssignment {
  courseId: string;
  courseName: string;
  classCount: number;
  assignedTeacher?: string;
  status: 'pending' | 'assigned' | 'in-progress' | 'completed';
}

const courseAssignments: CourseAssignment[] = [
  { courseId: '1', courseName: 'Lập trình C++', classCount: 3, assignedTeacher: 'Nguyễn Văn A', status: 'assigned' },
  { courseId: '2', courseName: 'Cơ sở dữ liệu', classCount: 2, assignedTeacher: 'Trần Thị B', status: 'assigned' },
  { courseId: '3', courseName: 'Web Development', classCount: 2, assignedTeacher: 'Lê Văn C', status: 'assigned' },
  { courseId: '4', courseName: 'Đồ án I', classCount: 1, status: 'pending' },
];

export default function SemesterManagement() {
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Quản lý phân công</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Phân công giáo viên theo Học kì</h3>
      </div>

      {/* Semesters Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {semesters.map((semester) => (
          <div
            key={semester.id}
            onClick={() => setSelectedSemester(semester)}
            className={`cursor-pointer rounded-xl border-2 p-4 transition-all ${
              selectedSemester?.id === semester.id
                ? 'border-indigo-600 bg-indigo-50'
                : 'border-slate-200 bg-white hover:border-indigo-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-600">{semester.code} {semester.year}</p>
                <h4 className="mt-1 text-lg font-bold text-slate-900">{semester.name}</h4>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  semester.status === 'active'
                    ? 'bg-green-100 text-green-700'
                    : semester.status === 'pending'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                {semester.status === 'active' ? 'Đang diễn ra' : semester.status === 'pending' ? 'Sắp tới' : 'Hoàn tất'}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-2 text-center">
                <p className="text-xs font-medium text-slate-600">Môn học</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{semester.courseCount}</p>
              </div>
              <div className="rounded-lg bg-indigo-50 p-2 text-center">
                <p className="text-xs font-medium text-indigo-600">GV phân công</p>
                <p className="mt-1 text-lg font-bold text-indigo-700">{semester.assignedTeachers}</p>
              </div>
              <div className="rounded-lg bg-purple-50 p-2 text-center">
                <p className="text-xs font-medium text-purple-600">Tổng GV</p>
                <p className="mt-1 text-lg font-bold text-purple-700">{semester.totalTeachers}</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {new Date(semester.startDate).toLocaleDateString('vi-VN')} - {new Date(semester.endDate).toLocaleDateString('vi-VN')}
            </p>
          </div>
        ))}
      </div>

      {/* Course Assignments */}
      {selectedSemester && (
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">
                Phân công môn học - {selectedSemester.code} {selectedSemester.year}
              </h4>
              <p className="mt-1 text-sm text-slate-600">
                {selectedSemester.courseCount} môn học, {selectedSemester.assignedTeachers}/{selectedSemester.totalTeachers} giáo viên
              </p>
            </div>
            <button className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-white font-medium hover:bg-indigo-700">
              + Phân công
            </button>
          </div>

          {/* Course List */}
          <div className="mt-6 space-y-3">
            {courseAssignments.map((course) => (
              <div key={course.courseId} className="rounded-xl border border-slate-200 p-4 hover:border-indigo-300 hover:bg-indigo-50/30 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-bold text-slate-900">{course.courseName}</h5>
                    <div className="mt-2 flex items-center gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.classCount} lớp
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.assignedTeacher || 'Chưa gán'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        course.status === 'assigned'
                          ? 'bg-green-100 text-green-700'
                          : course.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-700'
                          : course.status === 'completed'
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {course.status === 'assigned'
                        ? 'Đã phân công'
                        : course.status === 'in-progress'
                        ? 'Đang dạy'
                        : course.status === 'completed'
                        ? 'Hoàn tất'
                        : 'Chờ phân công'}
                    </span>
                    <button className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Statistics */}
          <div className="mt-6 grid grid-cols-4 gap-3 rounded-lg bg-slate-50 p-4">
            <div className="text-center">
              <Clock className="mx-auto h-5 w-5 text-amber-600" />
              <p className="mt-2 text-sm font-medium text-slate-600">Chờ phân công</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {courseAssignments.filter(c => c.status === 'pending').length}
              </p>
            </div>
            <div className="text-center">
              <Users className="mx-auto h-5 w-5 text-green-600" />
              <p className="mt-2 text-sm font-medium text-slate-600">Đã phân công</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {courseAssignments.filter(c => c.status === 'assigned' || c.status === 'in-progress').length}
              </p>
            </div>
            <div className="text-center">
              <BookOpen className="mx-auto h-5 w-5 text-indigo-600" />
              <p className="mt-2 text-sm font-medium text-slate-600">Tổng môn</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{courseAssignments.length}</p>
            </div>
            <div className="text-center">
              <span className="text-2xl">📊</span>
              <p className="mt-2 text-sm font-medium text-slate-600">Hoàn thành</p>
              <p className="mt-1 text-xl font-bold text-slate-900">
                {Math.round(
                  ((courseAssignments.filter(c => c.status !== 'pending').length) / courseAssignments.length) * 100
                )}
                %
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
