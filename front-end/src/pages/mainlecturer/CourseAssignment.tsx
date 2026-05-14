import { ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
}

interface Class {
  id: string;
  name: string;
  studentCount: number;
  schedule: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
  classes: Class[];
}

interface Rubric {
  id: string;
  name: string;
  criteria: string[];
}

interface RubricMatrix {
  clo: string;
  bloomLevel: string;
  criteria: string[];
  weight: string;
}

const semesters = [
  { id: '1', code: 'HK2', name: 'Học kỳ 2', year: 2026 },
  { id: '2', code: 'HK1', name: 'Học kỳ 1', year: 2026 },
];

const courses: Course[] = [
  {
    id: '1',
    name: 'Lập trình C++',
    code: 'CS101',
    classes: [
      { id: '1', name: 'K65A', studentCount: 35, schedule: 'Thứ 2, 4 (7h-9h)' },
      { id: '2', name: 'K65B', studentCount: 38, schedule: 'Thứ 3, 5 (7h-9h)' },
      { id: '3', name: 'K65C', studentCount: 36, schedule: 'Thứ 2, 4 (9h-11h)' },
    ],
  },
  {
    id: '2',
    name: 'Cơ sở dữ liệu',
    code: 'DB101',
    classes: [
      { id: '4', name: 'K66A', studentCount: 32, schedule: 'Thứ 3, 5 (9h-11h)' },
      { id: '5', name: 'K66B', studentCount: 34, schedule: 'Thứ 4, 6 (7h-9h)' },
    ],
  },
];

const rubrics: Rubric[] = [
  {
    id: '1',
    name: 'Dự án phần mềm',
    criteria: ['Chất lượng code (40%)', 'Làm việc nhóm (35%)', 'Tài liệu (25%)'],
  },
  {
    id: '2',
    name: 'Báo cáo kỹ thuật',
    criteria: ['Nội dung (40%)', 'Trình bày (30%)', 'Tham khảo (30%)'],
  },
];

const rubricMatrices: RubricMatrix[] = [
  { clo: 'CLO1', bloomLevel: 'Vận dụng', criteria: ['Chất lượng code'], weight: '40%' },
  { clo: 'CLO2', bloomLevel: 'Vận dụng', criteria: ['Chất lượng code'], weight: '40%' },
  { clo: 'CLO3', bloomLevel: 'Phân tích', criteria: ['Làm việc nhóm'], weight: '35%' },
];

const teachers: Teacher[] = [
  { id: '1', name: 'Nguyễn Văn A', email: 'nva@hcmuaf.edu.vn', department: 'Tin học' },
  { id: '2', name: 'Trần Thị B', email: 'ttb@hcmuaf.edu.vn', department: 'Tin học' },
  { id: '3', name: 'Lê Văn C', email: 'lvc@hcmuaf.edu.vn', department: 'Tin học' },
];

