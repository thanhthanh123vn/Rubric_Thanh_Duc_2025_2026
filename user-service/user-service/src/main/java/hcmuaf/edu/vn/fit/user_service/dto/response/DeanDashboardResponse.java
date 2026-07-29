package hcmuaf.edu.vn.fit.user_service.dto.response;

import java.util.List;

public record DeanDashboardResponse(
        long totalLecturers,
        long activeCourses,
        long pendingRubrics,
        double obeAchievementRate,
        List<DepartmentProgressDto> departmentProgresses,
        List<ActivityDto> recentActivities
) {
    public record DepartmentProgressDto(
            String departmentName,
            int percent
    ) {}

    public record ActivityDto(
            int id,
            String type,
            String message,
            String time,
            boolean isUrgent
    ) {}
}