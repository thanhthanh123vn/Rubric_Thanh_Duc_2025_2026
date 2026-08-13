package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.RubricClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseResponse;

import hcmuaf.edu.vn.fit.course_service.dto.response.DeanDashboardResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@RequiredArgsConstructor
@Service
public class DeanService {
    private final UserClient userClient;
    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final RubricClient rubricClient;

    public List<CourseResponse> getCoursesByDepartment(String departmentId) {
        return courseRepository.findByDepartment(departmentId)
                .stream()
                .map(courseMapper::toCourseResponse)
                .toList();
    }
    public List<CourseResponse> getCoursesByFaculty(List<String> departmentNames) {
        return courseRepository.findByDepartmentIn(departmentNames)
                .stream()
                .map(courseMapper::toCourseResponse)
                .toList();
    }
    public DeanDashboardResponse getHeadDeapDashboardData(String userId) {
        long totalLecturers = 0;
        String department = "";

        try {

            LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
            department = lecturerResponse.getDepartment();
            System.out.println(department);
            totalLecturers = userClient.countLecturers(userId,department);
            System.out.println(totalLecturers);
        } catch (Exception e) {
            System.err.println("Lỗi gọi user-service: " + e.getMessage());
        }

        long activeCourses = courseRepository.count();
        long pendingRubrics = 0; // Đặt mặc định là 0
        double obeAchievementRate = 92.5;

        // Lấy số lượng rubric đang chờ duyệt thực tế bằng API hiện có
        try {
            List<Object> pendingList = rubricClient.getRubricsForApproval(userId, "PENDING");
            pendingRubrics = pendingList != null ? pendingList.size() : 0;
        } catch (Exception e) {
            System.err.println("Lỗi gọi rubric-service lấy pending rubrics: " + e.getMessage());
        }

        List<CourseResponse> courses = getCoursesByDepartment(department);
        Random random = new Random();

        List<DeanDashboardResponse.ProgressDto> departmentProgresses = courses.stream()
                .map(course -> new DeanDashboardResponse.ProgressDto(
                        course.getCourseName(),
                        random.nextInt(41) + 60
                ))
                .toList();


        List<DeanDashboardResponse.ActivityDto> recentActivities = List.of();
        if (department != null && !department.isEmpty()) {
            try {
                // Gọi sang rubric-service lấy 4 hoạt động gần nhất
                recentActivities = rubricClient.getDepartmentActivities(department, 4);
            } catch (Exception e) {
                System.err.println("Lỗi gọi rubric-service để lấy báo cáo: " + e.getMessage());
            }
        }
        return new DeanDashboardResponse(
                totalLecturers,
                activeCourses,
                pendingRubrics,
                obeAchievementRate,
                departmentProgresses,
                recentActivities
        );
    }
    public DeanDashboardResponse getDeanDashboardData(String userId) {
        long totalLecturers = 0;
        String facultyName = "";
        List<String> departmentNames = new ArrayList<>();

        try {
            // 1. Lấy thông tin giảng viên đang đăng nhập
            LecturerResponse lecturerResponse = userClient.getLecturerByUserId(userId);
            String departmentName = lecturerResponse.getDepartment();

            // 2. Lấy thông tin Khoa dựa vào tên Bộ môn
            FacultyResponse facultyResponse = userClient.getFacultyByDepartmentName(userId, departmentName);

            if (facultyResponse != null) {
                facultyName = facultyResponse.getFacultyName();
                System.out.println("Tên Khoa: " + facultyName);

                // 3. Lấy tổng số giảng viên trong khoa
                List<LecturerResponse> allLecturers = userClient.getLecturersByFaculty(userId, facultyName);
                totalLecturers = allLecturers != null ? allLecturers.size() : 0;
                System.out.println("Tổng số GV trong khoa: " + totalLecturers);

                // 4. Lấy danh sách các phòng ban (bộ môn) thuộc Khoa
                departmentNames = userClient.getDepartmentNamesByFaculty(userId, facultyName);
            }

        } catch (Exception e) {
            System.err.println("Lỗi gọi user-service: " + e.getMessage());
        }


        // Lấy khóa học dựa trên danh sách phòng ban

        List<CourseResponse> courses = new ArrayList<>();
        long activeCourses = 0;

        if (departmentNames != null && !departmentNames.isEmpty()) {
            courses = getCoursesByFaculty(departmentNames);
            activeCourses = courses.size();
        }

        long pendingRubrics = 0;
        double obeAchievementRate = 92.5;


        try {
            List<Object> pendingList = rubricClient.getRubricsForApproval(userId, "PENDING");
            pendingRubrics = pendingList != null ? pendingList.size() : 0;
        } catch (Exception e) {
            System.err.println("Lỗi gọi rubric-service lấy pending rubrics: " + e.getMessage());
        }

        Random random = new Random();
        List<DeanDashboardResponse.ProgressDto> departmentProgresses = courses.stream()
                .map(course -> new DeanDashboardResponse.ProgressDto(
                        course.getCourseName(),
                        random.nextInt(41) + 60
                ))
                .toList();

        List<DeanDashboardResponse.ActivityDto> recentActivities = List.of();
        if (facultyName != null && !facultyName.isEmpty()) {
            try {

                recentActivities = rubricClient.getDepartmentActivities(facultyName, 4);
            } catch (Exception e) {
                System.err.println("Lỗi gọi rubric-service để lấy báo cáo: " + e.getMessage());
            }
        }

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