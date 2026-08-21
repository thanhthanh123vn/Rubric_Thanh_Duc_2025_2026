import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import {
  CalendarDays,
  Camera,
  CameraOff,
  CheckCircle2,
  Clock3,
  History,
  LocateFixed,
  QrCode,
  ScanLine,
  TrendingUp,
  UserCheck,
  UserX,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  attendanceApi,
  getAttendanceErrorMessage,
  type AttendanceCheckInResponse,
  type AttendanceHistoryResponse,
  type AttendanceSessionSummaryResponse,
} from "@/api/attendanceApi.ts";
import { getBrowserId } from "@/utils/browserId.ts";

type Props = { offeringId: string };
type GeoState = { latitude: number; longitude: number; accuracy: number; capturedAt: number };
type ScannerControls = { stop: () => void };
type AttendanceTableRow = {
  session: AttendanceSessionSummaryResponse;
  record: AttendanceHistoryResponse | null;
};

function formatDateTime(value: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

function formatDateOnly(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "--" : date.toLocaleDateString("vi-VN");
}

function formatTimeOnly(value: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function getMethodLabel(method: string | null) {
  if (method === "QR") return "QR + GPS";
  if (method === "MANUAL") return "Giảng viên cập nhật";
  return method || "--";
}

function getAttendanceStatus(row: AttendanceTableRow) {
  if (row.record?.status === "PRESENT") return "present";
  if (row.record?.status === "ABSENT") return "absent";
  return new Date(row.session.startTime).getTime() > Date.now() ? "upcoming" : "absent";
}

function getStatusBadge(status: ReturnType<typeof getAttendanceStatus>) {
  if (status === "present") {
    return { label: "Có mặt", className: "border-emerald-200 bg-emerald-50 text-emerald-700" };
  }
  if (status === "upcoming") {
    return { label: "Chưa diễn ra", className: "border-sky-200 bg-sky-50 text-sky-700" };
  }
  return { label: "Vắng", className: "border-rose-200 bg-rose-50 text-rose-700" };
}

export default function StudentAttendanceCheckIn({ offeringId }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scannerControlsRef = useRef<ScannerControls | null>(null);
  const scanHandledRef = useRef(false);

  const [qrContent, setQrContent] = useState("");
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInResult, setCheckInResult] = useState<AttendanceCheckInResponse | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryResponse[]>([]);
  const [sessions, setSessions] = useState<AttendanceSessionSummaryResponse[]>([]);
  const [geoState, setGeoState] = useState<GeoState | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const stopScanner = () => {
    scannerControlsRef.current?.stop();
    scannerControlsRef.current = null;
    scanHandledRef.current = false;
    setIsScanning(false);
  };

  const loadAttendanceData = async () => {
    try {
      setIsLoadingHistory(true);
      setErrorMessage("");
      const [historyResponse, sessionResponse] = await Promise.all([
        attendanceApi.getMyAttendanceHistory(offeringId),
        attendanceApi.getAttendanceSessionsByOffering(offeringId),
      ]);
      setHistory(historyResponse);
      setSessions(sessionResponse);
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!offeringId) return;

    let isCurrent = true;
    Promise.all([
      attendanceApi.getMyAttendanceHistory(offeringId),
      attendanceApi.getAttendanceSessionsByOffering(offeringId),
    ])
      .then(([historyResponse, sessionResponse]) => {
        if (!isCurrent) return;
        setHistory(historyResponse);
        setSessions(sessionResponse);
      })
      .catch((error: unknown) => {
        if (isCurrent) setErrorMessage(getAttendanceErrorMessage(error));
      })
      .finally(() => {
        if (isCurrent) setIsLoadingHistory(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [offeringId]);

  useEffect(() => () => scannerControlsRef.current?.stop(), []);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => {
      setIsOnline(false);
      stopScanner();
      setIsScannerOpen(false);
    };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) throw new Error("Trình duyệt không hỗ trợ định vị GPS.");

    return new Promise<GeoState>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          capturedAt: Date.now(),
        }),
        (error) => {
          const message = error.code === error.PERMISSION_DENIED
            ? "Bạn chưa cấp quyền vị trí. Hãy cho phép GPS trong cài đặt trình duyệt."
            : error.code === error.TIMEOUT
              ? "GPS phản hồi quá chậm. Hãy ra nơi thoáng và thử lại."
              : "Không thể xác định vị trí hiện tại. Hãy bật GPS và thử lại.";
          reject(new Error(message));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
      );
    });
  };

  const handleGetLocation = async () => {
    try {
      setIsLocating(true);
      setErrorMessage("");
      const location = await getCurrentLocation();
      setGeoState(location);
      toast.success("Đã cập nhật vị trí GPS.");
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLocating(false);
    }
  };

  const submitCheckIn = async (content: string) => {
    if (!content.trim() || isSubmitting) return;
    if (!navigator.onLine) {
      const message = "Thiết bị đang ngoại tuyến. Hãy kết nối mạng trước khi điểm danh.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      const hasFreshLocation = geoState && Date.now() - geoState.capturedAt < 30000;
      const location = hasFreshLocation ? geoState : await getCurrentLocation();
      setGeoState(location);
      const response = await attendanceApi.checkInByQr({
        qrContent: content.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
        browserId: getBrowserId(),
      });
      setCheckInResult(response);
      setQrContent("");
      toast.success(response.message || "Điểm danh thành công.");
      await loadAttendanceData();
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startScanner = async () => {
    if (!videoRef.current || isScanning) return;
    if (!navigator.onLine) {
      const message = "Thiết bị đang ngoại tuyến. Hãy kết nối mạng để điểm danh.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      const message =
        "Trình duyệt chỉ cho phép dùng camera trên HTTPS hoặc localhost. Hãy mở hệ thống bằng HTTPS rồi thử lại.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setErrorMessage("");
      setCheckInResult(null);
      setIsScanning(true);
      scanHandledRef.current = false;
      const { BrowserQRCodeReader } = await import("@zxing/browser");
      const reader = new BrowserQRCodeReader(undefined, { delayBetweenScanAttempts: 250 });
      scannerControlsRef.current = await reader.decodeFromConstraints(
        { audio: false, video: { facingMode: { ideal: "environment" } } },
        videoRef.current,
        (result, _error, controls) => {
          if (!result || scanHandledRef.current) return;
          scanHandledRef.current = true;
          const content = result.getText();
          setQrContent(content);
          controls.stop();
          scannerControlsRef.current = null;
          setIsScanning(false);
          setIsScannerOpen(false);
          toast.success("Đã quét được mã QR. Đang xác thực vị trí...");
          void submitCheckIn(content);
        },
      );
    } catch (error) {
      stopScanner();
      const message =
        error instanceof Error && error.name === "NotAllowedError"
          ? "Bạn chưa cấp quyền sử dụng camera."
          : "Không thể mở camera. Hãy kiểm tra quyền camera hoặc nhập nội dung QR thủ công.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  const openScanner = () => {
    setErrorMessage("");
    setCheckInResult(null);
    setIsScannerOpen(true);
    window.setTimeout(() => void startScanner(), 0);
  };

  const closeScanner = () => {
    stopScanner();
    setIsScannerOpen(false);
  };

  useEffect(() => {
    if (!isScannerOpen) return undefined;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeScanner();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isScannerOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!qrContent.trim()) {
      const message = "Vui lòng quét mã QR hoặc nhập nội dung QR.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }
    void submitCheckIn(qrContent);
  };

  const attendanceRows = useMemo<AttendanceTableRow[]>(() => {
    const recordsBySession = new Map(history.map((item) => [item.sessionId, item]));
    return sessions
      .map((session) => ({ session, record: recordsBySession.get(session.sessionId) || null }))
      .sort((a, b) => new Date(b.session.startTime).getTime() - new Date(a.session.startTime).getTime());
  }, [history, sessions]);

  const statistics = useMemo(() => {
    const rows = attendanceRows.filter((row) => getAttendanceStatus(row) !== "upcoming");
    const upcoming = attendanceRows.length - rows.length;
    const present = rows.filter((row) => getAttendanceStatus(row) === "present").length;
    const absent = rows.length - present;
    const rate = rows.length === 0 ? 0 : Math.round((present / rows.length) * 100);
    return {
      total: rows.length,
      present,
      absent,
      upcoming,
      rate,
      result: rows.length > 0 && rate >= 80 ? "Đạt" : "Chưa đạt",
    };
  }, [attendanceRows]);

  return (
    <div className="space-y-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatisticCard icon={CalendarDays} label="Số buổi đã học" value={String(statistics.total)}
          note="Không tính các buổi chưa diễn ra." tone="slate" />
        <StatisticCard icon={UserCheck} label="Có mặt" value={String(statistics.present)}
          note={`${statistics.present}/${statistics.total} buổi`} tone="emerald" />
        <StatisticCard icon={UserX} label="Vắng" value={String(statistics.absent)}
          note={`${statistics.absent}/${statistics.total} buổi`} tone="rose" />
        <StatisticCard icon={TrendingUp} label="Tỷ lệ chuyên cần" value={`${statistics.rate}%`}
          note={`${statistics.result} yêu cầu tối thiểu 80%`}
          tone={statistics.rate >= 80 ? "emerald" : "amber"} />
      </div>

      <section className="w-full space-y-6">
        <article className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <ScanLine className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Quét QR điểm danh</h3>
                <p className="mt-1 text-sm text-slate-500">Camera sẽ đọc QR và gửi check-in cùng vị trí GPS.</p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${isOnline ? "bg-sky-50 text-sky-700" : "bg-rose-50 text-rose-700"}`}>
                {isOnline ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
                {isOnline ? "Trực tuyến" : "Ngoại tuyến"}
              </span>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">QR + GPS</span>
            </div>
          </div>

          <div className="mt-5 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-[1fr_auto] sm:items-center sm:p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-sm">
                <QrCode className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Sẵn sàng quét mã QR</p>
                <p className="mt-1 text-sm leading-6 text-slate-500">Camera chỉ mở trong cửa sổ quét và sẽ tự tắt sau khi nhận diện thành công.</p>
              </div>
            </div>
            <button type="button" onClick={openScanner} disabled={isSubmitting || !isOnline}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">
              <Camera className="h-4 w-4" />Mở camera
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <button type="button" onClick={() => void handleGetLocation()} disabled={isLocating}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              <LocateFixed className="h-4 w-4 text-emerald-600" />
              {isLocating ? "Đang lấy GPS..." : geoState ? "Cập nhật GPS" : "Lấy vị trí GPS"}
            </button>
            <div className={`flex min-h-12 items-center gap-3 rounded-xl border px-4 py-3 ${geoState ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
              <LocateFixed className={`h-4 w-4 shrink-0 ${geoState ? "text-emerald-600" : "text-amber-600"}`} />
              <div className="min-w-0">
                <p className={`text-sm font-semibold ${geoState ? "text-emerald-800" : "text-amber-800"}`}>{geoState ? "Đã xác định vị trí" : "Chưa có vị trí GPS"}</p>
                <p className="truncate text-xs text-slate-500">{geoState ? `Sai số khoảng ${Math.round(geoState.accuracy)} m` : "GPS sẽ được kiểm tra khi điểm danh"}</p>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Vị trí hiện tại</p>
            <p className="mt-1 text-sm text-slate-700">
              {geoState
                ? `${geoState.latitude.toFixed(6)}, ${geoState.longitude.toFixed(6)} · sai số ${Math.round(geoState.accuracy)} m`
                : "Chưa lấy vị trí GPS"}
            </p>
          </div>

          <details className="mt-4 rounded-xl border border-slate-200 bg-white">
            <summary className="cursor-pointer px-4 py-3 text-sm font-semibold text-slate-700">Nhập nội dung QR thủ công</summary>
            <form className="space-y-3 border-t border-slate-200 p-4" onSubmit={handleSubmit}>
              <textarea value={qrContent} onChange={(event) => setQrContent(event.target.value)}
                placeholder={`{"sessionId":"...","qrToken":"..."}`}
                className="min-h-24 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-mono text-sm outline-none focus:border-emerald-400" />
              <button type="submit" disabled={isSubmitting || !isOnline}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60 sm:w-auto">
                <QrCode className="h-4 w-4" />{isSubmitting ? "Đang xác nhận..." : "Xác nhận điểm danh"}
              </button>
            </form>
          </details>

          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{errorMessage}</div>
          ) : null}
          {checkInResult ? (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">Điểm danh thành công</p>
                  <p className="mt-1 text-sm text-emerald-700">
                    {formatDateTime(checkInResult.checkinTime)} · {getMethodLabel(checkInResult.method)}
                  </p>
                </div>
              </div>
            </div>
          ) : null}
        </article>

        <article className="w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-100 p-3 text-slate-700"><History className="h-5 w-5" /></div>
              <div>
                <h3 className="font-bold text-slate-900">Lịch sử điểm danh</h3>
                <p className="mt-1 text-sm text-slate-500">Các buổi gần nhất được hiển thị trước.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700">{statistics.present} có mặt</span>
              <span className="rounded-full bg-rose-50 px-3 py-1.5 text-rose-700">{statistics.absent} vắng</span>
              {statistics.upcoming > 0 && <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-700">{statistics.upcoming} sắp tới</span>}
            </div>
          </div>

          {isLoadingHistory ? (
            <div className="p-10 text-center text-sm text-slate-500">Đang tải lịch sử điểm danh...</div>
          ) : attendanceRows.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">Chưa có phiên điểm danh nào trong học phần này.</div>
          ) : (
            <>
              <div className="space-y-3 p-4 sm:hidden">
                {attendanceRows.map((row, index) => {
                  const status = getAttendanceStatus(row);
                  const badge = getStatusBadge(status);
                  return (
                    <article key={row.session.sessionId} className={`relative overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ${status === "present" ? "border-emerald-200" : status === "absent" ? "border-rose-200" : "border-sky-200"}`}>
                      <span className={`absolute inset-y-0 left-0 w-1 ${status === "present" ? "bg-emerald-500" : status === "absent" ? "bg-rose-500" : "bg-sky-500"}`} />
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Buổi {attendanceRows.length - index}</p>
                          <p className="mt-1 font-bold text-slate-900">{formatDateOnly(row.session.attendanceDate)}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />{formatTimeOnly(row.session.startTime)}–{formatTimeOnly(row.session.endTime)}
                          </p>
                        </div>
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                      </div>
                      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-xs text-slate-500">Check-in</dt><dd className="mt-1 font-medium text-slate-800">{formatDateTime(row.record?.checkinTime || null)}</dd></div>
                        <div><dt className="text-xs text-slate-500">Phương thức</dt><dd className="mt-1 font-medium text-slate-800">{getMethodLabel(row.record?.method || null)}</dd></div>
                      </dl>
                      {row.record?.note ? <p className="mt-3 border-t border-slate-200 pt-3 text-xs text-slate-600">{row.record.note}</p> : null}
                    </article>
                  );
                })}
              </div>
              <div className="hidden max-h-[560px] overflow-auto sm:block">
                <table className="w-full min-w-[820px] border-separate border-spacing-0 text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50/95 backdrop-blur">
                  <tr className="text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
                    <th className="w-20 border-b border-slate-200 px-5 py-3 text-center">Buổi</th>
                    <th className="border-b border-slate-200 px-5 py-3">Ngày học</th>
                    <th className="border-b border-slate-200 px-5 py-3">Check-in</th>
                    <th className="border-b border-slate-200 px-5 py-3">Phương thức</th>
                    <th className="border-b border-slate-200 px-5 py-3">Trạng thái</th>
                    <th className="border-b border-slate-200 px-5 py-3">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {attendanceRows.map((row, index) => {
                    const status = getAttendanceStatus(row);
                    const badge = getStatusBadge(status);
                    return (
                      <tr key={row.session.sessionId} className="align-middle text-slate-700 transition hover:bg-emerald-50/30">
                        <td className="border-b border-slate-100 px-5 py-4 text-center"><span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100 font-bold text-slate-600">{attendanceRows.length - index}</span></td>
                        <td className="whitespace-nowrap border-b border-slate-100 px-5 py-4">
                          <p className="font-semibold text-slate-900">{formatDateOnly(row.session.attendanceDate)}</p>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                            <Clock3 className="h-3.5 w-3.5" />{formatTimeOnly(row.session.startTime)}–{formatTimeOnly(row.session.endTime)}
                          </p>
                        </td>
                        <td className="whitespace-nowrap border-b border-slate-100 px-5 py-4 font-medium text-slate-800">{formatDateTime(row.record?.checkinTime || null)}</td>
                        <td className="whitespace-nowrap border-b border-slate-100 px-5 py-4"><span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">{getMethodLabel(row.record?.method || null)}</span></td>
                        <td className="border-b border-slate-100 px-5 py-4">
                          <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badge.className}`}>{badge.label}</span>
                        </td>
                        <td className="min-w-48 border-b border-slate-100 px-5 py-4 text-slate-600">
                          {row.record?.note || (status === "absent" ? "Không có bản ghi check-in." : "--")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                </table>
              </div>
            </>
          )}
        </article>
      </section>

      {isScannerOpen ? createPortal(
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/70 p-3 backdrop-blur-sm sm:p-6"
          role="dialog" aria-modal="true" aria-labelledby="attendance-scanner-title" onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeScanner();
          }}>
          <div className="flex max-h-[94svh] w-full max-w-2xl flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><ScanLine className="h-5 w-5" /></div>
                <div>
                  <h3 id="attendance-scanner-title" className="font-bold text-slate-900">Quét QR điểm danh</h3>
                  <p className="text-xs text-slate-500">Đưa mã QR vào chính giữa khung hình</p>
                </div>
              </div>
              <button type="button" onClick={closeScanner} aria-label="Đóng camera"
                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>

            <div className="bg-slate-950 p-3 sm:p-5">
              <div className="relative mx-auto aspect-[4/3] max-h-[65svh] overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} className={`h-full w-full object-cover transition-opacity ${isScanning ? "opacity-100" : "opacity-30"}`} muted playsInline />
                {isScanning ? (
                  <>
                    <div className="pointer-events-none absolute inset-[16%] rounded-2xl border-2 border-emerald-400 shadow-[0_0_0_999px_rgba(2,6,23,0.42)]" />
                    <div className="pointer-events-none absolute left-[16%] right-[16%] top-1/2 h-0.5 animate-pulse bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center text-white">
                    <CameraOff className="h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-semibold">{errorMessage ? "Không thể mở camera" : "Đang khởi động camera..."}</p>
                    {errorMessage ? (
                      <>
                        <p className="mt-2 max-w-md text-xs leading-5 text-slate-300">{errorMessage}</p>
                        <button type="button" onClick={() => void startScanner()}
                          className="mt-4 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100">Thử lại</button>
                      </>
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div className="flex items-center gap-2 text-xs text-slate-500"><LocateFixed className="h-4 w-4 text-emerald-600" />GPS sẽ được xác thực tự động sau khi quét.</div>
              <button type="button" onClick={closeScanner}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                <CameraOff className="h-4 w-4" />Tắt camera
              </button>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  );
}

function StatisticCard({
  icon: Icon, label, value, note, tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  note: string;
  tone: "slate" | "emerald" | "rose" | "amber";
}) {
  const toneClass = {
    slate: "border-slate-200 bg-white text-slate-600",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    rose: "border-rose-200 bg-rose-50 text-rose-700",
    amber: "border-amber-200 bg-amber-50 text-amber-700",
  }[tone];
  return (
    <div className={`min-w-0 rounded-2xl border p-3 sm:p-4 ${toneClass}`}>
      <div className="flex items-center justify-between gap-3"><p className="text-sm font-semibold">{label}</p><Icon className="h-5 w-5" /></div>
      <p className="mt-3 text-xl font-bold text-slate-900 sm:text-2xl">{value}</p>
      <p className="mt-1 text-xs text-slate-500">{note}</p>
    </div>
  );
}