export default function CourseAssignment() {
  const [step, setStep] = useState(1);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);
  const [selectedRubric, setSelectedRubric] = useState('');
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);

  const courseData = courses.find(c => c.id === selectedCourse);
  const rubricData = rubrics.find(r => r.id === selectedRubric);

  const toggleClass = (classId: string) => {
    setSelectedClasses(prev =>
      prev.includes(classId)
        ? prev.filter(id => id !== classId)
        : [...prev, classId]
    );
  };

  const selectedClassesData = courseData?.classes.filter(c => selectedClasses.includes(c.id)) || [];
  const totalStudents = selectedClassesData.reduce((sum, c) => sum + c.studentCount, 0);

  const handleAssign = () => {
    // Gọi API phân công
    console.log({
      semester: selectedSemester,
      course: selectedCourse,
      classes: selectedClasses,
      rubric: selectedRubric,
      teacher: selectedTeacher,
    });
    setShowConfirm(false);
    // Reset form
    setStep(1);
    setSelectedSemester('');
    setSelectedCourse('');
    setSelectedClasses([]);
    setSelectedRubric('');
    setSelectedTeacher('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">Phân công</p>
        <h3 className="mt-1 text-2xl font-bold text-slate-900">Phân công Giáo viên + Gắn Rubric</h3>
      </div>

      {/* Step Indicator */}
      <div className="flex justify-between">
        {[1, 2, 3, 4, 5].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                s <= step
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {s}
            </div>
            <p className="mt-2 text-xs font-medium text-slate-600">
              {s === 1 ? 'Học kì' : s === 2 ? 'Môn học' : s === 3 ? 'Lớp' : s === 4 ? 'Rubric' : 'GV & Xác nhận'}
            </p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="rounded-2xl border border-slate-200 bg-white p-8">
        {/* Step 1: Semester */}
        {step === 1 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Chọn Học kì</h4>
            <div className="grid gap-3 md:grid-cols-2">
              {semesters.map((sem) => (
                <button
                  key={sem.id}
                  onClick={() => {
                    setSelectedSemester(sem.id);
                    setStep(2);
                  }}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedSemester === sem.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <p className="font-bold text-slate-900">{sem.code} {sem.year}</p>
                  <p className="text-sm text-slate-600">{sem.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Course */}
        {step === 2 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Chọn Môn học</h4>
            <div className="grid gap-3">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => {
                    setSelectedCourse(course.id);
                    setStep(3);
                  }}
                  className={`rounded-lg border-2 p-4 text-left transition-all ${
                    selectedCourse === course.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{course.name}</p>
                      <p className="text-sm text-slate-600">{course.code}</p>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">{course.classes.length} lớp</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Classes */}
        {step === 3 && courseData && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Chọn Lớp (có thể chọn nhiều)</h4>
            <div className="grid gap-3">
              {courseData.classes.map((cls) => (
                <label
                  key={cls.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedClasses.includes(cls.id)
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedClasses.includes(cls.id)}
                      onChange={() => toggleClass(cls.id)}
                      className="h-5 w-5 rounded border-slate-300 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{cls.name}</p>
                      <div className="mt-1 flex gap-4 text-sm text-slate-600">
                        <span>{cls.studentCount} sinh viên</span>
                        <span>{cls.schedule}</span>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {selectedClasses.length > 0 && (
              <button
                onClick={() => setStep(4)}
                className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
              >
                Tiếp tục: Chọn Rubric →
              </button>
            )}
          </div>
        )}

        {/* Step 4: Rubric */}
        {step === 4 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Chọn Rubric</h4>
            <p className="text-sm text-slate-600">
              {selectedClassesData.length} lớp, {totalStudents} sinh viên
            </p>

            <div className="grid gap-4">
              {rubrics.map((rubric) => (
                <label
                  key={rubric.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedRubric === rubric.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="rubric"
                      value={rubric.id}
                      checked={selectedRubric === rubric.id}
                      onChange={() => setSelectedRubric(rubric.id)}
                      className="mt-1 h-5 w-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{rubric.name}</p>
                      <div className="mt-2 space-y-1">
                        {rubric.criteria.map((criterion) => (
                          <div key={criterion} className="flex items-center gap-2 text-sm text-slate-600">
                            <div className="h-2 w-2 rounded-full bg-indigo-600" />
                            {criterion}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Rubric Matrix Preview */}
            {selectedRubric && (
              <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50 p-4">
                <h5 className="mb-3 font-bold text-slate-900">Ma trận ánh xạ CLO → Tiêu chí</h5>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-indigo-200">
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">CLO</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Mức độ</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Tiêu chí</th>
                        <th className="px-3 py-2 text-left font-semibold text-slate-700">Trọng số</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rubricMatrices.map((row, idx) => (
                        <tr key={idx} className="border-b border-indigo-100">
                          <td className="px-3 py-2 text-slate-900">{row.clo}</td>
                          <td className="px-3 py-2 text-slate-600">{row.bloomLevel}</td>
                          <td className="px-3 py-2 text-slate-600">{row.criteria.join(', ')}</td>
                          <td className="px-3 py-2 font-medium text-slate-900">{row.weight}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {selectedRubric && (
              <button
                onClick={() => setStep(5)}
                className="mt-6 w-full rounded-lg bg-indigo-600 py-3 font-medium text-white hover:bg-indigo-700"
              >
                Tiếp tục: Chọn Giáo viên →
              </button>
            )}
          </div>
        )}

        {/* Step 5: Teacher & Confirm */}
        {step === 5 && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-slate-900">Phân công Giáo viên</h4>

            <div className="grid gap-3">
              {teachers.map((teacher) => (
                <label
                  key={teacher.id}
                  className={`cursor-pointer rounded-lg border-2 p-4 transition-all ${
                    selectedTeacher === teacher.id
                      ? 'border-indigo-600 bg-indigo-50'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="teacher"
                      value={teacher.id}
                      checked={selectedTeacher === teacher.id}
                      onChange={() => setSelectedTeacher(teacher.id)}
                      className="mt-1 h-5 w-5 text-indigo-600"
                    />
                    <div className="flex-1">
                      <p className="font-bold text-slate-900">{teacher.name}</p>
                      <div className="mt-1 space-y-1 text-sm text-slate-600">
                        <p>{teacher.email}</p>
                        <p>Bộ môn: {teacher.department}</p>
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
              <h5 className="mb-3 font-bold text-slate-900">Tóm tắt phân công</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Học kì:</span>
                  <span className="font-medium text-slate-900">
                    {semesters.find(s => s.id === selectedSemester)?.code}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Môn học:</span>
                  <span className="font-medium text-slate-900">
                    {courseData?.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Lớp:</span>
                  <span className="font-medium text-slate-900">
                    {selectedClassesData.map(c => c.name).join(', ')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Tổng sinh viên:</span>
                  <span className="font-medium text-slate-900">{totalStudents}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2">
                  <span className="text-slate-600">Rubric:</span>
                  <span className="font-medium text-indigo-600">{rubricData?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Giáo viên:</span>
                  <span className="font-medium text-slate-900">
                    {teachers.find(t => t.id === selectedTeacher)?.name}
                  </span>
                </div>
              </div>
            </div>

            {selectedTeacher && (
              <button
                onClick={() => setShowConfirm(true)}
                className="mt-6 w-full rounded-lg bg-green-600 py-3 font-medium text-white hover:bg-green-700"
              >
                ✓ Xác nhận Phân công
              </button>
            )}
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-2xl bg-white p-8">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Xác nhận phân công?</h3>
            <p className="mt-2 text-sm text-slate-600">
              Hệ thống sẽ gắn Rubric "{rubricData?.name}" vào các lớp và phân công cho {teachers.find(t => t.id === selectedTeacher)?.name}
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg border border-slate-300 py-2 font-medium text-slate-700 hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={handleAssign}
                className="flex-1 rounded-lg bg-green-600 py-2 font-medium text-white hover:bg-green-700"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
