package hcmuaf.edu.vn.fit.rubric_service.service;

import hcmuaf.edu.vn.fit.rubric_service.client.CourseClient;
import hcmuaf.edu.vn.fit.rubric_service.client.UserClient;
import hcmuaf.edu.vn.fit.rubric_service.dto.request.RubricApprovalRequest;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.CourseDto;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.RubricResponse;
import hcmuaf.edu.vn.fit.rubric_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.rubric_service.entity.Rubric;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricApprovalRecord;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricCriteria;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricLevel;
import hcmuaf.edu.vn.fit.rubric_service.entity.RubricVersionHead;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.ApprovalRequestStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricStatus;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricType;
import hcmuaf.edu.vn.fit.rubric_service.entity.enums.RubricVisibility;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricApprovalRecordRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricCriteriaRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricLevelRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricRepository;
import hcmuaf.edu.vn.fit.rubric_service.repository.RubricVersionHeadRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class RubricServiceVersionTest {

    @Mock private RubricRepository rubricRepository;
    @Mock private UserClient userClient;
    @Mock private CourseClient courseClient;
    @Mock private RubricCriteriaRepository rubricCriteriaRepository;
    @Mock private RubricLevelRepository rubricLevelRepository;
    @Mock private RubricApprovalRecordRepository approvalRecordRepository;
    @Mock private RubricVersionHeadRepository versionHeadRepository;

    @InjectMocks private RubricService rubricService;

    @Test
    void revertCreatesANewPendingVersionWithoutMovingHead() {
        String userId = "USER-1";
        String lecturerId = "LECTURER-1";
        RubricLevel oldLevel = RubricLevel.builder()
                .levelId("LV-OLD")
                .levelName("Tốt")
                .description("Đạt yêu cầu")
                .score(4F)
                .build();
        RubricCriteria oldCriterion = RubricCriteria.builder()
                .criteriaId("CR-OLD")
                .cloId("CLO-1")
                .criteriaName("Nội dung")
                .description("Độ chính xác")
                .weight(100F)
                .levels(Set.of(oldLevel))
                .build();
        Rubric oldVersion = Rubric.builder()
                .rubricId("RB-OLD")
                .lecturerId(lecturerId)
                .courseId("COURSE-1")
                .facultyId("FACULTY-1")
                .rubricName("Rubric báo cáo")
                .description("Version cần khôi phục")
                .rubricType(RubricType.LECTURER_VARIANT)
                .visibility(RubricVisibility.PRIVATE)
                .rootRubricId("RB-ROOT")
                .parentRubricId("RB-ROOT")
                .versionNumber(2)
                .status(RubricStatus.APPROVED)
                .criteria(new HashSet<>(Set.of(oldCriterion)))
                .build();
        oldCriterion.setRubric(oldVersion);
        oldLevel.setCriteria(oldCriterion);

        UserResponse user = new UserResponse(userId, "main.lecturer", "Giảng viên chính", null, null, "MAIN_LECTURER");
        LecturerResponse lecturer = new LecturerResponse();
        lecturer.setLecturerId(lecturerId);
        lecturer.setFullName("Giảng viên chính");

        when(userClient.getUser(userId)).thenReturn(user);
        when(userClient.getLecturerByUserId(userId)).thenReturn(lecturer);
        when(rubricRepository.findWithCriteriaAndLevelsByRubricId(any())).thenAnswer(invocation ->
                "RB-OLD".equals(invocation.getArgument(0)) ? Optional.of(oldVersion) : Optional.empty());
        when(rubricRepository.findMaxVersionNumber("RB-ROOT")).thenReturn(3);
        when(rubricRepository.save(any(Rubric.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(rubricCriteriaRepository.save(any(RubricCriteria.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(approvalRecordRepository.findTopByRubricIdOrderByRevisionNumberDesc(any())).thenReturn(Optional.empty());
        when(approvalRecordRepository.save(any(RubricApprovalRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        RubricResponse response = rubricService.revertHead("RB-OLD", userId);

        ArgumentCaptor<Rubric> versionCaptor = ArgumentCaptor.forClass(Rubric.class);
        verify(rubricRepository).save(versionCaptor.capture());
        Rubric restored = versionCaptor.getValue();
        assertThat(restored.getRubricId()).isNotEqualTo(oldVersion.getRubricId());
        assertThat(restored.getRootRubricId()).isEqualTo("RB-ROOT");
        assertThat(restored.getParentRubricId()).isEqualTo("RB-OLD");
        assertThat(restored.getVersionNumber()).isEqualTo(4);
        assertThat(restored.getStatus()).isEqualTo(RubricStatus.PENDING);
        assertThat(response.getId()).isEqualTo(restored.getRubricId());
        assertThat(response.isCurrentHead()).isFalse();

        ArgumentCaptor<RubricCriteria> criterionCaptor = ArgumentCaptor.forClass(RubricCriteria.class);
        verify(rubricCriteriaRepository).save(criterionCaptor.capture());
        assertThat(criterionCaptor.getValue().getCriteriaId()).isNotEqualTo("CR-OLD");
        assertThat(criterionCaptor.getValue().getCriteriaName()).isEqualTo("Nội dung");
        assertThat(criterionCaptor.getValue().getRubric()).isSameAs(restored);
        verify(rubricLevelRepository).saveAll(any());

        verify(versionHeadRepository, never()).save(any(RubricVersionHead.class));
        verify(rubricRepository, never()).save(oldVersion);
    }

    @Test
    void approvingRestoredVersionMovesHeadToIt() {
        String reviewerId = "HOD-USER";
        String lecturerId = "LECTURER-1";
        Rubric restoredVersion = Rubric.builder()
                .rubricId("RB-RESTORED")
                .lecturerId(lecturerId)
                .courseId("COURSE-1")
                .rubricType(RubricType.LECTURER_VARIANT)
                .visibility(RubricVisibility.PRIVATE)
                .rootRubricId("RB-ROOT")
                .parentRubricId("RB-OLD")
                .versionNumber(4)
                .status(RubricStatus.PENDING)
                .criteria(new HashSet<>())
                .build();
        UserResponse reviewer = new UserResponse(reviewerId, "hod", "Trưởng bộ môn", null, null, "HEAD_OF_DEPARTMENT");
        LecturerResponse reviewerProfile = new LecturerResponse();
        reviewerProfile.setDepartment("Công nghệ phần mềm");
        RubricApprovalRecord approvalRecord = RubricApprovalRecord.builder()
                .approvalRequestId("RAR-1")
                .rubricId(restoredVersion.getRubricId())
                .revisionNumber(1)
                .submittedBy("USER-1")
                .status(ApprovalRequestStatus.PENDING)
                .build();
        RubricApprovalRequest request = new RubricApprovalRequest();
        request.setAction("APPROVE");

        when(userClient.getUser(reviewerId)).thenReturn(reviewer);
        when(userClient.getLecturerByUserId(reviewerId)).thenReturn(reviewerProfile);
        when(courseClient.getCoursesByDepartment("Công nghệ phần mềm"))
                .thenReturn(List.of(new CourseDto("COURSE-1", "C01", "Môn học", "Công nghệ phần mềm")));
        when(rubricRepository.findById("RB-RESTORED")).thenReturn(Optional.of(restoredVersion));
        when(approvalRecordRepository.findTopByRubricIdOrderByRevisionNumberDesc("RB-RESTORED"))
                .thenReturn(Optional.of(approvalRecord));
        when(versionHeadRepository.findByRootRubricIdAndLecturerId("RB-ROOT", lecturerId))
                .thenReturn(Optional.empty());
        when(versionHeadRepository.save(any(RubricVersionHead.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(approvalRecordRepository.save(any(RubricApprovalRecord.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(rubricRepository.save(any(Rubric.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Rubric approved = rubricService.reviewRubric("RB-RESTORED", reviewerId, request);

        assertThat(approved.getStatus()).isEqualTo(RubricStatus.APPROVED);
        ArgumentCaptor<RubricVersionHead> headCaptor = ArgumentCaptor.forClass(RubricVersionHead.class);
        verify(versionHeadRepository).save(headCaptor.capture());
        assertThat(headCaptor.getValue().getRubricId()).isEqualTo("RB-RESTORED");
        assertThat(approvalRecord.getStatus()).isEqualTo(ApprovalRequestStatus.APPROVED);
    }
}
