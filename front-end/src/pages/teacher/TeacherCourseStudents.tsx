import { Users } from 'lucide-react';
import { useParams } from 'react-router-dom';

const mockStudents = [
  { id: '22130260', fullName: 'Nguyen Van Thanh', email: 'thanh@st.hcmuaf.edu.vn' },
  { id: '22130050', fullName: 'Ngo Van Duc', email: 'duc@st.hcmuaf.edu.vn' },
  { id: '22130111', fullName: 'Tran Thi Mai', email: 'mai@st.hcmuaf.edu.vn' },
];

export default function TeacherCourseStudents() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Sinh vien</p>
            <h4 className="mt-1 text-2xl font-bold text-slate-900">Danh sach sinh vien lop {id}</h4>
          </div>
          <Users className="h-5 w-5 text-emerald-600" />
        </div>

        <div className="mt-6 divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200">
          {mockStudents.map((student) => (
            <div key={student.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-700">
                  {student.fullName.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{student.fullName}</p>
                  <p className="text-sm text-slate-500">{student.id}</p>
                </div>
              </div>
              <p className="text-sm text-slate-500">{student.email}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

