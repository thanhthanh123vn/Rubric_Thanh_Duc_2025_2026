import { BookOpen, ClipboardList, FileText, Users, Workflow } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import {type TeacherCourseItem, teacherCourses} from './teacherCourseData';
import {useEffect, useState} from "react";
import courseService from "@/pages/admin/api/courseService.ts";

export default function TeacherCourseOverview() {
  const { id } = useParams<{ id: string }>();

  const [courses, setCourses] = useState<TeacherCourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
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

    fetchCourses();
  }, []);
  const course = courses.find((item) => item.offeringId === id);

  const stats = [
    { label: 'Sinh vien', value: course?.studentCount || 0, icon: Users },
    { label: 'Rubric', value: course?.rubricCount || 0, icon: FileText },
    { label: 'Bai tap', value: course?.assignmentCount || 0, icon: ClipboardList },
    { label: 'OBE', value: `${course?.obeProgress || 0}%`, icon: BookOpen },
  ];

  return (
    <div className="space-y-6">
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

