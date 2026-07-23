package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.RubricClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.response.DashboardStatsResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.SinhVienResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.entity.enums.EnrollmentStatus;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EnrollmentRepository enrollmentRepository;
    private final RubricClient rubricClient;
    private final UserClient userClient;

    public DashboardStatsResponse getStudentStats(String userId) {
        String studentId = "";
        try {
            SinhVienResponse student = userClient.getSinhVien(userId);
            studentId = student.getUserId();

        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentIdAndStatus(
                studentId, EnrollmentStatus.ACTIVE
        );
        long courseCount = enrollments.size();


        double totalProgress = 0.0;
        LocalDate today = LocalDate.now();

        if (courseCount > 0) {
            for (Enrollment enrollment : enrollments) {
                CourseOffering offering = enrollment.getCourseOffering();
                if (offering != null && offering.getStartDate() != null && offering.getEndDate() != null) {
                    LocalDate start = offering.getStartDate();
                    LocalDate end = offering.getEndDate();

                    double courseProgress = 0.0;

                    if (today.isBefore(start) || today.isEqual(start)) {
                        courseProgress = 0.0;
                    } else if (today.isAfter(end) || today.isEqual(end)) {
                        courseProgress = 100.0; // Khóa học đã kết thúc
                    } else {
                        // Tính số ngày đã trôi qua và tổng số ngày của khóa học
                        long totalDays = ChronoUnit.DAYS.between(start, end);
                        long passedDays = ChronoUnit.DAYS.between(start, today);

                        if (totalDays > 0) {
                            courseProgress = ((double) passedDays / totalDays) * 100.0;
                        }
                    }
                    totalProgress += courseProgress;
                }
            }
        }

        // Lấy trung bình cộng tiến độ các khóa học (làm tròn 1 chữ số thập phân)
        double avgProgress = courseCount > 0 ? Math.round((totalProgress / courseCount) * 10.0) / 10.0 : 0.0;

        // 3. Lấy số lượng rubric từ rubric-service thông qua Feign Client
        long rubricCount = 0L;
        try {
            rubricCount = rubricClient.getRubricCount();
        } catch (Exception e) {

            rubricCount = 0L;
        }

        return DashboardStatsResponse.builder()
                .enrolledCoursesCount(courseCount)
                .averageProgress(avgProgress)
                .rubricsCount(rubricCount)
                .build();
    }
}