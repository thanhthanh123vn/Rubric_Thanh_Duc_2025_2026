import {BarChart3, BookOpen, ClipboardList, FileEdit, FileText, TimerReset, Users, Workflow} from 'lucide-react';

export interface TeacherCourseItem {
  offeringId: string;
  courseCode: string;
  courseName: string;
  courseTitle: string;
  studentCount: number;
  semester: string;
  academicYear?: string;
  obeProgress: number;
  lecturerName: string;
  academicTitle?: string;
  status?: string;
  startDate?: string | null;
  endDate?: string | null;
  rubricCount?: number;
  assignmentCount?: number;
  colorClass?: string;
}

export const teacherCourses: TeacherCourseItem[] = [
  {
    offeringId: "TC-001",
    courseCode: "PTTKHT",
    courseName: "Phan tich va thiet ke he thong",
    courseTitle: "Phan tich va thiet ke he thong",
    lecturerName: "ThS. Tran Le Nhu Quynh",
    semester: "HK2 - 2025-2026",
    studentCount: 52,
    rubricCount: 6,
    assignmentCount: 4,
    obeProgress: 82,
    colorClass: "from-emerald-600 to-teal-500",
  },
  {
    offeringId: "TC-002",
    courseCode: "NMLT",
    courseName: "Nhap mon lap trinh",
    courseTitle: "Nhap mon lap trinh",
    lecturerName: "ThS. Tran Le Nhu Quynh",
    semester: "HK2 - 2025-2026",
    studentCount: 64,
    rubricCount: 5,
    assignmentCount: 6,
    obeProgress: 76,
    colorClass: "from-cyan-600 to-blue-500",
  },
  {
    offeringId: "TC-003",
    courseCode: "CSDL",
    courseName: "Co so du lieu",
    courseTitle: "Co so du lieu",
    lecturerName: "ThS. Tran Le Nhu Quynh",
    semester: "HK2 - 2025-2026",
    studentCount: 48,
    rubricCount: 7,
    assignmentCount: 5,
    obeProgress: 88,
    colorClass: "from-violet-600 to-fuchsia-500",
  },
];

export const teacherCourseMenu = [
  { key: 'overview', icon: BookOpen, label: 'Tổng quan', path: '' },
  { key: 'students', icon: Users, label: 'Sinh viên', path: 'students' },
  { key: 'assignments', icon: ClipboardList, label: 'Bài tập', path: 'assignments' },
  { key: 'rubric', icon: FileText, label: 'Rubric', path: 'rubric' },
  { key: 'questions',  icon: ClipboardList , label: 'Câu Hỏi', path: 'questions' },
  {
    key: 'exams',
    icon: FileEdit,
    label: 'Đề thi',
    path: 'exams',
    children: [
      { key: 'create-exam', label: 'Tạo đề thi', path: 'create-exam' },
      { key: 'exam-list', label: 'Danh sách đề thi', path: 'exam-list' },
      { key: 'view-exam-list', label: 'xem chi tiết đề thi', path: 'view-exam-list' },
      { key: 'grading-final', label: 'Nhập điểm cuối kỳ', path: 'grading-final' }
    ]
  },
  { key: 'obe', icon: BarChart3, label: 'OBE', path: 'obe' },

  { key: 'groups', icon: Workflow, label: 'Nhóm & Dự án', path: 'groups' },
  { key: 'grading', icon: FileText, label: 'Chấm bài', path: 'grading' },
  { key: 'projects', icon: Workflow, label: 'Dự án', path: 'projects' },
  { key: 'attendance', icon: TimerReset, label: 'Điểm danh', path: 'attendance' },
  { key: 'report', icon: BarChart3, label: 'Báo cáo', path: 'report' },
];
