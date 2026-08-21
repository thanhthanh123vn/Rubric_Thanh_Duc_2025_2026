import { useEffect, useMemo, useState } from "react";
import { Bell, CheckCheck, Clock3, Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import Header from "@/components/home/Header";
import Sidebar from "@/features/course/student/components/Sidebar";
import { courseService } from "@/features/course/courseApi";
import {
  notificationApi,
  type NotificationItem,
} from "@/features/notification/notificationApi";

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("vi-VN", { dateStyle: "short", timeStyle: "short" });
}

export default function CourseNotifications() {
  const { id: offeringId } = useParams();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [courseIds, setCourseIds] = useState<string[]>(offeringId ? [offeringId] : []);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      notificationApi.getNotifications(),
      offeringId ? courseService.getCourseById(offeringId) : Promise.resolve(null),
    ])
      .then(([items, course]) => {
        if (!active) return;
        setNotifications(items);
        setCourseIds(
          [
            offeringId,
            course?.course?.courseId,
            course?.courseId,
          ].filter((value): value is string => Boolean(value)),
        );
      })
      .catch(() => {
        if (active) toast.error("Không thể tải danh sách thông báo.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [offeringId]);

  const courseNotifications = useMemo(
    () =>
      notifications
        .filter((item) => Boolean(item.courseId && courseIds.includes(item.courseId)))
        .sort(
          (first, second) =>
            new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
        ),
    [notifications, courseIds],
  );

  const unreadCount = courseNotifications.filter((item) => !item.isRead).length;

  const markAsRead = async (item: NotificationItem) => {
    if (item.isRead) return;
    try {
      await notificationApi.markAsRead(item.id);
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === item.id ? { ...notification, isRead: true } : notification,
        ),
      );
    } catch {
      toast.error("Không thể cập nhật trạng thái thông báo.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onMenuClick={() => setMobileMenuOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-6">
          <div className="mx-auto max-w-[1312px] space-y-5">
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-600">
                    Học phần
                  </p>
                  <h1 className="mt-2 text-2xl font-bold text-slate-900">Thông báo</h1>
                  <p className="mt-1 text-sm text-slate-500">
                    Các cập nhật bài tập và hoạt động liên quan đến học phần này.
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-emerald-700">
                  <p className="text-2xl font-bold">{unreadCount}</p>
                  <p className="text-xs font-semibold">Chưa đọc</p>
                </div>
              </div>
            </section>

            <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">
                <Bell className="h-5 w-5 text-emerald-600" />
                <h2 className="font-bold text-slate-900">Danh sách thông báo</h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  Đang tải thông báo...
                </div>
              ) : courseNotifications.length === 0 ? (
                <div className="px-6 py-16 text-center">
                  <Bell className="mx-auto h-10 w-10 text-slate-300" />
                  <p className="mt-3 font-semibold text-slate-700">Chưa có thông báo</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Học phần này chưa có thông báo nào dành cho bạn.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {courseNotifications.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => void markAsRead(item)}
                      className={`flex w-full items-start gap-4 px-5 py-4 text-left transition hover:bg-slate-50 ${
                        item.isRead ? "bg-white" : "bg-emerald-50/60"
                      }`}
                    >
                      <div className={`mt-1 rounded-xl p-2 ${item.isRead ? "bg-slate-100" : "bg-emerald-100"}`}>
                        {item.isRead ? (
                          <CheckCheck className="h-4 w-4 text-slate-500" />
                        ) : (
                          <Bell className="h-4 w-4 text-emerald-700" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900">{item.title}</p>
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />
                            {formatDateTime(item.createdAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-sm leading-6 text-slate-600">{item.content}</p>
                        <p className="mt-2 text-xs font-medium text-slate-400">
                          {item.senderName || "Hệ thống LMS"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
