import { Users, UserPlus, Trash2, X } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { courseService } from "@/features/course/courseApi.ts";
import { useEffect, useState, useCallback } from "react";
import type { Type } from "@/features/course/student/api/type.ts";
import { toast } from "sonner";
export default function TeacherCourseStudents() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<Type[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // State cho Modal thêm sinh viên
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStudentId, setNewStudentId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  const fetchStudents = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await courseService.getStudentsByOffering(id);
      setStudents(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách sinh viên:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    console.log("id:", id);
     fetchStudents();
  }, [fetchStudents]);


  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !newStudentId.trim()) return;

    setIsSubmitting(true);
    try {
      await courseService.enrollCourse(newStudentId.trim(), id);
      await fetchStudents();
      toast.success("Thêm sinh viên thành công!");
      setNewStudentId("");
      setIsAddModalOpen(false);

    } catch (error) {
      console.error("Lỗi khi thêm sinh viên:", error);
      toast.error("Thêm sinh viên thất bại. Vui lòng kiểm tra lại mã SV.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý xóa sinh viên
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!id) return;
    const confirmDelete = window.confirm(`Bạn có chắc chắn muốn xóa sinh viên ${studentName} khỏi lớp này không?`);
    if (!confirmDelete) return;

    try {
      await courseService.unenrollCourse(studentId, id);
      toast.success("Xóa sinh viên thành công!");
      await fetchStudents();
    } catch (error) {
      console.error("Lỗi khi xóa sinh viên:", error);
      toast.error("Xóa sinh viên thất bại!");
    }
  };

  const filtered = students.filter((s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-emerald-600">
                  Sinh viên
                </p>
                <h4 className="mt-1 text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                  Danh sách lớp {id}
                </h4>
              </div>
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-600 shrink-0" />
            </div>

            {/* Nút thêm sinh viên */}
            <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Thêm sinh viên
            </button>
          </div>

          {/* Search */}
          <input
              type="text"
              placeholder="Tìm sinh viên..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mt-4 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* List */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          {isLoading ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Đang tải...
              </div>
          ) : filtered.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">
                Không có sinh viên
              </div>
          ) : (
              <div className="divide-y divide-slate-100">
                {filtered.map((student) => (
                    <div
                        key={student.studentId}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 hover:bg-slate-50 transition-colors"
                    >
                      {/* Left */}
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                          {student.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm sm:text-base font-semibold text-slate-900">
                            {student.fullName}
                          </p>
                          <p className="text-xs sm:text-sm text-slate-500">
                            MSSV: {student.studentId}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-2 sm:mt-0">
                        <p className="text-xs sm:text-sm text-slate-500 break-all">
                          {student.email}
                        </p>
                        <button
                            onClick={() => handleRemoveStudent(student.studentId, student.fullName)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa sinh viên"
                        >
                          <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
          )}
        </div>

        {/* Modal Thêm Sinh Viên */}
        {isAddModalOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
              <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-slate-900">Thêm Sinh Viên</h3>
                  <button
                      onClick={() => setIsAddModalOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddStudent}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Mã số sinh viên
                    </label>
                    <input
                        type="text"
                        required
                        value={newStudentId}
                        onChange={(e) => setNewStudentId(e.target.value)}
                        placeholder="Nhập MSSV..."
                        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="rounded-xl px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                    >
                      Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting || !newStudentId.trim()}
                        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {isSubmitting ? "Đang thêm..." : "Thêm vào lớp"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

      </div>
  );
}