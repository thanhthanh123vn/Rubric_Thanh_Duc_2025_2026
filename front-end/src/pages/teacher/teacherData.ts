import {
  Activity,
  BookOpen,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPin,
  Radar,
  School,
  ShieldCheck,
  Sparkles,
  Target,
  TimerReset,
  Users,
  Workflow,
} from 'lucide-react';

export const teacherModuleLinks = [
  { label: 'Tổng quan', path: '/teacher', icon: LayoutDashboard },
  { label: 'LO & Rubric', path: '/teacher/rubric', icon: Target },
  { label: 'Ngân hàng câu hỏi', path: '/teacher/questions', icon: ClipboardList },
];

export const quickStats = [
  { label: 'Học phần phụ trách', value: '4', note: '2 lớp lý thuyết, 2 lớp thực hành', icon: School, tone: 'emerald' },
  { label: 'Bài nộp chờ chấm', value: '18', note: '8 báo cáo, 10 project', icon: FileText, tone: 'amber' },
  { label: 'Rubric mẫu', value: '24', note: 'đã gắn CLO và Bloom', icon: Target, tone: 'cyan' },
  { label: 'Câu hỏi trong ngân hàng', value: '428', note: 'có tagging theo chuẩn đầu ra', icon: ClipboardList, tone: 'violet' },
];

export const cloItems = [
  { code: 'CLO1', title: 'Hiểu nguyên lý hệ thống', bloom: 'Hiểu', progress: 92 },
  { code: 'CLO2', title: 'Thiết kế dữ liệu rubric', bloom: 'Vận dụng', progress: 84 },
  { code: 'CLO3', title: 'Ánh xạ bài làm theo tiêu chí', bloom: 'Phân tích', progress: 76 },
];

export const rubricTemplates = [
  { name: 'Báo cáo kỹ thuật', tags: ['Essay', 'Citations', 'Structure'], weight: '40 / 30 / 30' },
  { name: 'Dự án phần mềm', tags: ['Teamwork', 'Source code', 'Evidence'], weight: '35 / 35 / 30' },
  { name: 'Thuyết trình học phần', tags: ['Content', 'Delivery', 'Q&A'], weight: '30 / 40 / 30' },
];

export const questionMatrix = [
  { level: 'Nhớ', count: 10, total: 20 },
  { level: 'Hiểu', count: 6, total: 20 },
  { level: 'Vận dụng', count: 3, total: 20 },
  { level: 'Phân tích', count: 1, total: 20 },
];

export const gradingQueue = [
  { student: 'Nguyễn Văn A', task: 'Báo cáo chương 2', status: 'Chờ rubric', score: '8.0', deadline: 'Hôm nay' },
  { student: 'Trần Thị B', task: 'Project nhóm - sprint 1', status: 'Chờ phản hồi', score: '7.5', deadline: 'Mai' },
  { student: 'Lê Văn C', task: 'Quiz CLO2', status: 'Đã chấm', score: '9.0', deadline: 'Đã hoàn tất' },
];

export const projectGroups = [
  { name: 'Nhóm 01', tasks: 8, done: 6, evidence: '2 commit, 1 file report' },
  { name: 'Nhóm 02', tasks: 6, done: 4, evidence: 'Kanban cập nhật hằng tuần' },
  { name: 'Nhóm 03', tasks: 7, done: 7, evidence: 'Demo đầy đủ, đúng hạn' },
];

export const attendanceRules = [
  { title: 'QR + GPS', detail: 'Mã QR 5 phút, bán kính kiểm tra 200m' },
  { title: 'Chấm điểm chuyên cần', detail: 'Đúng giờ, muộn, sai vị trí, vắng' },
  { title: 'Cảnh báo tự động', detail: 'Sinh viên dưới 80% sẽ được nhắc nhở' },
];

export const competencyRadar = [
  { subject: 'Knowledge', score: 88 },
  { subject: 'Skills', score: 81 },
  { subject: 'Attitude', score: 74 },
  { subject: 'Project', score: 86 },
  { subject: 'Quiz', score: 79 },
  { subject: 'Attendance', score: 92 },
];

export const teacherTones: Record<string, string> = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-100',
  violet: 'bg-violet-50 text-violet-700 border-violet-100',
};

export const teacherDots: Record<string, string> = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  cyan: 'bg-cyan-500',
  violet: 'bg-violet-500',
};

export const teacherHighlights = [
  { title: 'Constructive Alignment', tone: 'cyan' },
  { title: 'Rubric số hóa', tone: 'emerald' },
  { title: 'QR + GPS', tone: 'amber' },
];
