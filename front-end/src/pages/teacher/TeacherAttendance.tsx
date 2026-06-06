import { useState } from 'react';
import {
  Camera,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MapPin,
  QrCode,
  ShieldCheck,
  Users2,
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { teacherCourses } from './teacherCourseData';

type AttendanceStatus = 'valid' | 'late' | 'outside' | 'missed';

type AttendanceRecord = {
  studentId: string;
  studentName: string;
  scannedAt: string;
  distance: string;
  status: AttendanceStatus;
  rubricLevel: number;
  note: string;
};

const summaryStats = [
  {
    label: 'QR hiệu lực',
    value: '05 phút',
    note: 'Tự làm mới theo từng buổi học',
    icon: Clock3,
    tone: 'emerald' as const,
  },
  {
    label: 'Bán kính GPS',
    value: '120m',
    note: 'Xác thực GPS trong phạm vi cho phép',
    icon: MapPin,
    tone: 'cyan' as const,
  },
  {
    label: 'Đã điểm danh',
    value: '46/52',
    note: '6 sinh viên chưa hoàn tất',
    icon: Users2,
    tone: 'navy' as const,
  },
  {
    label: 'Chuyên cần đạt',
    value: '88%',
    note: 'Theo rubric phiên hiện tại',
    icon: CheckCircle2,
    tone: 'mint' as const,
  },
];

const rubricLevels = [
  { level: 'Mức 4', detail: 'Đúng giờ, đúng vị trí', score: '1.0 điểm' },
  { level: 'Mức 3', detail: 'Muộn hoặc lệch vị trí nhỏ', score: '0.75 điểm' },
  { level: 'Mức 2', detail: 'Ngoài thời gian hoặc vị trí', score: '0.5 điểm' },
  { level: 'Mức 1', detail: 'Không điểm danh', score: '0 điểm' },
];

const attendanceRecords: AttendanceRecord[] = [
  {
    studentId: '22130123',
    studentName: 'Nguyễn Minh Anh',
    scannedAt: '07:03',
    distance: '18m',
    status: 'valid',
    rubricLevel: 4,
    note: 'Đúng giờ, đúng vị trí',
  },
  {
    studentId: '22130177',
    studentName: 'Trần Gia Bảo',
    scannedAt: '07:11',
    distance: '42m',
    status: 'late',
    rubricLevel: 3,
    note: 'Muộn 6 phút',
  },
  {
    studentId: '22130211',
    studentName: 'Lê Thu Hà',
    scannedAt: '07:05',
    distance: '138m',
    status: 'outside',
    rubricLevel: 2,
    note: 'Lệch vị trí cho phép',
  },
  {
    studentId: '22130245',
    studentName: 'Phạm Quốc Huy',
    scannedAt: '--',
    distance: '--',
    status: 'missed',
    rubricLevel: 1,
    note: 'Không điểm danh',
  },
];

const qrHistory = [
  { session: 'Buổi 01', code: 'QR-PTTKHT-230526-01', time: '23/05/2026 • 07:00', status: 'Đã đóng' },
  { session: 'Buổi 02', code: 'QR-PTTKHT-250526-02', time: '25/05/2026 • 07:00', status: 'Đã đóng' },
  { session: 'Buổi 03', code: 'QR-PTTKHT-280526-03', time: '28/05/2026 • 07:00', status: 'Đang hoạt động' },
];

const attendanceHistory = [
  { student: 'Nguyễn Minh Anh', rubric: 'Mức 4', detail: '07:03 • 18m • Hợp lệ' },
  { student: 'Trần Gia Bảo', rubric: 'Mức 3', detail: '07:11 • 42m • Muộn 6 phút' },
  { student: 'Lê Thu Hà', rubric: 'Mức 2', detail: '07:05 • 138m • Sai vị trí' },
  { student: 'Phạm Quốc Huy', rubric: 'Mức 1', detail: 'Không ghi nhận lượt quét' },
];

function getStatusLabel(status: AttendanceStatus) {
  switch (status) {
    case 'valid':
      return 'Hợp lệ';
    case 'late':
      return 'Muộn';
    case 'outside':
      return 'Sai vị trí';
    case 'missed':
      return 'Vắng';
    default:
      return 'Khác';
  }
}

function getStatusClass(status: AttendanceStatus) {
  switch (status) {
    case 'valid':
      return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    case 'late':
      return 'border-cyan-200 bg-cyan-50 text-cyan-700';
    case 'outside':
      return 'border-amber-200 bg-amber-50 text-amber-700';
    case 'missed':
      return 'border-rose-200 bg-rose-50 text-rose-700';
    default:
      return 'border-slate-200 bg-slate-50 text-slate-700';
  }
}

function getHistoryBadgeClass(status: string) {
  return status === 'Đang hoạt động'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-slate-200 bg-slate-50 text-slate-700';
}

function getMetricTone(tone: 'emerald' | 'cyan' | 'navy' | 'mint') {
  switch (tone) {
    case 'emerald':
      return 'bg-emerald-500/10 text-emerald-700';
    case 'cyan':
      return 'bg-cyan-500/10 text-cyan-700';
    case 'navy':
      return 'bg-slate-900/10 text-slate-800';
    case 'mint':
      return 'bg-teal-500/10 text-teal-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export default function TeacherAttendance() {
  const { id } = useParams<{ id: string }>();
  const course = teacherCourses.find((item) => item.offeringId === id);
  const [activeMenu, setActiveMenu] = useState<'qr-history' | 'attendance-history'>('qr-history');

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Attendance
              </span>
              <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600">
                Đang theo dõi trực tiếp
              </span>
            </div>

            <h3 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Điểm danh QR + GPS
            </h3>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
              Theo dõi trạng thái quét QR, phạm vi GPS và quy đổi chuyên cần theo rubric trên một màn hình gọn,
              dễ đọc và đồng bộ với giao diện LMS hiện tại.
            </p>

            <div className="mt-5 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                {course?.courseTitle || 'Học phần'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
                Mã lớp: {course?.courseCode || 'PTTKHT'}
              </span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">23/05/2026</span>
            </div>
          </div>

          <div className="grid w-full gap-4 sm:grid-cols-2 xl:w-[420px]">
            <QuickInfo
              icon={ShieldCheck}
              title="Phiên đang mở"
              value="Buổi 03"
              note="QR hoạt động trong 05 phút"
            />
            <QuickInfo
              icon={CircleAlert}
              title="Cần lưu ý"
              value="03 trường hợp"
              note="Muộn, sai vị trí hoặc vắng"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryStats.map((item) => (
          <article
            key={item.label}
            className="group rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_22px_50px_rgba(16,185,129,0.14)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">{item.value}</p>
              </div>
              <div className={`rounded-2xl p-3 transition-transform group-hover:scale-105 ${getMetricTone(item.tone)}`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-500">{item.note}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-6 2xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
        <div className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Phiên điểm danh</p>
              <h4 className="mt-2 text-2xl font-bold text-slate-900">{course?.courseTitle || 'Học phần'}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Mã lớp {course?.courseCode || 'PTTKHT'} • Buổi học ngày 23/05/2026 • Đồng bộ trạng thái theo QR và GPS.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500"
              >
                <QrCode className="h-4 w-4" />
                Tạo QR mới
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                <Camera className="h-4 w-4" />
                Camera demo
              </button>
            </div>
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">QR phiên học</p>
                  <p className="mt-1 text-sm text-slate-500">Quét trong thời gian hiệu lực để ghi nhận chuyên cần.</p>
                </div>
                <div className="rounded-2xl bg-white p-3 text-emerald-700 shadow-sm">
                  <QrCode className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-5 space-y-3 text-sm text-slate-600">
                <div className="rounded-[1.5rem] border border-white bg-white px-4 py-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Mã phiên</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">QR-PTTKHT-280526-03</p>
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3">
                  <Clock3 className="h-4 w-4 text-emerald-600" />
                  Hiệu lực 5 phút
                </div>
                <div className="flex items-center gap-3 rounded-2xl border border-white bg-white/80 px-4 py-3">
                  <MapPin className="h-4 w-4 text-cyan-600" />
                  Xác thực trong bán kính 120m
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50/70 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500">Rubric chuyên cần</p>
                    <h5 className="mt-2 text-xl font-bold text-slate-900">Quy đổi minh bạch theo từng mức</h5>
                  </div>
                  <span className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                    4 mức đánh giá
                  </span>
                </div>

                <div className="mt-5 grid gap-3">
                  {rubricLevels.map((item, index) => (
                    <div
                      key={item.level}
                      className="flex flex-col gap-3 rounded-[1.5rem] border border-white bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md md:flex-row md:items-center md:justify-between"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-sm font-bold text-white">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{item.level}</p>
                          <p className="mt-1 text-sm leading-6 text-slate-500">{item.detail}</p>
                        </div>
                      </div>
                      <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
                        {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <MiniInsight title="Đúng giờ" value="34 SV" note="Chiếm 65%" />
                <MiniInsight title="Muộn nhẹ" value="8 SV" note="Cần nhắc nhở" />
                <MiniInsight title="Ngoại lệ" value="4 SV" note="Kiểm tra lại GPS" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Lịch sử hệ thống</p>
            <h4 className="mt-2 text-2xl font-bold text-slate-900">Theo dõi phiên QR và bản ghi điểm danh</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Chuyển nhanh giữa lịch sử tạo mã QR và lịch sử quét để kiểm tra diễn biến trong buổi học.
            </p>
          </div>

          <div className="inline-flex w-full rounded-full border border-slate-200 bg-slate-50 p-1 lg:w-auto">
            <button
              type="button"
              onClick={() => setActiveMenu('qr-history')}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all lg:flex-none ${
                activeMenu === 'qr-history'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Lịch sử QR
            </button>
            <button
              type="button"
              onClick={() => setActiveMenu('attendance-history')}
              className={`flex-1 rounded-full px-4 py-2.5 text-sm font-semibold transition-all lg:flex-none ${
                activeMenu === 'attendance-history'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Lịch sử điểm danh
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {activeMenu === 'qr-history'
            ? qrHistory.map((item) => (
                <article
                  key={item.code}
                  className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h5 className="text-lg font-semibold text-slate-900">{item.session}</h5>
                      <p className="mt-1 text-sm text-slate-500">{item.code}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700">
                        {item.time}
                      </span>
                      <span
                        className={`rounded-full border px-4 py-2 text-sm font-semibold ${getHistoryBadgeClass(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>
                </article>
              ))
            : attendanceHistory.map((item) => (
                <HistoryRow key={item.student} title={item.student} value={item.rubric} note={item.detail} />
              ))}
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-600">Danh sách ghi nhận</p>
            <h4 className="mt-2 text-2xl font-bold text-slate-900">Trạng thái điểm danh từng sinh viên</h4>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Hiển thị thời gian quét, vị trí GPS và mức rubric dưới dạng card dễ đọc trên cả desktop lẫn mobile.
            </p>
          </div>
          <span className="w-fit rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
            3 trường hợp cần lưu ý
          </span>
        </div>

        <div className="mt-6 grid gap-4">
          {attendanceRecords.map((record) => (
            <article
              key={record.studentId}
              className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md md:p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h5 className="text-lg font-semibold text-slate-900">{record.studentName}</h5>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusClass(record.status)}`}
                    >
                      {getStatusLabel(record.status)}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {record.studentId} • {record.note}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <InfoBadge label={`Quét lúc ${record.scannedAt}`} />
                  <InfoBadge label={`GPS ${record.distance}`} />
                  <InfoBadge label={`Mức ${record.rubricLevel}`} strong />
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function QuickInfo({
  icon: Icon,
  title,
  value,
  note,
}: {
  icon: typeof ShieldCheck;
  title: string;
  value: string;
  note: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function MiniInsight({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-slate-900">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{note}</p>
    </div>
  );
}

function InfoBadge({ label, strong }: { label: string; strong?: boolean }) {
  return (
    <span
      className={`rounded-full border px-4 py-2 text-sm ${
        strong
          ? 'border-emerald-200 bg-emerald-50 font-semibold text-emerald-700'
          : 'border-slate-200 bg-slate-50 font-medium text-slate-700'
      }`}
    >
      {label}
    </span>
  );
}

function HistoryRow({ title, value, note }: { title: string; value: string; note: string }) {
  return (
    <article className="rounded-[1.5rem] border border-slate-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900">{title}</p>
          <p className="mt-1 text-sm text-slate-500">{note}</p>
        </div>
        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700">
          {value}
        </span>
      </div>
    </article>
  );
}
