import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2, History, LocateFixed, QrCode, ScanLine } from "lucide-react";
import { toast } from "sonner";

import {
  attendanceApi,
  getAttendanceErrorMessage,
  type AttendanceCheckInResponse,
  type AttendanceHistoryResponse,
} from "@/api/attendanceApi.ts";

type StudentAttendanceCheckInProps = {
  offeringId: string;
};

type GeoState = {
  latitude: number;
  longitude: number;
  accuracy: number;
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "--";
  }

  return new Date(value).toLocaleString("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function StudentAttendanceCheckIn({
  offeringId,
}: StudentAttendanceCheckInProps) {
  const [qrContent, setQrContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkInResult, setCheckInResult] = useState<AttendanceCheckInResponse | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryResponse[]>([]);
  const [geoState, setGeoState] = useState<GeoState | null>(null);

  const loadHistory = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await attendanceApi.getMyAttendanceHistory(offeringId);
      setHistory(response);
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (!offeringId) {
      return;
    }

    loadHistory();
  }, [offeringId]);

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error("Trinh duyet khong ho tro GPS.");
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
        () => reject(new Error("Khong the lay vi tri hien tai.")),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 0,
        },
      );
    });
  };

  const handleGetLocation = async () => {
    try {
      setIsLocating(true);
      const location = await getCurrentLocation();
      setGeoState(location);
      toast.success("Da cap nhat vi tri GPS.");
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!qrContent.trim()) {
      const message = "Vui long dan noi dung QR de diem danh.";
      setErrorMessage(message);
      toast.error(message);
      return;
    }

    try {
      setIsSubmitting(true);
      const location = geoState ?? await getCurrentLocation();
      setGeoState(location);

      const response = await attendanceApi.checkInByQr({
        qrContent: qrContent.trim(),
        latitude: location.latitude,
        longitude: location.longitude,
      });
      setCheckInResult(response);
      setQrContent("");
      toast.success(response.message || "Diem danh thanh cong.");
      await loadHistory();
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <div className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">Diem danh bang QR + GPS</h4>
              <p className="text-sm text-slate-500">
                Dan noi dung QR va cap quyen vi tri de gui check-in.
              </p>
            </div>
          </div>

          <form className="mt-4 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">QR content</span>
              <textarea
                value={qrContent}
                onChange={(event) => setQrContent(event.target.value)}
                placeholder={`{"sessionId":"...","qrToken":"..."}`}
                className="min-h-36 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 outline-none transition focus:border-emerald-400 focus:bg-white"
              />
            </label>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Vi tri hien tai</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {geoState
                      ? `${geoState.latitude.toFixed(6)}, ${geoState.longitude.toFixed(6)} - sai so ${Math.round(geoState.accuracy)}m`
                      : "Chua lay GPS"}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={isLocating}
                  className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <LocateFixed className="h-4 w-4" />
                  {isLocating ? "Dang lay GPS..." : "Lay GPS"}
                </button>
              </div>
            </div>

            {errorMessage ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-600/20 transition hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <QrCode className="h-4 w-4" />
              {isSubmitting ? "Dang gui diem danh..." : "Xac nhan diem danh"}
            </button>
          </form>
        </div>

        {checkInResult ? (
          <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white p-2 text-emerald-700 shadow-sm">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                  Check-in thanh cong
                </p>
                <p className="mt-2 text-base font-bold text-slate-900">{checkInResult.message}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Ngay hoc" value={checkInResult.studyDate} />
                  <InfoItem label="Thoi gian" value={formatDateTime(checkInResult.checkinTime)} />
                  <InfoItem label="Session ID" value={checkInResult.sessionId} />
                  <InfoItem label="Phuong thuc" value={checkInResult.method} />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
            <History className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Lich su diem danh cua toi</h4>
            <p className="text-sm text-slate-500">Cac lan check-in gan nhat trong hoc phan.</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {isLoadingHistory ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              Dang tai lich su diem danh...
            </div>
          ) : history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
              Ban chua co ban ghi diem danh nao trong hoc phan nay.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.attendanceId} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.studyDate}</p>
                    <p className="mt-1 text-xs text-slate-500">Session: {item.sessionId}</p>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                    {item.status}
                  </span>
                </div>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <InfoItem label="Check-in luc" value={formatDateTime(item.checkinTime)} />
                  <InfoItem label="Phuong thuc" value={item.method || "--"} />
                </div>
                <p className="mt-3 text-sm text-slate-600">{item.note || "Khong co ghi chu."}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white px-3 py-2">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-1 break-all text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
