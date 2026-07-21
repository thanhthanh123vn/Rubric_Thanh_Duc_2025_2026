package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.StudentTranscriptItemResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.Enrollment;
import hcmuaf.edu.vn.fit.course_service.entity.enums.EnrollmentStatus;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
@RequiredArgsConstructor
@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;


    public List<StudentTranscriptItemResponse> getStudentTranscript(String studentId) {
        List<Enrollment> enrollments = enrollmentRepository
                .findByStudentIdAndStatusAndTotalScoreIsNotNull(studentId, EnrollmentStatus.ACTIVE);

        return enrollments.stream()
                .map(this::toTranscriptItem)
                .toList();
    }

    private StudentTranscriptItemResponse toTranscriptItem(Enrollment e) {
        CourseOffering offering = e.getCourseOffering();

        return StudentTranscriptItemResponse.builder()
                .enrollmentId(e.getEnrollmentId())
                .offeringId(offering != null ? offering.getOfferingId() : null)
                .courseId(offering != null && offering.getCourse() != null ? offering.getCourse().getCourseId() : null)
                .courseName(offering != null && offering.getCourse() != null ? offering.getCourse().getCourseName() : null)
                .attendanceScore(e.getAttendanceScore())
                .assignmentScore(e.getAssignmentScore())
                .midtermScore(e.getMidtermScore())
                .finalScore(e.getFinalScore())
                .totalScore(e.getTotalScore())
                .letterGrade(e.getLetterGrade())
                .build();
    }
}
