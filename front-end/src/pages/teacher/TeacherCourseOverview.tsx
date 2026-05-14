import { BookOpen, ClipboardList, FileText, Users, Workflow, UploadCloud, Download } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { type TeacherCourseItem } from './teacherCourseData';
import { useEffect, useState, useRef } from "react";
import courseService from "@/pages/admin/api/courseService.ts";
import { toast } from "sonner";
export default function TeacherCourseOverview() {
  const { id } = useParams<{ id: string }>();

  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Hàm load lại dữ liệu
  const fetchCourses = async () => {
    try {
      setIsLoading(true);
      const data = await courseService.getLecturerDashBoardCourses();
      console.log(data);
      setCourses(data);
    } catch (error) {
      console.error("Lỗi khi tải danh sách lớp:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const course = courses.find((item) => item.offeringId === id);

  // Hàm xử lý chọn file tải lên
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !id) return;

    setIsUploading(true);
    try {

      await courseService.uploadSyllabus(id, file);


      await fetchCourses();



        toast.success("Tải giáo trình lên thành công!");


    } catch (error) {
      console.error("Lỗi upload giáo trình:", error);
      toast.error("Tải giáo trình thất bại!");
    } finally {
      setIsUploading(false);

      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const stats = [
    { label: 'Sinh vien', value: course?.studentCount || 0, icon: Users },
    { label: 'Rubric', value: course?.rubricCount || 0, icon: FileText },
    { label: 'Bai tap', value: course?.assignmentCount || 0, icon: ClipboardList },
    { label: 'OBE', value: `${course?.obeProgress || 0}%`, icon: BookOpen },
  ];

  return (
      <div className="space-y-6">
        {/* 1. Thống kê */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-slate-500">{item.label}</p>
                    <p className="mt-2 text-3xl font-black text-slate-900">{item.value}</p>
                  </div>
                  <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
              </div>
          ))}
        </div>

        {/* 2. Quản lý giáo trình (MỚI) */}
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Giáo trình môn học
              </h4>
              <p className="mt-1 text-sm text-slate-500">
                {(course as any)?.syllabusUrl
                    ? "Giáo trình đã được cập nhật. Sinh viên có thể tải xuống tài liệu này."
                    : "Chưa có giáo trình nào được tải lên cho môn học này."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Input file ẩn */}
              <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.zip,.rar"
              />

              <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading || isLoading}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <UploadCloud className="h-4 w-4" />
                {isUploading ? "Đang tải..." : "Tải lên mới"}
              </button>

              {/* Nút tải xuống (chỉ hiện nếu đã có URL) */}
              {(course as any)?.syllabusUrl && (
                  <a
                      href={(course as any).syllabusUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    Tải giáo trình
                  </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. Link nhanh và Hoạt động gần đây */}
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xl font-bold text-slate-900">Nhanh hoc phan</h4>
                <p className="mt-1 text-sm text-slate-500">Tong quan cac che do quan ly</p>
              </div>
              <Workflow className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <QuickLink label="Quan ly sinh vien" to="students" />
              <QuickLink label="Bai tap va quiz" to="assignments" />
              <QuickLink label="Rubric va LO" to="rubric" />
              <QuickLink label="Nhom va du an" to="groups" />
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <h4 className="text-xl font-bold text-slate-900">Hoat dong gan day</h4>
            <div className="mt-4 space-y-3">
              {[
                'Da cap nhat rubric cho project sprint 2',
                'Da them 12 cau hoi moi vao ngan hang',
                'Da import danh sach lop hoc ky nay',
              ].map((item) => (
                  <div key={item} className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    {item}
                  </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
}

function QuickLink({ label, to }: { label: string; to: string }) {
  return (
      <Link
          to={to}
          className="rounded-2xl border border-slate-200 bg-slate-50 p-4 font-medium text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
      >
        {label}
      </Link>
  );
}