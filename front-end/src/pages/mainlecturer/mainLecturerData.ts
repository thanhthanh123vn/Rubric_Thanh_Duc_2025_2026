import {
  BookOpen,
  Grid3X3,
  LayoutDashboard,
  Target,
  Calendar,
} from 'lucide-react';

export const mainLecturerModuleLinks = [
  { label: 'Tổng quan', path: '/mainlecturer', icon: LayoutDashboard },
  { label: 'Quản lý CLO', path: '/mainlecturer/clo', icon: Target },
  { label: 'Tạo Rubric', path: '/mainlecturer/rubric', icon: BookOpen },
  { label: 'Ma trận Rubric', path: '/mainlecturer/rubric-matrix', icon: Grid3X3 },
  { label: 'Phân công Học kì', path: '/mainlecturer/semester', icon: Calendar },
  { label: 'Phân công GV', path: '/mainlecturer/assign', icon: BookOpen },
];

export const quickStats = [
  { label: 'Học phần quản lý', value: '6', note: '24 học phần toàn trường', icon: BookOpen, tone: 'indigo' },
  { label: 'CLO đã tạo', value: '48', note: 'kiểm soát chất lượng toàn hệ', icon: Target, tone: 'purple' },
  { label: 'Rubric mẫu', value: '32', note: 'được sử dụng bởi 24 giảng viên', icon: BookOpen, tone: 'blue' },
  { label: 'Ma trận', value: '12', note: 'ánh xạ CLO-LO-Tiêu chí', icon: Grid3X3, tone: 'fuchsia' },
];

export const cloItems = [
  { code: 'CLO1', title: 'Hiểu nguyên lý hệ thống', bloom: 'Hiểu', status: 'Duyệt', progress: 100 },
  { code: 'CLO2', title: 'Thiết kế dữ liệu rubric', bloom: 'Vận dụng', status: 'Chờ duyệt', progress: 75 },
  { code: 'CLO3', title: 'Ánh xạ bài làm theo tiêu chí', bloom: 'Phân tích', status: 'Nháp', progress: 50 },
  { code: 'CLO4', title: 'Đánh giá năng lực', bloom: 'Tổng hợp', status: 'Duyệt', progress: 100 },
];

export const rubricTemplates = [
  {
    id: 1,
    name: 'Báo cáo kỹ thuật',
    description: 'Đánh giá báo cáo có tính kỹ thuật cao, đòi hỏi phân tích chi tiết',
    tags: ['Essay', 'Citations', 'Structure'],
    criteria: ['Nội dung', 'Trình bày', 'Tham khảo'],
    weight: '40 / 30 / 30',
  },
  {
    id: 2,
    name: 'Dự án phần mềm',
    description: 'Đánh giá dự án phần mềm bao gồm code, teamwork và evidence',
    tags: ['Teamwork', 'Source code', 'Evidence'],
    criteria: ['Chất lượng code', 'Teamwork', 'Tài liệu'],
    weight: '35 / 35 / 30',
  },
  {
    id: 3,
    name: 'Thuyết trình học phần',
    description: 'Đánh giá thuyết trình về nội dung, cách trình bày và Q&A',
    tags: ['Content', 'Delivery', 'Q&A'],
    criteria: ['Nội dung', 'Trình bày', 'Q&A'],
    weight: '30 / 40 / 30',
  },
];

export const rubricMatrixData = [
  {
    id: 1,
    name: 'Ma trận OBE - Lập trình',
    courses: 4,
    cloCount: 6,
    criteria: 8,
    status: 'Hoàn tất',
  },
  {
    id: 2,
    name: 'Ma trận OBE - Database',
    courses: 3,
    cloCount: 5,
    criteria: 7,
    status: 'Chờ duyệt',
  },
  {
    id: 3,
    name: 'Ma trận OBE - Web',
    courses: 2,
    cloCount: 4,
    criteria: 6,
    status: 'Nháp',
  },
];

export const bloomLevels = [
  { level: 'Nhớ', color: 'bg-green-50 text-green-700 border-green-100' },
  { level: 'Hiểu', color: 'bg-green-50 text-green-700 border-green-100' },
  { level: 'Vận dụng', color: 'bg-green-50 text-green-700 border-green-100' },
  { level: 'Phân tích', color: 'bg-green-50 text-green-700 border-green-100' },
  { level: 'Đánh giá', color: 'bg-green-50 text-green-700 border-green-100' },
  { level: 'Tổng hợp', color: 'bg-green-50 text-green-700 border-green-100' },
];

export const mainLecturerTones: Record<string, string> = {
  indigo: 'bg-green-50 text-green-700 border-green-100',
  purple: 'bg-green-50 text-green-700 border-green-100',
  blue: 'bg-green-50 text-green-700 border-green-100',
  fuchsia: 'bg-green-50 text-green-700 border-green-100',
};

export const mainLecturerDots: Record<string, string> = {
  indigo: 'bg-green-500',
  purple: 'bg-green-500',
  blue: 'bg-green-500',
  fuchsia: 'bg-green-500',
};

export const mainLecturerHighlights = [
  { title: 'Quản lý CLO tập trung', tone: 'indigo' },
  { title: 'Rubric chuẩn hóa', tone: 'purple' },
  { title: 'Kiểm soát chất lượng', tone: 'blue' },
];

