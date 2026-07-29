package hcmuaf.edu.vn.fit.course_service.dto.response;

import java.util.List;

public record DeanDashboardResponse(
        long totalLecturers,
        long activeCourses,
        long pendingRubrics,
        double obeAchievementRate,
        List<ProgressDto> departmentProgresses,
        List<ActivityDto> recentActivities
) {

    public record ProgressDto(
            String courseName,
            int percent
    ) {}

    // DTO con cho phần Hoạt động gần đây
    public record ActivityDto(
            int id,
            String type,
            String message,
            String time,
            boolean isUrgent
    ) {}
}