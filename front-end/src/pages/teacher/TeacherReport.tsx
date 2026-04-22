import { Activity, CircleAlert } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar as RadarShape, RadarChart, ResponsiveContainer, Tooltip } from 'recharts';
import { teacherCourses } from './teacherCourseData';
import { competencyRadar } from './teacherData';

export default function TeacherReport() {
  const { id } = useParams<{ id: string }>();
  const course = teacherCourses.find((item) => item.id === id);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-600">Bao cao nang luc</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">
          Biểu đồ mạng nhện và tổng hợp kết quả {course ? `- ${course.courseTitle}` : ''}
        </h3>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Competency radar</h4>
              <p className="mt-1 text-sm text-slate-500">Tong hop tu quiz, rubric, attendance va project</p>
            </div>
            <Activity className="h-5 w-5 text-cyan-600" />
          </div>

          <div className="mt-6 h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={competencyRadar}>
                <PolarGrid stroke="#cbd5e1" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 12 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Tooltip />
                <RadarShape
                  name="Diem nang luc"
                  dataKey="score"
                  stroke="#059669"
                  fill="#10b981"
                  fillOpacity={0.22}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Goi y tac vu</h4>
              <p className="mt-1 text-sm text-slate-500">Nhìn nhanh những việc cần làm</p>
            </div>
            <CircleAlert className="h-5 w-5 text-amber-500" />
          </div>

          <div className="mt-6 space-y-3">
            {[
              'Ra soat rubric cho bai project tuan 4',
              'Import bo cau hoi trac nghiem moi cho CLO2',
              'Kiem tra danh sach sinh vien diem danh thieu',
              'Xuat bao cao nang luc cho lop DH22DTC',
            ].map((task) => (
              <div key={task} className="flex items-start gap-3 rounded-2xl border border-slate-200 p-4">
                <div className="mt-1 h-2.5 w-2.5 rounded-full bg-amber-500" />
                <p className="text-sm leading-6 text-slate-600">{task}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl bg-emerald-50 p-4">
            <p className="font-semibold text-emerald-800">Mục tiêu học kỳ</p>
            <p className="mt-2 text-sm leading-6 text-emerald-700">
              Chuẩn hóa quy trình đánh giá, giảm thời gian chấm thủ công và tăng tính minh bạch cho sinh viên.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
