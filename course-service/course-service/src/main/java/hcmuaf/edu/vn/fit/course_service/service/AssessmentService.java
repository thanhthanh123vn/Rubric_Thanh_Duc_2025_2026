package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.client.GradingClient;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.entity.enums.GradeStatus;
import hcmuaf.edu.vn.fit.course_service.mapper.AssessmentMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.CommentMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.CourseMapper;
import hcmuaf.edu.vn.fit.course_service.repository.jpa.*;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.lang.reflect.Field;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AssessmentService {


    private final AssessmentRepository assessmentRepository;
    private final  EnrollmentRepository enrollmentRepository;
    private final GradingClient gradingClient;
    private final CourseMapper courseMapper;

    private  final S3Service s3Service;
    @Enumerated(EnumType.STRING)
    private GradeStatus status = GradeStatus.PENDING;
    private final AssessmentMapper assessmentMapper;
    private final SubmissionRepository submissionRepository;
    private final CourseOfferingRepository courseOfferingRepository;
    private final GroupRepository groupRepository;
    private final ParticipantRepository participantRepository;
    @Autowired
    private AssessmentCLORepository assessmentCLORepository;

    @Autowired
    private CourseCLORepository courseCLORepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AssessmentCommentRepository assessmentCommentRepository;
     private final UserClient userClient;
     private final CommentMapper commentMapper;
    public List<AssessmentReponse> getAssByCourseOffering(String courseOffering, String studentId) {

        List<Object[]> res = assessmentRepository
                .getAssignmentByCourseOffering(courseOffering, studentId);



        return res.stream().map(item -> {
            try {
                AssessmentReponse dto = new AssessmentReponse();

                dto.setAssessmentId(item[0] != null ? item[0].toString() : null);
                dto.setAssessmentName(item[1] != null ? item[1].toString() : null);
                dto.setAssessmentType(item[2] != null ? item[2].toString() : null);
                dto.setWeight(item[3] != null ? ((Number) item[3]).floatValue() : null);

                dto.setEndTime((Timestamp) item[4]);
                if(item[5] != null){
                    dto.setSubmissionId(item[5].toString());
                    dto.setSubmissionAt((Timestamp) item[6]);
                }

                if (item[9] != null) {
                    String closJson = item[9].toString();
                    List<String> clos = objectMapper.readValue(
                            closJson,
                            new TypeReference<List<String>>() {}
                    );
                    dto.setCloCode(clos);
                }

                GradeDetailResponse gradeDetail = getGradeDetailSafely(dto.getAssessmentId(), studentId);
                Double fallbackTotalScore = dto.getSubmissionId() != null
                        ? getRubricFallbackTotalScore(dto.getAssessmentId(), studentId)
                        : null;

                dto.setCalculatedScore(
                        roundToSingleDecimal(resolveDisplayedTotalScore(
                                gradeDetail != null ? gradeDetail.getTotalScore() : null,
                                fallbackTotalScore
                        ))
                );
                dto.setLecturerComment(
                        gradeDetail != null && gradeDetail.getComment() != null && !gradeDetail.getComment().isBlank()
                                ? gradeDetail.getComment()
                                : fallbackTotalScore != null
                                    ? "Đã chấm theo rubric"
                                    : null
                );

                return dto;

            } catch (Exception e) {
                throw new RuntimeException("Parse error", e);
            }
        }).toList();
    }
    public AssessmentDetailResponse getAssById(String assessmentId, String studentId) {

        List<Object[]> list = assessmentRepository.getAssignmentDetail(assessmentId, studentId);

        if (list == null || list.isEmpty()) return null;

        Object[] res = list.get(0);
        if (res == null) {
            return null;
        }

        try {
            AssessmentDetailResponse dto = new AssessmentDetailResponse();

            dto.setAssessmentId((String) res[0]);
            dto.setAssessmentName((String) res[1]);
            dto.setDescription((String) res[2]);
            dto.setAssessmentType((String) res[3]);
            dto.setWeight(res[4] != null ? ((Number) res[4]).doubleValue() : null);
            dto.setEndTime((Timestamp) res[5]);

            dto.setSubmissionId((String) res[6]);
            dto.setSubmissionAt((Timestamp) res[7]);

            String closJson = (String) res[10];
            if (closJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, String>> cloList =
                        mapper.readValue(closJson, new TypeReference<>() {});

                Map<String, String> closMap = new HashMap<>();
                for (Map<String, String> clo : cloList) {
                    closMap.put(clo.get("code"), clo.get("description"));
                }

                dto.setClos(closMap);
            }

            GradeDetailResponse gradeDetail = getGradeDetailSafely(assessmentId, studentId);
            Double fallbackTotalScore = dto.getSubmissionId() != null
                    ? getRubricFallbackTotalScore(assessmentId, studentId)
                    : null;

            dto.setCalculatedScore(
                    roundToSingleDecimal(resolveDisplayedTotalScore(
                            gradeDetail != null ? gradeDetail.getTotalScore() : null,
                            fallbackTotalScore
                    ))
            );
            dto.setLecturerComment(
                    gradeDetail != null && gradeDetail.getComment() != null && !gradeDetail.getComment().isBlank()
                            ? gradeDetail.getComment()
                            : fallbackTotalScore != null
                                ? "Đã chấm theo rubric"
                                : null
            );
            if (dto.getRubricId() == null && gradeDetail != null && gradeDetail.getRubricId() != null) {
                dto.setRubricId(gradeDetail.getRubricId());
            }

            return dto;

        } catch (Exception e) {
            throw new RuntimeException("Parse error", e);
        }
    }
    public List<SubmissionEntity> getSubmissions(String assessmentId) {

        return submissionRepository.findByAssessmentId(assessmentId);
    }

    public List<AssessmentSubmissionStatusResponse> getSubmissionStatuses(String assessmentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + assessmentId));

        if (assessment.getCourseOffering() == null) {
            return Collections.emptyList();
        }

        String offeringId = assessment.getCourseOffering().getOfferingId();
        List<String> studentIds = enrollmentRepository.findStudentIdsByOfferingId(offeringId);
        if (studentIds == null || studentIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<String, SubmissionEntity> submissionMap = submissionRepository.findByAssessmentId(assessmentId)
                .stream()
                .collect(Collectors.toMap(
                        SubmissionEntity::getStudentId,
                        submission -> submission,
                        (current, ignored) -> current
                ));

        return studentIds.stream()
                .map(studentId -> {
                    SubmissionEntity submission = submissionMap.get(studentId);

                    if (submission == null) {
                        return AssessmentSubmissionStatusResponse.builder()
                                .id(assessmentId + "-" + studentId)
                                .assessmentId(assessmentId)
                                .studentId(studentId)
                                .status("NOT_SUBMITTED")
                                .submitted(false)
                                .build();
                    }

                    GradeDetailResponse gradeDetail = null;
                    Double fallbackTotalScore = null;
                    String fallbackComment = null;
                    List<SubmissionCriterionScoreResponse> gradedCriteria = Collections.emptyList();
                    try {
                        gradeDetail = gradingClient.getGradeByStudentAndAssessment(assessmentId, studentId);
                    } catch (Exception ignored) {
                    }

                    if (gradeDetail == null) {
                        try {
                            List<Object[]> rubricDetails = assessmentRepository.getRubricCriterionDetails(assessmentId, studentId);
                            if (rubricDetails != null && !rubricDetails.isEmpty()) {
                                fallbackTotalScore = rubricDetails.stream()
                                        .map(row -> row[4])
                                        .filter(Number.class::isInstance)
                                        .map(Number.class::cast)
                                        .mapToDouble(Number::doubleValue)
                                        .sum();
                                fallbackComment = "Đã chấm theo rubric";
                            }
                        } catch (Exception ignored) {
                        }
                    }

                    try {
                        List<Object[]> rubricDetails = assessmentRepository.getRubricCriterionDetails(assessmentId, studentId);
                        if (rubricDetails != null && !rubricDetails.isEmpty()) {
                            gradedCriteria = rubricDetails.stream()
                                    .map(this::mapSubmissionCriterionScore)
                                    .toList();
                        }
                    } catch (Exception ignored) {
                    }

                    if (fallbackTotalScore != null && Math.abs(fallbackTotalScore) < 0.000001d) {
                        fallbackTotalScore = null;
                        fallbackComment = null;
                    }

                    Double resolvedTotalScore = resolveDisplayedTotalScore(
                            gradeDetail != null ? gradeDetail.getTotalScore() : null,
                            fallbackTotalScore
                    );

                    return AssessmentSubmissionStatusResponse.builder()
                            .id(submission.getId())
                            .assessmentId(submission.getAssessmentId())
                            .studentId(submission.getStudentId())
                            .rubricId(submission.getRubricId())
                            .fileUrl(submission.getFileUrl())
                            .submittedLink(submission.getSubmittedLink())
                            .submittedAt(submission.getSubmittedAt())
                            .status(
                                    gradeDetail != null && gradeDetail.getStatus() != null && !gradeDetail.getStatus().isBlank()
                                            ? gradeDetail.getStatus()
                                            : fallbackTotalScore != null
                                                ? "GRADED"
                                            : submission.getStatus() != null && !submission.getStatus().isBlank()
                                                ? submission.getStatus()
                                                : "SUBMITTED"
                            )
                            .submitted(true)
                            .totalScore(roundToSingleDecimal(resolvedTotalScore))
                            .grade(gradeDetail != null ? gradeDetail.getGrade() : null)
                            .comment(gradeDetail != null ? gradeDetail.getComment() : fallbackComment)
                            .gradedCriteria(gradedCriteria)
                            .build();
                })
                .sorted(Comparator.comparing(AssessmentSubmissionStatusResponse::getStudentId))
                .toList();
    }

    private SubmissionCriterionScoreResponse mapSubmissionCriterionScore(Object[] row) {
        return SubmissionCriterionScoreResponse.builder()
                .criteriaId(row[0] != null ? row[0].toString() : null)
                .criteriaName(row[1] != null ? row[1].toString() : null)
                .levelId(row[2] != null ? row[2].toString() : null)
                .levelName(row[3] != null ? row[3].toString() : null)
                .score(roundToSingleDecimal(row[4] instanceof Number number ? number.doubleValue() : null))
                .build();
    }

    private Double roundToSingleDecimal(Double value) {
        if (value == null || !Double.isFinite(value)) {
            return value;
        }
        return BigDecimal.valueOf(value)
                .setScale(1, RoundingMode.HALF_UP)
                .doubleValue();
    }

    private Double resolveDisplayedTotalScore(Double gradeScore, Double rubricScore) {
        if (gradeScore != null && Double.isFinite(gradeScore)) {
            if (gradeScore <= 10d) {
                return gradeScore;
            }

            if (rubricScore != null && Double.isFinite(rubricScore) && rubricScore <= 10d) {
                return rubricScore;
            }
        }

        if (rubricScore != null && Double.isFinite(rubricScore)) {
            return rubricScore;
        }

        return gradeScore;
    }
    public SubmissionEntity submitAssignment(
            String assessmentId,
            String studentId,
            MultipartFile file,
            String link,
            String rubricId

    ){
        try{
            boolean hasFile = file != null && !file.isEmpty();
            boolean hasLink = link != null && !link.trim().isEmpty();

            if (!hasFile && !hasLink) {
                throw new RuntimeException("Phải có file hoặc link");
            }

            String fileUrl = null;
            String submittedLink = hasLink ? link.trim() : null;

            if (hasFile) {
                fileUrl = s3Service.uploadFile(file);
            }
            if (!assessmentRepository.existsById(assessmentId)) {
                throw new RuntimeException("Assessment không tồn tại: " + assessmentId);
            }
            SubmissionEntity existing =  submissionRepository.findByAssessmentIdAndStudentId(assessmentId,studentId).orElse(null);

            if(existing != null){
                existing.setFileUrl(fileUrl);
                existing.setSubmittedLink(submittedLink);
                existing.setSubmittedAt(java.time.LocalDateTime.now());
                existing.setRubricId(rubricId);

                submissionRepository.save(existing);
                return existing;
            }

            SubmissionEntity submission = new SubmissionEntity();
            submission.setAssessmentId(assessmentId);
            submission.setStudentId(studentId);
            submission.setFileUrl(fileUrl);
            submission.setSubmittedLink(submittedLink);
            submission.setSubmittedAt(java.time.LocalDateTime.now());
            submission.setRubricId(rubricId);

            submissionRepository.save(submission);

            return submission;

        }catch (Exception e){
            throw new RuntimeException("Parse error", e);
        }
    }

    @Transactional
    public AssessmentLecturerResponse createAssessment(
            String offeringId,
            String assessmentName,
            String description,
            Float weight,
            String assessmentType,
            String endTimeStr,
            String rubricId,
            
            List<String> cloIds,
            MultipartFile file
    ) {
        try {

            String fileUrl = (file != null && !file.isEmpty()) ? s3Service.uploadFile(file) : null;
            Timestamp endTime = (endTimeStr != null && !endTimeStr.isEmpty())
                    ? Timestamp.valueOf(LocalDateTime.parse(endTimeStr)) : null;

            CourseOffering offering = courseOfferingRepository.findById(offeringId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy lớp học"));
            String finalRubricId = (rubricId != null && !rubricId.trim().isEmpty()) ? rubricId : null;

            Assessment assessment = Assessment.builder()
                    .assessmentId(UUID.randomUUID().toString())
                    .courseOffering(offering)
                    .assessmentName(assessmentName)
                    .description(description)
                    .weight(weight)
                    .assessmentType(assessmentType)
                    .rubricId(finalRubricId)
                    .fileUrl(fileUrl)
                    .startTime(new Timestamp(System.currentTimeMillis()))
                    .endTime(endTime)
                    .build();

            Assessment savedAssessment = assessmentRepository.save(assessment);


            if (cloIds != null && !cloIds.isEmpty()) {
                List<AssessmentCLO> assessmentCLOs = cloIds.stream().map(cloId -> {
                    CourseCLO clo = courseCLORepository.findById(cloId)
                            .orElseThrow(() -> new RuntimeException("CLO không tồn tại: " + cloId));
                    return AssessmentCLO.builder()
                            .assessmentCloId(UUID.randomUUID().toString())
                            .assessment(savedAssessment)
                            .courseCLO(clo)
                            .build();
                }).toList();
                assessmentCLORepository.saveAll(assessmentCLOs);
            }

            return assessmentMapper.toResponse(savedAssessment);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi: " + e.getMessage());
        }
    }
    @Transactional
    public AssessmentLecturerResponse updateAssessment(
            String assessmentId,
            String assessmentName,
            String description,
            Float weight,
            String assessmentType,
            String endTimeStr,
            String rubricId,
            List<String> cloIds,
            MultipartFile file
    ) {
        try {
            // 1. Tìm bài tập cũ
            Assessment assessment = assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + assessmentId));

            // 2. Cập nhật thông tin cơ bản
            assessment.setAssessmentName(assessmentName);
            assessment.setDescription(description);
            assessment.setWeight(weight);
            assessment.setAssessmentType(assessmentType);

            if (endTimeStr != null && !endTimeStr.isEmpty()) {
                assessment.setEndTime(Timestamp.valueOf(LocalDateTime.parse(endTimeStr)));
            }

            String finalRubricId = (rubricId != null && !rubricId.trim().isEmpty()) ? rubricId : null;
            assessment.setRubricId(finalRubricId);

            // 3. Nếu có file mới thì upload và ghi đè url cũ
            if (file != null && !file.isEmpty()) {
                String fileUrl = s3Service.uploadFile(file);
                assessment.setFileUrl(fileUrl);
            }

            Assessment savedAssessment = assessmentRepository.save(assessment);

            // 4. Cập nhật lại danh sách CLO (Xóa cũ -> Thêm mới)
            assessmentCLORepository.deleteByAssessment_AssessmentId(assessmentId);

            if (cloIds != null && !cloIds.isEmpty()) {
                List<AssessmentCLO> assessmentCLOs = cloIds.stream().map(cloId -> {
                    CourseCLO clo = courseCLORepository.findById(cloId)
                            .orElseThrow(() -> new RuntimeException("CLO không tồn tại: " + cloId));
                    return AssessmentCLO.builder()
                            .assessmentCloId(UUID.randomUUID().toString())
                            .assessment(savedAssessment)
                            .courseCLO(clo)
                            .build();
                }).toList();
                assessmentCLORepository.saveAll(assessmentCLOs);
            }

            return assessmentMapper.toResponse(savedAssessment);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi cập nhật bài tập: " + e.getMessage(), e);
        }
    }
    @Transactional
    public void deleteAssessment(String assessmentId) {
        try {
            Assessment assessment = assessmentRepository.findById(assessmentId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + assessmentId));


            assessmentCLORepository.deleteByAssessment_AssessmentId(assessmentId);
            submissionRepository.deleteByAssessmentId(assessmentId);

            assessmentCommentRepository.deleteByAssessment_AssessmentId(assessmentId);
            assessmentRepository.delete(assessment);

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi xóa bài tập: " + e.getMessage(), e);
        }
    }

    public List<AssessmentLecturerResponse> getAssessmentsByOfferingId(String offeringId) {
        List<Assessment> assessments = assessmentRepository.findByCourseOffering_OfferingIdOrderByStartTimeDesc(offeringId);


        List<String> studentIds = enrollmentRepository.findStudentIdsByOfferingId(offeringId);
        Long totalStudents = studentIds != null ? (long) studentIds.size() : 0L;

        return assessments.stream().map(assessment -> {
            AssessmentLecturerResponse response = assessmentMapper.toResponse(assessment);
            response.setTotalStudents(totalStudents);


            Long submittedCount = submissionRepository.countByAssessmentId(assessment.getAssessmentId());
            response.setSubmittedCount(submittedCount);


            try {

                Long gradedCount = gradingClient.getGradedCount(assessment.getAssessmentId());
                response.setGradedCount(gradedCount);
                response.setPendingCount(submittedCount - gradedCount);
            } catch (Exception e) {

                response.setGradedCount(0L);
                response.setPendingCount(submittedCount);
            }

            return response;
        }).toList();
    }
    public CommentResponse addAssessmentComment(String assessmentId, String userId, CommentRequest request) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + assessmentId));

        AssessmentComment comment = AssessmentComment.builder()
                .commentId("ACM-" + UUID.randomUUID().toString().substring(0, 8))
                .assessment(assessment)
                .userId(userId)
                .content(request.getContent())
                .createdAt(new Timestamp(System.currentTimeMillis()))
                .build();

        AssessmentComment savedComment = assessmentCommentRepository.save(comment);


        CommentResponse response = commentMapper.toResponse(savedComment);
        response.setMine(true);


        try {
            UserResponse user = userClient.getUser(userId);
            if (user != null) {
                String displayName = (user.getFullName() != null && !user.getFullName().isEmpty())
                        ? user.getFullName() : user.getUsername();
                response.setFullName(displayName);
                response.setUsername(displayName);
                response.setAvatarUrl(user.getAvatarUrl());
            }
        } catch (Exception e) {
            response.setFullName("Unknown");
        }
        return response;
    }

    public List<CommentResponse> getCommentsByAssessmentId(String currentUserId, String assessmentId) {
        List<AssessmentComment> comments = assessmentCommentRepository.findByAssessment_AssessmentIdOrderByCreatedAtAsc(assessmentId);

        return comments.stream().map(comment -> {

            CommentResponse res = commentMapper.toResponse(comment);
            res.setMine(comment.getUserId().equals(currentUserId));


            try {
                UserResponse user = userClient.getUser(comment.getUserId());
                if (user != null) {
                    String displayName = (user.getFullName() != null && !user.getFullName().isEmpty())
                            ? user.getFullName() : user.getUsername();
                    res.setFullName(displayName);
                    res.setUsername(displayName);
                    res.setAvatarUrl(user.getAvatarUrl());
                }
            } catch (Exception e) {
                res.setFullName("Unknown");
            }
            return res;
        }).collect(Collectors.toList());
    }
    public AssessmentDetailResponse getAssessmentDetail(String assessmentId, String studentId) {

        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập: " + assessmentId));

        AssessmentDetailResponse response = Optional.ofNullable(getAssById(assessmentId, studentId))
                .orElseGet(() -> assessmentMapper.toDetailResponse(assessment));

        response.setAssessmentId(assessment.getAssessmentId());
        response.setAssessmentName(assessment.getAssessmentName());
        response.setDescription(assessment.getDescription());
        response.setAssessmentType(assessment.getAssessmentType());
        response.setWeight(assessment.getWeight());
        response.setEndTime(assessment.getEndTime());
        response.setFileUrl(assessment.getFileUrl());
        response.setRubricId(assessment.getRubricId());

        List< AssessmentCLO> assessmentCLOS = assessmentCLORepository.getByAssessment_AssessmentId(assessmentId);

        Optional<SubmissionEntity> submissionOpt = submissionRepository.findByAssessmentIdAndStudentId(assessmentId, studentId);
        if (submissionOpt.isPresent()) {
            SubmissionEntity sub = submissionOpt.get();
            response.setSubmissionId(sub.getId());
            response.setSubmissionAt(sub.getSubmittedAt() != null ? Timestamp.valueOf(sub.getSubmittedAt()) : null);
            response.setSubmittedFileUrl(sub.getFileUrl());
            response.setSubmittedLink(sub.getSubmittedLink());
            if (response.getRubricId() == null) {
                response.setRubricId(sub.getRubricId());
            }
        }

        List<Object[]> rubricDetailRows = assessmentRepository.getRubricCriterionDetails(assessmentId, studentId);
        if (rubricDetailRows != null && !rubricDetailRows.isEmpty()) {
            List<RubricCriterionDetailResponse> rubricDetails = rubricDetailRows.stream()
                    .map(row -> new RubricCriterionDetailResponse(
                            row[0] != null ? row[0].toString() : null,
                            row[1] != null ? row[1].toString() : null,
                            row[2] != null ? row[2].toString() : null,
                            row[3] != null ? row[3].toString() : null,
                            row[4] != null ? ((Number) row[4]).doubleValue() : null,
                            row[5] != null ? ((Number) row[5]).doubleValue() : null
                    ))
                    .toList();
            response.setRubricDetails(rubricDetails);
        }

        GradeDetailResponse gradeDetail = getGradeDetailSafely(assessmentId, studentId);
        Double fallbackTotalScore = getRubricFallbackTotalScore(rubricDetailRows);
        response.setCalculatedScore(
                roundToSingleDecimal(resolveDisplayedTotalScore(
                        gradeDetail != null ? gradeDetail.getTotalScore() : null,
                        fallbackTotalScore
                ))
        );
        response.setLecturerComment(
                gradeDetail != null && gradeDetail.getComment() != null && !gradeDetail.getComment().isBlank()
                        ? gradeDetail.getComment()
                        : fallbackTotalScore != null
                            ? "Đã chấm theo rubric"
                            : response.getLecturerComment()
        );
        if (response.getRubricId() == null && gradeDetail != null && gradeDetail.getRubricId() != null) {
            response.setRubricId(gradeDetail.getRubricId());
        }

        if (assessmentCLOS != null && !assessmentCLOS.isEmpty()) {
            Map<String, String> cloMap = assessmentCLOS.stream()
                    .collect(Collectors.toMap(
                            clo -> clo.getCourseCLO().getCloCode(),
                            clo -> clo.getCourseCLO().getDescription(),
                            (existing, replacement) -> existing
                    ));

            response.setClos(cloMap);
        }

        return response;
    }

    private GradeDetailResponse getGradeDetailSafely(String assessmentId, String studentId) {
        try {
            return gradingClient.getGradeByStudentAndAssessment(assessmentId, studentId);
        } catch (Exception ignored) {
            return null;
        }
    }

    private Double getRubricFallbackTotalScore(String assessmentId, String studentId) {
        try {
            return getRubricFallbackTotalScore(assessmentRepository.getRubricCriterionDetails(assessmentId, studentId));
        } catch (Exception ignored) {
            return null;
        }
    }

    private Double getRubricFallbackTotalScore(List<Object[]> rubricDetails) {
        if (rubricDetails == null || rubricDetails.isEmpty()) {
            return null;
        }

        double total = rubricDetails.stream()
                .map(row -> row[4])
                .filter(Number.class::isInstance)
                .map(Number.class::cast)
                .mapToDouble(Number::doubleValue)
                .sum();

        return Math.abs(total) < 0.000001d ? null : total;
    }

    public void unsubmitAssignment(String assessmentId, String studentId) {
        Assessment assessment = assessmentRepository.findById(assessmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập!"));


        if (assessment.getEndTime() != null) {
            Timestamp now = new Timestamp(System.currentTimeMillis());
            if (now.after(assessment.getEndTime())) {
                throw new RuntimeException("Đã quá hạn nộp bài, không thể hủy nộp!");
            }
        }


        SubmissionEntity submission = submissionRepository
                .findByAssessmentIdAndStudentId(assessmentId, studentId)
                .orElseThrow(() -> new RuntimeException("Bạn chưa nộp bài này!"));

        submissionRepository.delete(submission);
    }
    public List<CourseOfferingResponse> getOfferingsByCourseId(String courseId) {
        List<CourseOffering> offerings = courseOfferingRepository.findByCourse_CourseId(courseId);
        CourseResponse courseResponse = courseMapper.toCourseResponse(offerings.getFirst().getCourse());



        return offerings.stream().map(offering -> {
            CourseOfferingResponse response = new CourseOfferingResponse();
            response.setOfferingId(offering.getOfferingId());
             response.setOfferingName(offering.getOfferingName());
             response.setCourse(courseResponse);






            return response;
        }).collect(Collectors.toList());
    }

}
