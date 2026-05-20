import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Search, Loader2, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import courseService from '../admin/api/courseService';
import { toast } from "sonner";

const colorClasses = [
  "from-emerald-600 to-teal-500",
  "from-cyan-600 to-blue-500",
  "from-violet-600 to-fuchsia-500",
  "from-orange-500 to-red-500",
];

export default function TeacherCourses() {
  const [search, setSearch] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // State quản lý Modal Thêm/Sửa
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);


  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getTeacherCourses();

      const coursesWithColor = (data || []).map((course: any, index: number) => ({
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
        [course.courseName, course.courseCode, course.semester, course.offeringId]
            .filter(Boolean)
            .some((value) => value.toString().toLowerCase().includes(q))
    );
  }, [search, courses]);

  return (
      <div className="space-y-4 md:space-y-6 animate-in fade-in duration-500 pb-20 md:pb-0 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">

        {/* HEADER HERO SECTION */}
        <section className="flex flex-col lg:grid lg:grid-cols-[1.3fr_0.7fr] gap-4 md:gap-6">
          {/* Banner chính */}
          <div className="rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-emerald-700 via-emerald-600 to-teal-500 p-6 md:p-8 text-white shadow-xl shadow-emerald-900/10 flex flex-col justify-center">
            <p className="text-[10px] md:text-xs font-semibold uppercase tracking-[0.28em] text-emerald-50/80">Học phần phụ trách</p>
            <h3 className="mt-2 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Xem nhanh tất cả học phần đang giảng dạy.
            </h3>
            <p className="mt-3 md:mt-4 max-w-2xl text-sm leading-relaxed text-emerald-50 md:text-base">
              Giao diện tập trung vào quyền quản trị của giảng viên: vào từng học phần để quản lý sinh viên, rubric, bài tập, OBE và dự án.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <button
                  onClick={openAddModal}
                  className="w-full sm:w-auto rounded-xl sm:rounded-full bg-white px-5 py-3 text-sm font-bold text-emerald-700 shadow-lg shadow-black/10 transition-transform active:scale-95"
              >
                Tạo học phần mới
              </button>
              <button className="w-full sm:w-auto rounded-xl sm:rounded-full border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white backdrop-blur transition-transform active:scale-95">
                Import danh sách
              </button>
            </div>
          </div>

          {/* Cụm Thống kê */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-3 md:gap-4">
            {[
              { label: 'Lớp đang phụ trách', value: courses.length.toString() },
              { label: 'Tổng sinh viên', value: '164' },
              { label: 'Rubric sử dụng', value: '18' },
            ].map((item, i) => (
                <div key={item.label} className={`rounded-[1.25rem] md:rounded-[1.75rem] border border-slate-200/70 bg-white p-4 md:p-5 shadow-sm flex flex-col justify-center ${i === 0 ? 'col-span-2 sm:col-span-1 lg:col-span-1' : ''}`}>
                  <p className="text-xs md:text-sm font-medium text-slate-500 line-clamp-1">{item.label}</p>
                  <p className="mt-1 md:mt-2 text-2xl md:text-3xl font-black text-slate-900">{item.value}</p>
                </div>
            ))}
          </div>
        </section>

        {/* SEARCH BAR */}
        <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-3 md:p-4 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 rounded-xl md:rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:px-4 md:py-3 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 transition-all">
            <Search className="h-4 w-4 md:h-5 md:w-5 text-slate-400 shrink-0" />
            <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm môn học, mã lớp..."
                className="w-full bg-transparent text-sm md:text-base outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* COURSE GRID */}
        {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
              <p className="text-sm md:text-base text-slate-500 font-medium">Đang tải lớp học...</p>
            </div>
        ) : filtered.length === 0 ? (
            <div className="rounded-[1.5rem] md:rounded-[2rem] border border-slate-200 bg-white p-10 md:p-12 text-center shadow-sm">
              <p className="text-sm md:text-base text-slate-500 font-medium">Không tìm thấy lớp học phần nào phù hợp.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
              {filtered.map((course) => (
                  <div key={course.offeringId || course.id} className="flex flex-col overflow-hidden rounded-[1.5rem] md:rounded-[1.75rem] border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl group">
                    {/* Banner Môn Học */}
                    <div className={`h-20 md:h-24 bg-gradient-to-r ${course.colorClass} relative shrink-0`}>
                      <div className="absolute right-3 top-3 md:right-4 md:top-4 rounded-lg bg-white/20 px-2 py-1 md:px-3 md:py-1 text-[10px] md:text-xs font-semibold text-white backdrop-blur">
                        {course.semester || 'Học kỳ'}
                      </div>
                    </div>

                    {/* Nội dung Môn Học */}
                    <div className="flex flex-col flex-1 p-4 md:p-5">
                      <h4 className="text-base md:text-lg font-bold text-slate-900 line-clamp-1" title={course.courseName}>
                        {course.courseName}
                      </h4>
                      <p className="mt-1 text-xs md:text-sm font-medium text-slate-500">
                        {course.courseCode} • {course.offeringId}
                      </p>

                      {/* Grid 3 cột nhỏ gọn cho stats */}
                      <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">
                        <StatPill label="SV" value={course.studentCount || 0} />
                        <StatPill label="Rubric" value={course.rubricCount || 0} />
                        <StatPill label="Bài tập" value={course.assignmentCount || 0} />
                      </div>

                      <div className="mt-4 md:mt-5 space-y-2">
                        <div className="flex items-center justify-between text-xs md:text-sm">
                          <span className="text-slate-500 font-medium">Tiến độ OBE</span>
                          <span className="font-bold text-slate-900">{course.obeProgress || 0}%</span>
                        </div>
                        <div className="h-1.5 md:h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                              className={`h-full rounded-full bg-gradient-to-r ${course.colorClass}`}
                              style={{ width: `${course.obeProgress || 0}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer card */}
                      <div className="mt-auto pt-4 md:pt-5 flex items-center justify-between border-t border-slate-100">
                  <span className="text-xs md:text-sm italic font-medium text-slate-500 line-clamp-1 pr-2">
                    {course.lecturerName}
                  </span>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(course); }}
                              className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                              title="Chỉnh sửa môn học"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                              onClick={(e) => { e.stopPropagation(); handleDelete(course); }}
                              className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Xóa môn học"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                              onClick={() => navigate(`/teacher/course/${course.offeringId}`)}
                              className="inline-flex items-center gap-1.5 md:gap-2 rounded-lg md:rounded-xl bg-emerald-50 px-3 md:px-4 py-2 md:py-2 text-xs md:text-sm font-semibold text-emerald-700 transition-colors hover:bg-emerald-600 hover:text-white active:scale-95"
                          >
                            Vào lớp
                            <ArrowRight className="h-3 w-3 md:h-4 md:w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
            </div>
        )}

        {/* Render Modal thêm sửa ở cuối trang */}
        <CourseModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveCourse}
            initialData={editingCourse}
        />
      </div>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
      <div className="rounded-xl md:rounded-2xl bg-slate-50 p-2 md:p-3 text-center border border-slate-100 flex flex-col justify-center">
        <p className="text-[9px] md:text-[10px] uppercase tracking-[0.1em] md:tracking-[0.2em] text-slate-400 font-bold">{label}</p>
        <p className="mt-0.5 md:mt-1 text-sm md:text-lg font-black text-slate-900">{value}</p>
      </div>
  );
}

// ==========================================
// COMPONENT: Course Modal Form
// ==========================================
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
          <h3 className="text-xl font-bold text-slate-900 mb-5">
            {initialData ? 'Chỉnh sửa Học phần' : 'Tạo Học phần mới'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">Mã môn học</label>
              <input
                  required
                  value={formData.courseCode}
                  onChange={(e) => setFormData({...formData, courseCode: e.target.value})}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="VD: COMP101"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Tên môn học</label>
              <input
                  required
                  value={formData.courseName}
                  onChange={(e) => setFormData({...formData, courseName: e.target.value})}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="VD: Nhập môn Lập trình"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Học kỳ</label>
              <input
                  required
                  value={formData.semester}
                  onChange={(e) => setFormData({...formData, semester: e.target.value})}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  placeholder="VD: HK1 2025-2026"
              />
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl px-5 py-2.5 text-sm text-slate-600 hover:bg-slate-100 font-semibold transition-colors"
              >
                Hủy
              </button>
              <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm text-white font-semibold hover:bg-emerald-700 disabled:opacity-70 transition-colors shadow-sm"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {initialData ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </form>
        </div>
      </div>
  );
}