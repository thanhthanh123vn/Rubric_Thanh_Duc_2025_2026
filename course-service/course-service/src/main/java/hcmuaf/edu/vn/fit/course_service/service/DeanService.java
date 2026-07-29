package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseResponse;

import hcmuaf.edu.vn.fit.course_service.dto.response.DeanDashboardResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@RequiredArgsConstructor
@Service
public class DeanService {
    private final UserClient userClient;
    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;

    public List<CourseResponse> getCoursesByDepartment(String departmentId) {
        return courseRepository.findByDepartmentId(departmentId)
                .stream()
                .map(courseMapper::toCourseResponse)
                .toList();
    }

    public DeanDashboardResponse getDeanDashboardData(String userId) {
        long totalLecturers = 0;
        String department = "";

        try {
            // Lấy thông tin từ user-service thông qua FeignClient
            totalLecturers = userClient.countUsers(); // Hoặc countLecturers() nếu bạn có hàm này
            LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
            department = lecturerResponse.getDepartment();
        } catch (Exception e) {
            // Log lỗi nếu gọi FeignClient thất bại
            System.err.println("Lỗi gọi user-service: " + e.getMessage());
        }

        // Các số liệu tổng quan (Có thể query thật từ repository của bạn)
        long activeCourses = courseRepository.count(); // Ví dụ đếm tổng số môn học
        long pendingRubrics = 5;
        double obeAchievementRate = 92.5;

        // Xử lý danh sách tiến độ các môn học thuộc Khoa/Bộ môn đó
        List<CourseResponse> courses = getCoursesByDepartment(department);
        Random random = new Random();

        List<DeanDashboardResponse.ProgressDto> departmentProgresses = courses.stream()
                .map(course -> new DeanDashboardResponse.ProgressDto(
                        course.getCourseName(),
                        random.nextInt(41) + 60
                ))
                .toList();


        List<DeanDashboardResponse.ActivityDto> recentActivities = List.of(
                new DeanDashboardResponse.ActivityDto(1, "rubric", "Bộ môn Hệ Thống Thông Tin trình duyệt 5 Rubric mới.", "2 giờ trước", true),
                new DeanDashboardResponse.ActivityDto(2, "course", "Bộ môn KHMT hoàn tất phân công giảng dạy Học kỳ 1.", "Hôm qua", false),
                new DeanDashboardResponse.ActivityDto(3, "report", "Báo cáo đánh giá chất lượng học phần môn CSDL đã sẵn sàng.", "Hôm qua", false),
                new DeanDashboardResponse.ActivityDto(4, "rubric", "Bộ môn CNPM cập nhật lại ma trận chuẩn đầu ra.", "3 ngày trước", false)
        );

        return new DeanDashboardResponse(
                totalLecturers,
                activeCourses,
                pendingRubrics,
                obeAchievementRate,
                departmentProgresses,
                recentActivities
        );
    }
}