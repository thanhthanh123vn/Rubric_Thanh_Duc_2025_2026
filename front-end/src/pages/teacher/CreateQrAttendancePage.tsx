import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CalendarDays, Clock3, Download, LocateFixed, Pencil, Plus, QrCode, Search, Timer, Users2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import {
  attendanceApi,
  getAttendanceErrorMessage,
  type AttendanceLegendResponse,
  type AttendanceOverviewDateResponse,
  type AttendanceSessionResponse,
  type AttendanceSessionSummaryResponse,
  type AttendanceStudentOverviewResponse,
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

type AttendanceRecordTab = "valid" | "invalid" | "suspicious";
export type AttendancePageView = "create" | "history" | "overview";
type AttendanceLegendType = "present" | "absent" | "fraud" | "custom";
type AttendanceCellEditorState = {
  studentId: string;
  sessionId: string;
  legendType: AttendanceLegendType;
  colorHex: string;
  legendLabel: string;
  note: string;
};

type AttendanceLegendDraft = {
  id: string | null;
  name: string;
  color: string;
};

type AttendanceLegendItem = {
  id: string;
  name: string;
  color: string;
};

function toAttendanceLegendItem(legend: AttendanceLegendResponse): AttendanceLegendItem {
  return {
    id: legend.legendId,
    name: legend.legendLabel,
    color: legend.colorHex,
  };
}

const defaultDate = new Date().toISOString().slice(0, 10);
const PRESENT_COLOR = "#BBF7D0";
const ABSENT_COLOR = "#FECDD3";
const DEFAULT_FRAUD_COLOR = "#FDE68A";
const DEFAULT_FRAUD_LABEL = "Gian lận GPS";

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

function formatShortDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN");
}

