package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CloPloReviewRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.FacultyResponse;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloApprovalStatus;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloSubmission;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloSubmissionType;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloMapping;
import hcmuaf.edu.vn.fit.course_service.entity.CloPloMappingId;
import hcmuaf.edu.vn.fit.course_service.entity.Course;
import hcmuaf.edu.vn.fit.course_service.entity.CourseCLO;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CloPloMappingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CloPloSubmissionRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseCLORepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.EducationProgramRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.ProgramPloRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CloPloApprovalServiceTest {
    @Mock CourseRepository courseRepository;
    @Mock CourseOfferingRepository courseOfferingRepository;
    @Mock CourseCLORepository cloRepository;
    @Mock ProgramPloRepository ploRepository;
    @Mock EducationProgramRepository programRepository;
    @Mock CloPloMappingRepository mappingRepository;
    @Mock CloPloSubmissionRepository submissionRepository;
    @Mock UserClient userClient;
    @InjectMocks CloPloApprovalService service;

    @Test
    void submitCloDoesNotRequirePloMapping() {
        Course course = Course.builder().courseId("C1").programId("P1").build();
        CourseCLO clo = CourseCLO.builder().cloId("CLO1").cloCode("CLO1").course(course).build();
        LecturerResponse lecturer = new LecturerResponse();
        lecturer.setLecturerId("L1");

        when(cloRepository.findById("CLO1")).thenReturn(Optional.of(clo));
        when(userClient.getLecturerByUserId("U1")).thenReturn(lecturer);
        when(courseOfferingRepository.findByCourse_CourseId("C1"))
                .thenReturn(List.of(CourseOffering.builder().course(course).mainLecturerId("L1").build()));
        when(cloRepository.findByCourseCourseIdOrderByCloCodeAsc("C1")).thenReturn(List.of(clo));
        when(mappingRepository.findByIdCloIdIn(List.of("CLO1"))).thenReturn(List.of());
        when(ploRepository.findByProgramProgramIdOrderByPloCodeAsc("P1")).thenReturn(List.of());

        assertThat(service.submitClo("CLO1", "U1").getStatus()).isEqualTo("PENDING_REVIEW");
    }

    @Test
    void rejectRequiresReason() {
        Course course = Course.builder().courseId("C1").department("CNTT").build();
        CloPloSubmission submission = CloPloSubmission.builder()
                .submissionId("S1").courseId("C1").submissionType(CloPloSubmissionType.CLO_PLO_MAPPING)
                .status(CloPloApprovalStatus.PENDING_REVIEW).build();
        LecturerResponse reviewer = new LecturerResponse();
        reviewer.setDepartment("CNTT");
        FacultyResponse faculty = FacultyResponse.builder().facultyName("Khoa CNTT").build();
        CloPloReviewRequest request = new CloPloReviewRequest();
        request.setAction("REJECT");
        request.setReason("   ");

        when(submissionRepository.findById("S1")).thenReturn(Optional.of(submission));
        when(courseRepository.findById("C1")).thenReturn(Optional.of(course));
        when(userClient.getLecturerByUserId("U-HOD")).thenReturn(reviewer);
        when(userClient.getFacultyByDepartmentName("U-HOD", "CNTT")).thenReturn(faculty);
        when(userClient.getDepartmentNamesByFaculty("U-HOD", "Khoa CNTT")).thenReturn(List.of("CNTT"));
        when(courseRepository.findByDepartmentIn(List.of("CNTT"))).thenReturn(List.of(course));

        assertThatThrownBy(() -> service.review("S1", "U-HOD", request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Lý do từ chối là bắt buộc");
    }

    @Test
    void mappingCannotBeSubmittedBeforeCloIsApproved() {
        Course course = Course.builder().courseId("C1").build();
        CourseCLO clo = CourseCLO.builder().cloId("CLO1").cloCode("CLO1").course(course)
                .approvalStatus(CloPloApprovalStatus.DRAFT).build();
        LecturerResponse lecturer = new LecturerResponse();
        lecturer.setLecturerId("L1");

        when(courseRepository.findById("C1")).thenReturn(Optional.of(course));
        when(userClient.getLecturerByUserId("U1")).thenReturn(lecturer);
        when(courseOfferingRepository.findByCourse_CourseId("C1"))
                .thenReturn(List.of(CourseOffering.builder().course(course).mainLecturerId("L1").build()));
        when(cloRepository.findByCourseCourseIdOrderByCloCodeAsc("C1")).thenReturn(List.of(clo));
        when(mappingRepository.findByIdCloIdIn(List.of("CLO1")))
                .thenReturn(List.of(CloPloMapping.builder().id(new CloPloMappingId("CLO1", "PLO1")).build()));

        assertThatThrownBy(() -> service.submitMapping("C1", "U1"))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("Chỉ được gửi mapping của CLO đã duyệt");
    }
}
