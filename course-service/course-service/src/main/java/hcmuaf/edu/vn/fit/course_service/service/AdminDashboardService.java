package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.SubmissionEntity;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.AssessmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ParticipantRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.SubmissionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ParticipantRepository participantRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final AssessmentRepository assessmentRepository;
    private final SubmissionRepository submissionRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final CourseService courseService;

    public DashboardOverviewResponse getOverview() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.with(TemporalAdjusters.firstDayOfMonth()).withHour(0).withMinute(0).withSecond(0);
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);

        // 1. LẤY DỮ LIỆU THỐNG KÊ (STATS)


        long totalUsers = participantRepository.count();

        long newUsersThisMonth = 150;
        String userIncrease = String.format("+%d%%", (newUsersThisMonth * 100) / (totalUsers == 0 ? 1 : totalUsers));


        long activeCourses = courseOfferingRepository.count();

        // Tổng Rubric (Giả sử dựa trên Assessment)
        long totalRubrics = assessmentRepository.count();

        // Tỷ lệ hoàn thành (Giả sử: Số bài đã nộp / Tổng số enrollment)
        long totalSubmissions = submissionRepository.count();
        long totalEnrollments = enrollmentRepository.count();
        double completionRateVal = totalEnrollments == 0 ? 0 : ((double) totalSubmissions / totalEnrollments) * 100;

        DashboardOverviewResponse.StatsDto stats = DashboardOverviewResponse.StatsDto.builder()
                .totalUsers(new DashboardOverviewResponse.StatDataDto(String.valueOf(totalUsers), userIncrease))
                .activeCourses(new DashboardOverviewResponse.StatDataDto(String.valueOf(activeCourses), "+3 mới"))
                .totalRubrics(new DashboardOverviewResponse.StatDataDto(String.valueOf(totalRubrics), "+5%"))
                .completionRate(new DashboardOverviewResponse.StatDataDto(String.format("%.1f%%", completionRateVal), "+2.0%"))
                .build();


        // 2. LẤY DỮ LIỆU PHÂN BỔ KHÓA HỌC (ALLOCATIONS)


        List<DashboardCourseAdmin> courseStats =  courseOfferingRepository.getCourseAllocations(PageRequest.of(0, 5));

        String[] colors = {"bg-blue-600", "bg-purple-500", "bg-orange-500", "bg-emerald-500", "bg-pink-500"};
        List<DashboardOverviewResponse.CourseAllocationDto> allocations = new ArrayList<>();


        for (int i = 0; i < courseStats.size(); i++) {


            DashboardCourseAdmin proj = courseStats.get(i);
            System.out.println(courseStats.get(i).getOfferingId());


            List<StudentCourseResponse> studentCourseProjections = courseService.getStudentsByOfferingId(proj.getOfferingId());
            long totalStudentsInAllCourses = studentCourseProjections.size();

            double percentage = totalStudentsInAllCourses == 0 ? 0 : ((double)totalUsers / totalStudentsInAllCourses) * 100;

            allocations.add(DashboardOverviewResponse.CourseAllocationDto.builder()
                    .id(proj.getOfferingId())
                    .name(proj.getCourseName())
                    .studentCount(proj.getStudentCount())
                    .percentage(percentage)
                    .colorClass(colors[i % colors.length]) 
                    .build());
        }

        
        List<SubmissionEntity> recentSubmissions = submissionRepository.findTop5ByOrderBySubmittedAtDesc();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

        List<DashboardOverviewResponse.ActivityDto> activities = recentSubmissions.stream().map(sub ->
                DashboardOverviewResponse.ActivityDto.builder()
                        .id(sub.getId())
                        .action("Sinh viên ID " + sub.getStudentId() + " đã nộp bài tập.")
                        .time(sub.getSubmittedAt() != null ? sub.getSubmittedAt().format(formatter) : "Vừa xong")
                        .type("submit")
                        .build()
        ).collect(Collectors.toList());


        return DashboardOverviewResponse.builder()
                .stats(stats)
                .allocations(allocations)
                .recentActivities(activities)
                .build();
    }
}