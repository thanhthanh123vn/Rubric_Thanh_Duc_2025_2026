package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.AssessmentMappingResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.CLOLecturerResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBECloDetailResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBELecturerProcessResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.OBEProgressResponse;
import hcmuaf.edu.vn.fit.course_service.dto.response.StudentScoreResponse;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OBEService {

    private static final double PASS_THRESHOLD = 50;

    private final CourseRepository courseRepo;
    private final EnrollmentRepository enrollmentRepo;


    // 1. STUDENT OBE PROGRESS

    public List<OBEProgressResponse> getOBEProgressByStudentId(String offeringId, String studentId) {

        List<Object[]> rows = courseRepo.getOBEByOfferingByStudent(offeringId, studentId);

        return rows.stream().map(r -> {

            double achieved = r[3] != null ? ((Number) r[3]).doubleValue() : 0;
            double totalWeight = r[4] != null ? ((Number) r[4]).doubleValue() : 0;

            double percent = (totalWeight == 0) ? 0 : (achieved / totalWeight) * 100;

            return new OBEProgressResponse(
                    (String) r[0],
                    (String) r[1],
                    (String) r[2],
                    totalWeight,
                    achieved,
                    Math.min(percent, 100)
            );
        }).toList();
    }


    // 2. LECTURER CLO PROGRESS

    public OBELecturerProcessResponse getOBEForLecturer(String offeringId) {

        List<Object[]> cloRows = courseRepo.getCLOsByOffering(offeringId);

        List<CLOLecturerResponse> clos = cloRows.stream().map(r -> {
            String cloId = (String) r[0];
            List<StudentScoreResponse> students = getStudentScores(offeringId, cloId);

            double progressPercent = normalizePercent(
                    students.stream()
                            .mapToDouble(StudentScoreResponse::getScore)
                            .average()
                            .orElse(0)
            );

            int totalStudents = students.size();
            int passedStudents = (int) students.stream()
                    .filter(student -> student.getScore() >= PASS_THRESHOLD)
                    .count();
            int failedStudents = totalStudents - passedStudents;
            int below40 = (int) students.stream()
                    .filter(student -> student.getScore() < 40)
                    .count();
            int from40to70 = (int) students.stream()
                    .filter(student -> student.getScore() >= 40 && student.getScore() < 70)
                    .count();
            int above70 = (int) students.stream()
                    .filter(student -> student.getScore() >= 70)
                    .count();

            return CLOLecturerResponse.builder()
                    .cloId(cloId)
                    .cloCode((String) r[1])
                    .cloDescription((String) r[2])
                    .progressPercent(progressPercent)
                    .totalStudents(totalStudents)
                    .passedStudents(passedStudents)
                    .failedStudents(failedStudents)
                    .below40(below40)
                    .from40to70(from40to70)
                    .above70(above70)
                    .build();
        }).toList();

        double overall = clos.stream()
                .mapToDouble(CLOLecturerResponse::getProgressPercent)
                .average()
                .orElse(0);

        return OBELecturerProcessResponse.builder()
                .offeringId(offeringId)
                .totalStudents(enrollmentRepo.countByCourseOffering_OfferingId(offeringId))
                .overallProgress(overall)
                .clos(clos)
                .build();
    }


    // 3. CLO DETAIL BY STUDENT

    public OBECloDetailResponse getCloDetail(String offeringId, String cloId) {

        List<StudentScoreResponse> students = getStudentScores(offeringId, cloId);

        List<Object[]> assessRows = courseRepo.getAssessmentByCLO(offeringId, cloId);

        List<AssessmentMappingResponse> assessments = assessRows.stream().map(r ->
                AssessmentMappingResponse.builder()
                        .assessmentId((String) r[0])
                        .assessmentName((String) r[1])
                        .weight(r[2] != null ? ((Number) r[2]).doubleValue() : 0)
                        .build()
        ).toList();

        List<Object[]> cloInfo = courseRepo.getCLOsByOffering(offeringId);

        Object[] clo = cloInfo.stream()
                .filter(c -> c[0].equals(cloId))
                .findFirst()
                .orElse(null);

        return OBECloDetailResponse.builder()
                .cloId(cloId)
                .cloCode(clo != null ? (String) clo[1] : "")
                .cloDescription(clo != null ? (String) clo[2] : "")
                .students(students)
                .assessments(assessments)
                .build();
    }

    private List<StudentScoreResponse> getStudentScores(String offeringId, String cloId) {
        return courseRepo.getStudentScoresByCLO(offeringId, cloId).stream()
                .map(r -> StudentScoreResponse.builder()
                        .studentId((String) r[0])
                        .fullName((String) r[1])
                        .score(normalizePercent(r[2] != null ? ((Number) r[2]).doubleValue() : 0))
                        .build()
                )
                .sorted(Comparator.comparing(StudentScoreResponse::getScore).reversed()
                        .thenComparing(StudentScoreResponse::getFullName))
                .toList();
    }

    private double normalizePercent(double value) {
        return Math.min(Math.max(value, 0), 100);
    }
}