function formatRemaining(endTime: string) {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) {
    return "Đã hết hạn";
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

function getSessionStatusLabel(status: string) {
  switch (status) {
    case "OPEN":
      return "Đang mở";
    case "CLOSED":
      return "Đã đóng";
    default:
      return status;
  }
}

function getAttendanceStatusLabel(status: string) {
  switch (status) {
    case "PRESENT":
      return "Có mặt";
    case "ABSENT":
      return "Vắng";
    case "LATE":
      return "Đi muộn";
    default:
      return status;
  }
}

function getAttendanceMethodLabel(method: string | null) {
  if (!method) {
    return "--";
  }

  switch (method) {
    case "QR":
      return "QR";
    case "MANUAL":
      return "Thủ công";
    default:
      return method;
  }
}

function isSuspiciousFraudRecord(record: AttendanceStudentResponse) {
  const reason = record.suspiciousReason?.toLowerCase() || "";
  return reason.includes("browser id") || reason.includes("user-agent") || reason.includes("ip ");
}

function isInvalidAttendanceRecord(record: AttendanceStudentResponse) {
  if (isSuspiciousFraudRecord(record)) {
    return false;
  }

  const reason = record.suspiciousReason?.toLowerCase() || "";
  return reason.includes("khong co du lieu gps") || reason.includes("vuot qua ban kinh");
}

function getAttendanceRecordTab(record: AttendanceStudentResponse): AttendanceRecordTab {
  if (isSuspiciousFraudRecord(record)) {
    return "suspicious";
  }
  if (isInvalidAttendanceRecord(record)) {
    return "invalid";
  }
  return "valid";
}

function getAttendanceTabLabel(tab: AttendanceRecordTab) {
  switch (tab) {
    case "valid":
      return "Hợp lệ";
    case "invalid":
      return "Không hợp lệ";
    case "suspicious":
      return "Nghi ngờ";
  }
}

function getGpsReviewLabel(record: AttendanceStudentResponse) {
  const reason = record.suspiciousReason?.toLowerCase() || "";
  const labels: string[] = [];

  if (reason.includes("khong co du lieu gps")) {
    labels.push("Thiếu GPS");
  }
  if (reason.includes("vuot qua ban kinh")) {
    labels.push("Ngoài bán kính");
  }
  if (reason.includes("browser id") || reason.includes("user-agent") || reason.includes("ip ")) {
    labels.push("Trùng thiết bị/IP");
  }

  if (labels.length > 0) {
    return labels.join(", ");
  }

  return record.suspicious ? "Cần kiểm tra" : "Trong bán kính";
}

function canReviewAttendanceRecord(record: AttendanceStudentResponse) {
  return Boolean(record.suspicious);
}

function getAttendanceResultLabel(status: string) {
  return status === "PASS" ? "Đậu" : "Rớt";
}

function getAttendanceResultClass(status: string) {
  return status === "PASS"
    ? "bg-emerald-100 text-emerald-700"
    : "bg-rose-100 text-rose-700";
}

function getOverviewCellKey(studentId: string, sessionId: string) {
  return `${studentId}__${sessionId}`;
}

function getCellTextColor(hexColor: string) {
  const normalized = hexColor.replace("#", "");
  if (normalized.length !== 6) {
    return "#0f172a";
  }

  const red = Number.parseInt(normalized.slice(0, 2), 16);
  const green = Number.parseInt(normalized.slice(2, 4), 16);
  const blue = Number.parseInt(normalized.slice(4, 6), 16);
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  return brightness > 160 ? "#0f172a" : "#ffffff";
}

function buildLegendId(name: string, color: string) {
  return `${name.trim().toLowerCase()}__${color.trim().toUpperCase()}`;
}

function buildAttendanceExportValue(cell: AttendanceOverviewDateResponse) {
  if (cell.note && cell.note.trim()) {
    return cell.note.trim();
  }

  return cell.status === "PRESENT" ? "Có mặt" : "Vắng";
}

function getOverviewColorKey(cell: AttendanceOverviewDateResponse): AttendanceLegendType {
  if (cell.colorHex || cell.legendLabel) {
    return "custom";
  }
  if (cell.category === "FRAUD") {
    return "fraud";
  }

  return cell.status === "PRESENT" ? "present" : "absent";
}

export default function CreateQrAttendancePage({ view = "create" }: { view?: AttendancePageView }) {
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
  const [sessionDateFilter, setSessionDateFilter] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceStudentResponse[]>([]);
  const [attendanceOverviewRows, setAttendanceOverviewRows] = useState<AttendanceStudentOverviewResponse[]>([]);
  const [activeRecordTab, setActiveRecordTab] = useState<AttendanceRecordTab>("valid");
  const [editingCell, setEditingCell] = useState<AttendanceCellEditorState | null>(null);
  const [customLegends, setCustomLegends] = useState<AttendanceLegendItem[]>([]);
  const [legendDraft, setLegendDraft] = useState<AttendanceLegendDraft>({
    id: null,
    name: "",
    color: DEFAULT_FRAUD_COLOR,
  });
  const [geoState, setGeoState] = useState<GeoState | null>(null);
  const [geoAddress, setGeoAddress] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isLoadingRecords, setIsLoadingRecords] = useState(false);
  const [isLoadingOverview, setIsLoadingOverview] = useState(false);
  const [updatingAttendanceId, setUpdatingAttendanceId] = useState("");
  const [savingOverviewCellKey, setSavingOverviewCellKey] = useState("");
  const [remainingLabel, setRemainingLabel] = useState("");
  const [studentSearch, setStudentSearch] = useState("");

  const hasActiveQr = Boolean(
    activeSession && new Date(activeSession.endTime).getTime() > Date.now(),
  );

  const displayedSession = hasActiveQr ? activeSession : null;

  const selectedSession = useMemo(
    () => sessions.find((session) => session.sessionId === selectedSessionId) || null,
    [selectedSessionId, sessions],
  );

  const filteredSessions = useMemo(() => {
    if (!sessionDateFilter) {
      return sessions;
    }
    return sessions.filter((session) => session.attendanceDate === sessionDateFilter);
  }, [sessionDateFilter, sessions]);

  const recordCounts = useMemo(() => {
    const counts: Record<AttendanceRecordTab, number> = {
      valid: 0,
      invalid: 0,
      suspicious: 0,
    };

    attendanceRecords.forEach((record) => {
      counts[getAttendanceRecordTab(record)] += 1;
    });

    return counts;
  }, [attendanceRecords]);

  const filteredAttendanceRecords = useMemo(
    () => attendanceRecords.filter((record) => getAttendanceRecordTab(record) === activeRecordTab),
    [activeRecordTab, attendanceRecords],
  );

  const overviewStats = useMemo(() => {
    const totalStudents = attendanceOverviewRows.length;
    const totalSessions = attendanceOverviewRows[0]?.totalSessions || 0;
    const passCount = attendanceOverviewRows.filter((row) => row.resultStatus === "PASS").length;
    return {
      totalStudents,
      totalSessions,
      passCount,
      failCount: totalStudents - passCount,
    };
  }, [attendanceOverviewRows]);

  const overviewDateColumns = useMemo(
    () => attendanceOverviewRows[0]?.attendanceDates || [],
    [attendanceOverviewRows],
  );

  const filteredOverviewRows = useMemo(() => {
    const normalizedKeyword = studentSearch.trim().toLowerCase();
    if (!normalizedKeyword) {
      return attendanceOverviewRows;
    }

    return attendanceOverviewRows.filter(
      (row) =>
        row.studentId.toLowerCase().includes(normalizedKeyword) ||
        row.studentName.toLowerCase().includes(normalizedKeyword),
    );
  }, [attendanceOverviewRows, studentSearch]);

  const savedCustomLegends = useMemo(() => {
    const legendMap = new Map<string, AttendanceLegendItem>();
    attendanceOverviewRows.forEach((row) => {
      row.attendanceDates.forEach((item) => {
        if (!item.colorHex || !item.legendLabel) {
          return;
        }
        const id = buildLegendId(item.legendLabel, item.colorHex);
        if (!legendMap.has(id)) {
          legendMap.set(id, { id, name: item.legendLabel, color: item.colorHex });
        }
      });
    });
    return Array.from(legendMap.values());
  }, [attendanceOverviewRows]);

  const availableCustomLegends = useMemo(() => {
    const legendMap = new Map<string, AttendanceLegendItem>();
    [...savedCustomLegends, ...customLegends].forEach((item) => {
      legendMap.set(buildLegendId(item.name, item.color), item);
    });
    return Array.from(legendMap.values());
  }, [customLegends, savedCustomLegends]);

  const handleChange = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      throw new Error("Trình duyệt không hỗ trợ GPS.");
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
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      throw new Error("Không thể lấy địa chỉ từ tọa độ hiện tại.");
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

  const loadAttendanceOverview = async () => {
    if (!id) {
      return;
    }

    try {
      setIsLoadingOverview(true);
      const response = await attendanceApi.getAttendanceOverviewByOffering(id);
      setAttendanceOverviewRows(response);
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    } finally {
      setIsLoadingOverview(false);
    }
  };

  const loadAttendanceLegends = async () => {
    if (!id) {
      return;
    }

    try {
      const response = await attendanceApi.getAttendanceLegendsByOffering(id);
      setCustomLegends(response.map(toAttendanceLegendItem));
    } catch (error) {
      setErrorMessage(getAttendanceErrorMessage(error));
    }
  };

  const handleExportAttendanceExcel = () => {
    const rowsToExport = filteredOverviewRows;
    if (rowsToExport.length === 0) {
      toast.error("Không có dữ liệu để xuất.");
      return;
    }

    const headers = [
      "STT",
      "MSSV",
      "Họ tên",
      "Email",
      "Số ngày đi học",
      "Số ngày vắng",
      "Trạng thái",
      ...overviewDateColumns.map((item) => formatShortDate(item.attendanceDate)),
    ];

    const tableRows = rowsToExport
      .map((row, index) => {
        const values = [
          String(index + 1),
          row.studentId,
          row.studentName,
          row.email || "",
          String(row.presentCount),
          String(row.absentCount),
          getAttendanceResultLabel(row.resultStatus),
          ...row.attendanceDates.map((item) => buildAttendanceExportValue(item)),
        ];

        return `<tr>${values
          .map((value) => `<td>${String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")}</td>`)
          .join("")}</tr>`;
      })
      .join("");

    const html = `
      <html>
        <head>
          <meta charset="utf-8" />
        </head>
        <body>
          <table border="1">
            <thead>
              <tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr>
            </thead>
            <tbody>${tableRows}</tbody>
          </table>
        </body>
      </html>
    `;

    const blob = new Blob([`\ufeff${html}`], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `attendance-overview-${id || "class"}.xls`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const handleAttendanceStatusUpdate = async (
    record: AttendanceStudentResponse,
    nextStatus: "PRESENT" | "ABSENT",
  ) => {
    if (!selectedSession) {
      return;
    }

    try {
      setUpdatingAttendanceId(record.attendanceId);
      const updatedRecord = await attendanceApi.updateAttendanceStatus(
        selectedSession.sessionId,
        record.attendanceId,
        nextStatus,
      );
      setAttendanceRecords((current) =>
        current.map((item) =>
          item.attendanceId === updatedRecord.attendanceId ? updatedRecord : item,
        ),
      );
      setAttendanceOverviewRows((current) =>
        current.map((row) => {
          if (row.studentId !== updatedRecord.studentId) {
            return row;
          }

          const attendanceDates = row.attendanceDates.map((item) => {
            if (item.sessionId !== updatedRecord.sessionId) {
              return item;
            }

            const category =
              nextStatus === "ABSENT" && Boolean(updatedRecord.suspicious)
                ? "FRAUD"
                : "DEFAULT";

            return {
              ...item,
              status: nextStatus,
              category,
              note: category === "FRAUD" ? null : item.note,
              displayText: category === "FRAUD" ? "" : item.note || "",
            };
          });

          const presentCount = attendanceDates.filter((item) => item.status === "PRESENT").length;
          const totalSessions = attendanceDates.length;
          const absentCount = totalSessions - presentCount;

          return {
            ...row,
            presentCount,
            absentCount,
            totalSessions,
            resultStatus: totalSessions === 0 || presentCount / totalSessions >= 0.8 ? "PASS" : "FAIL",
            attendanceDates,
          };
        }),
      );
      toast.success(
        nextStatus === "ABSENT"
          ? "Đã đánh vắng sinh viên."
          : "Đã khôi phục có mặt.",
      );
    } catch (error) {
      toast.error(getAttendanceErrorMessage(error));
    } finally {
      setUpdatingAttendanceId("");
    }
  };

  const applyLegendDraft = async () => {
    if (!id) {
      return;
    }

    const nextName = legendDraft.name.trim();
    if (!nextName) {
      toast.error("Hãy nhập tên chú thích.");
      return;
    }

    const previousLegend = legendDraft.id
      ? availableCustomLegends.find((item) => item.id === legendDraft.id) || null
      : null;
    const previousLegendKey = previousLegend
      ? buildLegendId(previousLegend.name, previousLegend.color)
      : null;
    const persistedLegendId = customLegends.some((item) => item.id === legendDraft.id)
      ? legendDraft.id
      : null;

    try {
      const savedLegend = await attendanceApi.upsertAttendanceLegend(id, {
        legendId: persistedLegendId,
        legendLabel: nextName,
        colorHex: legendDraft.color.toUpperCase(),
      });
      const nextLegend = toAttendanceLegendItem(savedLegend);

      if (previousLegend) {
        const cellsToUpdate = attendanceOverviewRows.flatMap((row) =>
          row.attendanceDates
            .filter(
              (item) =>
                buildLegendId(item.legendLabel || "", item.colorHex || "") === previousLegendKey,
            )
            .map((item) => ({
              studentId: row.studentId,
              sessionId: item.sessionId,
              status: (item.status === "PRESENT" ? "PRESENT" : "ABSENT") as "PRESENT" | "ABSENT",
              note: item.note || "",
              category: item.category,
            })),
        );

        if (cellsToUpdate.length > 0) {
          const updatedCells = await Promise.all(
            cellsToUpdate.map((cell) =>
              attendanceApi.updateAttendanceOverviewCell(id, {
                ...cell,
                colorHex: nextLegend.color,
                legendLabel: nextLegend.name,
              }),
            ),
          );
          const updatedCellMap = new Map(
            updatedCells.map((cell, index) => [
              getOverviewCellKey(cellsToUpdate[index].studentId, cell.sessionId),
              cell,
            ]),
          );

          setAttendanceOverviewRows((current) =>
            current.map((row) => {
              const attendanceDates = row.attendanceDates.map(
                (item) => updatedCellMap.get(getOverviewCellKey(row.studentId, item.sessionId)) || item,
              );
              const presentCount = attendanceDates.filter((item) => item.status === "PRESENT").length;
              const totalSessions = attendanceDates.length;
              const absentCount = totalSessions - presentCount;
              return {
                ...row,
                attendanceDates,
                presentCount,
                absentCount,
                totalSessions,
                resultStatus: totalSessions === 0 || presentCount / totalSessions >= 0.8 ? "PASS" : "FAIL",
              };
            }),
          );
        }
      }

      setCustomLegends((current) => {
        const nextItems = previousLegend
          ? current.filter((item) => item.id !== previousLegend.id)
          : current;
        if (nextItems.some((item) => item.id === nextLegend.id)) {
          return nextItems.map((item) => (item.id === nextLegend.id ? nextLegend : item));
        }
        return [...nextItems, nextLegend];
      });
      setLegendDraft({ id: null, name: "", color: DEFAULT_FRAUD_COLOR });
      toast.success(previousLegend ? "Đã sửa chú thích." : "Đã tạo chú thích mới.");
    } catch (error) {
      toast.error(getAttendanceErrorMessage(error));
    }
  };

  const startEditingOverviewCell = (
    row: AttendanceStudentOverviewResponse,
    cell: AttendanceOverviewDateResponse,
  ) => {
    setEditingCell({
      studentId: row.studentId,
      sessionId: cell.sessionId,
      legendType: getOverviewColorKey(cell),
      colorHex:
        cell.colorHex ||
        (cell.category === "FRAUD"
          ? DEFAULT_FRAUD_COLOR
          : cell.status === "PRESENT"
            ? PRESENT_COLOR
            : ABSENT_COLOR),
      legendLabel: cell.legendLabel || "",
      note: cell.note || "",
    });
  };

  const cancelEditingOverviewCell = () => {
    setEditingCell(null);
  };

  const saveOverviewCell = async () => {
    if (!id || !editingCell) {
      return;
    }

    const cellKey = getOverviewCellKey(editingCell.studentId, editingCell.sessionId);

    try {
      setSavingOverviewCellKey(cellKey);
      const nextStatus = editingCell.legendType === "present" ? "PRESENT" : "ABSENT";
      const nextCategory = editingCell.legendType === "fraud" ? "FRAUD" : "DEFAULT";
      const nextColorHex = editingCell.legendType === "custom" ? editingCell.colorHex : null;
      const nextLegendLabel = editingCell.legendType === "custom" ? editingCell.legendLabel : null;
      const updatedCell = await attendanceApi.updateAttendanceOverviewCell(id, {
        studentId: editingCell.studentId,
        sessionId: editingCell.sessionId,
        status: nextStatus,
        note: editingCell.note,
        category: nextCategory,
        colorHex: nextColorHex,
        legendLabel: nextLegendLabel,
      });

      setAttendanceOverviewRows((current) =>
        current.map((row) => {
          if (row.studentId !== editingCell.studentId) {
            return row;
          }

          const attendanceDates = row.attendanceDates.map((item) =>
            item.sessionId === editingCell.sessionId ? updatedCell : item,
          );
          const presentCount = attendanceDates.filter((item) => item.status === "PRESENT").length;
          const totalSessions = attendanceDates.length;
          const absentCount = totalSessions - presentCount;

          return {
            ...row,
            presentCount,
            absentCount,
            totalSessions,
            resultStatus: totalSessions === 0 || presentCount / totalSessions >= 0.8 ? "PASS" : "FAIL",
            attendanceDates,
          };
        }),
      );

      setAttendanceRecords((current) =>
        current.map((record) => {
          if (record.studentId !== editingCell.studentId || record.sessionId !== editingCell.sessionId) {
            return record;
          }

          return {
            ...record,
            status: updatedCell.status,
            note: updatedCell.note || "",
            method: "MANUAL",
          };
        }),
      );

      toast.success("Đã cập nhật ô điểm danh.");
      setEditingCell(null);
    } catch (error) {
      toast.error(getAttendanceErrorMessage(error));
    } finally {
      setSavingOverviewCellKey("");
    }
  };

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
      const location = geoState ?? (await getCurrentLocation());
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
      await Promise.all([loadSessions(response.sessionId), loadAttendanceOverview()]);
      toast.success("Tạo phiên điểm danh QR + GPS thành công.");
    } catch (error) {
      const message = getAttendanceErrorMessage(error);
      setErrorMessage(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    loadActiveSession();
    loadSessions();
    loadAttendanceOverview();
    loadAttendanceLegends();
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

  useEffect(() => {
    if (filteredSessions.some((session) => session.sessionId === selectedSessionId)) {
      return;
    }

    setSelectedSessionId(filteredSessions[0]?.sessionId || "");
  }, [filteredSessions, selectedSessionId]);

  useEffect(() => {
    if (recordCounts[activeRecordTab] > 0) {
      return;
    }
    if (recordCounts.valid > 0) {
      setActiveRecordTab("valid");
      return;
    }
    if (recordCounts.invalid > 0) {
      setActiveRecordTab("invalid");
      return;
    }
    if (recordCounts.suspicious > 0) {
      setActiveRecordTab("suspicious");
    }
  }, [activeRecordTab, recordCounts]);

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="overflow-hidden rounded-[2rem] border border-slate-200/80 bg-[radial-gradient(circle_at_top_right,_rgba(16,185,129,0.15),_transparent_30%),linear-gradient(180deg,_#ffffff_0%,_#f4fbf8_100%)] p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
              Điểm danh QR + GPS
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900">
              Quản lý điểm danh lớp học phần
            </h2>
          </div>

          <div className="rounded-[1.75rem] border border-emerald-100 bg-white/80 px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Lớp học phần
            </p>
            <p className="mt-2 text-lg font-bold text-slate-900">{id || "Chưa xác định"}</p>
          </div>
        </div>
      </section>

      {view !== "overview" ? (
        <>
          <section className={`${view === "history" ? "hidden" : "grid"} gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(380px,0.95fr)]`}>
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
                  Mã QR hiện tại còn hiệu lực. Thời gian còn lại:
                  {" "}
                  <span className="font-bold">{remainingLabel}</span>
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
                              ? "Đang lấy địa chỉ chi tiết..."
                              : geoAddress || "Chưa lấy được địa chỉ chi tiết."}
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
                  {hasActiveQr
                    ? "Đang có mã QR hoạt động"
                    : isSubmitting
                      ? "Đang tạo phiên..."
                      : "Tạo phiên điểm danh QR"}
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
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Nội dung mã QR
                    </p>
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

          <section className={`${view === "create" ? "hidden" : "grid"} gap-6 xl:grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)]`}>
            <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-slate-100 p-3 text-slate-700">
                  <Clock3 className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Các phiên điểm danh</h3>
                  <p className="text-sm text-slate-500">Chọn buổi để xem danh sách check-in.</p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-700">Lọc theo ngày</span>
                  <input
                    type="date"
                    value={sessionDateFilter}
                    onChange={(event) => setSessionDateFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white"
                  />
                </label>

                <div className="max-h-[32rem] space-y-3 overflow-y-auto pr-2">
                  {isLoadingSessions ? (
                    <EmptyState message="Đang tải danh sách phiên điểm danh..." />
                  ) : sessions.length === 0 ? (
                    <EmptyState message="Chưa có phiên điểm danh nào cho lớp học phần này." />
                  ) : filteredSessions.length === 0 ? (
                    <EmptyState message="Không có phiên điểm danh nào trong ngày đã chọn." />
                  ) : (
                    filteredSessions.map((session) => (
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
                            <p className="text-sm font-bold text-slate-900">
                              {formatDateOnly(session.attendanceDate)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {formatDateTime(session.startTime)} - {formatDateTime(session.endTime)}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getSessionStatusBadgeClass(session.status)}`}>
                            {getSessionStatusLabel(session.status)}
                          </span>
                        </div>
                        <p className="mt-3 text-sm text-slate-600">
                          Đã điểm danh: <span className="font-semibold text-slate-900">{session.checkedInCount}</span>
                        </p>
                      </button>
                    ))
                  )}
                </div>
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
                  <EmptyState message="Hãy chọn một phiên điểm danh để xem dữ liệu." />
                ) : isLoadingRecords ? (
                  <EmptyState message="Đang tải danh sách sinh viên đã điểm danh..." />
                ) : attendanceRecords.length === 0 ? (
                  <EmptyState
                    message={`Chưa có sinh viên nào điểm danh ở phiên ngày ${formatDateOnly(selectedSession.attendanceDate)}.`}
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-3">
                      {(["valid", "invalid", "suspicious"] as AttendanceRecordTab[]).map((tab) => {
                        const isActive = activeRecordTab === tab;
                        return (
                          <button
                            key={tab}
                            type="button"
                            onClick={() => setActiveRecordTab(tab)}
                            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              isActive
                                ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700"
                            }`}
                          >
                            <span>{getAttendanceTabLabel(tab)}</span>
                            <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-slate-700">
                              {recordCounts[tab]}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {filteredAttendanceRecords.length === 0 ? (
                      <EmptyState
                        message={`Không có sinh viên thuộc nhóm ${getAttendanceTabLabel(activeRecordTab).toLowerCase()} trong phiên này.`}
                      />
                    ) : (
                      <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-slate-200 text-sm">
                            <thead className="bg-slate-100/90">
                              <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                <th className="px-4 py-3">STT</th>
                                <th className="px-4 py-3">Sinh viên</th>
                                <th className="px-4 py-3">Thời gian check-in</th>
                                <th className="px-4 py-3">Phương thức</th>
                                <th className="px-4 py-3">Khoảng cách</th>
                                <th className="px-4 py-3">Bán kính</th>
                                <th className="px-4 py-3">Vị trí sinh viên</th>
                                <th className="px-4 py-3">Trạng thái</th>
                                <th className="px-4 py-3">Đối chiếu GPS</th>
                                <th className="px-4 py-3">Thao tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 bg-white">
                              {filteredAttendanceRecords.map((record, index) => (
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
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    {getAttendanceMethodLabel(record.method)}
                                  </td>
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
                                        {getAttendanceStatusLabel(record.status)}
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
                                  <td className="px-4 py-4">{getGpsReviewLabel(record)}</td>
                                  <td className="px-4 py-4">
                                    {canReviewAttendanceRecord(record) ? (
                                      <button
                                        type="button"
                                        disabled={updatingAttendanceId === record.attendanceId}
                                        onClick={() =>
                                          void handleAttendanceStatusUpdate(
                                            record,
                                            record.status === "ABSENT" ? "PRESENT" : "ABSENT",
                                          )
                                        }
                                        className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                                          record.status === "ABSENT"
                                            ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                                            : "bg-rose-100 text-rose-700 hover:bg-rose-200"
                                        } disabled:cursor-not-allowed disabled:opacity-70`}
                                      >
                                        {updatingAttendanceId === record.attendanceId
                                          ? "Đang cập nhật..."
                                          : record.status === "ABSENT"
                                            ? "Khôi phục có mặt"
                                            : "Đánh vắng"}
                                      </button>
                                    ) : (
                                      <span className="text-xs text-slate-400">--</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </article>
          </section>
        </>
      ) : (
        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <InfoCard label="Tổng sinh viên" value={String(overviewStats.totalStudents)} />
            <InfoCard label="Số buổi đã học" value={String(overviewStats.totalSessions)} />
            <InfoCard label="Đậu chuyên cần" value={String(overviewStats.passCount)} />
            <InfoCard label="Rớt chuyên cần" value={String(overviewStats.failCount)} />
          </div>

          <article className="rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-[0_18px_45px_rgba(15,23,42,0.06)] md:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
                <Users2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Theo dõi điểm danh sinh viên trong lớp</h3>
                <p className="text-sm text-slate-500">
                  Mỗi ngày điểm danh là một cột riêng. Ô xanh là đi học, ô đỏ là vắng. Giảng viên có thể bấm vào từng ô để chỉnh màu và ghi chú như "phép".
                </p>
              </div>
            </div>

            <div className="mt-5">
              {isLoadingOverview ? (
                <EmptyState message="Đang tải bảng theo dõi điểm danh..." />
              ) : attendanceOverviewRows.length === 0 ? (
                <EmptyState message="Chưa có dữ liệu điểm danh để tổng hợp cho lớp học phần này." />
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col gap-4 rounded-[1.5rem] border border-slate-200 bg-slate-50 px-4 py-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex w-full flex-col gap-3 xl:max-w-[58rem]">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                          <span className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: PRESENT_COLOR }} />
                          Đi học
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                          <span className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: ABSENT_COLOR }} />
                          Vắng
                        </span>
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700">
                          <span className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: DEFAULT_FRAUD_COLOR }} />
                          {DEFAULT_FRAUD_LABEL}
                        </span>
                        {availableCustomLegends.map((legend) => (
                          <button
                            key={legend.id}
                            type="button"
                            onClick={() =>
                              setLegendDraft({ id: legend.id, name: legend.name, color: legend.color })
                            }
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition hover:border-slate-300"
                            title="Chọn để sửa chú thích"
                          >
                            <span className="h-4 w-4 rounded-md border border-slate-200" style={{ backgroundColor: legend.color }} />
                            {legend.name}
                            <Pencil className="h-3.5 w-3.5 text-slate-400" />
                          </button>
                        ))}
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          value={legendDraft.name}
                          onChange={(event) =>
                            setLegendDraft((current) => ({ ...current, name: event.target.value }))
                          }
                          placeholder="Tên chú thích"
                          className="w-40 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
                        />
                        <input
                          type="color"
                          value={legendDraft.color}
                          onChange={(event) =>
                            setLegendDraft((current) => ({ ...current, color: event.target.value }))
                          }
                          className="h-10 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white p-1"
                        />
                        <button
                          type="button"
                          onClick={() => void applyLegendDraft()}
                          className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500 text-white transition hover:bg-emerald-600"
                          title={legendDraft.id ? "Sửa chú thích" : "Tạo chú thích"}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                        {legendDraft.id ? (
                          <button
                            type="button"
                            onClick={() => setLegendDraft({ id: null, name: "", color: DEFAULT_FRAUD_COLOR })}
                            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600"
                          >
                            Hủy sửa
                          </button>
                        ) : null}
                      </div>

                      <p className="text-xs text-slate-500">Trong bảng chỉ hiện màu hoặc text.</p>
                    </div>

                    <div className="flex w-full max-w-md flex-col gap-3 xl:items-end">
                      <div className="relative w-full">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                          value={studentSearch}
                          onChange={(event) => setStudentSearch(event.target.value)}
                          placeholder="Tìm theo MSSV"
                          className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-700"
                        />
                      </div>
                      <div>
                        <button
                          type="button"
                          onClick={handleExportAttendanceExcel}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300"
                        >
                          <Download className="h-4 w-4" />
                          Xuất Excel
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.5rem] border border-slate-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-[1100px] w-full divide-y divide-slate-200 text-sm">
                      <thead className="bg-slate-100/90">
                        <tr className="text-left text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                          <th className="px-4 py-3">STT</th>
                          <th className="px-4 py-3">Thông tin sinh viên</th>
                          <th className="px-4 py-3">Số lần đi học</th>
                          <th className="px-4 py-3">Số lần vắng</th>
                          <th className="px-4 py-3">Trạng thái</th>
                          {overviewDateColumns.map((item) => (
                            <th
                              key={item.sessionId}
                              className="w-14 min-w-[56px] px-1 py-3 whitespace-nowrap text-center"
                            >
                              {formatShortDate(item.attendanceDate)}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {filteredOverviewRows.map((row, index) => (
                          <tr key={row.studentId} className="align-top text-slate-700">
                            <td className="px-4 py-4 font-semibold text-slate-500">{index + 1}</td>
                            <td className="px-4 py-4">
                              <p className="font-semibold text-slate-900">{row.studentName}</p>
                              <p className="mt-1 text-xs text-slate-500">{row.studentId}</p>
                              {row.email ? <p className="mt-1 text-xs text-slate-500">{row.email}</p> : null}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap font-semibold text-emerald-700">
                              {row.presentCount}/{row.totalSessions}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap font-semibold text-rose-700">
                              {row.absentCount}/{row.totalSessions}
                            </td>
                            <td className="px-4 py-4">
                              <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getAttendanceResultClass(row.resultStatus)}`}>
                                {getAttendanceResultLabel(row.resultStatus)}
                              </span>
                            </td>
                            {row.attendanceDates.map((item) => {
                              const isEditing =
                                editingCell != null &&
                                editingCell.studentId === row.studentId &&
                                editingCell.sessionId === item.sessionId;
                              const cellKey = getOverviewCellKey(row.studentId, item.sessionId);
                              const isSaving = savingOverviewCellKey === cellKey;

                              return (
                                <td key={cellKey} className="w-14 min-w-[56px] border-l border-slate-100 p-1 align-middle">
                                  {isEditing ? (
                                    <div className="mx-auto flex w-12 flex-col gap-1">
                                      <div className="grid grid-cols-2 gap-1">
                                        {(
                                          [
                                            { key: "present", color: PRESENT_COLOR, title: "Đi học", label: "" },
                                            { key: "absent", color: ABSENT_COLOR, title: "Vắng", label: "" },
                                            { key: "fraud", color: DEFAULT_FRAUD_COLOR, title: DEFAULT_FRAUD_LABEL, label: "" },
                                            ...availableCustomLegends.map((legend) => ({
                                              key: legend.id,
                                              color: legend.color,
                                              title: legend.name,
                                              label: legend.name,
                                            })),
                                          ] as const
                                        ).map((option) => (
                                          <button
                                            key={option.key}
                                            type="button"
                                            title={option.title}
                                            onClick={() =>
                                              setEditingCell((current) =>
                                                current
                                                  ? {
                                                      ...current,
                                                      legendType:
                                                        option.key === "present"
                                                          ? "present"
                                                          : option.key === "absent"
                                                            ? "absent"
                                                            : option.key === "fraud"
                                                              ? "fraud"
                                                              : "custom",
                                                      colorHex: option.color,
                                                      legendLabel:
                                                        option.key === "present" ||
                                                        option.key === "absent" ||
                                                        option.key === "fraud"
                                                          ? ""
                                                          : option.label,
                                                    }
                                                  : current,
                                              )
                                            }
                                            className={`h-5 rounded-md border transition ${
                                              ((option.key === "present" && editingCell.legendType === "present") ||
                                                (option.key === "absent" && editingCell.legendType === "absent") ||
                                                (option.key === "fraud" && editingCell.legendType === "fraud") ||
                                                (editingCell.legendType === "custom" &&
                                                  editingCell.colorHex === option.color &&
                                                  editingCell.legendLabel === option.label))
                                                ? "border-slate-900 ring-1 ring-slate-900"
                                                : "border-slate-200"
                                            }`}
                                            style={{ backgroundColor: option.color }}
                                          />
                                        ))}
                                      </div>
                                      <input
                                        value={editingCell.note}
                                        onChange={(event) =>
                                          setEditingCell((current) =>
                                            current ? { ...current, note: event.target.value } : current,
                                          )
                                        }
                                        placeholder="Text nếu cần"
                                        className="w-full rounded-lg border border-slate-200 bg-white px-1.5 py-1 text-[11px] text-slate-700"
                                      />
                                      <div className="flex gap-1">
                                        <button
                                          type="button"
                                          onClick={() => void saveOverviewCell()}
                                          disabled={isSaving}
                                          className="flex-1 rounded-md bg-emerald-600 px-1 py-1 text-[10px] font-semibold text-white disabled:opacity-70"
                                        >
                                          {isSaving ? "Đang lưu..." : "Lưu"}
                                        </button>
                                        <button
                                          type="button"
                                          onClick={cancelEditingOverviewCell}
                                          className="flex-1 rounded-md bg-slate-200 px-1 py-1 text-[10px] font-semibold text-slate-700"
                                        >
                                          Hủy
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <button
                                      type="button"
                                      onClick={() => startEditingOverviewCell(row, item)}
                                      className="mx-auto flex h-12 w-12 items-center justify-center rounded-md border border-white/50 p-1 text-center text-[10px] font-semibold transition hover:scale-[1.02] hover:brightness-95"
                                      style={{
                                        backgroundColor:
                                          item.colorHex ||
                                          (getOverviewColorKey(item) === "fraud"
                                            ? DEFAULT_FRAUD_COLOR
                                            : getOverviewColorKey(item) === "present"
                                              ? PRESENT_COLOR
                                              : ABSENT_COLOR),
                                        color: getCellTextColor(
                                          item.colorHex ||
                                          (getOverviewColorKey(item) === "fraud"
                                            ? DEFAULT_FRAUD_COLOR
                                            : getOverviewColorKey(item) === "present"
                                              ? PRESENT_COLOR
                                              : ABSENT_COLOR),
                                        ),
                                      }}
                                      title="Bấm để chỉnh sửa ô này"
                                    >
                                      {item.note ? (
                                        <span className="line-clamp-2 break-words leading-tight">
                                          {item.note}
                                        </span>
                                      ) : null}
                                    </button>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                        {filteredOverviewRows.length === 0 ? (
                          <tr>
                            <td
                              colSpan={7 + overviewDateColumns.length}
                              className="px-4 py-8 text-center text-sm text-slate-500"
                            >
                              Không tìm thấy sinh viên theo MSSV này.
                            </td>
                          </tr>
                        ) : null}
                      </tbody>
                    </table>
                  </div>
                </div>
                </div>
              )}
            </div>
          </article>
        </section>
      )}
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
          {getSessionStatusLabel(value)}
        </span>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
      {message}
    </div>
  );
}
