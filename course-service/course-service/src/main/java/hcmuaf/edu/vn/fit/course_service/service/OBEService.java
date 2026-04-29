package hcmuaf.edu.vn.fit.course_service.service;

import hcmuaf.edu.vn.fit.course_service.dto.response.*;
import hcmuaf.edu.vn.fit.course_service.repository.CourseRepository;
import hcmuaf.edu.vn.fit.course_service.repository.EnrollmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OBEService {

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

        List<Object[]> cloRows = courseRepo.getOBEByOffering(offeringId);

        int totalStudents = enrollmentRepo.countByCourseOffering_OfferingId(offeringId);

        List<CLOLecturerResponse> clos = cloRows.stream().map(r -> {

            double achieved = r[3] != null ? ((Number) r[3]).doubleValue() : 0;
            double totalWeight = r[4] != null ? ((Number) r[4]).doubleValue() : 0;

            double percent = (totalWeight == 0) ? 0 : (achieved / totalWeight) * 100;

            percent = Math.min(percent, 100);

            int passed = (int) Math.round(percent / 100.0 * totalStudents);
            int failed = totalStudents - passed;

            return CLOLecturerResponse.builder()
                    .cloId((String) r[0])
                    .cloCode((String) r[1])
                    .cloDescription((String) r[2])
                    .progressPercent(percent)
                    .totalStudents(totalStudents)
                    .passedStudents(passed)
                    .failedStudents(failed)

                    // tạm giữ fake distribution
                    .below40((int) (totalStudents * 0.2))
                    .from40to70((int) (totalStudents * 0.5))
                    .above70((int) (totalStudents * 0.3))
                    .build();
        }).toList();

        double overall = clos.stream()
                .mapToDouble(CLOLecturerResponse::getProgressPercent)
                .average()
                .orElse(0);

        return OBELecturerProcessResponse.builder()
                .offeringId(offeringId)
                .totalStudents(totalStudents)
                .overallProgress(overall)
                .clos(clos)
                .build();
    }


    // 3. CLO DETAIL BY STUDENT

    public OBECloDetailResponse getCloDetail(String offeringId, String cloId) {

        List<Object[]> studentRows = courseRepo.getStudentScoresByCLO(offeringId, cloId);

        List<StudentScoreResponse> students = studentRows.stream().map(r ->
                StudentScoreResponse.builder()
                        .studentId((String) r[0])
                        .fullName((String) r[1])
                        .score(r[2] != null ? ((Number) r[2]).doubleValue() : 0)
                        .build()
        ).toList();

        List<Object[]> assessRows = courseRepo.getAssessmentByCLO(offeringId, cloId);

        List<AssessmentMappingResponse> assessments = assessRows.stream().map(r ->
                AssessmentMappingResponse.builder()
                        .assessmentId((String) r[0])
                        .assessmentName((String) r[1])
                        .weight(r[2] != null ? ((Number) r[2]).doubleValue() : 0)
                        .build()
        ).toList();

        List<Object[]> cloInfo = courseRepo.getOBEByOffering(offeringId);

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
}