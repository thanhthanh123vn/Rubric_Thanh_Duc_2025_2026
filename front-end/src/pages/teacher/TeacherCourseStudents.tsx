import { Users } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { courseService } from "@/features/course/courseApi.ts";
import { useEffect, useState } from "react";
import type { Type } from "@/features/course/student/api/type.ts";

export default function TeacherCourseStudents() {
  const { id } = useParams<{ id: string }>();
  const [students, setStudents] = useState<Type[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
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
    };

    fetchStudents();
  }, [id]);

  const filtered = students.filter((s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
      <div className="p-3 sm:p-4 md:p-6 space-y-4">

        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 md:p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
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
              <div className="divide-y">
                {filtered.map((student) => (
                    <div
                        key={student.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4"
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
                            {student.id}
                          </p>
                        </div>
                      </div>

                      {/* Right */}
                      <p className="text-xs sm:text-sm text-slate-500 break-all">
                        {student.email}
                      </p>
                    </div>
                ))}
              </div>
          )}
        </div>
      </div>
  );
}