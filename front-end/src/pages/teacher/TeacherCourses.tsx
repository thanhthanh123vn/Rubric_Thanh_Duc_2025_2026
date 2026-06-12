import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Edit2, Loader2, Search, Trash2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";

import courseService from '../admin/api/courseService';
import type { TeacherCourseItem } from './teacherCourseData';

const colorClasses = [
  "from-emerald-600 to-teal-500",
  "from-cyan-600 to-blue-500",
  "from-violet-600 to-fuchsia-500",
  "from-orange-500 to-red-500",
];

type SemesterGroup = {
  key: string;
  label: string;
  semesterCode: string;
  statusLabel: string;
  statusClassName: string;
  sortYear: number;
  sortSemester: number;
  statusOrder: number;
  courses: TeacherCourseItem[];
  totalStudents: number;
};

function getAcademicYearSortValue(academicYear?: string) {
  if (!academicYear) return 0;
  const match = academicYear.match(/(\d{4})\D+(\d{4})/);
  if (match) return Number(match[2]);
  const singleYear = academicYear.match(/(\d{4})/);
  return singleYear ? Number(singleYear[1]) : 0;
}

function getSemesterSortValue(semester?: string) {
  if (!semester) return 0;
  const match = semester.match(/(\d+)/);
  return match ? Number(match[1]) : 0;
}

function getSemesterCode(semester?: string) {
  return (semester || 'Học kỳ').trim();
}

function getSemesterLabel(course: TeacherCourseItem) {
  const semester = getSemesterCode(course.semester);
  const academicYear = (course.academicYear || '').trim();
  return academicYear ? `${semester} ${academicYear}` : semester;
}

function getCourseStatus(course: TeacherCourseItem) {
  const now = new Date();
  const startDate = course.startDate ? new Date(course.startDate) : null;
  const endDate = course.endDate ? new Date(course.endDate) : null;
  const rawStatus = (course.status || '').toUpperCase();

  if (endDate && endDate < now) {
    return {
      label: 'Đã đóng',
      order: 2,
      className: 'bg-slate-100 text-slate-700',
    };
  }

  if (startDate && startDate > now) {
    return {
      label: 'Sắp tới',
      order: 1,
      className: 'bg-amber-100 text-amber-700',
    };
  }

  if (rawStatus === 'CLOSED') {
    return {
      label: 'Đã đóng',
      order: 2,
      className: 'bg-slate-100 text-slate-700',
    };
  }

  return {
    label: 'Đang diễn ra',
    order: 0,
    className: 'bg-green-100 text-green-700',
  };
}

