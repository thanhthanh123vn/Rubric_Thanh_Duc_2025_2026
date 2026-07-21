package hcmuaf.edu.vn.fit.course_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponse {
    private StatsDto stats;
    private List<CourseAllocationDto> allocations;
    private List<ActivityDto> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatsDto {
        private StatDataDto totalUsers;
        private StatDataDto activeCourses;
        private StatDataDto totalRubrics;
        private StatDataDto completionRate;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatDataDto {
        private String value;
        private String increase;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CourseAllocationDto {
        private String id;
        private String name;
        private long studentCount;
        private Double percentage;
        private String colorClass;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ActivityDto {
        private String id;
        private String action;
        private String time;
        private String type;
    }
}