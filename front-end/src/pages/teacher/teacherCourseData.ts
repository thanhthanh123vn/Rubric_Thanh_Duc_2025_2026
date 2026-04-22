import { BarChart3, BookOpen, ClipboardList, FileText, TimerReset, Users, Workflow } from 'lucide-react';

export interface TeacherCourseItem {
  id: string;
  courseTitle: string;
  courseCode: string;
  lecturerName: string;
  semester: string;
  studentCount: number;
  rubricCount: number;
  assignmentCount: number;
  obeProgress: number;
  colorClass: string;
}

export const teacherCourses: TeacherCourseItem[] = [
  {
    id: 'TC-001',
    courseTitle: 'Phân tích và thiết kế hệ thống',
    courseCode: 'PTTKHT',
    lecturerName: 'ThS. Trần Lê Như Quỳnh',
    semester: 'HK2 - 2025-2026',
    studentCount: 52,
    rubricCount: 6,
    assignmentCount: 4,
    obeProgress: 82,
    colorClass: 'from-emerald-600 to-teal-500',
  },
  {
    id: 'TC-002',
    courseTitle: 'Nhập môn lập trình',
    courseCode: 'NMLT',
    lecturerName: 'ThS. Trần Lê Như Quỳnh',
    semester: 'HK2 - 2025-2026',
    studentCount: 64,
    rubricCount: 5,
    assignmentCount: 6,
    obeProgress: 76,
    colorClass: 'from-cyan-600 to-blue-500',
  },
  {
    id: 'TC-003',
    courseTitle: 'Cơ sở dữ liệu',
    courseCode: 'CSDL',
    lecturerName: 'ThS. Trần Lê Như Quỳnh',
    semester: 'HK2 - 2025-2026',
    studentCount: 48,
    rubricCount: 7,
    assignmentCount: 5,
    obeProgress: 88,
    colorClass: 'from-violet-600 to-fuchsia-500',
  },
];

export const teacherCourseMenu = [
  { key: 'overview', icon: BookOpen, label: 'Tổng quan', path: '' },
  { key: 'students', icon: Users, label: 'Sinh viên', path: 'students' },
  { key: 'assignments', icon: ClipboardList, label: 'Bài tập', path: 'assignments' },
  { key: 'rubric', icon: FileText, label: 'Rubric', path: 'rubric' },
  { key: 'obe', icon: BarChart3, label: 'OBE', path: 'obe' },
  { key: 'groups', icon: Workflow, label: 'Nhóm & Dự án', path: 'groups' },
  { key: 'grading', icon: FileText, label: 'Chấm bài', path: 'grading' },
  { key: 'projects', icon: Workflow, label: 'Dự án', path: 'projects' },
  { key: 'attendance', icon: TimerReset, label: 'Điểm danh', path: 'attendance' },
  { key: 'report', icon: BarChart3, label: 'Báo cáo', path: 'report' },
];
