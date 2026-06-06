import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Clock3, QrCode, Timer, Users2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  attendanceApi,
  getAttendanceErrorMessage,
  type AttendanceSessionResponse,
  type AttendanceSessionSummaryResponse,
  type AttendanceStudentResponse,
} from "@/api/attendanceApi.ts";

type FormState = {
  attendanceDate: string;
  startTime: string;
  endTime: string;
};

const defaultDate = new Date().toISOString().slice(0, 10);

function toDateTimeValue(date: string, time: string) {
  return `${date}T${time}`;
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatDateOnly(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    dateStyle: "full",
  });
}

function formatRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) {
    return "Da het han";
  }

  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

export default function CreateQrAttendancePage() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<FormState>({
    attendanceDate: defaultDate,
    startTime: "",
    endTime: "",
  });
  const [activeSession, setActiveSession] = useState<AttendanceSessionResponse | null>(null);
  const [sessions, setSessions] = useState<AttendanceSessionSummaryResponse[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceStudentResponse[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [remainingLabel, setRemainingLabel] = useState("");

  const hasActiveQr = Boolean(
    activeSession && new Date(activeSession.endTime).getTime() > Date.now(),
  );

  const displayedSession = hasActiveQr ? activeSession : null;

  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedSessionId) || null,
    [sessions, selectedSessionId],
  );

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const loadSessions = async (preferredSessionId?: string) => {
    if (!id) {
      return;
    }

    try {
      setIsLoadingSessions(true);
      const response = await attendanceApi.getAttendanceSessionsByOffering(id);
      setSessions(response);
      setSelectedSessionId(preferredSessionId || response[0]?.sessionId || "");
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadActiveSession = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await attendanceApi.getActiveAttendanceSession(id);
      setActiveSession(response);
    } catch {
      setActiveSession(null);
    }
  };

  const loadAttendanceRecords = async (sessionId: string) => {
    if (!sessionId) {
      setAttendanceRecords([]);
      return;
    }

    try {
      setIsLoadingRecords(true);
      const response = await attendanceApi.getAttendanceRecordsBySession(sessionId);
      setAttendanceRecords(response);
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    } finally {
      setIsLoadingRecords(false);
    }
  };

  useEffect(() => {
    loadActiveSession();
    loadSessions();
  }, [id]);

  useEffect(() => {
    if (!activeSession) {
      setRemainingLabel("");
      return;
    }

    const updateRemaining = () => {
      setRemainingLabel(formatRemaining(activeSession.endTime));
    };

    updateRemaining();
    const timerId = window.setInterval(updateRemaining, 1000);
    return () => window.clearInterval(timerId);
  }, [activeSession]);

  useEffect(() => {
    if (!selectedSessionId) {
      setAttendanceRecords([]);
      return;
    }

    loadAttendanceRecords(selectedSessionId);
  }, [selectedSessionId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (hasActiveQr) {
      const message = "QR hien tai chua het han. Hay doi phien nay ket thuc.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (!id) {
      const message = "Khong tim thay offeringId cua lop hoc phan.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    if (!form.attendanceDate || !form.startTime || !form.endTime) {
      const message = "Vui long nhap day du ngay, gio bat dau va gio ket thuc.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    const startDateTime = toDateTimeValue(form.attendanceDate, form.startTime);
    const endDateTime = toDateTimeValue(form.attendanceDate, form.endTime);

    if (new Date(startDateTime) >= new Date(endDateTime)) {
      const message = "Gio bat dau phai nho hon gio ket thuc.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await attendanceApi.createAttendanceSession({
        offeringId: id,
        attendanceDate: form.attendanceDate,
        startTime: startDateTime,
        endTime: endDateTime,
      });

      setActiveSession(response);
      await loadSessions(response.sessionId);
      toast.success("Tao phien diem danh QR thanh cong.");
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f4fbf8_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              QR Attendance
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              Tao phien diem danh QR cho lop hoc phan
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 md:text-base">
              Neu QR hien tai chua het han, he thong se tiep tuc hien QR do va tam khoa thao tac tao moi.
            </p>
          </div>

          <div className="rounded-[1.75rem] border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Lop hoc phan</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{id || "Chua xac dinh"}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]">
        <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Thong tin phien diem danh</h3>
              <p className="text-sm text-slate-500">Khi con QR hieu luc, nut tao moi se bi khoa.</p>
            </div>
          </div>

          {hasActiveQr ? (
            <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
              QR hien tai con hieu luc. Thoi gian het han con lai: <span className="font-bold">{remainingLabel}</span>
            </div>
          ) : null}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Ngay diem danh</span>
              <input
                type="date"
                value={form.attendanceDate}
                onChange={(event) => handleChange("attendanceDate", event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                required
                disabled={hasActiveQr}
              />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Gio bat dau</span>
                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(event) => handleChange("startTime", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                    required
                    disabled={hasActiveQr}
                  />
                </div>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Gio ket thuc</span>
                <div className="relative">
                  <Timer className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(event) => handleChange("endTime", event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                    required
                    disabled={hasActiveQr}
                  />
                </div>
              </label>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting || hasActiveQr}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <QrCode className="h-4 w-4" />
              {hasActiveQr ? "Dang co QR hoat dong" : isSubmitting ? "Dang tao phien..." : "Tao phien diem danh QR"}
            </button>
          </form>
        </article>

        <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">QR hien tai</h3>
              <p className="text-sm text-slate-500">Hien QR dang con hieu luc neu co.</p>
            </div>
          </div>

          {displayedSession ? (
            <div className="space-y-5">
              <div className="flex justify-center rounded-[1.75rem] border border-dashed border-emerald-200 bg-emerald-50/60 p-6">
                <div className="rounded-[1.5rem] bg-white p-4 shadow-sm">
                  <QRCodeSVG value={displayedSession.qrContent} size={240} level="M" includeMargin />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <InfoCard label="Trang thai" value={displayedSession.status} />
                <InfoCard label="Het han con lai" value={remainingLabel || "Da het han"} />
                <InfoCard label="Bat dau" value={formatDateTime(displayedSession.startTime)} />
                <InfoCard label="Ket thuc" value={formatDateTime(displayedSession.endTime)} />
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">QR Content</p>
                <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-all text-sm leading-6 text-slate-700">
                  {displayedSession.qrContent}
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-slate-200 bg-slate-50/80 px-6 text-center">
              <div className="rounded-full bg-white p-4 text-emerald-700 shadow-sm">
                <QrCode className="h-8 w-8" />
              </div>
              <h4 className="mt-5 text-lg font-bold text-slate-900">Khong co QR dang hoat dong</h4>
              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                Khi tao phien moi, QR se hien o day cho sinh vien quet.
              </p>
            </div>
          )}
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]">
        <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
              <Clock3 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Cac phien diem danh</h3>
              <p className="text-sm text-slate-500">Tieu de hien theo ngay, khong can sessionId.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {isLoadingSessions ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Dang tai danh sach phien diem danh...
              </div>
            ) : sessions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Chua co phien diem danh nao cho lop hoc phan nay.
              </div>
            ) : (
              sessions.map((session) => (
                <button
                  key={session.sessionId}
                  type="button"
                  onClick={() => setSelectedSessionId(session.sessionId)}
                  className={`w-full rounded-[1.5rem] border p-4 text-left transition ${
                    selectedSessionId === session.sessionId
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-slate-200 bg-slate-50 hover:border-emerald-200 hover:bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-900">{formatDateOnly(session.attendanceDate)}</p>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                      </p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-700">
                      {session.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    Da diem danh: <span className="font-semibold text-slate-900">{session.checkedInCount}</span>
                  </p>
                </button>
              ))
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <Users2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Sinh vien da diem danh</h3>
              <p className="text-sm text-slate-500">Danh sach cap nhat theo phien dang chon.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {!selectedSession ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Hay chon mot phien diem danh de xem du lieu.
              </div>
            ) : isLoadingRecords ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Dang tai danh sach sinh vien da diem danh...
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                Chua co sinh vien nao diem danh o phien ngay {formatDateOnly(selectedSession.attendanceDate)}.
              </div>
            ) : (
              attendanceRecords.map((record, index) => (
                <div key={record.attendanceId} className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-500">#{index + 1}</p>
                      <h4 className="mt-1 text-base font-bold text-slate-900">{record.studentName}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {record.studentId}
                        {record.email ? ` • ${record.email}` : ""}
                      </p>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                      {record.status}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <InfoCard label="Check-in luc" value={record.checkinTime ? formatDateTime(record.checkinTime) : "--"} />
                    <InfoCard label="Phuong thuc" value={record.method || "--"} />
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <p className="mt-2 break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
