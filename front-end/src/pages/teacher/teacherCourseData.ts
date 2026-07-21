import { BarChart3, BookOpen, ClipboardList, FileEdit, FileText, TimerReset, Users, Workflow } from 'lucide-react';

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
    offeringId: 'TC-001',
    courseCode: 'PTTKHT',
    courseName: 'Phân tích và thiết kế hệ thống',
    courseTitle: 'Phân tích và thiết kế hệ thống',
    lecturerName: 'ThS. Trần Lê Như Quỳnh',
    semester: 'HK2 - 2025-2026',
    studentCount: 52,
    rubricCount: 6,
    assignmentCount: 4,
    obeProgress: 82,
    colorClass: 'from-emerald-600 to-teal-500',
  },
  {
    offeringId: 'TC-002',
    courseCode: 'NMLT',
    courseName: 'Nhập môn lập trình',
    courseTitle: 'Nhập môn lập trình',
    lecturerName: 'ThS. Trần Lê Như Quỳnh',
    semester: 'HK2 - 2025-2026',
    studentCount: 64,
    rubricCount: 5,
    assignmentCount: 6,
    obeProgress: 76,
    colorClass: 'from-cyan-600 to-blue-500',
  },
  {
    offeringId: 'TC-003',
    courseCode: 'CSDL',
    courseName: 'Cơ sở dữ liệu',
    courseTitle: 'Cơ sở dữ liệu',
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
  { key: 'questions', icon: ClipboardList, label: 'Câu hỏi', path: 'questions' },
  {
    key: 'exams',
    icon: FileEdit,
    label: 'Đề thi',
    path: 'exams',
    children: [
      { key: 'create-exam', label: 'Tạo đề thi', path: 'create-exam' },
      { key: 'exam-list', label: 'Danh sách đề thi', path: 'exam-list' },

      { key: 'grading-final', label: 'Nhập điểm cuối kỳ', path: 'grading-final' }


    ],

  },
  { key: 'obe', icon: BarChart3, label: 'OBE', path: 'obe' },
  { key: 'groups', icon: Workflow, label: 'Nhóm & dự án', path: 'groups' },
  { key: 'grading', icon: FileText, label: 'Chấm bài', path: 'grading' },
  {
    key: 'attendance',
    icon: TimerReset,
    label: 'Điểm danh',
    path: 'attendance',
    children: [
      { key: 'attendance-create', label: 'Tạo phiên điểm danh', path: 'create' },
      { key: 'attendance-history', label: 'Lịch sử điểm danh', path: 'history' },
      { key: 'attendance-monitoring', label: 'Theo dõi lớp', path: 'monitoring' },
    ],
  },
  {
    key: 'report',
    icon: BarChart3,
    label: 'Báo cáo',
    path: 'report',
    children: [
      { key: 'grade-entry', label: 'Nhập điểm học phần', path: 'grade-entry' },
      { key: 'gradebook-report', label: 'Bảng điểm học phần', path: 'gradebook' },
      { key: 'outcome-report', label: 'Báo cáo chuẩn đầu ra', path: 'outcomes' },
    ],
  },
];
