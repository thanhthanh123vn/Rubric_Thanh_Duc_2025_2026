package hcmuaf.edu.vn.fit.course_service.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import hcmuaf.edu.vn.fit.course_service.client.UserClient;
import hcmuaf.edu.vn.fit.course_service.dto.request.CommentRequest;
import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.entity.*;
import hcmuaf.edu.vn.fit.course_service.mapper.AssessmentMapper;
import hcmuaf.edu.vn.fit.course_service.mapper.CommentMapper;
import hcmuaf.edu.vn.fit.course_service.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class AssessmentService {


    private final AssessmentRepository assessmentRepository;


    private  final S3Service s3Service;

    private final AssessmentMapper assessmentMapper;
    private final SubmissionRepository submissionRepository;
    private final CourseOfferingRepository courseOfferingRepository;
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
        System.out.println(res.toString());
        return res.stream().map(item -> {
            try {
                AssessmentReponse dto = new AssessmentReponse();

                dto.setAssessmentId(item[0] != null ? item[0].toString() : null);
                dto.setAssessmentName(item[1] != null ? item[1].toString() : null);
                dto.setWeight(item[2] != null ? ((Double) item[2]) : null);

                dto.setEndTime((Timestamp) item[3]);
                if(item[4] != null){
                    dto.setSubmissionId(item[4].toString());
                    dto.setSubmissionAt((Timestamp) item[5]);

                    dto.setCalculatedScore(item[6] != null ? ((Double) item[6]) / 10 : null);

                    dto.setLecturerComment(item[7] != null ? item[7].toString() : null);

                }

                if (item[8] != null) {
                    String closJson = item[8].toString();
                    List<String> clos = objectMapper.readValue(
                            closJson,
                            new TypeReference<List<String>>() {}
                    );
                    dto.setCloCode(clos);
                }

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
            dto.setWeight(res[3] != null ? ((Number) res[3]).doubleValue() : 0);
            dto.setEndTime((Timestamp) res[4]);

            dto.setSubmissionId((String) res[5]);
            dto.setSubmissionAt((Timestamp) res[6]);

            dto.setCalculatedScore(res[7] != null ? ((Number) res[7]).doubleValue() / 10 : 0);
            dto.setLecturerComment((String) res[8]);

            String closJson = (String) res[9];
            if (closJson != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, String>> cloList =
                        mapper.readValue(closJson, new TypeReference<>() {});

                // convert list -> map (code -> description)
                Map<String, String> closMap = new HashMap<>();
                for (Map<String, String> clo : cloList) {
                    closMap.put(clo.get("code"), clo.get("description"));
                }

                dto.setClos(closMap);
            }

            return dto;

        } catch (Exception e) {
            throw new RuntimeException("Parse error", e);
        }
    }

    public Object submitAssignment(
            String assessmentId,
            String studentId,
            MultipartFile file,
            String link
    ){
        try{
            if ((file == null || file.isEmpty()) ) {
                throw new RuntimeException("Phải có file");
            }

            String fileUrl = "";

            if (file != null && !file.isEmpty()) {
                fileUrl = s3Service.uploadFile(file);
            }
            if (!assessmentRepository.existsById(assessmentId)) {
                throw new RuntimeException("Assessment không tồn tại: " + assessmentId);
            }
            SubmissionEntity existing =  submissionRepository.findByAssessmentIdAndStudentId(assessmentId,studentId).orElse(null);

            if(existing != null){
                existing.setFileUrl(fileUrl);
                existing.setSubmittedAt(java.time.LocalDateTime.now());

                submissionRepository.save(existing);
                return existing;
            }

            SubmissionEntity submission = new SubmissionEntity();
            submission.setAssessmentId(assessmentId);
            submission.setStudentId(studentId);
            submission.setFileUrl(fileUrl);
            submission.setSubmittedAt(java.time.LocalDateTime.now());

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
                    .weight(0f)
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


        return assessments.stream()
                .map(assessmentMapper::toResponse)
                .toList();
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
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài tập!"));


        AssessmentDetailResponse response = assessmentMapper.toDetailResponse(assessment);
       List< AssessmentCLO> assessmentCLOS = assessmentCLORepository.getByAssessment_AssessmentId(assessment.getAssessmentId());
        System.out.println("Chuẩn CLOS getAssessmentDetail "+assessmentCLOS);
        // 3.  Nếu  có Rubric và CLO chi tiết, hãy gọi sang Rubric Service hoặc map tại đây
         response.setRubricId((assessment.getRubricId()));
        Optional<SubmissionEntity> submissionOpt = submissionRepository.findByAssessmentIdAndStudentId(assessmentId, studentId);
        if (submissionOpt.isPresent()) {
            SubmissionEntity sub = submissionOpt.get();
            response.setSubmissionId(sub.getId());
            response.setSubmissionAt(Timestamp.valueOf(sub.getSubmittedAt())); // Hoặc trường lưu thời gian nộp của bạn


            response.setSubmittedFileUrl(sub.getFileUrl());
            response.setSubmittedLink(sub.getFileUrl());
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
}