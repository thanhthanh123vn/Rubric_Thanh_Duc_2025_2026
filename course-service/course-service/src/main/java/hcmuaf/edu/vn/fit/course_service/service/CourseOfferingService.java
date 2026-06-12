package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CourseOfferingRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.CourseOfferingResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerInfo; // Bổ sung class này
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import lombok.RequiredArgsConstructor;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseOfferingService {

    private final CourseOfferingRepository courseOfferingRepository;
    private final CourseRepository courseRepository;
    private final CourseMapper courseMapper;
    private final UserClient userClient;


    private static final Logger log = LoggerFactory.getLogger(CourseOfferingService.class);

    public List<CourseOfferingResponse> getOfferingsByCourseId(String courseId) {
        List<CourseOffering> offerings = courseOfferingRepository.findByCourse_CourseId(courseId);

        return offerings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public CourseOfferingResponse getOfferingById(String offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));
        return mapToResponse(offering);
    }

    @Transactional
    public CourseOfferingResponse createOffering(String courseId, CourseOfferingRequest request) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy môn học với ID: " + courseId));

        CourseOffering offering = CourseOffering.builder()
                .offeringId(UUID.randomUUID().toString())
                .course(course)
                .offeringName(request.getOfferingName())
                .lecturerIds(request.getLecturerIds())
                .semester(request.getSemester())
                .academicYear(request.getAcademicYear())
                .maxStudents(request.getMaxStudents())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(request.getStatus() != null ? request.getStatus() : "OPEN")
                .build();

        offering = courseOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    @Transactional
    public CourseOfferingResponse updateOffering(String offeringId, CourseOfferingRequest request) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));

        offering.setOfferingName(request.getOfferingName());
        offering.setLecturerIds(request.getLecturerIds());
        offering.setSemester(request.getSemester());
        offering.setAcademicYear(request.getAcademicYear());
        offering.setMaxStudents(request.getMaxStudents());
        offering.setStartDate(request.getStartDate());
        offering.setEndDate(request.getEndDate());

        if (request.getStatus() != null) {
            offering.setStatus(request.getStatus());
        }

        offering = courseOfferingRepository.save(offering);
        return mapToResponse(offering);
    }

    @Transactional
    public void deleteOffering(String offeringId) {
        CourseOffering offering = courseOfferingRepository.findById(offeringId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học phần với ID: " + offeringId));

        courseOfferingRepository.delete(offering);
    }

    private CourseOfferingResponse mapToResponse(CourseOffering entity) {

        List<LecturerInfo> lecturerInfos = new ArrayList<>();

        if (entity.getLecturerIds() != null && !entity.getLecturerIds().isEmpty()) {
            for (String lId : entity.getLecturerIds()) {
                try {
                    LecturerResponse lecturer = userClient.getLecturer(lId);
                    lecturerInfos.add(new LecturerInfo(lId, lecturer.getFullName()));
                } catch (Exception e) {
                    log.error("Không thể lấy thông tin giảng viên ID: {}", lId, e);
                    lecturerInfos.add(new LecturerInfo(lId, "Không xác định"));
                }
            }
        }

        return CourseOfferingResponse.builder()
                .offeringId(entity.getOfferingId())
                .offeringName(entity.getOfferingName())
                .course(courseMapper.toCourseResponse(entity.getCourse()))
                .lecturers(lecturerInfos)
                .semester(entity.getSemester())
                .year(entity.getAcademicYear())
                .maxStudents(entity.getMaxStudents())
                .startDate(entity.getStartDate())
                .endDate(entity.getEndDate())
                .status(entity.getStatus())
                .build();
    }

    public List<CourseOfferingResponse> getOfferings() {
        List<CourseOffering> offerings = courseOfferingRepository.findAll();

        return offerings.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }
}