export default function TeacherCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [selectedSemesterKey, setSelectedSemesterKey] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);

  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getLecturerDashBoardCourses();

      const coursesWithColor = (data || []).map((course: TeacherCourseItem, index: number) => ({
        ...course,
        colorClass: colorClasses[index % colorClasses.length]
      }));

      setCourses(coursesWithColor);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
      toast.error("Không thể tải danh sách môn học.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (editingCourse) {
        await courseService.updateCourse(editingCourse.courseId || editingCourse.id, courseData);
        toast.success("Cập nhật môn học thành công!");
      } else {
        await courseService.createCourse(courseData);
        toast.success("Thêm môn học thành công!");
      }
      fetchCourses();
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    }
  };

  const handleDelete = async (course: any) => {
    const courseId = course.courseId || course.id;
    if (window.confirm(`Bạn có chắc chắn muốn xóa môn học "${course.courseName}" không?`)) {
      try {
        await courseService.deleteCourse(courseId);
        toast.success("Xóa môn học thành công!");
        fetchCourses();
      } catch (error) {
        toast.error("Không thể xóa môn học!");
      }
    }
  };

  const openAddModal = () => {
    setEditingCourse(null);
    setIsModalOpen(true);
  };

  const openEditModal = (course: any) => {
    setEditingCourse(course);
    setIsModalOpen(true);
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      [course.courseName, course.courseCode, course.semester, course.academicYear, course.offeringId]
        .filter(Boolean)
        .some((value) => value.toString().toLowerCase().includes(q))
    );
  }, [search, courses]);

  const semesterGroups = useMemo<SemesterGroup[]>(() => {
    const grouped = new Map<string, TeacherCourseItem[]>();

    filtered.forEach((course) => {
      const key = getSemesterLabel(course);
      const existing = grouped.get(key) || [];
      existing.push(course);
      grouped.set(key, existing);
    });

    return Array.from(grouped.entries())
      .map(([key, groupCourses]) => {
        const firstCourse = groupCourses[0];
        const topStatus = groupCourses.map(getCourseStatus).sort((a, b) => a.order - b.order)[0];

        return {
          key,
          label: key,
          semesterCode: getSemesterCode(firstCourse.semester),
          statusLabel: topStatus.label,
          statusClassName: topStatus.className,
          sortYear: getAcademicYearSortValue(firstCourse.academicYear),
          sortSemester: getSemesterSortValue(firstCourse.semester),
          statusOrder: topStatus.order,
          totalStudents: groupCourses.reduce((sum, course) => sum + (course.studentCount || 0), 0),
          courses: groupCourses.slice().sort((a, b) => a.courseName.localeCompare(b.courseName, 'vi')),
        };
      })
      .sort((a, b) => {
        if (b.sortYear !== a.sortYear) return b.sortYear - a.sortYear;
        if (b.sortSemester !== a.sortSemester) return b.sortSemester - a.sortSemester;
        if (a.statusOrder !== b.statusOrder) return a.statusOrder - b.statusOrder;
        return a.label.localeCompare(b.label, 'vi');
      });
  }, [filtered]);

  useEffect(() => {
    if (semesterGroups.length === 0) {
      if (selectedSemesterKey) setSelectedSemesterKey('');
      return;
    }

    if (!semesterGroups.some((group) => group.key === selectedSemesterKey)) {
      setSelectedSemesterKey(semesterGroups[0].key);
    }
  }, [semesterGroups, selectedSemesterKey]);

  const selectedSemester =
    semesterGroups.find((group) => group.key === selectedSemesterKey) || semesterGroups[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-green-700">Môn học được phân công</p>
          <h3 className="mt-1 text-2xl font-bold text-slate-900">Phân công môn học theo học kỳ</h3>
          <p className="mt-2 text-sm text-slate-600">
            Chọn một học kỳ để xem toàn bộ môn học đang được phân công cho giảng viên.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white transition-colors hover:bg-green-800"
        >
          + Tạo học phần
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo môn học, mã lớp, học kỳ..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-green-700" />
          <p className="font-medium text-slate-500">Đang tải môn học được phân công...</p>
        </div>
      ) : semesterGroups.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
          <p className="font-medium text-slate-500">Không tìm thấy môn học phù hợp.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {semesterGroups.map((group) => (
              <button
                key={group.key}
                type="button"
                onClick={() => setSelectedSemesterKey(group.key)}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  selectedSemester?.key === group.key
                    ? 'border-green-700 bg-green-50'
                    : 'border-slate-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-600">{group.label}</p>
                    <h4 className="mt-1 text-lg font-bold text-slate-900">{group.semesterCode}</h4>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${group.statusClassName}`}>
                    {group.statusLabel}
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-xs font-medium text-slate-600">Môn học</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">{group.courses.length}</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-2 text-center">
                    <p className="text-xs font-medium text-green-700">Sinh viên</p>
                    <p className="mt-1 text-lg font-bold text-green-700">{group.totalStudents}</p>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-2 text-center">
                    <p className="text-xs font-medium text-slate-600">OBE TB</p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {Math.round(
                        group.courses.reduce((sum, course) => sum + (course.obeProgress || 0), 0) / group.courses.length
                      )}
                      %
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {selectedSemester ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    Danh sách môn học - {selectedSemester.label}
                  </h4>
                  <p className="mt-1 text-sm text-slate-600">
                    {selectedSemester.courses.length} môn học, {selectedSemester.totalStudents} sinh viên
                  </p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${selectedSemester.statusClassName}`}>
                  {selectedSemester.statusLabel}
                </span>
              </div>

              <div className="mt-6 space-y-3">
                {selectedSemester.courses.map((course) => (
                  <div
                    key={course.offeringId}
                    className="rounded-xl border border-slate-200 p-4 transition-colors hover:border-green-300 hover:bg-green-50/30"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h5 className="font-bold text-slate-900">{course.courseName}</h5>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                            {course.courseCode}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <BookOpen className="h-4 w-4" />
                            {course.offeringId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {course.studentCount || 0} sinh viên
                          </span>
                          <span>OBE {course.obeProgress || 0}%</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEditModal(course);
                          }}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-green-700"
                          title="Chỉnh sửa môn học"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(course);
                          }}
                          className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-rose-600"
                          title="Xóa môn học"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/teacher/course/${course.offeringId}`)}
                          className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
                        >
                          Vào lớp
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </>
      )}

      <CourseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCourse}
        initialData={editingCourse}
      />
    </div>
  );
}

interface CourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: any) => void;
  initialData?: any;
}

function CourseModal({ isOpen, onClose, onSave, initialData }: CourseModalProps) {
  const [formData, setFormData] = useState({
    courseCode: '',
    courseName: '',
    semester: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        courseCode: initialData.courseCode || '',
        courseName: initialData.courseName || '',
        semester: initialData.semester || '',
        description: initialData.description || ''
      });
    } else {
      setFormData({ courseCode: '', courseName: '', semester: '', description: '' });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave(formData);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
        <h3 className="mb-5 text-xl font-bold text-slate-900">
          {initialData ? 'Chỉnh sửa học phần' : 'Tạo học phần mới'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-slate-700">Mã môn học</label>
            <input
              required
              value={formData.courseCode}
              onChange={(e) => setFormData({ ...formData, courseCode: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="VD: COMP101"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Tên môn học</label>
            <input
              required
              value={formData.courseName}
              onChange={(e) => setFormData({ ...formData, courseName: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="VD: Nhập môn Lập trình"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Học kỳ</label>
            <input
              required
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none transition-all focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="VD: HK1 2025-2026"
            />
          </div>

          <div className="mt-8 flex justify-end gap-3 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-70"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {initialData ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
