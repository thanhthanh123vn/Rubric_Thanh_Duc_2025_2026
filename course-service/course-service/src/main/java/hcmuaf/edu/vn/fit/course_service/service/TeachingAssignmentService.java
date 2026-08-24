package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssignmentProposalRequest;
import hcmuaf.edu.vn.fit.course_service.dto.request.TeachingAssignmentReviewRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerInfo;
import hcmuaf.edu.vn.fit.course_service.dto.response.LecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.TeachingAssignmentProposalResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.UserResponse;
import hcmuaf.edu.vn.fit.course_service.entity.AssignmentProposalStatus;
import hcmuaf.edu.vn.fit.course_service.entity.CourseOffering;
import hcmuaf.edu.vn.fit.course_service.entity.TeachingAssignmentProposal;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.CourseOfferingRepository;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.TeachingAssignmentProposalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TeachingAssignmentService {
    private final TeachingAssignmentProposalRepository proposalRepository;
    private final CourseOfferingRepository offeringRepository;
    private final CourseService courseService;
    private final UserClient userClient;

    @Transactional(readOnly = true)
    public List<TeachingAssignmentProposalResponse> getProposals(String userId, String status) {
        UserResponse user = requireLeadership(userId);
        AssignmentProposalStatus parsedStatus = hasText(status) && !"ALL".equalsIgnoreCase(status)
                ? AssignmentProposalStatus.valueOf(status.toUpperCase())
                : null;
        List<TeachingAssignmentProposal> proposals = parsedStatus == null
                ? proposalRepository.findAllByOrderByCreatedAtDesc()
                : proposalRepository.findByStatusOrderByCreatedAtDesc(parsedStatus);

        if (isDepartmentHead(user)) {
            LecturerResponse profile = userClient.getLecturerByUserId(userId);
            String department = profile == null ? null : profile.getDepartment();
            proposals = proposals.stream()
                    .filter(proposal -> offeringRepository.findById(proposal.getOfferingId())
                            .map(offering -> Objects.equals(offering.getCourse().getDepartment(), department))
                            .orElse(false))
                    .toList();
        }
        return proposals.stream().map(this::toResponse).toList();
    }

    @Transactional
    public TeachingAssignmentProposalResponse createProposal(
            String userId,
            TeachingAssignmentProposalRequest request
    ) {
        UserResponse requester = requireDepartmentHead(userId);
        CourseOffering offering = requireOffering(request == null ? null : request.getOfferingId());
        validateDepartmentScope(userId, offering);
        List<String> lecturerIds = normalizeLecturerIds(request.getLecturerIds());
        validateLecturers(offering, lecturerIds);
        proposalRepository.findFirstByOfferingIdAndStatusOrderByCreatedAtDesc(
                offering.getOfferingId(), AssignmentProposalStatus.PENDING
        ).ifPresent(existing -> {
            throw new IllegalStateException("Lớp học phần đã có một đề xuất đang chờ duyệt.");
        });

        TeachingAssignmentProposal proposal = TeachingAssignmentProposal.builder()
                .proposalId("TAP-" + UUID.randomUUID())
                .offeringId(offering.getOfferingId())
                .lecturerIds(new ArrayList<>(lecturerIds))
                .previousLecturerIds(offering.getLecturerIds() == null
                        ? new ArrayList<>()
                        : new ArrayList<>(offering.getLecturerIds()))
                .requestedBy(userId)
                .requestedByName(requester.getFullName())
                .requestNote(request.getNote())
                .status(AssignmentProposalStatus.PENDING)
                .build();
        return toResponse(proposalRepository.save(proposal));
    }

    @Transactional
    public TeachingAssignmentProposalResponse updateProposal(
            String proposalId,
            String userId,
            TeachingAssignmentProposalRequest request
    ) {
        requireDepartmentHead(userId);
        TeachingAssignmentProposal proposal = requirePendingOwnedProposal(proposalId, userId);
        CourseOffering offering = requireOffering(proposal.getOfferingId());
        List<String> lecturerIds = normalizeLecturerIds(request.getLecturerIds());
        validateLecturers(offering, lecturerIds);
        proposal.setLecturerIds(new ArrayList<>(lecturerIds));
        proposal.setRequestNote(request.getNote());
        return toResponse(proposalRepository.save(proposal));
    }

    @Transactional
    public TeachingAssignmentProposalResponse cancelProposal(String proposalId, String userId) {
        requireDepartmentHead(userId);
        TeachingAssignmentProposal proposal = requirePendingOwnedProposal(proposalId, userId);
        proposal.setStatus(AssignmentProposalStatus.CANCELLED);
        return toResponse(proposalRepository.save(proposal));
    }

    @Transactional
    public TeachingAssignmentProposalResponse reviewProposal(
            String proposalId,
            String userId,
            TeachingAssignmentReviewRequest request
    ) {
        UserResponse reviewer = requireDean(userId);
        TeachingAssignmentProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề xuất phân công."));
        if (proposal.getStatus() != AssignmentProposalStatus.PENDING) {
            throw new IllegalStateException("Đề xuất này đã được xử lý.");
        }
        String action = request == null ? null : request.getAction();
        if ("APPROVE".equalsIgnoreCase(action)) {
            courseService.assignLecturers(proposal.getOfferingId(), proposal.getLecturerIds());
            proposal.setStatus(AssignmentProposalStatus.APPROVED);
        } else if ("REJECT".equalsIgnoreCase(action)) {
            if (!hasText(request.getNote())) {
                throw new IllegalArgumentException("Vui lòng nhập lý do từ chối.");
            }
            proposal.setStatus(AssignmentProposalStatus.REJECTED);
        } else {
            throw new IllegalArgumentException("Hành động phê duyệt không hợp lệ.");
        }
        proposal.setReviewedBy(userId);
        proposal.setReviewedByName(reviewer.getFullName());
        proposal.setReviewNote(request == null ? null : request.getNote());
        proposal.setReviewedAt(LocalDateTime.now());
        return toResponse(proposalRepository.save(proposal));
    }

    private TeachingAssignmentProposalResponse toResponse(TeachingAssignmentProposal proposal) {
        CourseOffering offering = requireOffering(proposal.getOfferingId());
        return TeachingAssignmentProposalResponse.builder()
                .proposalId(proposal.getProposalId())
                .offeringId(offering.getOfferingId())
                .offeringName(offering.getOfferingName())
                .courseId(offering.getCourse().getCourseId())
                .courseCode(offering.getCourse().getCourseCode())
                .courseName(offering.getCourse().getCourseName())
                .department(offering.getCourse().getDepartment())
                .semester(offering.getSemester())
                .lecturers(toLecturerInfos(proposal.getLecturerIds()))
                .previousLecturers(toLecturerInfos(proposal.getPreviousLecturerIds()))
                .requestedBy(proposal.getRequestedBy())
                .requestedByName(proposal.getRequestedByName())
                .requestNote(proposal.getRequestNote())
                .status(proposal.getStatus().name())
                .reviewedBy(proposal.getReviewedBy())
                .reviewedByName(proposal.getReviewedByName())
                .reviewNote(proposal.getReviewNote())
                .reviewedAt(proposal.getReviewedAt())
                .createdAt(proposal.getCreatedAt())
                .updatedAt(proposal.getUpdatedAt())
                .build();
    }

    private List<LecturerInfo> toLecturerInfos(List<String> ids) {
        if (ids == null) return List.of();
        return ids.stream().map(id -> {
            try {
                LecturerResponse lecturer = userClient.getLecturer(id);
                return new LecturerInfo(id, lecturer == null ? id : lecturer.getFullName());
            } catch (Exception ignored) {
                return new LecturerInfo(id, id);
            }
        }).toList();
    }

    private void validateLecturers(CourseOffering offering, List<String> lecturerIds) {
        for (String lecturerId : lecturerIds) {
            LecturerResponse lecturer = userClient.getLecturer(lecturerId);
            if (lecturer == null) {
                throw new IllegalArgumentException("Không tìm thấy giảng viên " + lecturerId);
            }
            if (!Objects.equals(offering.getCourse().getDepartment(), lecturer.getDepartment())) {
                throw new IllegalArgumentException("Giảng viên không thuộc bộ môn quản lý học phần.");
            }
        }
    }

    private void validateDepartmentScope(String userId, CourseOffering offering) {
        LecturerResponse profile = userClient.getLecturerByUserId(userId);
        if (profile == null || !Objects.equals(profile.getDepartment(), offering.getCourse().getDepartment())) {
            throw new SecurityException("Bạn chỉ được phân công học phần thuộc bộ môn mình phụ trách.");
        }
    }

    private List<String> normalizeLecturerIds(List<String> lecturerIds) {
        if (lecturerIds == null || lecturerIds.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ít nhất một giảng viên.");
        }
        return lecturerIds.stream().filter(TeachingAssignmentService::hasText).distinct().toList();
    }

    private TeachingAssignmentProposal requirePendingOwnedProposal(String proposalId, String userId) {
        TeachingAssignmentProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề xuất phân công."));
        if (!Objects.equals(proposal.getRequestedBy(), userId)) {
            throw new SecurityException("Bạn không phải người tạo đề xuất này.");
        }
        if (proposal.getStatus() != AssignmentProposalStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể sửa hoặc hủy đề xuất đang chờ duyệt.");
        }
        return proposal;
    }

    private CourseOffering requireOffering(String offeringId) {
        if (!hasText(offeringId)) throw new IllegalArgumentException("Thiếu lớp học phần.");
        return offeringRepository.findById(offeringId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lớp học phần."));
    }

    private UserResponse requireLeadership(String userId) {
        UserResponse user = userClient.getUser(userId);
        if (user == null || !("DEAN".equals(user.getRole()) || isDepartmentHead(user))) {
            throw new SecurityException("Bạn không có quyền xem quản lý phân công.");
        }
        return user;
    }

    private UserResponse requireDepartmentHead(String userId) {
        UserResponse user = userClient.getUser(userId);
        if (!isDepartmentHead(user)) {
            throw new SecurityException("Chỉ Trưởng bộ môn được tạo hoặc chỉnh sửa phân công.");
        }
        return user;
    }

    private UserResponse requireDean(String userId) {
        UserResponse user = userClient.getUser(userId);
        if (user == null || !"DEAN".equals(user.getRole())) {
            throw new SecurityException("Chỉ lãnh đạo khoa được phê duyệt phân công.");
        }
        return user;
    }

    private boolean isDepartmentHead(UserResponse user) {
        return user != null && ("HEAD_OF_DEPARTMENT".equals(user.getRole())
                || "DEPARTMENT_HEAD".equals(user.getRole()));
    }

    private static boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
