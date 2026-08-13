package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.ScheduleRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.CourseSchedule;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseScheduleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseScheduleService {

    private final CourseScheduleRepository courseScheduleRepository;
    private final CourseOfferingRepository courseOfferingRepository;

    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        // 1. Tìm lớp học phần
        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học phần với ID: " + request.getOfferingId()));

        // 2. Tạo thực thể CourseSchedule
        CourseSchedule schedule = CourseSchedule.builder()
                .courseOffering(offering)
                .room(request.getRoom())
                .classType(request.getClassType())
                .dayOfWeek(request.getDayOfWeek())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .colorTheme(request.getColorTheme())
                .build();

        // 3. Lưu vào Database
        CourseSchedule savedSchedule = courseScheduleRepository.save(schedule);

        // 4. Trả về kết quả
        return mapToResponse(savedSchedule);
    }

    private ScheduleResponse mapToResponse(CourseSchedule schedule) {
        return ScheduleResponse.builder()
                .scheduleId(schedule.getScheduleId())
                .offeringId(schedule.getCourseOffering().getOfferingId())
                .room(schedule.getRoom())
                .classType(schedule.getClassType())
                .dayOfWeek(schedule.getDayOfWeek())
                .startTime(schedule.getStartTime())
                .endTime(schedule.getEndTime())
                .colorTheme(schedule.getColorTheme())
                .build();
    }

    public List<StudentScheduleResponse> getStudentSchedule(String studentId) {
        // Lấy danh sách lịch học từ Repository
        List<CourseSchedule> schedules = courseScheduleRepository.findSchedulesByStudentId(studentId);

        // Map sang DTO trả về cho Client
        return schedules.stream().map(schedule -> {
            CourseOffering offering = schedule.getCourseOffering();

            return StudentScheduleResponse.builder()
                    .scheduleId(schedule.getScheduleId())
                    .offeringId(offering.getOfferingId())
                    .offeringName(offering.getOfferingName())
                    .courseName(offering.getCourse() != null ? offering.getCourse().getCourseName() : "")
                    .room(schedule.getRoom())
                    .classType(schedule.getClassType())
                    .dayOfWeek(schedule.getDayOfWeek())
                    .startTime(schedule.getStartTime())
                    .endTime(schedule.getEndTime())
                    .colorTheme(schedule.getColorTheme())
                    .build();
        }).collect(Collectors.toList());
    }
}