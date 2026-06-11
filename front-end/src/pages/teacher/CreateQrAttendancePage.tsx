import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Clock3, LocateFixed, QrCode, Timer, Users2 } from "lucide-react";
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
  radius: string;
};

type GeoState = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

type ReverseGeocodeResponse = {
  display_name?: string;
};

function formatReverseGeocodeAddress(rawAddress: string) {
  return rawAddress
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .filter((part) => !/^\d{4,}$/.test(part))
    .filter((part) => part.toLowerCase() !== "vietnam")
    .slice(0, 6)
    .join(", ");
}

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

function formatMeters(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) {
    return "--";
  }

  return `${value.toFixed(1)} m`;
}

function getSessionStatusBadgeClass(status: string) {
  return status === "CLOSED"
    ? "bg-rose-100 text-rose-700"
    : "bg-emerald-100 text-emerald-700";
}

export default function CreateQrAttendancePage() {
    const { id } = useParams<{ id: string }>();
    const [form, setForm] = useState<FormState>({
        attendanceDate: defaultDate,
        startTime: "",
        endTime: "",
        radius: "100",
    });
    const [activeSession, setActiveSession] = useState<AttendanceSessionResponse | null>(null);
    const [sessions, setSessions] = useState<AttendanceSessionSummaryResponse[]>([]);
    const [selectedSessionId, setSelectedSessionId] = useState("");
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceStudentResponse[]>([]);
    const [geoState, setGeoState] = useState<GeoState | null>(null);
    const [geoAddress, setGeoAddress] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLocating, setIsLocating] = useState(false);
    const [isResolvingAddress, setIsResolvingAddress] = useState(false);
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

    const getCurrentLocation = async () => {
        if (!navigator.geolocation) {
            throw new Error("Trình duyệt không hỗ trợ định vị GPS.");
        }

        return new Promise<GeoState>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                    });
                },
                () => reject(new Error("Không thể lấy vị trí hiện tại.")),
                {
                    enableHighAccuracy: true,
                    timeout: 15000,
                    maximumAge: 0,
                },
            );
        });
    };

    const getLocationAddress = async (latitude: number, longitude: number) => {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            {
                headers: {
                    Accept: "application/json",
                },
            },
        );

        if (!response.ok) {
            throw new Error("Khong the lay dia chi tu toa do hien tai.");
        }

        const data = (await response.json()) as ReverseGeocodeResponse;
        return formatReverseGeocodeAddress(data.display_name || "");
    };

    const updateLocationAddress = async (latitude: number, longitude: number) => {
        try {
            setIsResolvingAddress(true);
            const address = await getLocationAddress(latitude, longitude);
            setGeoAddress(address);
        } catch {
            setGeoAddress("");
        } finally {
            setIsResolvingAddress(false);
        }
    };

    const handleGetLocation = async () => {
        try {
            setIsLocating(true);
            const location = await getCurrentLocation();
            setGeoState(location);
            await updateLocationAddress(location.latitude, location.longitude);
            toast.success("Đã cập nhật vị trí GPS thành công.");
        } catch (error) {
            const message = getAttendanceErrorMessage(error);
            setErrorMessage(message);
            toast.error(message);
        } finally {
            setIsLocating(false);
        }
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
            const message = "Mã QR hiện tại chưa hết hạn. Hãy đợi phiên này kết thúc.";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        if (!id) {
            const message = "Không tìm thấy offeringId của lớp học phần.";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        if (!form.attendanceDate || !form.startTime || !form.endTime) {
            const message = "Vui lòng nhập đầy đủ ngày, giờ bắt đầu và giờ kết thúc.";
            setErrorMessage(message);
            toast.error(message);
            return;
        }

        try {
            setIsSubmitting(true);
            const location = geoState ?? await getCurrentLocation();
            setGeoState(location);
            if (!geoAddress) {
                void updateLocationAddress(location.latitude, location.longitude);
            }

            const startDateTime = toDateTimeValue(form.attendanceDate, form.startTime);
            const endDateTime = toDateTimeValue(form.attendanceDate, form.endTime);

            if (new Date(startDateTime) >= new Date(endDateTime)) {
                throw new Error("Giờ bắt đầu phải nhỏ hơn giờ kết thúc.");
            }

            const response = await attendanceApi.createAttendanceSession({
                offeringId: id,
                attendanceDate: form.attendanceDate,
                startTime: startDateTime,
                endTime: endDateTime,
                latitude: location.latitude,
                longitude: location.longitude,
                radius: Number(form.radius),
            });

            setActiveSession(response);
            await loadSessions(response.sessionId);
            toast.success("Tạo phiên điểm danh QR + GPS thành công.");
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
              Điểm danh QR + GPS
            </span>
                        <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
                            Tạo phiên điểm danh QR cho lớp học phần
                        </h2>

                    </div>

                    <div className="rounded-[1.75rem] border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">Lớp học phần</p>
                        <p className="mt-2 text-lg font-bold text-slate-900">{id || "Chưa xác định"}</p>
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
                            <h3 className="text-xl font-bold text-slate-900">Thông tin phiên điểm danh</h3>
                        </div>
                    </div>

                    {hasActiveQr ? (
                        <div className="mb-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
                            Mã QR hiện tại còn hiệu lực. Thời gian hết hạn còn lại: <span className="font-bold">{remainingLabel}</span>
                        </div>
                    ) : null}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <label className="block">
                            <span className="mb-2 block text-sm font-semibold text-slate-700">Ngày điểm danh</span>
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
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ bắt đầu</span>
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
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Giờ kết thúc</span>
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

                        <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_180px]">
                            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm font-semibold text-slate-900">Vị trí giảng viên</p>
                                        <p className="mt-1 text-xs text-slate-500">
                                            {geoState
                                                ? `${geoState.latitude.toFixed(6)}, ${geoState.longitude.toFixed(6)} - sai số ${Math.round(geoState.accuracy)}m`
                                                : "Chưa lấy GPS"}
                                        </p>
                                        {geoState ? (
                                            <p className="mt-2 text-xs leading-5 text-slate-600">
                                                {isResolvingAddress
                                                    ? "Dang lay dia chi chi tiet..."
                                                    : geoAddress || "Chua lay duoc dia chi chi tiet."}
                                            </p>
                                        ) : null}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={isLocating || hasActiveQr}
                                        className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                                    >
                                        <LocateFixed className="h-4 w-4" />
                                        {isLocating ? "Đang lấy GPS..." : "Lấy GPS"}
                                    </button>
                                </div>
                            </div>

                            <label className="block">
                                <span className="mb-2 block text-sm font-semibold text-slate-700">Bán kính (m)</span>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.radius}
                                    onChange={(event) => handleChange("radius", event.target.value)}
                                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                                    required
                                    disabled={hasActiveQr}
                                />
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
                            {hasActiveQr ? "Đang có mã QR hoạt động" : isSubmitting ? "Đang tạo phiên..." : "Tạo phiên điểm danh QR"}
                        </button>
                    </form>
                </article>

                <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="rounded-2xl bg-slate-900/5 p-3 text-slate-700">
                            <QrCode className="h-5 w-5" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">QR hiện tại</h3>
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
                                <StatusInfoCard label="Trạng thái" value={displayedSession.status} />
                                <InfoCard label="Hết hạn còn lại" value={remainingLabel || "Đã hết hạn"} />
                                <InfoCard label="Bắt đầu" value={formatDateTime(displayedSession.startTime)} />
                                <InfoCard label="Kết thúc" value={formatDateTime(displayedSession.endTime)} />
                            </div>

                            <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Nội dung mã QR (QR Content)</p>
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
                            <h4 className="mt-5 text-lg font-bold text-slate-900">Không có QR đang hoạt động</h4>
                            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                                Khi tạo phiên mới, mã QR sẽ hiển thị ở đây để sinh viên quét.
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
                            <h3 className="text-xl font-bold text-slate-900">Các phiên điểm danh</h3>
                            <p className="text-sm text-slate-500">Tiêu đề hiển thị theo ngày.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {isLoadingSessions ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                Đang tải danh sách phiên điểm danh...
                            </div>
                        ) : sessions.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                Chưa có phiên điểm danh nào cho lớp học phần này.
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
                                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSessionStatusBadgeClass(session.status)}`}>
                      {session.status}
                    </span>
                                    </div>
                                    <p className="mt-3 text-sm text-slate-600">
                                        Đã điểm danh: <span className="font-semibold text-slate-900">{session.checkedInCount}</span>
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
                            <h3 className="text-xl font-bold text-slate-900">Sinh viên đã điểm danh</h3>
                            <p className="text-sm text-slate-500">Danh sách cập nhật theo phiên đang chọn.</p>
                        </div>
                    </div>

                    <div className="mt-5 space-y-3">
                        {!selectedSession ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                Hãy chọn một phiên điểm danh để xem dữ liệu.
                            </div>
                        ) : isLoadingRecords ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                Đang tải danh sách sinh viên đã điểm danh...
                            </div>
                        ) : attendanceRecords.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                                Chưa có sinh viên nào điểm danh ở phiên ngày {formatDateOnly(selectedSession.attendanceDate)}.
                            </div>
                        ) : (
                            <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-slate-200 text-sm">
                                        <thead className="bg-slate-100/90">
                                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                            <th className="px-4 py-3">STT</th>
                                            <th className="px-4 py-3">Sinh viên</th>
                                            <th className="px-4 py-3">Thời gian Check-in</th>
                                            <th className="px-4 py-3">Phương thức</th>
                                            <th className="px-4 py-3">Khoảng cách</th>
                                            <th className="px-4 py-3">Bán kính</th>
                                            <th className="px-4 py-3">Vị trí sinh viên</th>
                                            <th className="px-4 py-3">Trạng thái</th>
                                            <th className="px-4 py-3">Đối chiếu GPS</th>
                                        </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 bg-white">
                                        {attendanceRecords.map((record, index) => (
                                            <tr key={record.attendanceId} className="align-top text-slate-700">
                                                <td className="px-4 py-4 font-semibold text-slate-500">{index + 1}</td>
                                                <td className="px-4 py-4">
                                                    <p className="font-semibold text-slate-900">{record.studentName}</p>
                                                    <p className="mt-1 text-xs text-slate-500">{record.studentId}</p>
                                                    {record.email ? (
                                                        <p className="mt-1 text-xs text-slate-500">{record.email}</p>
                                                    ) : null}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    {record.checkinTime ? formatDateTime(record.checkinTime) : "--"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">{record.method || "--"}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">{formatMeters(record.distance)}</td>
                                                <td className="px-4 py-4 whitespace-nowrap">{formatMeters(record.sessionRadius)}</td>
                                                <td className="px-4 py-4">
                                                    {record.latitude != null && record.longitude != null
                                                        ? `${record.latitude.toFixed(6)}, ${record.longitude.toFixed(6)}`
                                                        : "--"}
                                                </td>
                                                <td className="px-4 py-4">
                                                    <div className="flex flex-col gap-2">
                              <span className="inline-flex w-fit rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                {record.status}
                              </span>
                                                        <span
                                                            className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                                                record.suspicious
                                                                    ? "bg-rose-100 text-rose-700"
                                                                    : "bg-sky-100 text-sky-700"
                                                            }`}
                                                        >
                                {record.suspicious ? "Nghi ngờ gian lận" : "Hợp lệ"}
                              </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    {record.suspiciousReason || "Vị trí nằm trong bán kính cho phép"}
                                                </td>
                                            </tr>
                                        ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
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

function StatusInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <div className="mt-2">
        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getSessionStatusBadgeClass(value)}`}>
          {value}
        </span>
      </div>
    </div>
  );
}
