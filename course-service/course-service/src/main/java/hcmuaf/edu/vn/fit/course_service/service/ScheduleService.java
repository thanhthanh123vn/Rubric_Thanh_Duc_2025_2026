package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.request.ScheduleRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.ScheduleResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.CourseSchedule;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseScheduleMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseScheduleRepository; // Repo tự tạo
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor // Tự động inject các final dependencies
public class ScheduleService {

    private final CourseScheduleRepository courseScheduleRepository;
    private final CourseScheduleMapper scheduleMapper;
    private final CourseOfferingRepository courseOfferingRepository;

    public List<ScheduleResponse> getStudentSchedule(String studentId) {


        List<CourseSchedule> rawSchedules = courseScheduleRepository.findSchedulesByStudentId(studentId);


        return scheduleMapper.toDtoList(rawSchedules);
    }

    public List<ScheduleResponse> getAllSchedules() {
        return scheduleMapper.toDtoList(courseScheduleRepository.findAll());
    }
    public ScheduleResponse getScheduleById(String id) {
        CourseSchedule schedule = courseScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch học với ID: " + id));
        return scheduleMapper.toDto(schedule);
    }
    @Transactional
    public ScheduleResponse createSchedule(ScheduleRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học với ID: " + request.getOfferingId()));

        CourseSchedule newSchedule = CourseSchedule.builder()
                .courseOffering(offering)
                .room(request.getRoom())
                .classType(request.getType())
                .dayOfWeek(request.getDay())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .colorTheme(request.getColor())
                .build();

        newSchedule = courseScheduleRepository.save(newSchedule);
        return scheduleMapper.toDto(newSchedule);
    }
    @Transactional
    public ScheduleResponse updateSchedule(String id, ScheduleRequest request) {
        CourseSchedule existingSchedule = courseScheduleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch học với ID: " + id));

        // Nếu có đổi Lớp học (CourseOffering)
        if (!existingSchedule.getCourseOffering().getOfferingId().equals(request.getOfferingId())) {
            CourseOffering offering = courseOfferingRepository.findById(request.getOfferingId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Lớp học với ID: " + request.getOfferingId()));
            existingSchedule.setCourseOffering(offering);
        }

        existingSchedule.setRoom(request.getRoom());
        existingSchedule.setClassType(request.getType());
        existingSchedule.setDayOfWeek(request.getDay());
        existingSchedule.setStartTime(request.getStartTime());
        existingSchedule.setEndTime(request.getEndTime());
        existingSchedule.setColorTheme(request.getColor());

        existingSchedule = courseScheduleRepository.save(existingSchedule);
        return scheduleMapper.toDto(existingSchedule);
    }

    // --- DELETE ---
    @Transactional
    public void deleteSchedule(String id) {
        if (!courseScheduleRepository.existsById(id)) {
            throw new RuntimeException("Không tìm thấy lịch học với ID: " + id);
        }
        courseScheduleRepository.deleteById(id);
    }
}