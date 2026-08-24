type NotificationRouteData = {
    courseId?: string | null;
};

export function resolveNotificationReferenceUrl(referenceUrl?: string | null) {
    if (!referenceUrl?.trim()) {
        return null;
    }

    let path = referenceUrl.trim();

    try {
        const parsedUrl = new URL(path, window.location.origin);
        if (parsedUrl.origin !== window.location.origin) {
            return null;
        }
        path = `${parsedUrl.pathname}${parsedUrl.search}${parsedUrl.hash}`;
    } catch {
        return null;
    }

    // Hỗ trợ các thông báo cũ đã lưu sai route `/courses/...`.
    path = path.replace(/^\/courses\//, "/course/");

    // Trang submission riêng không tồn tại; đưa giảng viên về danh sách bài tập của lớp.
    const submissionPath = path.match(/^\/course\/([^/]+)\/submissions\/[^/]+/);
    if (submissionPath) {
        return `/teacher/course/${submissionPath[1]}/assignments`;
    }

    return path.startsWith("/") ? path : `/${path}`;
}

export function resolveNotificationCenterUrl(
    role: string | undefined,
    currentPath: string,
    notifications: NotificationRouteData[],
) {
    const normalizedRole = role?.toUpperCase();

    if (normalizedRole === "ADMIN") return "/admin/notifications";
    if (normalizedRole === "MAIN_LECTURER" || normalizedRole === "MAIN_TEACHER") return "/mainlecturer/notifications";
    if (normalizedRole === "DEAN") return "/dean/notifications";
    if (normalizedRole === "HEAD_OF_DEPARTMENT" || normalizedRole === "DEPARTMENT_HEAD") return "/department/notifications";

    const teacherCourse = currentPath.match(/^\/teacher\/course\/([^/]+)/);
    if (normalizedRole === "TEACHER" || normalizedRole === "LECTURER") {
        return teacherCourse ? `/teacher/course/${teacherCourse[1]}/notifications` : "/teacher";
    }

    const currentStudentCourse = currentPath.match(/^\/course\/([^/]+)/)?.[1];
    const notificationCourse = notifications.find((notification) => notification.courseId)?.courseId;
    const courseId = currentStudentCourse || notificationCourse;
    return courseId ? `/course/${courseId}/notifications` : "/dashboard";
}
